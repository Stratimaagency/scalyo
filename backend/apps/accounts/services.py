from django.contrib.auth import authenticate, get_user_model
from rest_framework_simplejwt.tokens import RefreshToken

from .models import Company, NotificationPreferences

User = get_user_model()


class AuthService:
    """Handles user registration and authentication."""

    @staticmethod
    def register(validated_data):
        company_name = validated_data.pop('company_name')
        company = Company.objects.create(name=company_name)
        user = User.objects.create_user(
            username=validated_data['email'],
            email=validated_data['email'],
            password=validated_data['password'],
            display_name=validated_data.get('display_name', ''),
            role=validated_data['role'],
            company=company,
        )
        NotificationPreferences.objects.create(user=user)
        return user

    @staticmethod
    def authenticate(email, password):
        return authenticate(username=email, password=password)

    @staticmethod
    def get_tokens(user):
        refresh = RefreshToken.for_user(user)
        return {
            'access': str(refresh.access_token),
            'refresh': str(refresh),
        }


class AccountDeletionService:
    """Handles user and company deletion with cleanup."""

    @staticmethod
    def delete_user(user):
        company = user.company
        if company and company.users.count() == 1:
            company.delete()
        user.delete()
