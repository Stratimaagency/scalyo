from django.db import models


class KpiData(models.Model):
    company = models.ForeignKey(
        'accounts.Company', on_delete=models.CASCADE, related_name='kpi_data'
    )
    period = models.CharField(max_length=50)  # e.g. "2025-03", "__custom__", "__goals__"
    kpis = models.JSONField(default=dict, blank=True)
    goals = models.JSONField(default=dict, blank=True)
    custom_kpis = models.JSONField(default=list, blank=True)
    history = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ['company', 'period']
        verbose_name = 'KPI data'
        verbose_name_plural = 'KPI data'

    def __str__(self):
        return f"{self.company.name} - {self.period}"
