"""
White-box tests for core app — covers permissions, mixins, and singleton views.
Tests LSP compliance for SingletonModelViewMixin.
"""
from unittest.mock import MagicMock

from django.test import TestCase
from rest_framework.test import APIClient, APIRequestFactory
from rest_framework import status
from rest_framework.exceptions import ValidationError

from apps.accounts.services import AuthService
from .permissions import IsCompanyMember
from .mixins import CompanyQuerySetMixin
from .views import SingletonModelViewMixin, SingletonModelViewMeta


# ──────────────────────────────────────────────
# Permission tests
# ──────────────────────────────────────────────

class IsCompanyMemberTests(TestCase):
    def test_allows_user_with_company(self):
        user = AuthService.register({
            'email': 'perm@test.com', 'password': 'pass1234',
            'display_name': '', 'role': 'csm', 'company_name': 'Corp',
        })
        permission = IsCompanyMember()
        request = MagicMock()
        request.user = user
        request.auth = True
        self.assertTrue(permission.has_permission(request, None))

    def test_denies_user_without_company(self):
        from django.contrib.auth import get_user_model
        User = get_user_model()
        user = User.objects.create_user(
            username='nocomp@test.com', email='nocomp@test.com',
            password='pass1234',
        )
        permission = IsCompanyMember()
        request = MagicMock()
        request.user = user
        request.auth = True
        self.assertFalse(permission.has_permission(request, None))

    def test_denies_unauthenticated(self):
        permission = IsCompanyMember()
        request = MagicMock()
        request.user.is_authenticated = False
        self.assertFalse(permission.has_permission(request, None))


# ──────────────────────────────────────────────
# CompanyQuerySetMixin tests
# ──────────────────────────────────────────────

class CompanyQuerySetMixinTests(TestCase):
    def test_get_company_raises_for_no_company(self):
        from django.contrib.auth import get_user_model
        User = get_user_model()
        user = User.objects.create_user(
            username='nocomp2@test.com', email='nocomp2@test.com',
            password='pass1234',
        )
        mixin = CompanyQuerySetMixin()
        mixin.request = MagicMock()
        mixin.request.user = user
        with self.assertRaises(ValidationError):
            mixin.get_company()

    def test_get_company_returns_company(self):
        user = AuthService.register({
            'email': 'mixin@test.com', 'password': 'pass1234',
            'display_name': '', 'role': 'csm', 'company_name': 'Corp',
        })
        mixin = CompanyQuerySetMixin()
        mixin.request = MagicMock()
        mixin.request.user = user
        self.assertEqual(mixin.get_company(), user.company)


# ──────────────────────────────────────────────
# LSP: SingletonModelViewMixin metaclass tests
# ──────────────────────────────────────────────

class SingletonModelViewMixinLSPTests(TestCase):
    """LSP: Verifies that incomplete subclasses fail at class definition time."""

    def test_base_mixin_can_be_instantiated(self):
        """The base mixin itself should not fail."""
        mixin = SingletonModelViewMixin()
        self.assertIsNone(mixin.model_class)

    def test_lsp_violation_detected_at_class_time(self):
        """LSP: Subclass without model_class should raise TypeError."""
        with self.assertRaises(TypeError) as ctx:
            class BadMixin(SingletonModelViewMixin):
                serializer_class = MagicMock
        self.assertIn('model_class', str(ctx.exception))

    def test_lsp_violation_missing_serializer(self):
        """LSP: Subclass without serializer_class should raise TypeError."""
        with self.assertRaises(TypeError) as ctx:
            class BadMixin2(SingletonModelViewMixin):
                model_class = MagicMock
        self.assertIn('serializer_class', str(ctx.exception))

    def test_valid_subclass(self):
        """LSP: Complete subclass satisfies the contract."""
        class GoodMixin(SingletonModelViewMixin):
            model_class = MagicMock
            serializer_class = MagicMock
        self.assertIsNotNone(GoodMixin.model_class)


# ──────────────────────────────────────────────
# Singleton get/save view tests (integration)
# ──────────────────────────────────────────────

class SingletonViewTests(TestCase):
    """Tests for the singleton_get_save_views factory function."""

    def setUp(self):
        self.client = APIClient()
        self.user = AuthService.register({
            'email': 'sv@test.com', 'password': 'pass1234',
            'display_name': '', 'role': 'csm', 'company_name': 'Corp',
        })
        self.client.force_authenticate(user=self.user)

    def test_task_board_get(self):
        resp = self.client.get('/api/tasks/')
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertIn('tasks', resp.data)

    def test_task_board_save(self):
        resp = self.client.post('/api/tasks/save/', {
            'tasks': [{'id': 1, 'title': 'Task 1'}],
        }, format='json')
        self.assertEqual(resp.status_code, status.HTTP_200_OK)

    def test_calendar_events_get(self):
        resp = self.client.get('/api/planning/')
        self.assertEqual(resp.status_code, status.HTTP_200_OK)

    def test_wellbeing_get(self):
        resp = self.client.get('/api/wellbeing/')
        self.assertEqual(resp.status_code, status.HTTP_200_OK)

    def test_wellbeing_update(self):
        resp = self.client.patch('/api/wellbeing/update/', {
            'score': 85, 'burnout': 'low',
        }, format='json')
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(resp.data['score'], 85)

    def test_roadmap_get(self):
        resp = self.client.get('/api/roadmap/')
        self.assertEqual(resp.status_code, status.HTTP_200_OK)

    def test_roadmap_update(self):
        resp = self.client.patch('/api/roadmap/update/', {
            'phase': 'Phase 2', 'progress': 50,
        }, format='json')
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(resp.data['phase'], 'Phase 2')
