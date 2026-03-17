from rest_framework.exceptions import ValidationError


class CompanyQuerySetMixin:
    """Filters queryset to the authenticated user's company."""

    def get_company(self):
        company = getattr(self.request.user, 'company', None)
        if not company:
            raise ValidationError('User has no company.')
        return company

    def get_queryset(self):
        return super().get_queryset().filter(company=self.get_company())

    def perform_create(self, serializer):
        serializer.save(company=self.get_company())
