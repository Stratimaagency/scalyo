import stripe
from django.conf import settings


def _get_plan_price_map():
    return {
        'Starter': settings.STRIPE_STARTER_PRICE_ID,
        'Growth': settings.STRIPE_GROWTH_PRICE_ID,
        'Elite': settings.STRIPE_ELITE_PRICE_ID,
    }


def _get_price_plan_map():
    return {v: k for k, v in _get_plan_price_map().items() if v}


class StripeService:
    """Handles all Stripe API interactions."""

    @staticmethod
    def _init_stripe():
        if not stripe.api_key:
            stripe.api_key = settings.STRIPE_SECRET_KEY

    @staticmethod
    def get_or_create_customer(company, email):
        StripeService._init_stripe()
        if company.stripe_customer_id:
            return company.stripe_customer_id
        customer = stripe.Customer.create(
            email=email,
            name=company.name,
            metadata={'company_id': str(company.id)},
        )
        company.stripe_customer_id = customer.id
        company.save(update_fields=['stripe_customer_id'])
        return customer.id

    @staticmethod
    def create_checkout_session(company, email, plan):
        price_id = _get_plan_price_map().get(plan)
        if not price_id:
            raise ValueError(f'No price configured for plan: {plan}')

        customer_id = StripeService.get_or_create_customer(company, email)

        session = stripe.checkout.Session.create(
            customer=customer_id,
            payment_method_types=['card'],
            line_items=[{'price': price_id, 'quantity': 1}],
            mode='subscription',
            success_url=f'{settings.FRONTEND_URL}/settings?billing=success',
            cancel_url=f'{settings.FRONTEND_URL}/settings?billing=cancelled',
            metadata={'company_id': str(company.id), 'plan': plan},
        )
        return session

    @staticmethod
    def create_portal_session(company):
        StripeService._init_stripe()
        if not company.stripe_customer_id:
            raise ValueError('No Stripe customer for this company')

        session = stripe.billing_portal.Session.create(
            customer=company.stripe_customer_id,
            return_url=f'{settings.FRONTEND_URL}/settings',
        )
        return session

    @staticmethod
    def handle_checkout_completed(session):
        company_id = session.get('metadata', {}).get('company_id')
        plan = session.get('metadata', {}).get('plan')
        subscription_id = session.get('subscription')

        if not company_id:
            return

        from apps.accounts.models import Company
        try:
            company = Company.objects.get(id=int(company_id))
        except Company.DoesNotExist:
            return

        company.plan = plan or company.plan
        company.stripe_subscription_id = subscription_id or ''
        company.subscription_status = 'active'
        company.save(update_fields=['plan', 'stripe_subscription_id', 'subscription_status'])

    @staticmethod
    def handle_subscription_updated(subscription):
        sub_id = subscription.get('id')
        status = subscription.get('status')

        from apps.accounts.models import Company
        try:
            company = Company.objects.get(stripe_subscription_id=sub_id)
        except Company.DoesNotExist:
            return

        company.subscription_status = status or ''

        items = subscription.get('items', {}).get('data', [])
        if items:
            price_id = items[0].get('price', {}).get('id', '')
            plan = _get_price_plan_map().get(price_id)
            if plan:
                company.plan = plan

        company.save(update_fields=['plan', 'subscription_status'])

    @staticmethod
    def handle_subscription_deleted(subscription):
        sub_id = subscription.get('id')

        from apps.accounts.models import Company
        try:
            company = Company.objects.get(stripe_subscription_id=sub_id)
        except Company.DoesNotExist:
            return

        company.plan = 'Starter'
        company.subscription_status = 'canceled'
        company.stripe_subscription_id = ''
        company.save(update_fields=['plan', 'subscription_status', 'stripe_subscription_id'])
