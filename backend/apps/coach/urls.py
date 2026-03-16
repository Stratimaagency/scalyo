from django.urls import path
from . import views

urlpatterns = [
    path('chat/', views.coach_chat),
    path('stream/', views.coach_stream),
]
