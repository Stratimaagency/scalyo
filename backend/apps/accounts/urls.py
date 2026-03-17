from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from . import views

urlpatterns = [
    path('register/', views.RegisterView.as_view()),
    path('login/', views.LoginView.as_view()),
    path('token/refresh/', TokenRefreshView.as_view()),
    path('profile/', views.ProfileView.as_view()),
    path('company/', views.CompanyView.as_view()),
    path('notifications/', views.NotificationPrefsView.as_view()),
    path('delete-account/', views.DeleteAccountView.as_view()),
    path('stripe-urls/', views.StripeUrlsView.as_view()),
]
