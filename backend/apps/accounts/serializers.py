from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Company, NotificationPreferences

User = get_user_model()


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    company_name = serializers.CharField(write_only=True)
    role = serializers.ChoiceField(choices=User.ROLE_CHOICES)

    class Meta:
        model = User
        fields = ['email', 'password', 'display_name', 'company_name', 'role']

    def create(self, validated_data):
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


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField()


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'email', 'display_name', 'role', 'language', 'theme', 'currency', 'company']
        read_only_fields = ['id', 'email']


class CompanySerializer(serializers.ModelSerializer):
    class Meta:
        model = Company
        fields = '__all__'


class NotificationPreferencesSerializer(serializers.ModelSerializer):
    class Meta:
        model = NotificationPreferences
        fields = ['churn_alerts', 'weekly_report', 'wellbeing_alerts', 'renewal_alerts']
