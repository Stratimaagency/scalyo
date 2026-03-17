from rest_framework import serializers
from .models import KpiData


class KpiDataSerializer(serializers.ModelSerializer):
    class Meta:
        model = KpiData
        fields = ['id', 'period', 'kpis', 'goals', 'custom_kpis', 'history', 'updated_at']
        read_only_fields = ['id', 'updated_at']


class KpiSaveMonthlySerializer(serializers.Serializer):
    period = serializers.CharField(max_length=50)
    kpis = serializers.DictField(required=False, default=dict)
    goals = serializers.DictField(required=False, default=dict)

    def validate_period(self, value):
        if value.startswith('__'):
            raise serializers.ValidationError('Use dedicated endpoints for custom/goals data.')
        return value


class KpiSaveCustomSerializer(serializers.Serializer):
    custom_kpis = serializers.ListField(required=False, default=list)
    history = serializers.DictField(required=False, default=dict)


class KpiSaveGoalsSerializer(serializers.Serializer):
    goals = serializers.DictField()
