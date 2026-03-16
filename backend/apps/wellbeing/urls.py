from django.urls import path
from . import views

urlpatterns = [
    path('', views.wellbeing_get),
    path('update/', views.wellbeing_update),
]
