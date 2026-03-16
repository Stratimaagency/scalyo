from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate, get_user_model
from django.conf import settings

from .serializers import (
    RegisterSerializer, LoginSerializer, UserSerializer,
    CompanySerializer, NotificationPreferencesSerializer,
)
from .models import Company, NotificationPreferences

User = get_user_model()


@api_view(['POST'])
@permission_classes([AllowAny])
def register_view(request):
    serializer = RegisterSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    user = serializer.save()
    refresh = RefreshToken.for_user(user)
    return Response({
        'user': UserSerializer(user).data,
        'tokens': {
            'access': str(refresh.access_token),
            'refresh': str(refresh),
        }
    }, status=status.HTTP_201_CREATED)


@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    serializer = LoginSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    user = authenticate(
        username=serializer.validated_data['email'],
        password=serializer.validated_data['password'],
    )
    if not user:
        return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)
    refresh = RefreshToken.for_user(user)
    return Response({
        'user': UserSerializer(user).data,
        'tokens': {
            'access': str(refresh.access_token),
            'refresh': str(refresh),
        }
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
@permission_classes([IsAuthenticated])
def company_view(request):
    company = request.user.company
    if not company:
        return Response({'error': 'No company'}, status=404)
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
    user = request.user
    company = user.company
    if company and company.users.count() == 1:
        company.delete()
    user.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def stripe_urls_view(request):
    return Response({
        'starter': settings.STRIPE_STARTER_URL,
        'growth': settings.STRIPE_GROWTH_URL,
        'elite': settings.STRIPE_ELITE_URL,
    })
