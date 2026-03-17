"""
White-box tests for KPIs app — covers services, views, serializers, and models.
"""
from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status

from apps.accounts.services import AuthService
from .models import KpiData
from .services import KpiService
from .serializers import KpiSaveMonthlySerializer


class KpiModelTests(TestCase):
    def setUp(self):
        self.user = AuthService.register({
            'email': 'kpi@test.com', 'password': 'pass1234',
            'display_name': '', 'role': 'csm', 'company_name': 'Corp',
        })
        self.company = self.user.company

    def test_str(self):
        kpi = KpiData.objects.create(company=self.company, period='2025-01')
        self.assertEqual(str(kpi), 'Corp - 2025-01')

    def test_unique_together(self):
        KpiData.objects.create(company=self.company, period='2025-01')
        with self.assertRaises(Exception):
            KpiData.objects.create(company=self.company, period='2025-01')


class KpiServiceTests(TestCase):
    """White-box tests for KpiService — tests update_or_create logic paths."""

    def setUp(self):
        self.user = AuthService.register({
            'email': 'ks@test.com', 'password': 'pass1234',
            'display_name': '', 'role': 'csm', 'company_name': 'Corp',
        })
        self.company = self.user.company

    def test_get_all_empty(self):
        result = KpiService.get_all(self.company)
        self.assertEqual(result.count(), 0)

    def test_save_monthly_creates_new(self):
        obj = KpiService.save_monthly(
            self.company, '2025-03', {'arr': 100}, {'arr': 200},
        )
        self.assertEqual(obj.period, '2025-03')
        self.assertEqual(obj.kpis['arr'], 100)
        self.assertEqual(obj.goals['arr'], 200)

    def test_save_monthly_updates_existing(self):
        KpiService.save_monthly(self.company, '2025-03', {'arr': 100}, {})
        obj = KpiService.save_monthly(self.company, '2025-03', {'arr': 200}, {})
        self.assertEqual(obj.kpis['arr'], 200)
        self.assertEqual(KpiData.objects.filter(
            company=self.company, period='2025-03',
        ).count(), 1)

    def test_save_custom(self):
        obj = KpiService.save_custom(
            self.company, [{'name': 'NRR'}], {'2025-01': 95},
        )
        self.assertEqual(obj.period, '__custom__')
        self.assertEqual(obj.custom_kpis[0]['name'], 'NRR')

    def test_save_goals(self):
        obj = KpiService.save_goals(self.company, {'arr': 1000000})
        self.assertEqual(obj.period, '__goals__')
        self.assertEqual(obj.goals['arr'], 1000000)

    def test_get_all_returns_all_types(self):
        KpiService.save_monthly(self.company, '2025-01', {}, {})
        KpiService.save_custom(self.company, [], {})
        KpiService.save_goals(self.company, {})
        self.assertEqual(KpiService.get_all(self.company).count(), 3)


class KpiSerializerTests(TestCase):
    def test_monthly_serializer_rejects_reserved_period(self):
        ser = KpiSaveMonthlySerializer(data={
            'period': '__custom__', 'kpis': {},
        })
        self.assertFalse(ser.is_valid())
        self.assertIn('period', ser.errors)

    def test_monthly_serializer_accepts_normal_period(self):
        ser = KpiSaveMonthlySerializer(data={
            'period': '2025-03', 'kpis': {'arr': 100},
        })
        self.assertTrue(ser.is_valid())


class KpiViewTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = AuthService.register({
            'email': 'kv@test.com', 'password': 'pass1234',
            'display_name': '', 'role': 'csm', 'company_name': 'Corp',
        })
        self.client.force_authenticate(user=self.user)

    def test_list_kpis(self):
        resp = self.client.get('/api/kpis/')
        self.assertEqual(resp.status_code, status.HTTP_200_OK)

    def test_save_monthly(self):
        resp = self.client.post('/api/kpis/monthly/', {
            'period': '2025-03', 'kpis': {'arr': 500}, 'goals': {},
        }, format='json')
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(resp.data['period'], '2025-03')

    def test_save_custom(self):
        resp = self.client.post('/api/kpis/custom/', {
            'custom_kpis': [{'name': 'NRR'}], 'history': {},
        }, format='json')
        self.assertEqual(resp.status_code, status.HTTP_200_OK)

    def test_save_goals(self):
        resp = self.client.post('/api/kpis/goals/', {
            'goals': {'arr': 1000000},
        }, format='json')
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
