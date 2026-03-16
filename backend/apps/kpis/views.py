from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from .models import KpiData
from .serializers import KpiDataSerializer


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def kpi_list(request):
    company = request.user.company
    if not company:
        return Response([])
    data = KpiData.objects.filter(company=company)
    return Response(KpiDataSerializer(data, many=True).data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def kpi_save_monthly(request):
    company = request.user.company
    period = request.data.get('period')
    if not period:
        return Response({'error': 'period required'}, status=400)
    obj, _ = KpiData.objects.update_or_create(
        company=company, period=period,
        defaults={'kpis': request.data.get('kpis', {}), 'goals': request.data.get('goals', {})}
    )
    return Response(KpiDataSerializer(obj).data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def kpi_save_custom(request):
    company = request.user.company
    obj, _ = KpiData.objects.update_or_create(
        company=company, period='__custom__',
        defaults={
            'custom_kpis': request.data.get('custom_kpis', []),
            'history': request.data.get('history', {}),
        }
    )
    return Response(KpiDataSerializer(obj).data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def kpi_save_goals(request):
    company = request.user.company
    obj, _ = KpiData.objects.update_or_create(
        company=company, period='__goals__',
        defaults={'goals': request.data.get('goals', {})}
    )
    return Response(KpiDataSerializer(obj).data)
