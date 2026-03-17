from abc import ABCMeta
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response

from .permissions import IsCompanyMember


class SingletonModelViewMeta(ABCMeta):
    """LSP: Metaclass that enforces subclasses define model_class and serializer_class.
    This ensures any subclass satisfies the contract at class definition time,
    preventing silent failures at runtime."""

    def __init__(cls, name, bases, namespace):
        super().__init__(name, bases, namespace)
        # Skip validation on the base mixin itself
        if name != 'SingletonModelViewMixin' and bases:
            is_concrete = any(
                issubclass(b, SingletonModelViewMixin)
                for b in bases
                if b is not SingletonModelViewMixin
                and hasattr(b, 'model_class')
            )
            if not is_concrete:
                if getattr(cls, 'model_class', None) is None:
                    raise TypeError(
                        f"{name} must define 'model_class' "
                        f"(LSP: subclasses must fulfill the base contract)"
                    )
                if getattr(cls, 'serializer_class', None) is None:
                    raise TypeError(
                        f"{name} must define 'serializer_class' "
                        f"(LSP: subclasses must fulfill the base contract)"
                    )


class SingletonModelViewMixin(metaclass=SingletonModelViewMeta):
    """
    LSP: Mixin for models with a OneToOne relationship to Company.
    Subclasses MUST define model_class and serializer_class to satisfy
    the Liskov Substitution Principle — any subclass can be used wherever
    the base mixin is expected without breaking behavior.
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
