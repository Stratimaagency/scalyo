<template>
  <div class="fade-in">
    <div class="mb-lg">
      <h3 style="font-weight: 800; margin-bottom: 4px">{{ t('tipsTitle') }}</h3>
      <p style="font-size: 13px; color: var(--muted)">{{ t('tipsDesc') }}</p>
    </div>

    <!-- Search -->
    <input v-model="search" :placeholder="t('searchTips')" class="field-input mb-md" style="max-width: 400px" />

    <!-- Role tabs -->
    <div class="tab-bar mb-lg">
      <button class="tab-item" :class="{ active: roleTab === 'manager' }" @click="roleTab = 'manager'">{{ t('managerTips') }}</button>
      <button class="tab-item" :class="{ active: roleTab === 'csm' }" @click="roleTab = 'csm'">{{ t('csmTips') }}</button>
    </div>

    <!-- Tips -->
    <div style="display: flex; flex-direction: column; gap: 8px">
      <div
        v-for="tip in filteredTips" :key="tip.id"
        class="card card-lift"
        style="padding: 16px 18px; cursor: pointer"
        @click="openTip = openTip === tip.id ? null : tip.id"
      >
        <div class="flex-between">
          <div style="display: flex; gap: 10px; align-items: center">
            <ScalyoIcon :name="tip.icon" :size="20" />
            <span style="font-weight: 700; font-size: 14px">{{ tip.title }}</span>
          </div>
          <span style="color: var(--muted); font-size: 16px; transition: transform .2s" :style="{ transform: openTip === tip.id ? 'rotate(180deg)' : '' }">▾</span>
        </div>
        <div v-if="openTip === tip.id" style="margin-top: 12px; font-size: 13px; line-height: 1.7; color: var(--muted); white-space: pre-wrap; border-top: 1px solid var(--border); padding-top: 12px">
          {{ tip.content }}
        </div>
      </div>
    </div>

    <EmptyState v-if="!filteredTips.length" icon="lightbulb" :title="t('noResults')" />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useI18n } from '../i18n'
import EmptyState from '../components/EmptyState.vue'
import ScalyoIcon from '../components/ScalyoIcon.vue'

const { t } = useI18n()
const search = ref('')
const roleTab = ref('manager')
const openTip = ref(null)

const managerTips = [
  { id: 1, icon: 'target', title: 'Comment mener un 1-on-1 CS efficace ?', content: "1. Préparez un agenda avec 3 points maximum\n2. Commencez par le positif : succès récents, wins\n3. Abordez les points de blocage avec des questions ouvertes\n4. Définissez ensemble les prochaines actions\n5. Terminez par un point bien-être\n\nDurée idéale : 30 minutes\nFréquence : hebdomadaire pour les juniors, bi-mensuelle pour les seniors" },
  { id: 2, icon: 'chart-up', title: 'Comment démontrer la valeur du CS au COMEX ?', content: "Métriques à présenter :\n- Net Revenue Retention (NRR)\n- Impact du CS sur le churn (-X% depuis mise en place)\n- Expansion revenue driven by CS\n- Time to Value (réduction)\n\nFormat :\n- Dashboard mensuel (1 page)\n- QBR trimestriel (5 slides max)\n- Toujours lier les KPIs CS aux revenus" },
  { id: 3, icon: 'fire', title: 'Comment prévenir le burn-out de mes CSMs ?', content: "Signaux d'alerte :\n- Réponses de plus en plus courtes\n- Temps de réponse en hausse\n- Baisse de qualité des interactions\n- Absentéisme ou présentéisme\n\nActions :\n1. Check-in bien-être hebdomadaire\n2. Rotation des comptes difficiles\n3. Plafond de comptes par CSM\n4. Formation continue (pas seulement opérationnelle)\n5. Créer un espace de parole sans jugement" },
  { id: 4, icon: 'people', title: "Comment structurer l'intégration d'un nouveau CSM ?", content: "Semaine 1 : Observation\n- Shadow de 3 CSMs différents\n- Lecture de la documentation\n- Présentation de l'équipe\n\nSemaine 2-3 : Accompagnement\n- Prise en charge de 3-5 comptes simples\n- Buddy system avec un CSM senior\n- Daily check-in\n\nSemaine 4-8 : Autonomie progressive\n- Portefeuille croissant\n- Premier QBR supervisé\n- Feedback 360 à J+30\n\nJ+90 : Évaluation complète" },
  { id: 5, icon: 'trophy', title: 'Comment fixer des objectifs CS équilibrés ?', content: "Catégories d'objectifs :\n\n1. Rétention (40%)\n- GRR > 90%\n- NRR > 105%\n- Churn < 5%\n\n2. Satisfaction (30%)\n- NPS > 40\n- CSAT > 8/10\n- Health Score moyen > 70\n\n3. Développement (20%)\n- Expansion MRR\n- Upsell/Cross-sell pipeline\n\n4. Opérationnel (10%)\n- Time to first value\n- SLA respect" },
]

