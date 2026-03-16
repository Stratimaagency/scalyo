from .models import KpiData


class KpiService:
    """Handles KPI data persistence with update_or_create pattern."""

    @staticmethod
    def get_all(company):
        return KpiData.objects.filter(company=company)

    @staticmethod
    def save_monthly(company, period, kpis, goals):
        obj, _ = KpiData.objects.update_or_create(
            company=company, period=period,
            defaults={'kpis': kpis, 'goals': goals},
        )
        return obj

    @staticmethod
    def save_custom(company, custom_kpis, history):
        obj, _ = KpiData.objects.update_or_create(
            company=company, period='__custom__',
            defaults={'custom_kpis': custom_kpis, 'history': history},
        )
        return obj

    @staticmethod
    def save_goals(company, goals):
        obj, _ = KpiData.objects.update_or_create(
            company=company, period='__goals__',
            defaults={'goals': goals},
        )
        return obj
