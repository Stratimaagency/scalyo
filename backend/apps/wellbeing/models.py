from django.db import models


class Wellbeing(models.Model):
    BURNOUT_CHOICES = [
        ('none', 'None'),
        ('low', 'Low'),
        ('moderate', 'Moderate'),
        ('high', 'High'),
    ]
    company = models.OneToOneField(
        'accounts.Company', on_delete=models.CASCADE, related_name='wellbeing'
    )
    score = models.IntegerField(default=70)
    burnout = models.CharField(max_length=10, choices=BURNOUT_CHOICES, default='none')
    charge = models.IntegerField(default=70)
    trend = models.CharField(max_length=10, default='+0')
    alerts = models.JSONField(default=list, blank=True)
    team = models.JSONField(default=list, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = 'wellbeing'

    def __str__(self):
        return f"Wellbeing: {self.company.name}"
