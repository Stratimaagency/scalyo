"""
White-box tests for portfolio app — covers models, services, views, and serializers.
"""
from decimal import Decimal

from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status

from apps.accounts.services import AuthService
from .models import Account, AccountTodo
from .services import AccountImportService
from .serializers import AccountSerializer, ImportAccountRowSerializer


class AccountModelTests(TestCase):
    def setUp(self):
        self.user = AuthService.register({
            'email': 'port@test.com', 'password': 'pass1234',
            'display_name': '', 'role': 'csm', 'company_name': 'Corp',
        })
        self.company = self.user.company

    def test_str(self):
        acc = Account.objects.create(company=self.company, name='Acme')
        self.assertEqual(str(acc), 'Acme')

    def test_default_values(self):
        acc = Account.objects.create(company=self.company, name='Default')
        self.assertEqual(acc.health, 70)
        self.assertEqual(acc.risk, 'low')
        self.assertEqual(acc.arr, 0)

    def test_ordering_by_arr_descending(self):
        Account.objects.create(company=self.company, name='Low', arr=100)
        Account.objects.create(company=self.company, name='High', arr=1000)
        accounts = list(Account.objects.filter(company=self.company))
        self.assertEqual(accounts[0].name, 'High')
        self.assertEqual(accounts[1].name, 'Low')


class AccountTodoModelTests(TestCase):
    def setUp(self):
        self.user = AuthService.register({
            'email': 'todo@test.com', 'password': 'pass1234',
            'display_name': '', 'role': 'csm', 'company_name': 'Corp',
        })
        self.company = self.user.company
        self.account = Account.objects.create(company=self.company, name='Acme')

    def test_str(self):
        todo = AccountTodo.objects.create(
            account=self.account, company=self.company, text='Follow up',
        )
        self.assertEqual(str(todo), 'Acme: Follow up')

    def test_default_done_is_false(self):
        todo = AccountTodo.objects.create(
            account=self.account, company=self.company, text='Task',
        )
        self.assertFalse(todo.done)


class AccountImportServiceTests(TestCase):
    """White-box tests: verifies import service creates all rows correctly."""

    def setUp(self):
        self.user = AuthService.register({
            'email': 'import@test.com', 'password': 'pass1234',
            'display_name': '', 'role': 'csm', 'company_name': 'Corp',
        })
        self.company = self.user.company

    def test_import_single_account(self):
        ids = AccountImportService.import_accounts(self.company, [
            {'name': 'Imported', 'csm': 'John', 'arr': 5000},
        ])
        self.assertEqual(len(ids), 1)
        acc = Account.objects.get(pk=ids[0])
        self.assertEqual(acc.name, 'Imported')
        self.assertEqual(acc.csm, 'John')
        self.assertEqual(acc.arr, 5000)

    def test_import_multiple_accounts(self):
        ids = AccountImportService.import_accounts(self.company, [
            {'name': 'A'}, {'name': 'B'}, {'name': 'C'},
        ])
        self.assertEqual(len(ids), 3)

    def test_import_empty_list(self):
        ids = AccountImportService.import_accounts(self.company, [])
        self.assertEqual(ids, [])

    def test_import_uses_defaults(self):
        ids = AccountImportService.import_accounts(self.company, [
            {'name': 'Minimal'},
        ])
        acc = Account.objects.get(pk=ids[0])
        self.assertEqual(acc.health, 70)
        self.assertEqual(acc.risk, 'low')
        self.assertEqual(acc.csm, '')


class AccountSerializerTests(TestCase):
    def setUp(self):
        self.user = AuthService.register({
            'email': 'ser@test.com', 'password': 'pass1234',
            'display_name': '', 'role': 'csm', 'company_name': 'Corp',
        })
        self.company = self.user.company

    def test_health_validation_too_high(self):
        acc = Account.objects.create(company=self.company, name='A')
        ser = AccountSerializer(acc, data={'health': 150}, partial=True)
        self.assertFalse(ser.is_valid())
        self.assertIn('health', ser.errors)

    def test_health_validation_too_low(self):
        acc = Account.objects.create(company=self.company, name='A')
        ser = AccountSerializer(acc, data={'health': -1}, partial=True)
        self.assertFalse(ser.is_valid())
        self.assertIn('health', ser.errors)

    def test_health_validation_valid(self):
        acc = Account.objects.create(company=self.company, name='A')
        ser = AccountSerializer(acc, data={'health': 50}, partial=True)
        self.assertTrue(ser.is_valid())

    def test_risk_validation_invalid(self):
        acc = Account.objects.create(company=self.company, name='A')
        ser = AccountSerializer(acc, data={'risk': 'extreme'}, partial=True)
        self.assertFalse(ser.is_valid())
        self.assertIn('risk', ser.errors)


