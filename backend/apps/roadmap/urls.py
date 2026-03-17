from django.urls import path
from . import views

urlpatterns = [
    path('', views.roadmap_get),
    path('update/', views.roadmap_update),
]
