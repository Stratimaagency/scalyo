<template>
  <div class="fade-in">
    <div class="mb-lg">
      <h3 style="font-weight: 800; margin-bottom: 4px">{{ t('resources') }}</h3>
      <p style="font-size: 13px; color: var(--muted)">Frameworks, guides and best practices for CS teams</p>
    </div>

    <!-- Category filter -->
    <div style="display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 16px">
      <button class="chip" :class="{ active: catFilter === 'all' }" @click="catFilter = 'all'">{{ t('allAccounts') || 'All' }}</button>
      <button v-for="cat in categories" :key="cat.key" class="chip" :class="{ active: catFilter === cat.key }" @click="catFilter = cat.key">
        <ScalyoIcon :name="cat.icon" :size="14" /> {{ cat.label }}
      </button>
    </div>

    <!-- Resource cards -->
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 14px">
      <AppCard v-for="res in filteredResources" :key="res.id" class="card-lift" style="cursor: pointer" @click="selectedResource = res">
        <div style="margin-bottom: 10px"><ScalyoIcon :name="res.icon" :size="32" /></div>
        <div style="font-weight: 800; margin-bottom: 4px">{{ res.title }}</div>
        <div style="font-size: 12px; color: var(--muted); line-height: 1.6">{{ res.desc }}</div>
        <div style="margin-top: 10px">
          <span class="tag" :class="'risk-low'" style="font-size: 10px">{{ res.category }}</span>
        </div>
      </AppCard>
    </div>

    <!-- Detail modal -->
    <AppModal v-if="selectedResource" :title="selectedResource.title" @close="selectedResource = null" maxWidth="700px">
      <div style="text-align: center; margin-bottom: 16px"><ScalyoIcon :name="selectedResource.icon" :size="52" /></div>
      <div style="white-space: pre-wrap; font-size: 14px; line-height: 1.8; color: var(--text)">{{ selectedResource.content }}</div>
    </AppModal>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useI18n } from '../i18n'
import AppCard from '../components/AppCard.vue'
import AppModal from '../components/AppModal.vue'
import ScalyoIcon from '../components/ScalyoIcon.vue'

const { t } = useI18n()
const catFilter = ref('all')
const selectedResource = ref(null)

const categories = [
  { key: 'framework', icon: 'clipboard', label: 'Frameworks' },
  { key: 'kpi', icon: 'dashboard', label: 'KPIs' },
  { key: 'playbook', icon: 'book-open', label: 'Playbooks' },
  { key: 'template', icon: 'memo', label: 'Templates' },
]

const resources = [
  { id: 1, icon: 'target', title: 'NPS de 0 à +50 en 60 jours', desc: 'Framework complet avec étapes, scripts et métriques de suivi.', category: 'framework', content: "Phase 1 (J1-15): Audit & Baseline\n- Envoyer le NPS à 100% de la base\n- Identifier détracteurs, passifs, promoteurs\n- Classifier les retours par thème\n\nPhase 2 (J15-30): Close the Loop\n- Appeler chaque détracteur (< 24h)\n- Créer un plan d'action par compte\n- Communiquer les améliorations\n\nPhase 3 (J30-45): Améliorer\n- Implémenter les quick wins\n- Former l'équipe sur les patterns récurrents\n- Relancer le NPS aux détracteurs traités\n\nPhase 4 (J45-60): Consolider\n- Mesurer l'évolution\n- Documenter les best practices\n- Automatiser le suivi" },
  { id: 2, icon: 'dashboard', title: 'KPIs Essentiels CS', desc: 'Indicateurs essentiels pour le suivi hebdomadaire de votre équipe.', category: 'kpi', content: "KPIs Opérationnels:\n- Time to Value (TTV)\n- First Response Time\n- Resolution Time\n- Tickets/CSM/semaine\n\nKPIs Business:\n- Net Revenue Retention (NRR)\n- Gross Revenue Retention (GRR)\n- Expansion MRR\n- Churn Rate\n\nKPIs Satisfaction:\n- NPS\n- CSAT\n- CES (Customer Effort Score)\n- Health Score moyen" },
  { id: 3, icon: 'refresh', title: 'Matrice Valeur × Risque', desc: 'Classifiez vos comptes par valeur × risque. Décisions rapides.', category: 'framework', content: "Quadrant 1 - Haute Valeur / Haut Risque: PRIORITÉ ABSOLUE\n→ Action immédiate, escalade manager, plan de sauvetage\n\nQuadrant 2 - Haute Valeur / Bas Risque: PROTÉGER & DÉVELOPPER\n→ QBR réguliers, upsell/cross-sell, advocacy\n\nQuadrant 3 - Basse Valeur / Haut Risque: AUTOMATISER\n→ Self-service, contenu, webinars collectifs\n\nQuadrant 4 - Basse Valeur / Bas Risque: TECH TOUCH\n→ Emails automatiques, in-app guidance" },
  { id: 4, icon: 'warning', title: 'Protocole Détection Churn', desc: "Signaux d'alerte précoce et procédure d'intervention en 5 étapes.", category: 'playbook', content: "Signaux d'alerte:\n- Baisse d'usage > 20% sur 30 jours\n- Pas de login depuis 14+ jours\n- Ticket de facturation/annulation\n- Changement de champion/sponsor\n- NPS détracteur\n\nProcédure en 5 étapes:\n1. Détection (automatique via health score)\n2. Qualification (appel discovery en 24h)\n3. Plan d'action (roadmap personnalisée)\n4. Exécution (weekly check-ins)\n5. Stabilisation (monitoring 90 jours)" },
  { id: 5, icon: 'envelope', title: 'Séquences Email Automatisées', desc: 'Templates pour onboarding, QBR, renouvellement et plus.', category: 'template', content: "Séquence Onboarding (30 jours):\n- J+0: Welcome + Setup guide\n- J+3: Check-in \"Avez-vous besoin d'aide ?\"\n- J+7: Tips & Best practices\n- J+14: Premier QBR mini\n- J+30: Bilan du premier mois\n\nSéquence Renouvellement (90 jours avant):\n- J-90: Teaser nouvelles features\n- J-60: QBR avec ROI review\n- J-30: Proposition de renouvellement\n- J-14: Relance si pas de réponse\n- J-7: Escalade si nécessaire" },
  { id: 6, icon: 'building', title: 'Onboarding Playbook', desc: 'Structure standard pour un onboarding client réussi.', category: 'playbook', content: "Phase 1 - Kickoff (Semaine 1):\n- Call de bienvenue\n- Définir les objectifs du client\n- Identifier les KPIs de succès\n- Planifier les jalons\n\nPhase 2 - Setup (Semaines 2-3):\n- Configuration technique\n- Import de données\n- Formation admin\n\nPhase 3 - Adoption (Semaines 4-8):\n- Formation utilisateurs\n- Suivi de l'adoption\n- Quick wins\n\nPhase 4 - Handoff (Semaines 8-12):\n- Premier QBR\n- Transition vers le CSM\n- Documenter le plan de succès" },
]

const filteredResources = computed(() => {
  if (catFilter.value === 'all') return resources
  return resources.filter(r => r.category === catFilter.value)
})
</script>
