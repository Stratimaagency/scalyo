import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const KPI_CATALOG = [
  // Revenue & Growth
  { id: 'arr', name: 'ARR', cat: 'revenue', unit: '€', format: 'currency', benchmarkGood: null, recommended: true },
  { id: 'mrr', name: 'MRR', cat: 'revenue', unit: '€', format: 'currency' },
  { id: 'nrr', name: 'NRR', cat: 'revenue', unit: '%', format: 'pct', benchmarkGood: 110, recommended: true },
  { id: 'grr', name: 'GRR', cat: 'revenue', unit: '%', format: 'pct', benchmarkGood: 90 },
  { id: 'arr_new', name: 'ARR New', cat: 'revenue', unit: '€', format: 'currency' },
  { id: 'arr_expansion', name: 'ARR Expansion', cat: 'revenue', unit: '€', format: 'currency' },
  { id: 'arr_contraction', name: 'ARR Contraction', cat: 'revenue', unit: '€', format: 'currency', inverse: true },
  { id: 'arr_churn', name: 'ARR Churn', cat: 'revenue', unit: '€', format: 'currency', inverse: true },
  { id: 'revenue_growth', name: 'Revenue Growth Rate', cat: 'revenue', unit: '%', format: 'pct' },
  { id: 'acv', name: 'ACV', cat: 'revenue', unit: '€', format: 'currency' },
  { id: 'arpu', name: 'ARPU', cat: 'revenue', unit: '€', format: 'currency' },
  { id: 'ltv', name: 'LTV', cat: 'revenue', unit: '€', format: 'currency' },
  { id: 'ltv_cac', name: 'LTV/CAC', cat: 'revenue', unit: 'x', format: 'number' },
  // Retention
  { id: 'churn_clients', name: 'Churn Clients', cat: 'retention', unit: '%', format: 'pct', inverse: true, recommended: true, benchmarkGood: 5 },
  { id: 'churn_revenue', name: 'Churn Revenus', cat: 'retention', unit: '%', format: 'pct', inverse: true },
  { id: 'retention_net', name: 'Rétention Net', cat: 'retention', unit: '%', format: 'pct' },
  { id: 'renewal_rate', name: 'Taux Renouvellement', cat: 'retention', unit: '%', format: 'pct' },
  { id: 'logo_retention', name: 'Logo Retention', cat: 'retention', unit: '%', format: 'pct' },
  { id: 'at_risk', name: 'At-Risk Accounts', cat: 'retention', unit: '', format: 'number' },
  { id: 'saved_accounts', name: 'Saved Accounts', cat: 'retention', unit: '', format: 'number' },
  // Health
  { id: 'health_avg', name: 'Health Score Moyen', cat: 'health', unit: '/100', format: 'score', recommended: true },
  { id: 'nps', name: 'NPS', cat: 'health', unit: '', format: 'number', recommended: true, benchmarkGood: 50 },
  { id: 'csat', name: 'CSAT', cat: 'health', unit: '/5', format: 'score' },
  { id: 'ces', name: 'CES', cat: 'health', unit: '/7', format: 'score' },
  { id: 'critical_count', name: 'Comptes Critiques', cat: 'health', unit: '', format: 'number', inverse: true },
  { id: 'watch_count', name: 'Comptes Vigilance', cat: 'health', unit: '', format: 'number' },
  { id: 'healthy_count', name: 'Comptes Sains', cat: 'health', unit: '', format: 'number' },
  // Expansion
  { id: 'expansion_rate', name: 'Taux Expansion', cat: 'expansion', unit: '%', format: 'pct' },
  { id: 'upsell_revenue', name: 'Upsell Revenue', cat: 'expansion', unit: '€', format: 'currency' },
  { id: 'crosssell_revenue', name: 'Cross-sell Revenue', cat: 'expansion', unit: '€', format: 'currency' },
  { id: 'net_new_arr', name: 'Net New ARR', cat: 'expansion', unit: '€', format: 'currency' },
  { id: 'pipeline_expansion', name: 'Pipeline Expansion', cat: 'expansion', unit: '€', format: 'currency' },
  // Activation
  { id: 'ttfv', name: 'Time to First Value', cat: 'activation', unit: 'j', format: 'number', inverse: true },
  { id: 'tta', name: 'Time to Activation', cat: 'activation', unit: 'j', format: 'number', inverse: true },
  { id: 'activation_rate', name: 'Taux Activation', cat: 'activation', unit: '%', format: 'pct' },
  { id: 'onboarding_rate', name: 'Onboarding Completion', cat: 'activation', unit: '%', format: 'pct' },
  { id: 'feature_adoption', name: 'Feature Adoption', cat: 'activation', unit: '%', format: 'pct' },
  { id: 'dau_mau', name: 'DAU/MAU', cat: 'activation', unit: '%', format: 'pct' },
  // Team
  { id: 'accounts_per_csm', name: 'Comptes / CSM', cat: 'team', unit: '', format: 'number' },
  { id: 'arr_per_csm', name: 'ARR / CSM', cat: 'team', unit: '€', format: 'currency' },
  { id: 'churn_per_csm', name: 'Churn / CSM', cat: 'team', unit: '%', format: 'pct', inverse: true },
  { id: 'nps_per_csm', name: 'NPS / CSM', cat: 'team', unit: '', format: 'number' },
  { id: 'response_time', name: 'Temps réponse client', cat: 'team', unit: 'h', format: 'number', inverse: true },
  { id: 'wellbeing_team', name: 'Bien-être Équipe', cat: 'team', unit: '/100', format: 'score' },
  // Engagement
  { id: 'qbr_done', name: 'QBRs réalisés', cat: 'engagement', unit: '%', format: 'pct' },
  { id: 'email_response', name: 'Taux réponse email', cat: 'engagement', unit: '%', format: 'pct' },
  { id: 'touches_month', name: 'Touches / mois', cat: 'engagement', unit: '', format: 'number' },
  { id: 'tickets_open', name: 'Tickets ouverts', cat: 'engagement', unit: '', format: 'number', inverse: true },
  { id: 'resolution_time', name: 'Délai résolution', cat: 'engagement', unit: 'h', format: 'number', inverse: true },
]

