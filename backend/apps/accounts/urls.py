from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from . import views

urlpatterns = [
    path('register/', views.register_view),
    path('login/', views.login_view),
    path('token/refresh/', TokenRefreshView.as_view()),
    path('profile/', views.profile_view),
    path('company/', views.company_view),
    path('notifications/', views.notification_prefs_view),
    path('delete-account/', views.delete_account_view),
    path('stripe-urls/', views.stripe_urls_view),
]
