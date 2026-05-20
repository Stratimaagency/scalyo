<template>
  <div class="wb-trends" v-if="store.weekEntries.length > 1">
    <h3>{{ t('wb_trends_title') }}</h3>
    <div class="wb-trend-row" v-for="e in recentEntries" :key="e.entry_date">
      <span class="wb-trend-date">{{ formatDate(e.entry_date) }}</span>
      <span style="font-size:0.9rem;">{{ moodEmoji(e.mood) }}</span>
      <div style="flex:1;background:var(--bg-hover);border-radius:4px;height:8px;">
        <div class="wb-trend-bar" :class="barClass(e.score)" :style="{ width: e.score + '%' }"></div>
      </div>
      <span style="font-size:0.72rem;color:var(--text-muted);min-width:30px;text-align:right;">{{ e.score }}</span>
    </div>
    <p v-if="store.trend !== 'stable'" style="font-size:0.78rem;color:var(--text-secondary);margin-top:10px;">
      {{ store.trend === 'improving' ? t('wb_trend_improving') : t('wb_trend_declining') }}
    </p>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useWellbeingStore } from '@/stores/wellbeing'

const { t } = useI18n({ useScope: 'global' })
const store = useWellbeingStore()

const recentEntries = computed(() => store.weekEntries.slice(-7))
const emojiMap = { exhausted: '\u{1F629}', stressed: '\u{1F61F}', attention: '\u{1F642}', normal: '\u{1F60A}', great: '\u{1F604}' }
function moodEmoji(m) { return emojiMap[m] || '\u{2014}' }
function barClass(v) { return v < 35 ? 'low' : v < 65 ? 'mid' : '' }
function formatDate(d) { return new Date(d + 'T00:00:00').toLocaleDateString(undefined, { weekday: 'short', day: 'numeric' }) }
</script>
