from django.urls import path
from . import views

urlpatterns = [
    path('chat/', views.CoachChatView.as_view()),
    path('stream/', views.CoachStreamView.as_view()),
]
