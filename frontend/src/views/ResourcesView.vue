<template>
  <div class="fade-in">
    <div class="mb-lg">
      <h3 style="font-weight: 800; margin-bottom: 4px">{{ t('resTitle') }}</h3>
      <p style="font-size: 13px; color: var(--muted)">{{ t('resSubtitle') }}</p>
    </div>

    <!-- Category filter -->
    <div style="display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 16px">
      <button class="chip" :class="{ active: catFilter === 'all' }" @click="catFilter = 'all'">{{ t('resCatAll') }}</button>
      <button v-for="cat in categories" :key="cat.key" class="chip" :class="{ active: catFilter === cat.key }" @click="catFilter = cat.key">
        <ScalyoIcon :name="cat.icon" :size="14" /> {{ t(cat.labelKey) }}
      </button>
    </div>

    <!-- Resource cards -->
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 14px">
      <div v-for="res in filteredResources" :key="res.id" style="position: relative">
        <AppCard class="card-lift" :style="{ cursor: isLocked(res) ? 'default' : 'pointer', filter: isLocked(res) ? 'blur(5px)' : 'none', pointerEvents: isLocked(res) ? 'none' : 'auto' }" @click="handleResourceClick(res)">
          <div style="margin-bottom: 10px"><ScalyoIcon :name="res.icon" :size="32" /></div>
          <div style="font-weight: 800; margin-bottom: 4px">{{ t(res.titleKey) }}</div>
          <div style="font-size: 12px; color: var(--muted); line-height: 1.6">{{ t(res.descKey) }}</div>
          <div style="margin-top: 10px">
            <span class="tag" :class="'risk-low'" style="font-size: 10px">{{ t(res.categoryKey) }}</span>
          </div>
        </AppCard>
        <div v-if="isLocked(res)" style="position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; z-index: 2;">
          <div style="text-align: center; background: var(--card); border: 1px solid var(--border); border-radius: 12px; padding: 14px 20px; box-shadow: 0 4px 20px rgba(0,0,0,0.15);">
            <div style="font-size: 20px; margin-bottom: 4px">&#x1F512;</div>
            <div style="font-size: 11px; font-weight: 700; color: var(--teal)">GROWTH</div>
            <button class="btn btn-primary btn-sm" style="margin-top: 6px; font-size: 11px" @click="$router.push({ name: 'settings' })">
              {{ lang === 'en' ? 'Upgrade' : lang === 'kr' ? '업그레이드' : 'Débloquer' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Detail modal -->
    <AppModal v-if="selectedResource" :title="t(selectedResource.titleKey)" @close="selectedResource = null" maxWidth="700px">
      <div style="text-align: center; margin-bottom: 16px"><ScalyoIcon :name="selectedResource.icon" :size="52" /></div>
      <div style="white-space: pre-wrap; font-size: 14px; line-height: 1.8; color: var(--text)">{{ t(selectedResource.contentKey) }}</div>
    </AppModal>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useI18n } from '../i18n'
import { useAuthStore } from '../stores/auth'
import AppCard from '../components/AppCard.vue'
import AppModal from '../components/AppModal.vue'
import ScalyoIcon from '../components/ScalyoIcon.vue'

const { t, lang } = useI18n()
const authStore = useAuthStore()
const PLAN_RANK = { Starter: 0, Growth: 1, Elite: 2 }
const currentRank = computed(() => PLAN_RANK[authStore.company?.plan || 'Starter'] ?? 0)
const catFilter = ref('all')
const selectedResource = ref(null)

const categories = [
  { key: 'framework', icon: 'clipboard', labelKey: 'resCatGuide' },
  { key: 'kpi', icon: 'dashboard', labelKey: 'kpi' },
  { key: 'playbook', icon: 'book-open', labelKey: 'resCatPlaybook' },
  { key: 'template', icon: 'memo', labelKey: 'resCatTemplate' },
  { key: 'coaching', icon: 'users', labelKey: 'resCatCoaching' },
  { key: 'training', icon: 'clipboard', labelKey: 'resCatTraining' },
  { key: 'process', icon: 'refresh', labelKey: 'resCatProcess' },
]

const resources = [
  { id: 1, icon: 'target', titleKey: 'resNps', descKey: 'resDescNps', category: 'framework', categoryKey: 'resCatGuide', contentKey: 'resContentNps' },
  { id: 2, icon: 'dashboard', titleKey: 'resKpiEssentials', descKey: 'resDescKpi', category: 'kpi', categoryKey: 'kpi', contentKey: 'resContentKpi' },
  { id: 3, icon: 'refresh', titleKey: 'resValueRisk', descKey: 'resDescValueRisk', category: 'framework', categoryKey: 'resCatGuide', contentKey: 'resContentValueRisk' },
  { id: 4, icon: 'warning', titleKey: 'resChurnProtocol', descKey: 'resDescChurn', category: 'playbook', categoryKey: 'resCatPlaybook', contentKey: 'resContentChurn' },
  { id: 5, icon: 'envelope', titleKey: 'resEmailSequences', descKey: 'resDescEmail', category: 'template', categoryKey: 'resCatTemplate', contentKey: 'resContentEmail', minPlan: 'Growth' },
  { id: 6, icon: 'building', titleKey: 'resOnboardingPlaybook', descKey: 'resDescOnboarding', category: 'playbook', categoryKey: 'resCatPlaybook', contentKey: 'resContentOnboarding' },
  { id: 7, icon: 'users', titleKey: 'resCoachingSession', descKey: 'resDescCoaching', category: 'coaching', categoryKey: 'resCatCoaching', contentKey: 'resContentCoaching', minPlan: 'Growth' },
  { id: 8, icon: 'clipboard', titleKey: 'resQbrGuide', descKey: 'resDescQbr', category: 'framework', categoryKey: 'resCatGuide', contentKey: 'resContentQbr' },
  { id: 9, icon: 'heart', titleKey: 'resHealthScoreGuide', descKey: 'resDescHealthScore', category: 'framework', categoryKey: 'resCatGuide', contentKey: 'resContentHealthScore' },
  { id: 10, icon: 'star', titleKey: 'resTrainingNewCsm', descKey: 'resDescTraining', category: 'training', categoryKey: 'resCatTraining', contentKey: 'resContentTraining', minPlan: 'Growth' },
  { id: 11, icon: 'calendar', titleKey: 'resRenewalProcess', descKey: 'resDescRenewal', category: 'process', categoryKey: 'resCatProcess', contentKey: 'resContentRenewal' },
  { id: 12, icon: 'trending-up', titleKey: 'resExpansionPlaybook', descKey: 'resDescExpansion', category: 'playbook', categoryKey: 'resCatPlaybook', contentKey: 'resContentExpansion', minPlan: 'Growth' },
  { id: 13, icon: 'phone', titleKey: 'resRetentionScripts', descKey: 'resDescRetention', category: 'template', categoryKey: 'resCatTemplate', contentKey: 'resContentRetention' },
  { id: 14, icon: 'bolt', titleKey: 'resPlaybookSaas', descKey: 'resDescSaas', category: 'playbook', categoryKey: 'resCatPlaybook', contentKey: 'resContentSaas', minPlan: 'Growth' },
  { id: 15, icon: 'shield', titleKey: 'resPlaybookFintech', descKey: 'resDescFintech', category: 'playbook', categoryKey: 'resCatPlaybook', contentKey: 'resContentFintech', minPlan: 'Growth' },
  { id: 16, icon: 'building', titleKey: 'resPlaybookServices', descKey: 'resDescServices', category: 'playbook', categoryKey: 'resCatPlaybook', contentKey: 'resContentServices', minPlan: 'Growth' },
  { id: 17, icon: 'trending-up', titleKey: 'resRoiCalculator', descKey: 'resDescRoi', category: 'framework', categoryKey: 'resCatGuide', contentKey: 'resContentRoi' },
  { id: 18, icon: 'clipboard', titleKey: 'resQbrDeck', descKey: 'resDescQbrDeck', category: 'template', categoryKey: 'resCatTemplate', contentKey: 'resContentQbrDeck', minPlan: 'Growth' },
  { id: 19, icon: 'check', titleKey: 'resFirstDayChecklist', descKey: 'resDescFirstDay', category: 'training', categoryKey: 'resCatTraining', contentKey: 'resContentFirstDay' },
  { id: 20, icon: 'warning', titleKey: 'resChurnReduction', descKey: 'resDescChurnReduction', category: 'playbook', categoryKey: 'resCatPlaybook', contentKey: 'resContentChurnReduction', minPlan: 'Growth' },
  { id: 21, icon: 'flag', titleKey: 'resEscalationProcess', descKey: 'resDescEscalation', category: 'process', categoryKey: 'resCatProcess', contentKey: 'resContentEscalation' },
  { id: 22, icon: 'star', titleKey: 'resAdvocacyProgram', descKey: 'resDescAdvocacy', category: 'playbook', categoryKey: 'resCatPlaybook', contentKey: 'resContentAdvocacy', minPlan: 'Growth' },
]

function isLocked(res) {
  if (!res.minPlan) return false
  return currentRank.value < (PLAN_RANK[res.minPlan] ?? 1)
}

function handleResourceClick(res) {
  if (isLocked(res)) return
  selectedResource.value = res
}

const filteredResources = computed(() => {
  if (catFilter.value === 'all') return resources
  return resources.filter(r => r.category === catFilter.value)
})
</script>
