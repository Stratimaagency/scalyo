<template>
  <div class="wb-trends">
    <h3>📈 {{ t('wb_trends_title') }}</h3>
    <div v-if="recentEntries.length">
      <div class="wb-trend-row" v-for="e in recentEntries" :key="e.entry_date">
        <span class="wb-trend-date">{{ formatDate(e.entry_date) }}</span>
        <span style="font-size:0.9rem;">{{ moodEmoji(e.mood) }}</span>
        <div style="flex:1;background:var(--bg-hover);border-radius:4px;height:8px;">
          <div class="wb-trend-bar" :class="barClass(e.score)" :style="{ width: e.score + '%' }"></div>
        </div>
        <span style="font-size:0.72rem;color:var(--text-muted);min-width:30px;text-align:right;">{{ e.score }}</span>
      </div>
      <p v-if="store.trend === 'improving'" style="font-size:0.78rem;color:var(--green);margin-top:10px;">✅ {{ t('wb_trend_improving') }}</p>
      <p v-else-if="store.trend === 'declining'" style="font-size:0.78rem;color:var(--amber);margin-top:10px;">🧡 {{ t('wb_trend_declining') }}</p>
    </div>
    <div v-else style="text-align:center;padding:20px 0;">
      <p style="font-size:2rem;margin-bottom:8px;">📊</p>
      <p style="font-size:0.82rem;color:var(--text-secondary);">{{ t('wb_trends_empty') }}</p>
      <p style="font-size:0.75rem;color:var(--text-muted);margin-top:4px;">{{ t('wb_trends_empty_hint') }}</p>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useWellbeingStore } from '@/stores/wellbeing'

const { t } = useI18n({ useScope: 'global' })
const store = useWellbeingStore()

const recentEntries = computed(() => store.weekEntries.slice(-7))
const emojiMap = { exhausted: '😩', stressed: '😟', attention: '🙂', normal: '😊', great: '😄' }
function moodEmoji(m) { return emojiMap[m] || '—' }
function barClass(v) { return v < 35 ? 'low' : v < 65 ? 'mid' : '' }
function formatDate(d) { return new Date(d + 'T00:00:00').toLocaleDateString(undefined, { weekday: 'short', day: 'numeric' }) }
</script>
