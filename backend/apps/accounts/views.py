from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from django.conf import settings

from apps.core.permissions import IsCompanyMember
from .serializers import (
    RegisterSerializer, LoginSerializer, UserSerializer,
    CompanySerializer, NotificationPreferencesSerializer,
)
from .models import NotificationPreferences
from .services import AuthService, AccountDeletionService


@api_view(['POST'])
@permission_classes([AllowAny])
def register_view(request):
    serializer = RegisterSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    user = serializer.save()
    tokens = AuthService.get_tokens(user)
    return Response({
        'user': UserSerializer(user).data,
        'tokens': tokens,
    }, status=status.HTTP_201_CREATED)


@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    serializer = LoginSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    user = AuthService.authenticate(
        email=serializer.validated_data['email'],
        password=serializer.validated_data['password'],
    )
    if not user:
        return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)
    tokens = AuthService.get_tokens(user)
    return Response({
        'user': UserSerializer(user).data,
        'tokens': tokens,
    })


@api_view(['GET', 'PATCH'])
@permission_classes([IsAuthenticated])
def profile_view(request):
    if request.method == 'GET':
        return Response(UserSerializer(request.user).data)
    serializer = UserSerializer(request.user, data=request.data, partial=True)
    serializer.is_valid(raise_exception=True)
    serializer.save()
    return Response(serializer.data)


@api_view(['GET', 'PATCH'])
@permission_classes([IsCompanyMember])
def company_view(request):
    company = request.user.company
    if request.method == 'GET':
        return Response(CompanySerializer(company).data)
    serializer = CompanySerializer(company, data=request.data, partial=True)
    serializer.is_valid(raise_exception=True)
    serializer.save()
    return Response(serializer.data)


@api_view(['GET', 'PATCH'])
@permission_classes([IsAuthenticated])
def notification_prefs_view(request):
    prefs, _ = NotificationPreferences.objects.get_or_create(user=request.user)
    if request.method == 'GET':
        return Response(NotificationPreferencesSerializer(prefs).data)
    serializer = NotificationPreferencesSerializer(prefs, data=request.data, partial=True)
    serializer.is_valid(raise_exception=True)
    serializer.save()
    return Response(serializer.data)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_account_view(request):
    AccountDeletionService.delete_user(request.user)
    return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def stripe_urls_view(request):
    return Response({
        'starter': settings.STRIPE_STARTER_URL,
        'growth': settings.STRIPE_GROWTH_URL,
        'elite': settings.STRIPE_ELITE_URL,
    })
