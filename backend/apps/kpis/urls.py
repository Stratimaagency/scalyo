from django.urls import path
from . import views

urlpatterns = [
    path('', views.kpi_list),
    path('monthly/', views.kpi_save_monthly),
    path('custom/', views.kpi_save_custom),
    path('goals/', views.kpi_save_goals),
]
