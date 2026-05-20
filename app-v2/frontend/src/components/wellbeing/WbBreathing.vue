<template>
  <div class="micro-action-card" v-if="visible">
    <div class="micro-action-title">{{ t(actionTitle) }}</div>
    <div v-if="!started">
      <p style="font-size:0.82rem;color:var(--text-secondary);margin-bottom:14px;">{{ t(actionDesc) }}</p>
      <button class="micro-action-btn" @click="start">{{ t('wb_micro_start') }}</button>
    </div>
    <div v-else-if="!finished">
      <div class="breathing-circle" :class="phase">{{ t('wb_breathe_' + phase) }}</div>
      <p style="font-size:0.78rem;color:var(--text-muted);">{{ currentStep }}/{{ totalSteps }}</p>
    </div>
    <div v-else>
      <p style="font-size:1.2rem;margin-bottom:10px;">\u{2705}</p>
      <p style="font-size:0.85rem;color:var(--text);font-weight:600;margin-bottom:12px;">{{ t('wb_micro_done') }}</p>
      <h3 style="font-size:0.82rem;color:var(--text-secondary);margin-bottom:8px;">{{ t('wb_micro_delta') }}</h3>
      <div class="mood-grid" style="justify-content:center;">
        <button v-for="d in deltas" :key="d.key" class="mood-btn" :class="{ active: selectedDelta === d.key }" @click="selectDelta(d.key)" style="min-width:70px;padding:8px 12px;">
          <span class="mood-emoji" style="font-size:1.2rem;">{{ d.emoji }}</span>
          <span class="mood-label">{{ t(d.labelKey) }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onBeforeUnmount } from 'vue'
import { useI18n } from 'vue-i18n'
import { useWellbeingStore } from '@/stores/wellbeing'

const props = defineProps({ mood: String })
const { t } = useI18n({ useScope: 'global' })
const store = useWellbeingStore()

const visible = computed(() => ['exhausted', 'stressed', 'attention'].includes(props.mood))
const actionTitle = computed(() => {
  if (props.mood === 'exhausted') return 'wb_micro_breathing'
  if (props.mood === 'stressed') return 'wb_micro_reframe'
  return 'wb_micro_gratitude'
})
const actionDesc = computed(() => actionTitle.value + '_desc')

const started = ref(false)
const finished = ref(false)
const phase = ref('inhale')
const currentStep = ref(0)
const totalSteps = 6
const selectedDelta = ref(null)
let timer = null

const deltas = [
  { key: 'worse', emoji: '\u{1F614}', labelKey: 'wb_delta_worse' },
  { key: 'same', emoji: '\u{1F610}', labelKey: 'wb_delta_same' },
  { key: 'better', emoji: '\u{1F60C}', labelKey: 'wb_delta_better' },
]

function start() {
  started.value = true
  currentStep.value = 1
  runCycle()
}

function runCycle() {
  phase.value = 'inhale'
  timer = setTimeout(() => {
    phase.value = 'exhale'
    timer = setTimeout(() => {
      currentStep.value++
      if (currentStep.value > totalSteps) {
        finished.value = true
        store.completeMicroAction(actionTitle.value)
      } else { runCycle() }
    }, 4000)
  }, 4000)
}

function selectDelta(key) {
  selectedDelta.value = key
  store.saveDeltaMood(key)
}
onBeforeUnmount(() => { if (timer) clearTimeout(timer) })
</script>
