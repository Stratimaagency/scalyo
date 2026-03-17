from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response

from apps.core.mixins import CompanyQuerySetMixin
from apps.core.permissions import IsCompanyMember
from .models import Account, AccountTodo
from .serializers import (
    AccountSerializer, AccountListSerializer,
    AccountTodoSerializer, ImportAccountSerializer,
)
from .services import AccountImportService  # SRP: import from portfolio's own services


class AccountViewSet(CompanyQuerySetMixin, viewsets.ModelViewSet):
    permission_classes = [IsCompanyMember]
    queryset = Account.objects.all()
    filterset_fields = ['csm', 'risk']
    search_fields = ['name']

    def get_serializer_class(self):
        if self.action == 'list':
            return AccountListSerializer
        return AccountSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        search = self.request.query_params.get('search')
        if search:
            qs = qs.filter(name__icontains=search)
        return qs

    @action(detail=False, methods=['post'])
    def import_accounts(self, request):
        serializer = ImportAccountSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        company = self.get_company()
        created_ids = AccountImportService.import_accounts(
            company, serializer.validated_data['accounts']
        )
        return Response(
            {'created': len(created_ids), 'ids': created_ids},
            status=status.HTTP_201_CREATED,
        )


class AccountTodoViewSet(CompanyQuerySetMixin, viewsets.ModelViewSet):
    serializer_class = AccountTodoSerializer
    permission_classes = [IsCompanyMember]
    queryset = AccountTodo.objects.all()

    def get_queryset(self):
        return super().get_queryset().filter(account_id=self.kwargs['account_pk'])

    def perform_create(self, serializer):
        serializer.save(
            company=self.get_company(),
            account_id=self.kwargs['account_pk'],
        )
