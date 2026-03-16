from rest_framework import serializers
from .models import Account, AccountTodo


class AccountTodoSerializer(serializers.ModelSerializer):
    class Meta:
        model = AccountTodo
        fields = ['id', 'text', 'done', 'created_at']


class AccountSerializer(serializers.ModelSerializer):
    todos = AccountTodoSerializer(many=True, read_only=True)

    class Meta:
        model = Account
        fields = [
            'id', 'name', 'csm', 'arr', 'health', 'risk', 'plan',
            'contact', 'contact_email', 'issues', 'notes',
            'onboarding_date', 'renewal_date', 'todos',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class AccountListSerializer(serializers.ModelSerializer):
    class Meta:
        model = Account
        fields = [
            'id', 'name', 'csm', 'arr', 'health', 'risk', 'plan',
            'contact', 'issues', 'created_at',
        ]


class ImportAccountSerializer(serializers.Serializer):
    accounts = serializers.ListField(child=serializers.DictField())