class ImportAccountRowSerializerTests(TestCase):
    def test_valid_row(self):
        ser = ImportAccountRowSerializer(data={'name': 'Acme', 'arr': '5000'})
        self.assertTrue(ser.is_valid())

    def test_missing_name(self):
        ser = ImportAccountRowSerializer(data={'arr': '5000'})
        self.assertFalse(ser.is_valid())
        self.assertIn('name', ser.errors)

    def test_health_out_of_range(self):
        ser = ImportAccountRowSerializer(data={'name': 'A', 'health': 200})
        self.assertFalse(ser.is_valid())


class AccountViewSetTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = AuthService.register({
            'email': 'av@test.com', 'password': 'pass1234',
            'display_name': '', 'role': 'csm', 'company_name': 'Corp',
        })
        self.client.force_authenticate(user=self.user)

    def test_list_accounts(self):
        Account.objects.create(company=self.user.company, name='A1')
        resp = self.client.get('/api/portfolio/accounts/')
        self.assertEqual(resp.status_code, status.HTTP_200_OK)

    def test_create_account(self):
        resp = self.client.post('/api/portfolio/accounts/', {
            'name': 'New Account', 'health': 80, 'risk': 'low',
        }, format='json')
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)
        self.assertEqual(resp.data['name'], 'New Account')

    def test_retrieve_account(self):
        acc = Account.objects.create(company=self.user.company, name='Detail')
        resp = self.client.get(f'/api/portfolio/accounts/{acc.pk}/')
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(resp.data['name'], 'Detail')

    def test_update_account(self):
        acc = Account.objects.create(company=self.user.company, name='Old')
        resp = self.client.patch(f'/api/portfolio/accounts/{acc.pk}/', {
            'name': 'New',
        }, format='json')
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(resp.data['name'], 'New')

    def test_delete_account(self):
        acc = Account.objects.create(company=self.user.company, name='Del')
        resp = self.client.delete(f'/api/portfolio/accounts/{acc.pk}/')
        self.assertEqual(resp.status_code, status.HTTP_204_NO_CONTENT)

    def test_search_accounts(self):
        Account.objects.create(company=self.user.company, name='Searchable')
        Account.objects.create(company=self.user.company, name='Other')
        resp = self.client.get('/api/portfolio/accounts/?search=Search')
        self.assertEqual(resp.status_code, status.HTTP_200_OK)

    def test_import_accounts(self):
        resp = self.client.post('/api/portfolio/accounts/import_accounts/', {
            'accounts': [
                {'name': 'Imp1', 'arr': '1000'},
                {'name': 'Imp2', 'arr': '2000'},
            ],
        }, format='json')
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)
        self.assertEqual(resp.data['created'], 2)

    def test_company_isolation(self):
        """White-box: ensures accounts from other companies are not visible."""
        other_user = AuthService.register({
            'email': 'other@test.com', 'password': 'pass1234',
            'display_name': '', 'role': 'csm', 'company_name': 'Other Corp',
        })
        Account.objects.create(company=other_user.company, name='Secret')
        resp = self.client.get('/api/portfolio/accounts/')
        names = [a['name'] for a in resp.data.get('results', resp.data)]
        self.assertNotIn('Secret', names)


class AccountTodoViewSetTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = AuthService.register({
            'email': 'td@test.com', 'password': 'pass1234',
            'display_name': '', 'role': 'csm', 'company_name': 'Corp',
        })
        self.client.force_authenticate(user=self.user)
        self.account = Account.objects.create(
            company=self.user.company, name='Acme',
        )

    def test_list_todos(self):
        AccountTodo.objects.create(
            account=self.account, company=self.user.company, text='Task 1',
        )
        resp = self.client.get(
            f'/api/portfolio/accounts/{self.account.pk}/todos/'
        )
        self.assertEqual(resp.status_code, status.HTTP_200_OK)

    def test_create_todo(self):
        resp = self.client.post(
            f'/api/portfolio/accounts/{self.account.pk}/todos/',
            {'text': 'New todo'},
            format='json',
        )
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)

    def test_toggle_todo(self):
        todo = AccountTodo.objects.create(
            account=self.account, company=self.user.company, text='Toggle',
        )
        resp = self.client.patch(
            f'/api/portfolio/accounts/{self.account.pk}/todos/{todo.pk}/',
            {'done': True},
            format='json',
        )
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertTrue(resp.data['done'])

    def test_delete_todo(self):
        todo = AccountTodo.objects.create(
            account=self.account, company=self.user.company, text='Del',
        )
        resp = self.client.delete(
            f'/api/portfolio/accounts/{self.account.pk}/todos/{todo.pk}/'
        )
        self.assertEqual(resp.status_code, status.HTTP_204_NO_CONTENT)
