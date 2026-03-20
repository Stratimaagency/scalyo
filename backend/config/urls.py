from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('apps.accounts.urls')),
    path('api/portfolio/', include('apps.portfolio.urls')),
    path('api/kpis/', include('apps.kpis.urls')),
    path('api/tasks/', include('apps.tasks.urls')),
    path('api/planning/', include('apps.planning.urls')),
    path('api/wellbeing/', include('apps.wellbeing.urls')),
    path('api/roadmap/', include('apps.roadmap.urls')),
    path('api/coach/', include('apps.coach.urls')),
    path('api/feedback/', include('apps.feedback.urls')),
    path('api/email-studio/', include('apps.email_studio.urls')),
    path('api/billing/', include('apps.billing.urls')),
]