const csmTips = [
  { id: 10, icon: 'handshake', title: 'Comment gérer un conflit avec un collègue CSM ?', content: "1. Identifiez le problème de fond (pas les symptômes)\n2. Demandez un 1-on-1 informel\n3. Utilisez le format \"je\" : \"Je ressens... quand...\"\n4. Cherchez une solution win-win\n5. Si nécessaire, impliquez un médiateur\n\nÀ éviter :\n- Régler ça par email/Slack\n- En parler à toute l'équipe\n- Accumuler sans communiquer" },
  { id: 11, icon: 'dashboard', title: 'Comment accélérer la montée en compétences ?', content: "1. Identifiez vos lacunes (auto-évaluation)\n2. Trouvez un mentor dans l'équipe\n3. Documentez chaque interaction difficile\n4. Demandez des feedbacks réguliers\n5. Lisez 1 article CS par jour\n\nRessources recommandées :\n- Gainsight Pulse\n- CS Insider\n- SuccessHACKER\n- The Customer Success Café (podcast)" },
  { id: 12, icon: 'lightbulb', title: 'Comment influencer sans autorité formelle ?', content: "1. Construisez votre crédibilité par les données\n2. Devenez expert d'un domaine spécifique\n3. Partagez vos insights proactivement\n4. Aidez les autres avant de demander\n5. Proposez des solutions, pas des problèmes\n\nTechnique : le \"pull\" plutôt que le \"push\"\n- Posez des questions qui mènent à votre conclusion\n- Laissez les autres s'approprier l'idée\n- Soyez patient et constant" },
  { id: 13, icon: 'brain', title: 'Comment gérer la surcharge sans alerter le manager ?', content: "D'abord : il est OK d'alerter votre manager ! C'est leur rôle de vous aider.\n\nMais si vous voulez d'abord essayer :\n1. Priorisez par impact business (ARR × risque)\n2. Automatisez les tâches répétitives\n3. Utilisez des templates pour les emails récurrents\n4. Regroupez les tâches similaires (batch)\n5. Dites non aux réunions sans agenda\n\nSi ça persiste > 2 semaines, communiquez avec votre manager." },
  { id: 14, icon: 'star-glow', title: "Comment devenir une référence dans l'équipe ?", content: "1. Expertise : Maîtrisez parfaitement 2-3 sujets\n2. Partage : Créez des guides, des templates\n3. Mentorat : Aidez les nouveaux arrivants\n4. Innovation : Proposez des améliorations de process\n5. Fiabilité : Soyez constant dans la qualité\n\nVisibilité :\n- Présentez en réunion d'équipe\n- Documentez vos best practices\n- Participez aux projets transverses" },
]

const filteredTips = computed(() => {
  const list = roleTab.value === 'manager' ? managerTips : csmTips
  if (!search.value) return list
  const q = search.value.toLowerCase()
  return list.filter(t => t.title.toLowerCase().includes(q) || t.content.toLowerCase().includes(q))
})
</script>
