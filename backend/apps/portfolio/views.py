from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import Account, AccountTodo
from .serializers import (
    AccountSerializer, AccountListSerializer,
    AccountTodoSerializer, ImportAccountSerializer,
)


class AccountViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.action == 'list':
            return AccountListSerializer
        return AccountSerializer

    def get_queryset(self):
        company = self.request.user.company
        if not company:
            return Account.objects.none()
        qs = Account.objects.filter(company=company)
        csm = self.request.query_params.get('csm')
        risk = self.request.query_params.get('risk')
        search = self.request.query_params.get('search')
        if csm:
            qs = qs.filter(csm=csm)
        if risk:
            qs = qs.filter(risk=risk)
        if search:
            qs = qs.filter(name__icontains=search)
        return qs

    def perform_create(self, serializer):
        serializer.save(company=self.request.user.company)

    @action(detail=False, methods=['post'])
    def import_accounts(self, request):
        ser = ImportAccountSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        company = request.user.company
        created = []
        for row in ser.validated_data['accounts']:
            acc = Account.objects.create(
                company=company,
                name=row.get('name', ''),
                csm=row.get('csm', ''),
                arr=row.get('arr', 0),
                health=row.get('health', 70),
                risk=row.get('risk', 'low'),
                plan=row.get('plan', ''),
                contact=row.get('contact', ''),
                contact_email=row.get('contact_email', ''),
                notes=row.get('notes', ''),
            )
            created.append(acc.id)
        return Response({'created': len(created), 'ids': created}, status=status.HTTP_201_CREATED)


class AccountTodoViewSet(viewsets.ModelViewSet):
    serializer_class = AccountTodoSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        company = self.request.user.company
        return AccountTodo.objects.filter(
            company=company,
            account_id=self.kwargs['account_pk'],
        )

    def perform_create(self, serializer):
        serializer.save(
            company=self.request.user.company,
            account_id=self.kwargs['account_pk'],
        )
