from django.urls import path
from . import views

urlpatterns = [
    path('', views.task_list),
    path('save/', views.task_save),
]
