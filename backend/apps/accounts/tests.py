"""
White-box tests for accounts app — covers services, views, serializers, and models.
Tests internal logic paths, branching, and edge cases.
"""
from unittest.mock import patch, MagicMock

from django.test import TestCase, override_settings
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status

from .models import Company, NotificationPreferences
from .services import (
    CompanyService, UserService, NotificationService,
    TokenService, AuthService,
)
from .serializers import RegisterSerializer, UserSerializer, CompanySerializer

User = get_user_model()


# ──────────────────────────────────────────────
# SRP: CompanyService tests
# ──────────────────────────────────────────────

class CompanyServiceTests(TestCase):
    """White-box tests for CompanyService — single responsibility: company lifecycle."""

    def test_create_company(self):
        company = CompanyService.create('Test Corp')
        self.assertEqual(company.name, 'Test Corp')
        self.assertTrue(Company.objects.filter(pk=company.pk).exists())

    def test_delete_if_empty_deletes_company_with_no_users(self):
        company = CompanyService.create('Empty Corp')
        result = CompanyService.delete_if_empty(company)
        self.assertTrue(result)
        self.assertFalse(Company.objects.filter(pk=company.pk).exists())

    def test_delete_if_empty_keeps_company_with_users(self):
        company = CompanyService.create('Active Corp')
        User.objects.create_user(
            username='u@test.com', email='u@test.com',
            password='pass1234', company=company,
        )
        result = CompanyService.delete_if_empty(company)
        self.assertFalse(result)
        self.assertTrue(Company.objects.filter(pk=company.pk).exists())

    def test_delete_if_empty_handles_none(self):
        result = CompanyService.delete_if_empty(None)
        self.assertFalse(result)


# ──────────────────────────────────────────────
# SRP: UserService tests
# ──────────────────────────────────────────────

class UserServiceTests(TestCase):
    """White-box tests for UserService — single responsibility: user lifecycle."""

    def test_create_user(self):
        company = CompanyService.create('Corp')
        user = UserService.create(
            email='test@example.com', password='pass1234',
            company=company, display_name='Test', role='csm',
        )
        self.assertEqual(user.email, 'test@example.com')
        self.assertEqual(user.company, company)
        self.assertEqual(user.role, 'csm')
        self.assertTrue(user.check_password('pass1234'))

    def test_create_user_defaults(self):
        company = CompanyService.create('Corp')
        user = UserService.create(
            email='default@example.com', password='pass1234', company=company,
        )
        self.assertEqual(user.display_name, '')
        self.assertEqual(user.role, 'csm')

    def test_delete_user_removes_empty_company(self):
        company = CompanyService.create('Solo Corp')
        user = UserService.create(
            email='solo@example.com', password='pass1234', company=company,
        )
        company_pk = company.pk
        UserService.delete(user)
        self.assertFalse(User.objects.filter(email='solo@example.com').exists())
        self.assertFalse(Company.objects.filter(pk=company_pk).exists())

    def test_delete_user_keeps_company_with_other_users(self):
        company = CompanyService.create('Team Corp')
        user1 = UserService.create(
            email='u1@test.com', password='pass1234', company=company,
        )
        UserService.create(
            email='u2@test.com', password='pass1234', company=company,
        )
        UserService.delete(user1)
        self.assertFalse(User.objects.filter(email='u1@test.com').exists())
        self.assertTrue(Company.objects.filter(pk=company.pk).exists())


# ──────────────────────────────────────────────
# SRP: NotificationService tests
# ──────────────────────────────────────────────

class NotificationServiceTests(TestCase):
    def test_create_defaults(self):
        company = CompanyService.create('Corp')
        user = UserService.create(
            email='n@test.com', password='pass1234', company=company,
        )
        prefs, created = NotificationService.create_defaults(user)
        self.assertTrue(created)
        self.assertTrue(prefs.churn_alerts)
        self.assertTrue(prefs.weekly_report)

    def test_create_defaults_idempotent(self):
        company = CompanyService.create('Corp')
        user = UserService.create(
            email='n2@test.com', password='pass1234', company=company,
        )
        NotificationService.create_defaults(user)
        prefs, created = NotificationService.create_defaults(user)
        self.assertFalse(created)


# ──────────────────────────────────────────────
# SRP: TokenService tests
# ──────────────────────────────────────────────

