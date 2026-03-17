from apps.core.views import singleton_get_save_views
from .models import Roadmap
from .serializers import RoadmapSerializer

roadmap_get, roadmap_update = singleton_get_save_views(Roadmap, RoadmapSerializer)
