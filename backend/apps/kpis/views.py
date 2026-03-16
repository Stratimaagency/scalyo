from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response

from apps.core.permissions import IsCompanyMember
from .serializers import (
    KpiDataSerializer, KpiSaveMonthlySerializer,
    KpiSaveCustomSerializer, KpiSaveGoalsSerializer,
)
from .services import KpiService


@api_view(['GET'])
@permission_classes([IsCompanyMember])
def kpi_list(request):
    data = KpiService.get_all(request.user.company)
    return Response(KpiDataSerializer(data, many=True).data)


@api_view(['POST'])
@permission_classes([IsCompanyMember])
def kpi_save_monthly(request):
    serializer = KpiSaveMonthlySerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    d = serializer.validated_data
    obj = KpiService.save_monthly(request.user.company, d['period'], d['kpis'], d['goals'])
    return Response(KpiDataSerializer(obj).data)


@api_view(['POST'])
@permission_classes([IsCompanyMember])
def kpi_save_custom(request):
    serializer = KpiSaveCustomSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    d = serializer.validated_data
    obj = KpiService.save_custom(request.user.company, d['custom_kpis'], d['history'])
    return Response(KpiDataSerializer(obj).data)


@api_view(['POST'])
@permission_classes([IsCompanyMember])
def kpi_save_goals(request):
    serializer = KpiSaveGoalsSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    obj = KpiService.save_goals(request.user.company, serializer.validated_data['goals'])
    return Response(KpiDataSerializer(obj).data)