class TokenServiceTests(TestCase):
    def test_get_tokens_returns_access_and_refresh(self):
        company = CompanyService.create('Corp')
        user = UserService.create(
            email='t@test.com', password='pass1234', company=company,
        )
        tokens = TokenService.get_tokens(user)
        self.assertIn('access', tokens)
        self.assertIn('refresh', tokens)
        self.assertTrue(len(tokens['access']) > 0)
        self.assertTrue(len(tokens['refresh']) > 0)


# ──────────────────────────────────────────────
# SRP: AuthService orchestration tests
# ──────────────────────────────────────────────

class AuthServiceTests(TestCase):
    def test_register_creates_company_user_and_prefs(self):
        user = AuthService.register({
            'email': 'new@test.com',
            'password': 'pass1234',
            'display_name': 'New User',
            'role': 'manager',
            'company_name': 'New Corp',
        })
        self.assertEqual(user.email, 'new@test.com')
        self.assertEqual(user.company.name, 'New Corp')
        self.assertEqual(user.role, 'manager')
        self.assertTrue(
            NotificationPreferences.objects.filter(user=user).exists()
        )

    def test_authenticate_valid(self):
        company = CompanyService.create('Corp')
        UserService.create(
            email='auth@test.com', password='pass1234', company=company,
        )
        user = AuthService.authenticate('auth@test.com', 'pass1234')
        self.assertIsNotNone(user)

    def test_authenticate_invalid(self):
        user = AuthService.authenticate('nonexistent@test.com', 'wrong')
        self.assertIsNone(user)


# ──────────────────────────────────────────────
# View tests (white-box: tests HTTP paths and branching)
# ──────────────────────────────────────────────

class RegisterViewTests(TestCase):
    def setUp(self):
        self.client = APIClient()

    def test_register_success(self):
        resp = self.client.post('/api/auth/register/', {
            'email': 'view@test.com',
            'password': 'pass1234',
            'display_name': 'View User',
            'role': 'csm',
            'company_name': 'View Corp',
        }, format='json')
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)
        self.assertIn('tokens', resp.data)
        self.assertIn('user', resp.data)

    def test_register_duplicate_email(self):
        self.client.post('/api/auth/register/', {
            'email': 'dup@test.com', 'password': 'pass1234',
            'display_name': '', 'role': 'csm', 'company_name': 'Corp',
        }, format='json')
        resp = self.client.post('/api/auth/register/', {
            'email': 'dup@test.com', 'password': 'pass1234',
            'display_name': '', 'role': 'csm', 'company_name': 'Corp2',
        }, format='json')
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)

    def test_register_short_password(self):
        resp = self.client.post('/api/auth/register/', {
            'email': 'short@test.com', 'password': '123',
            'display_name': '', 'role': 'csm', 'company_name': 'Corp',
        }, format='json')
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)


class LoginViewTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        AuthService.register({
            'email': 'login@test.com', 'password': 'pass1234',
            'display_name': '', 'role': 'csm', 'company_name': 'Corp',
        })

    def test_login_success(self):
        resp = self.client.post('/api/auth/login/', {
            'email': 'login@test.com', 'password': 'pass1234',
        }, format='json')
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertIn('tokens', resp.data)

    def test_login_invalid_credentials(self):
        resp = self.client.post('/api/auth/login/', {
            'email': 'login@test.com', 'password': 'wrongpass',
        }, format='json')
        self.assertEqual(resp.status_code, status.HTTP_401_UNAUTHORIZED)


class ProfileViewTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = AuthService.register({
            'email': 'profile@test.com', 'password': 'pass1234',
            'display_name': 'Profile', 'role': 'csm', 'company_name': 'Corp',
        })
        self.client.force_authenticate(user=self.user)

    def test_get_profile(self):
        resp = self.client.get('/api/auth/profile/')
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(resp.data['email'], 'profile@test.com')

    def test_patch_profile(self):
        resp = self.client.patch('/api/auth/profile/', {
            'display_name': 'Updated',
        }, format='json')
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(resp.data['display_name'], 'Updated')

    def test_unauthenticated_profile(self):
        client = APIClient()
        resp = client.get('/api/auth/profile/')
        self.assertEqual(resp.status_code, status.HTTP_401_UNAUTHORIZED)


class CompanyViewTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = AuthService.register({
            'email': 'comp@test.com', 'password': 'pass1234',
            'display_name': '', 'role': 'manager', 'company_name': 'My Corp',
        })
        self.client.force_authenticate(user=self.user)

    def test_get_company(self):
        resp = self.client.get('/api/auth/company/')
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(resp.data['name'], 'My Corp')

    def test_patch_company(self):
        resp = self.client.patch('/api/auth/company/', {
            'name': 'Updated Corp',
        }, format='json')
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(resp.data['name'], 'Updated Corp')


class NotificationPrefsViewTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = AuthService.register({
            'email': 'notif@test.com', 'password': 'pass1234',
            'display_name': '', 'role': 'csm', 'company_name': 'Corp',
        })
        self.client.force_authenticate(user=self.user)

    def test_get_notification_prefs(self):
        resp = self.client.get('/api/auth/notifications/')
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertTrue(resp.data['churn_alerts'])

    def test_patch_notification_prefs(self):
        resp = self.client.patch('/api/auth/notifications/', {
            'churn_alerts': False,
        }, format='json')
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertFalse(resp.data['churn_alerts'])


class DeleteAccountViewTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = AuthService.register({
            'email': 'del@test.com', 'password': 'pass1234',
            'display_name': '', 'role': 'csm', 'company_name': 'Corp',
        })
        self.client.force_authenticate(user=self.user)

    def test_delete_account(self):
        resp = self.client.delete('/api/auth/delete-account/')
        self.assertEqual(resp.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(User.objects.filter(email='del@test.com').exists())


class StripeUrlsViewTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = AuthService.register({
            'email': 'stripe@test.com', 'password': 'pass1234',
            'display_name': '', 'role': 'csm', 'company_name': 'Corp',
        })
        self.client.force_authenticate(user=self.user)

    @override_settings(
        STRIPE_STARTER_URL='http://starter',
        STRIPE_GROWTH_URL='http://growth',
        STRIPE_ELITE_URL='http://elite',
    )
    def test_get_stripe_urls(self):
        resp = self.client.get('/api/auth/stripe-urls/')
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(resp.data['starter'], 'http://starter')
        self.assertEqual(resp.data['growth'], 'http://growth')
        self.assertEqual(resp.data['elite'], 'http://elite')


# ──────────────────────────────────────────────
# Model tests
# ──────────────────────────────────────────────

class CompanyModelTests(TestCase):
    def test_str(self):
        company = Company.objects.create(name='Str Corp')
        self.assertEqual(str(company), 'Str Corp')

    def test_default_plan(self):
        company = Company.objects.create(name='Default Corp')
        self.assertEqual(company.plan, 'Starter')

    def test_default_color(self):
        company = Company.objects.create(name='Color Corp')
        self.assertEqual(company.color, '#7EC8B8')


class UserModelTests(TestCase):
    def test_str_with_display_name(self):
        company = Company.objects.create(name='Corp')
        user = User.objects.create_user(
            username='u@t.com', email='u@t.com', password='p',
            display_name='Display', company=company,
        )
        self.assertEqual(str(user), 'Display')

    def test_str_without_display_name(self):
        company = Company.objects.create(name='Corp')
        user = User.objects.create_user(
            username='u2@t.com', email='u2@t.com', password='p',
            display_name='', company=company,
        )
        self.assertEqual(str(user), 'u2@t.com')


# ──────────────────────────────────────────────
# Serializer tests (white-box: validates internal paths)
# ──────────────────────────────────────────────

class RegisterSerializerTests(TestCase):
    def test_valid_data(self):
        ser = RegisterSerializer(data={
            'email': 'ser@test.com', 'password': 'pass1234',
            'display_name': 'Ser', 'company_name': 'Corp', 'role': 'csm',
        })
        self.assertTrue(ser.is_valid())

    def test_duplicate_email_validation(self):
        AuthService.register({
            'email': 'exists@test.com', 'password': 'pass1234',
            'display_name': '', 'role': 'csm', 'company_name': 'Corp',
        })
        ser = RegisterSerializer(data={
            'email': 'exists@test.com', 'password': 'pass1234',
            'display_name': '', 'company_name': 'Corp', 'role': 'csm',
        })
        self.assertFalse(ser.is_valid())
        self.assertIn('email', ser.errors)

    def test_missing_company_name(self):
        ser = RegisterSerializer(data={
            'email': 'no@test.com', 'password': 'pass1234',
            'display_name': '', 'role': 'csm',
        })
        self.assertFalse(ser.is_valid())
        self.assertIn('company_name', ser.errors)
