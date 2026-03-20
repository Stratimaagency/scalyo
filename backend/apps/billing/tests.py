"""
Tests for billing app — covers Stripe webhook handling and API views.
"""
import json
from unittest.mock import patch, MagicMock

from django.test import TestCase, override_settings
from rest_framework.test import APIClient
from rest_framework import status

from apps.accounts.models import Company
from apps.accounts.services import AuthService
from .services import StripeService


class StripeWebhookTests(TestCase):
    """Tests webhook event handlers."""

    def setUp(self):
        self.user = AuthService.register({
            'email': 'wh@test.com', 'password': 'pass1234',
            'display_name': '', 'role': 'manager', 'company_name': 'WH Corp',
        })
        self.company = self.user.company

    def test_handle_checkout_completed(self):
        self.company.stripe_customer_id = 'cus_test'
        self.company.save()

        session = {
            'metadata': {'company_id': str(self.company.id), 'plan': 'Growth'},
            'subscription': 'sub_test_123',
        }
        StripeService.handle_checkout_completed(session)

        self.company.refresh_from_db()
        self.assertEqual(self.company.plan, 'Growth')
        self.assertEqual(self.company.stripe_subscription_id, 'sub_test_123')
        self.assertEqual(self.company.subscription_status, 'active')

    def test_handle_checkout_completed_missing_company(self):
        session = {
            'metadata': {'company_id': '99999', 'plan': 'Growth'},
            'subscription': 'sub_test',
        }
        # Should not raise
        StripeService.handle_checkout_completed(session)

    def test_handle_checkout_completed_no_metadata(self):
        StripeService.handle_checkout_completed({})

    @override_settings(
        STRIPE_STARTER_PRICE_ID='price_starter',
        STRIPE_GROWTH_PRICE_ID='price_growth',
        STRIPE_ELITE_PRICE_ID='price_elite',
    )
    def test_handle_subscription_updated(self):
        self.company.stripe_subscription_id = 'sub_upd'
        self.company.save()

        subscription = {
            'id': 'sub_upd',
            'status': 'past_due',
            'items': {'data': [{'price': {'id': 'price_elite'}}]},
        }
        StripeService.handle_subscription_updated(subscription)

        self.company.refresh_from_db()
        self.assertEqual(self.company.subscription_status, 'past_due')
        self.assertEqual(self.company.plan, 'Elite')

    def test_handle_subscription_deleted(self):
        self.company.stripe_subscription_id = 'sub_del'
        self.company.plan = 'Growth'
        self.company.save()

        StripeService.handle_subscription_deleted({'id': 'sub_del'})

        self.company.refresh_from_db()
        self.assertEqual(self.company.plan, 'Starter')
        self.assertEqual(self.company.subscription_status, 'canceled')
        self.assertEqual(self.company.stripe_subscription_id, '')

    def test_handle_subscription_deleted_unknown(self):
        StripeService.handle_subscription_deleted({'id': 'sub_unknown'})


@override_settings(STRIPE_WEBHOOK_SECRET='')
class WebhookEndpointTests(TestCase):
    """Tests the webhook HTTP endpoint without signature verification."""

    def setUp(self):
        self.user = AuthService.register({
            'email': 'whep@test.com', 'password': 'pass1234',
            'display_name': '', 'role': 'manager', 'company_name': 'EP Corp',
        })

    def test_webhook_checkout_completed(self):
        event = {
            'type': 'checkout.session.completed',
            'data': {
                'object': {
                    'metadata': {
                        'company_id': str(self.user.company.id),
                        'plan': 'Elite',
                    },
                    'subscription': 'sub_wh',
                },
            },
        }
        resp = self.client.post(
            '/api/billing/webhook/',
            data=json.dumps(event),
            content_type='application/json',
        )
        self.assertEqual(resp.status_code, 200)
        self.user.company.refresh_from_db()
        self.assertEqual(self.user.company.plan, 'Elite')

    def test_webhook_invalid_json(self):
        resp = self.client.post(
            '/api/billing/webhook/',
            data='not json',
            content_type='application/json',
        )
        self.assertEqual(resp.status_code, 400)

    def test_webhook_unknown_event(self):
        event = {'type': 'unknown.event', 'data': {'object': {}}}
        resp = self.client.post(
            '/api/billing/webhook/',
            data=json.dumps(event),
            content_type='application/json',
        )
        self.assertEqual(resp.status_code, 200)


class BillingViewTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = AuthService.register({
            'email': 'bv@test.com', 'password': 'pass1234',
            'display_name': '', 'role': 'manager', 'company_name': 'BV Corp',
        })
        self.client.force_authenticate(user=self.user)

    def test_subscription_status(self):
        resp = self.client.get('/api/billing/status/')
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(resp.data['plan'], 'Starter')
        self.assertFalse(resp.data['has_subscription'])

    def test_checkout_invalid_plan(self):
        resp = self.client.post('/api/billing/checkout/', {
            'plan': 'InvalidPlan',
        }, format='json')
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)

    @patch('apps.billing.services.stripe.checkout.Session.create')
    @patch('apps.billing.services.stripe.Customer.create')
    @override_settings(
        STRIPE_SECRET_KEY='sk_test',
        STRIPE_GROWTH_PRICE_ID='price_growth',
        FRONTEND_URL='http://localhost:5173',
    )
    def test_checkout_success(self, mock_customer, mock_session):
        mock_customer.return_value = MagicMock(id='cus_new')
        mock_session.return_value = MagicMock(url='https://checkout.stripe.com/test')

        resp = self.client.post('/api/billing/checkout/', {
            'plan': 'Growth',
        }, format='json')
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertIn('checkout_url', resp.data)

    @patch('apps.billing.services.stripe.billing_portal.Session.create')
    def test_portal_success(self, mock_portal):
        self.user.company.stripe_customer_id = 'cus_portal'
        self.user.company.save()
        mock_portal.return_value = MagicMock(url='https://billing.stripe.com/test')

        resp = self.client.post('/api/billing/portal/')
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertIn('portal_url', resp.data)

    def test_portal_no_customer(self):
        resp = self.client.post('/api/billing/portal/')
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)

    def test_unauthenticated(self):
        client = APIClient()
        resp = client.get('/api/billing/status/')
        self.assertEqual(resp.status_code, status.HTTP_401_UNAUTHORIZED)
