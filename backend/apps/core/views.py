from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response

from .permissions import IsCompanyMember


class SingletonModelViewMixin:
    """
    Mixin for models with a OneToOne relationship to Company.
    Handles get_or_create pattern used by TaskBoard, CalendarEvents,
    Wellbeing, and Roadmap.
    """
    model_class = None
    serializer_class = None

    def get_object(self):
        company = self.get_company()
        obj, _ = self.model_class.objects.get_or_create(company=company)
        return obj


def singleton_get_save_views(model_class, serializer_class):
    """
    Factory that creates a pair of (get_view, save_view) for singleton
    company models. Eliminates repeated get_or_create + serialize boilerplate
    in tasks, planning, wellbeing, and roadmap apps.
    """

    @api_view(['GET'])
    @permission_classes([IsCompanyMember])
    def get_view(request):
        obj, _ = model_class.objects.get_or_create(company=request.user.company)
        return Response(serializer_class(obj).data)

    @api_view(['PATCH', 'PUT', 'POST'])
    @permission_classes([IsCompanyMember])
    def save_view(request):
        obj, _ = model_class.objects.get_or_create(company=request.user.company)
        serializer = serializer_class(obj, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    return get_view, save_view
