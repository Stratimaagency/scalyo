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
            'id', 'name', 'csm', 'mrr', 'arr', 'industry', 'usage',
            'health', 'risk', 'plan',
            'contact', 'contact_email', 'issues', 'notes',
            'onboarding_date', 'renewal_date', 'renewal', 'todos',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def validate_health(self, value):
        if not 0 <= value <= 100:
            raise serializers.ValidationError('Health score must be between 0 and 100.')
        return value

    def validate_risk(self, value):
        valid = [c[0] for c in Account.RISK_CHOICES]
        if value and value not in valid:
            raise serializers.ValidationError(f'Risk must be one of: {", ".join(valid)}')
        return value


class AccountListSerializer(serializers.ModelSerializer):
    class Meta:
        model = Account
        fields = [
            'id', 'name', 'csm', 'mrr', 'arr', 'industry', 'usage',
            'health', 'risk', 'plan',
            'contact', 'renewal', 'issues', 'created_at',
        ]


class ImportAccountRowSerializer(serializers.Serializer):
    """Validates each row in a bulk import."""
    name = serializers.CharField(max_length=255)
    csm = serializers.CharField(max_length=255, required=False, default='')
    mrr = serializers.DecimalField(max_digits=12, decimal_places=2, required=False, default=0)
    arr = serializers.DecimalField(max_digits=12, decimal_places=2, required=False, default=0)
    industry = serializers.CharField(max_length=100, required=False, default='')
    usage = serializers.IntegerField(min_value=0, max_value=100, required=False, default=70)
    health = serializers.IntegerField(min_value=0, max_value=100, required=False, default=70)
    risk = serializers.ChoiceField(choices=Account.RISK_CHOICES, required=False, default='low')
    plan = serializers.CharField(max_length=50, required=False, default='')
    contact = serializers.CharField(max_length=255, required=False, default='')
    contact_email = serializers.EmailField(required=False, default='')
    renewal = serializers.CharField(max_length=50, required=False, default='')
    notes = serializers.CharField(required=False, default='')


class ImportAccountSerializer(serializers.Serializer):
    accounts = ImportAccountRowSerializer(many=True)

    def validate_accounts(self, value):
        if not value:
            raise serializers.ValidationError('At least one account is required.')
        return value
