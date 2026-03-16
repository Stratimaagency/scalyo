from apps.core.views import singleton_get_save_views
from .models import Wellbeing
from .serializers import WellbeingSerializer

wellbeing_get, wellbeing_update = singleton_get_save_views(Wellbeing, WellbeingSerializer)
