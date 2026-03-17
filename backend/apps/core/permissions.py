from rest_framework.permissions import IsAuthenticated


class IsCompanyMember(IsAuthenticated):
    """Ensures the user is authenticated AND belongs to a company."""

    message = 'You must belong to a company to access this resource.'

    def has_permission(self, request, view):
        if not super().has_permission(request, view):
            return False
        return getattr(request.user, 'company', None) is not None
