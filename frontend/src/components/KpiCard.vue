<template>
  <AppCard>
    <div class="flex-between mb-sm">
      <span style="font-size: 10px; font-weight: 700; color: var(--muted); text-transform: uppercase; letter-spacing: .1em">{{ label }}</span>
      <span style="font-size: 18px">{{ icon }}</span>
    </div>
    <div class="kpi-value" :style="{ color: color || 'var(--text)' }">{{ value }}</div>
    <div v-if="sub" style="font-size: 11px; font-weight: 600; margin-top: 4px" :style="{ color: trendColor }">
      {{ trendIcon }} {{ sub }}
    </div>
  </AppCard>
</template>

<script setup>
import { computed } from 'vue'
import AppCard from './AppCard.vue'

const props = defineProps({
  label: String,
  value: [String, Number],
  icon: String,
  color: String,
  sub: String,
  trend: String,
})

const trendColor = computed(() =>
  props.trend === 'up' ? 'var(--green)' : props.trend === 'down' ? 'var(--red)' : 'var(--muted)'
)
const trendIcon = computed(() =>
  props.trend === 'up' ? '↑' : props.trend === 'down' ? '↓' : ''
)
</script>
