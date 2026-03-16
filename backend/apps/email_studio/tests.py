"""
White-box tests for email_studio app — covers OCP registry pattern and views.
"""
from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status

from apps.accounts.services import AuthService
from .templates_registry import EmailTemplate, TemplateRegistry, registry


class EmailTemplateTests(TestCase):
    """OCP: Tests the EmailTemplate value object."""

    def test_localize_fr(self):
        tpl = EmailTemplate(
            'test', names={'fr': 'Nom', 'en': 'Name'},
            subjects={'fr': 'Sujet', 'en': 'Subject'},
            bodies={'fr': 'Corps', 'en': 'Body'},
        )
        result = tpl.localize('fr')
        self.assertEqual(result['name'], 'Nom')
        self.assertEqual(result['subject'], 'Sujet')

    def test_localize_en(self):
        tpl = EmailTemplate(
            'test', names={'fr': 'Nom', 'en': 'Name'},
            subjects={'fr': 'Sujet', 'en': 'Subject'},
            bodies={'fr': 'Corps', 'en': 'Body'},
        )
        result = tpl.localize('en')
        self.assertEqual(result['name'], 'Name')

    def test_localize_fallback_to_fr(self):
        tpl = EmailTemplate(
            'test', names={'fr': 'Nom'},
            subjects={'fr': 'Sujet'},
            bodies={'fr': 'Corps'},
        )
        result = tpl.localize('kr')
        self.assertEqual(result['name'], 'Nom')


class TemplateRegistryTests(TestCase):
    """OCP: Registry allows adding templates without modifying existing code."""

    def test_register_and_get(self):
        reg = TemplateRegistry()
        tpl = EmailTemplate(
            'new', names={'fr': 'N'}, subjects={'fr': 'S'}, bodies={'fr': 'B'},
        )
        reg.register(tpl)
        self.assertIsNotNone(reg.get('new'))

    def test_get_nonexistent(self):
        reg = TemplateRegistry()
        self.assertIsNone(reg.get('missing'))

    def test_list_localized(self):
        reg = TemplateRegistry()
        reg.register(EmailTemplate(
            'a', names={'fr': 'A'}, subjects={'fr': 'S'}, bodies={'fr': 'B'},
        ))
        reg.register(EmailTemplate(
            'b', names={'fr': 'B'}, subjects={'fr': 'S'}, bodies={'fr': 'B'},
        ))
        result = reg.list_localized('fr')
        self.assertEqual(len(result), 2)

    def test_default_registry_has_templates(self):
        self.assertTrue(len(registry.all()) >= 6)


class EmailStudioViewTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = AuthService.register({
            'email': 'es@test.com', 'password': 'pass1234',
            'display_name': '', 'role': 'csm', 'company_name': 'Corp',
        })
        self.client.force_authenticate(user=self.user)

    def test_template_list(self):
        resp = self.client.get('/api/email-studio/templates/')
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertTrue(len(resp.data) >= 6)

    def test_template_list_en(self):
        resp = self.client.get('/api/email-studio/templates/?lang=en')
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        # Check that at least one template has English content
        names = [t['name'] for t in resp.data]
        self.assertTrue(any('Welcome' in n or 'QBR' in n for n in names))

    def test_template_detail(self):
        resp = self.client.get('/api/email-studio/templates/welcome/')
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(resp.data['id'], 'welcome')

    def test_template_detail_not_found(self):
        resp = self.client.get('/api/email-studio/templates/nonexistent/')
        self.assertEqual(resp.status_code, 404)
