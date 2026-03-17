from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register('accounts', views.AccountViewSet, basename='account')

urlpatterns = [
    path('', include(router.urls)),
    path(
        'accounts/<int:account_pk>/todos/',
        views.AccountTodoViewSet.as_view({'get': 'list', 'post': 'create'}),
    ),
    path(
        'accounts/<int:account_pk>/todos/<int:pk>/',
        views.AccountTodoViewSet.as_view({'patch': 'partial_update', 'delete': 'destroy'}),
    ),
]
