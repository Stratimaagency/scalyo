<template>
  <div>
    <h2>{{ t('wb_how_feel') }}</h2>
    <div class="mood-grid">
      <button v-for="m in moods" :key="m.key" class="mood-btn" :class="{ active: store.mood === m.key }" @click="selectMood(m.key)">
        <span class="mood-emoji">{{ m.emoji }}</span>
        <span class="mood-label">{{ t(m.labelKey) }}</span>
      </button>
    </div>
    <div class="wb-sliders">
      <div class="wb-slider-card">
        <div class="wb-slider-label">{{ t('wb_energy') }}</div>
        <div class="wb-slider-val" :class="scoreClass(store.score)">{{ store.score }}%</div>
        <input type="range" class="wb-range" min="0" max="100" :value="store.score" @input="store.saveScore(+$event.target.value)" />
      </div>
      <div class="wb-slider-card">
        <div class="wb-slider-label">{{ t('wb_workload') }}</div>
        <div class="wb-slider-val" :class="chargeClass(store.charge)">{{ store.charge }}%</div>
        <input type="range" class="wb-range" min="0" max="100" :value="store.charge" @input="store.saveCharge(+$event.target.value)" />
      </div>
    </div>
    <span class="wb-saved" :class="{ visible: store.saving }">{{ t('wb_saving') }}</span>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
import { useWellbeingStore } from '@/stores/wellbeing'

const { t } = useI18n({ useScope: 'global' })
const store = useWellbeingStore()
const emit = defineEmits(['mood-selected'])

const moods = [
  { key: 'exhausted', emoji: '\u{1F629}', labelKey: 'wb_mood_exhausted' },
  { key: 'stressed', emoji: '\u{1F61F}', labelKey: 'wb_mood_stressed' },
  { key: 'attention', emoji: '\u{1F642}', labelKey: 'wb_mood_attention' },
  { key: 'normal', emoji: '\u{1F60A}', labelKey: 'wb_mood_normal' },
  { key: 'great', emoji: '\u{1F604}', labelKey: 'wb_mood_great' },
]

function selectMood(key) {
  store.saveMood(key)
  emit('mood-selected', key)
}

function scoreClass(v) { return v < 35 ? 'low' : v < 65 ? 'mid' : 'high' }
function chargeClass(v) { return v > 80 ? 'low' : v > 60 ? 'mid' : 'high' }
</script>
