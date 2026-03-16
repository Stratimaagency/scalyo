from apps.core.views import singleton_get_save_views
from .models import CalendarEvents
from .serializers import CalendarEventsSerializer

events_list, events_save = singleton_get_save_views(CalendarEvents, CalendarEventsSerializer)
