from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    ROLE_CHOICES = [
        ('manager', 'Manager'),
        ('csm', 'CSM'),
    ]
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='csm')
    company = models.ForeignKey(
        'Company', on_delete=models.CASCADE, null=True, blank=True, related_name='users'
    )
    display_name = models.CharField(max_length=255, blank=True)
    language = models.CharField(max_length=5, default='fr')
    theme = models.CharField(max_length=10, default='dark')
    currency = models.CharField(max_length=5, default='EUR')

    def __str__(self):
        return self.display_name or self.username


class Company(models.Model):
    PLAN_CHOICES = [
        ('Starter', 'Starter'),
        ('Growth', 'Growth'),
        ('Elite', 'Elite'),
    ]
    name = models.CharField(max_length=255)
    plan = models.CharField(max_length=10, choices=PLAN_CHOICES, default='Starter')
    arr = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    churn = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    nps = models.IntegerField(default=0)
    color = models.CharField(max_length=20, default='#7EC8B8')
    logo = models.CharField(max_length=10, blank=True, default='')
    stripe_customer_id = models.CharField(max_length=255, blank=True, default='')
    stripe_subscription_id = models.CharField(max_length=255, blank=True, default='')
    subscription_status = models.CharField(max_length=20, blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = 'companies'

    def __str__(self):
        return self.name


class NotificationPreferences(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='notification_prefs')
    churn_alerts = models.BooleanField(default=True)
    weekly_report = models.BooleanField(default=True)
    wellbeing_alerts = models.BooleanField(default=True)
    renewal_alerts = models.BooleanField(default=True)

    class Meta:
        verbose_name_plural = 'notification preferences'
