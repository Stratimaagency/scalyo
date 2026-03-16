from rest_framework import serializers
from .models import KpiData


class KpiDataSerializer(serializers.ModelSerializer):
    class Meta:
        model = KpiData
        fields = ['id', 'period', 'kpis', 'goals', 'custom_kpis', 'history', 'updated_at']
        read_only_fields = ['id', 'updated_at']
