from django.urls import path
from . import views

urlpatterns = [
    path('', views.events_list),
    path('save/', views.events_save),
]
