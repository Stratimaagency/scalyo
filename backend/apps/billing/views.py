import json
import stripe
from django.conf import settings
from django.http import HttpResponse
from django.views.decorators.csrf import csrf_exempt
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .services import StripeService


class CreateCheckoutView(APIView):
    """Creates a Stripe Checkout session for subscription."""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        plan = request.data.get('plan')
        if plan not in ('Starter', 'Growth', 'Elite'):
            return Response({'error': 'Invalid plan'}, status=400)

        try:
            session = StripeService.create_checkout_session(
                company=request.user.company,
                email=request.user.email,
                plan=plan,
            )
            return Response({'checkout_url': session.url})
        except ValueError as e:
            return Response({'error': str(e)}, status=400)


class CustomerPortalView(APIView):
    """Creates a Stripe Customer Portal session."""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            session = StripeService.create_portal_session(request.user.company)
            return Response({'portal_url': session.url})
        except ValueError as e:
            return Response({'error': str(e)}, status=400)


class SubscriptionStatusView(APIView):
    """Returns current subscription status."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        company = request.user.company
        return Response({
            'plan': company.plan,
            'subscription_status': company.subscription_status,
            'has_subscription': bool(company.stripe_subscription_id),
        })


@csrf_exempt
def stripe_webhook(request):
    """Handles Stripe webhook events."""
    payload = request.body
    sig_header = request.META.get('HTTP_STRIPE_SIGNATURE', '')

    webhook_secret = settings.STRIPE_WEBHOOK_SECRET
    if webhook_secret:
        try:
            event = stripe.Webhook.construct_event(payload, sig_header, webhook_secret)
        except (ValueError, stripe.error.SignatureVerificationError):
            return HttpResponse(status=400)
    else:
        try:
            event = json.loads(payload)
        except json.JSONDecodeError:
            return HttpResponse(status=400)

    event_type = event.get('type', '')
    data_object = event.get('data', {}).get('object', {})

    if event_type == 'checkout.session.completed':
        StripeService.handle_checkout_completed(data_object)
    elif event_type == 'customer.subscription.updated':
        StripeService.handle_subscription_updated(data_object)
    elif event_type == 'customer.subscription.deleted':
        StripeService.handle_subscription_deleted(data_object)

    return HttpResponse(status=200)
