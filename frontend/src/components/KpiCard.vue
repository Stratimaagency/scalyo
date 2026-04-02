<template>
  <div class="card card-lift" style="padding: 14px 16px;">
    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px;">
      <span style="font-size: 12px; font-weight: 800; color: #1e293b; text-transform: uppercase; letter-spacing: .06em;">{{ label }}</span>
      <ScalyoIcon :name="icon" :size="22" />
    </div>
    <div class="kpi-value" :style="{ color: color || 'var(--text)' }">{{ value }}</div>
    <div v-if="sub" style="font-size: 13px; font-weight: 500; margin-top: 6px; color: #475569;">
      {{ sub }}
    </div>
  </div>
</template>

<script setup>
import ScalyoIcon from './ScalyoIcon.vue'

defineProps({
  label: String,
  value: [String, Number],
  icon: String,
  color: String,
  sub: String,
  trend: String,
})
</script>