export const useKpiStore = defineStore('kpis', () => {
  const copils = ref([])

  function addCopil(data) {
    const id = 'copil_' + Date.now()
    copils.value.push({ id, createdAt: new Date().toISOString().slice(0, 10), ...data })
    return id
  }

  function updateCopil(id, data) {
    const i = copils.value.findIndex(c => c.id === id)
    if (i !== -1) Object.assign(copils.value[i], data)
  }

  function deleteCopil(id) {
    copils.value = copils.value.filter(c => c.id !== id)
  }

  function duplicateCopil(id) {
    const orig = copils.value.find(c => c.id === id)
    if (orig) {
      const copy = JSON.parse(JSON.stringify(orig))
      copy.id = 'copil_' + Date.now()
      copy.name = orig.name + ' (copy)'
      copy.createdAt = new Date().toISOString().slice(0, 10)
      copils.value.push(copy)
    }
  }

  function getCopil(id) {
    return copils.value.find(c => c.id === id)
  }

  function computeScore(copil) {
    if (!copil?.kpis?.length) return 0
    let total = 0, count = 0
    for (const kpi of copil.kpis) {
      if (!kpi.target || !kpi.value) continue
      const catalog = KPI_CATALOG.find(k => k.id === kpi.kpiId)
      const ratio = catalog?.inverse ? kpi.target / kpi.value : kpi.value / kpi.target
      total += Math.min(ratio * 100, 120)
      count++
    }
    return count ? Math.round(total / count) : 0
  }

  function scoreStatus(score) {
    if (score >= 95) return 'excellent'
    if (score >= 75) return 'good'
    if (score >= 50) return 'attention'
    return 'critical'
  }

  return { copils, addCopil, updateCopil, deleteCopil, duplicateCopil, getCopil, computeScore, scoreStatus }
})
