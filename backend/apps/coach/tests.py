"""
White-box tests for coach app — covers OCP (mode registry), DIP (AI client abstraction),
ISP (separated chat/stream services), and views.
"""
from unittest.mock import MagicMock, patch

from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status

from apps.accounts.services import AuthService
from .services import (
    CoachModeRegistry, AIClient, AnthropicAIClient,
    CoachChatService, CoachStreamService, coach_mode_registry,
)


# ──────────────────────────────────────────────
# OCP: CoachModeRegistry tests
# ──────────────────────────────────────────────

class CoachModeRegistryTests(TestCase):
    """White-box tests for OCP: new modes can be added without modifying existing code."""

    def test_register_and_get(self):
        registry = CoachModeRegistry()
        registry.register('test_mode', 'Test prompt')
        self.assertEqual(registry.get_prompt('test_mode'), 'Test prompt')

    def test_get_unknown_mode_falls_back_to_default(self):
        registry = CoachModeRegistry()
        registry.register('coach', 'Default prompt')
        self.assertEqual(registry.get_prompt('unknown'), 'Default prompt')

    def test_available_modes(self):
        registry = CoachModeRegistry()
        registry.register('mode_a', 'A')
        registry.register('mode_b', 'B')
        modes = registry.available_modes()
        self.assertIn('mode_a', modes)
        self.assertIn('mode_b', modes)

    def test_default_registry_has_coach_and_nova(self):
        """Verifies built-in modes are pre-registered."""
        self.assertIn('coach', coach_mode_registry.available_modes())
        self.assertIn('nova', coach_mode_registry.available_modes())

    def test_ocp_add_new_mode(self):
        """OCP: Adding a new mode doesn't require modifying CoachChatService."""
        registry = CoachModeRegistry()
        registry.register('coach', 'Default')
        registry.register('onboarding_expert', 'You are an onboarding expert.')
        self.assertEqual(
            registry.get_prompt('onboarding_expert'),
            'You are an onboarding expert.',
        )


# ──────────────────────────────────────────────
# DIP: AIClient abstraction tests
# ──────────────────────────────────────────────

class FakeAIClient(AIClient):
    """Test double that implements the AIClient interface."""

    def __init__(self):
        self.last_call = None

    def chat(self, model, max_tokens, system, messages):
        self.last_call = ('chat', model, system, messages)
        return {'content': 'fake response', 'role': 'assistant'}

    def stream(self, model, max_tokens, system, messages):
        self.last_call = ('stream', model, system, messages)

        def gen():
            yield 'data: {"text": "chunk1"}\n\n'
            yield 'data: [DONE]\n\n'
        return gen()


class AIClientAbstractionTests(TestCase):
    """DIP: Services depend on AIClient abstraction, not AnthropicAIClient."""

    def test_fake_client_satisfies_interface(self):
        client = FakeAIClient()
        result = client.chat('model', 100, 'sys', [])
        self.assertEqual(result['content'], 'fake response')

    def test_fake_client_stream(self):
        client = FakeAIClient()
        chunks = list(client.stream('model', 100, 'sys', []))
        self.assertEqual(len(chunks), 2)
        self.assertIn('chunk1', chunks[0])


# ──────────────────────────────────────────────
# ISP: Separated service interface tests
# ──────────────────────────────────────────────

class CoachChatServiceTests(TestCase):
    """ISP: CoachChatService only handles synchronous chat."""

    def test_chat_delegates_to_client(self):
        client = FakeAIClient()
        service = CoachChatService(client)
        result = service.chat([{'role': 'user', 'content': 'Hello'}], mode='coach')
        self.assertEqual(result['content'], 'fake response')
        self.assertEqual(client.last_call[0], 'chat')

    def test_chat_uses_correct_mode_prompt(self):
        client = FakeAIClient()
        service = CoachChatService(client)
        service.chat([{'role': 'user', 'content': 'Hi'}], mode='nova')
        system_prompt = client.last_call[2]
        self.assertIn('Nova', system_prompt)

    def test_chat_default_mode_is_coach(self):
        client = FakeAIClient()
        service = CoachChatService(client)
        service.chat([{'role': 'user', 'content': 'Hi'}])
        system_prompt = client.last_call[2]
        self.assertIn('Customer Success', system_prompt)


class CoachStreamServiceTests(TestCase):
    """ISP: CoachStreamService only handles streaming."""

    def test_stream_returns_generator(self):
        client = FakeAIClient()
        service = CoachStreamService(client)
        gen = service.stream([{'role': 'user', 'content': 'Hello'}])
        chunks = list(gen)
        self.assertTrue(len(chunks) > 0)

    def test_stream_delegates_to_client(self):
        client = FakeAIClient()
        service = CoachStreamService(client)
        service.stream([{'role': 'user', 'content': 'Hello'}], mode='nova')
        self.assertEqual(client.last_call[0], 'stream')


# ──────────────────────────────────────────────
# View tests
# ──────────────────────────────────────────────

class CoachChatViewTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = AuthService.register({
            'email': 'coach@test.com', 'password': 'pass1234',
            'display_name': '', 'role': 'csm', 'company_name': 'Corp',
        })
        self.client.force_authenticate(user=self.user)

    @patch('apps.coach.views.get_ai_client')
    def test_chat_success(self, mock_factory):
        mock_factory.return_value = FakeAIClient()
        resp = self.client.post('/api/coach/chat/', {
            'messages': [{'role': 'user', 'content': 'Hello'}],
            'mode': 'coach',
        }, format='json')
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.data['content'], 'fake response')

    @patch('apps.coach.views.get_ai_client')
    def test_chat_missing_api_key(self, mock_factory):
        mock_factory.side_effect = ValueError('ANTHROPIC_API_KEY is not configured.')
        resp = self.client.post('/api/coach/chat/', {
            'messages': [],
        }, format='json')
        self.assertEqual(resp.status_code, 400)

    def test_chat_unauthenticated(self):
        client = APIClient()
        resp = client.post('/api/coach/chat/', {
            'messages': [],
        }, format='json')
        self.assertEqual(resp.status_code, 401)

    @patch('apps.coach.views.get_ai_client')
    def test_stream_success(self, mock_factory):
        mock_factory.return_value = FakeAIClient()
        resp = self.client.post('/api/coach/stream/', {
            'messages': [{'role': 'user', 'content': 'Hello'}],
            'mode': 'coach',
        }, format='json')
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp['Content-Type'], 'text/event-stream')


class CoachModelTests(TestCase):
    def test_conversation_str(self):
        from .models import CoachConversation
        user = AuthService.register({
            'email': 'cm@test.com', 'password': 'pass1234',
            'display_name': '', 'role': 'csm', 'company_name': 'Corp',
        })
        conv = CoachConversation.objects.create(user=user, messages=[])
        self.assertIn('cm@test.com', str(conv))
