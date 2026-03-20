from django.urls import path
from . import views

urlpatterns = [
    path('templates/', views.template_list),
    path('templates/<str:template_id>/', views.template_detail),
    path('send/', views.send_email),
]
