from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import CalendarEvents
from .serializers import CalendarEventsSerializer


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def events_list(request):
    company = request.user.company
    if not company:
        return Response({'events': []})
    obj, _ = CalendarEvents.objects.get_or_create(company=company)
    return Response(CalendarEventsSerializer(obj).data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def events_save(request):
    company = request.user.company
    obj, _ = CalendarEvents.objects.get_or_create(company=company)
    obj.events = request.data.get('events', [])
    obj.save()
    return Response(CalendarEventsSerializer(obj).data)
