from django.db import models


class Account(models.Model):
    RISK_CHOICES = [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('critical', 'Critical'),
    ]
    company = models.ForeignKey(
        'accounts.Company', on_delete=models.CASCADE, related_name='accounts'
    )
    name = models.CharField(max_length=255)
    csm = models.CharField(max_length=255, blank=True, default='')
    mrr = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    arr = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    industry = models.CharField(max_length=100, blank=True, default='')
    usage = models.IntegerField(default=70)
    health = models.IntegerField(default=70)
    risk = models.CharField(max_length=10, choices=RISK_CHOICES, default='low')
    plan = models.CharField(max_length=50, blank=True, default='')
    contact = models.CharField(max_length=255, blank=True, default='')
    contact_email = models.EmailField(blank=True, default='')
    issues = models.JSONField(default=list, blank=True)
    notes = models.TextField(blank=True, default='')
    onboarding_date = models.DateField(null=True, blank=True)
    renewal_date = models.DateField(null=True, blank=True)
    renewal = models.CharField(max_length=50, blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-arr']

    def __str__(self):
        return self.name


class AccountTodo(models.Model):
    account = models.ForeignKey(Account, on_delete=models.CASCADE, related_name='todos')
    company = models.ForeignKey('accounts.Company', on_delete=models.CASCADE)
    text = models.CharField(max_length=500)
    done = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.account.name}: {self.text}"
