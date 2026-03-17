"""
White-box tests for feedback app.
"""
from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status

from apps.accounts.services import AuthService
from .models import Feedback


class FeedbackModelTests(TestCase):
    def test_str(self):
        user = AuthService.register({
            'email': 'fb@test.com', 'password': 'pass1234',
            'display_name': '', 'role': 'csm', 'company_name': 'Corp',
        })
        fb = Feedback.objects.create(
            user=user, category='bug', rating=4, description='A bug',
        )
        self.assertIn('fb@test.com', str(fb))
        self.assertIn('bug', str(fb))


class FeedbackViewTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = AuthService.register({
            'email': 'fbv@test.com', 'password': 'pass1234',
            'display_name': '', 'role': 'csm', 'company_name': 'Corp',
        })
        self.client.force_authenticate(user=self.user)

    def test_create_feedback(self):
        resp = self.client.post('/api/feedback/', {
            'category': 'feature',
            'rating': 5,
            'description': 'Great feature idea',
        }, format='json')
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)

    def test_create_feedback_invalid_category(self):
        resp = self.client.post('/api/feedback/', {
            'category': 'invalid',
            'rating': 5,
            'description': 'Test',
        }, format='json')
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)

    def test_create_feedback_missing_description(self):
        resp = self.client.post('/api/feedback/', {
            'category': 'bug',
            'rating': 3,
        }, format='json')
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)

    def test_unauthenticated(self):
        client = APIClient()
        resp = client.post('/api/feedback/', {
            'category': 'bug', 'rating': 3, 'description': 'Test',
        }, format='json')
        self.assertEqual(resp.status_code, status.HTTP_401_UNAUTHORIZED)
