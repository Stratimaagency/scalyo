from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import Wellbeing
from .serializers import WellbeingSerializer


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def wellbeing_get(request):
    company = request.user.company
    if not company:
        return Response({})
    obj, _ = Wellbeing.objects.get_or_create(company=company)
    return Response(WellbeingSerializer(obj).data)


@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def wellbeing_update(request):
    company = request.user.company
    obj, _ = Wellbeing.objects.get_or_create(company=company)
    serializer = WellbeingSerializer(obj, data=request.data, partial=True)
    serializer.is_valid(raise_exception=True)
    serializer.save()
    return Response(serializer.data)
