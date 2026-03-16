from django.contrib.auth import authenticate, get_user_model
from rest_framework_simplejwt.tokens import RefreshToken

from .models import Company, NotificationPreferences

User = get_user_model()


class CompanyService:
    """SRP: Responsible only for company lifecycle operations."""

    @staticmethod
    def create(name):
        return Company.objects.create(name=name)

    @staticmethod
    def delete_if_empty(company):
        """Delete a company only if it has no remaining users."""
        if company and company.users.count() == 0:
            company.delete()
            return True
        return False


class UserService:
    """SRP: Responsible only for user creation and deletion."""

    @staticmethod
    def create(email, password, company, display_name='', role='csm'):
        return User.objects.create_user(
            username=email,
            email=email,
            password=password,
            display_name=display_name,
            role=role,
            company=company,
        )

    @staticmethod
    def delete(user):
        company = user.company
        user.delete()
        CompanyService.delete_if_empty(company)


class NotificationService:
    """SRP: Responsible only for notification preferences."""

    @staticmethod
    def create_defaults(user):
        return NotificationPreferences.objects.get_or_create(user=user)


class TokenService:
    """SRP: Responsible only for JWT token operations."""

    @staticmethod
    def get_tokens(user):
        refresh = RefreshToken.for_user(user)
        return {
            'access': str(refresh.access_token),
            'refresh': str(refresh),
        }


class AuthService:
    """SRP: Orchestrates registration and login only (delegates to focused services)."""

    @staticmethod
    def register(validated_data):
        company_name = validated_data.pop('company_name')
        company = CompanyService.create(company_name)
        user = UserService.create(
            email=validated_data['email'],
            password=validated_data['password'],
            company=company,
            display_name=validated_data.get('display_name', ''),
            role=validated_data['role'],
        )
        NotificationService.create_defaults(user)
        return user

    @staticmethod
    def authenticate(email, password):
        return authenticate(username=email, password=password)


class AccountImportService:
    """SRP: Handles bulk import of accounts for a company."""

    @staticmethod
    def import_accounts(company, accounts_data):
        from apps.portfolio.models import Account
        created = []
        for row in accounts_data:
            acc = Account.objects.create(
                company=company,
                name=row.get('name', ''),
                csm=row.get('csm', ''),
                arr=row.get('arr', 0),
                health=row.get('health', 70),
                risk=row.get('risk', 'low'),
                plan=row.get('plan', ''),
                contact=row.get('contact', ''),
                contact_email=row.get('contact_email', ''),
                notes=row.get('notes', ''),
            )
            created.append(acc.id)
        return created
