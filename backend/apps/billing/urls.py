from django.urls import path
from . import views

urlpatterns = [
    path('checkout/', views.CreateCheckoutView.as_view()),
    path('portal/', views.CustomerPortalView.as_view()),
    path('status/', views.SubscriptionStatusView.as_view()),
    path('webhook/', views.stripe_webhook),
]
