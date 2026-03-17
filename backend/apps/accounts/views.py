from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from django.conf import settings

from apps.core.permissions import IsCompanyMember
from .serializers import (
    RegisterSerializer, LoginSerializer, UserSerializer,
    CompanySerializer, NotificationPreferencesSerializer,
)
from .models import NotificationPreferences
from .services import AuthService, TokenService, UserService


# SRP: Each view class handles a single resource/action


class RegisterView(APIView):
    """Handles user registration."""
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        tokens = TokenService.get_tokens(user)
        return Response({
            'user': UserSerializer(user).data,
            'tokens': tokens,
        }, status=status.HTTP_201_CREATED)


class LoginView(APIView):
    """Handles user login."""
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = AuthService.authenticate(
            email=serializer.validated_data['email'],
            password=serializer.validated_data['password'],
        )
        if not user:
            return Response(
                {'error': 'Invalid credentials'},
                status=status.HTTP_401_UNAUTHORIZED,
            )
        tokens = TokenService.get_tokens(user)
        return Response({
            'user': UserSerializer(user).data,
            'tokens': tokens,
        })


class ProfileView(APIView):
    """SRP: Handles user profile read and update as separate methods."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(UserSerializer(request.user).data)

    def patch(self, request):
        serializer = UserSerializer(request.user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)


class CompanyView(APIView):
    """SRP: Handles company read and update."""
    permission_classes = [IsCompanyMember]

    def get(self, request):
        return Response(CompanySerializer(request.user.company).data)

    def patch(self, request):
        serializer = CompanySerializer(
            request.user.company, data=request.data, partial=True,
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)


class NotificationPrefsView(APIView):
    """SRP: Handles notification preferences read and update."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        prefs, _ = NotificationPreferences.objects.get_or_create(user=request.user)
        return Response(NotificationPreferencesSerializer(prefs).data)

    def patch(self, request):
        prefs, _ = NotificationPreferences.objects.get_or_create(user=request.user)
        serializer = NotificationPreferencesSerializer(
            prefs, data=request.data, partial=True,
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)


class DeleteAccountView(APIView):
    """SRP: Handles account deletion only."""
    permission_classes = [IsAuthenticated]

    def delete(self, request):
        UserService.delete(request.user)
        return Response(status=status.HTTP_204_NO_CONTENT)


class StripeUrlsView(APIView):
    """SRP: Provides Stripe payment URLs."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response({
            'starter': settings.STRIPE_STARTER_URL,
            'growth': settings.STRIPE_GROWTH_URL,
            'elite': settings.STRIPE_ELITE_URL,
        })
