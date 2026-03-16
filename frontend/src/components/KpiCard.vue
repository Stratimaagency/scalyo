<template>
  <div class="card card-lift" style="padding: 14px 16px;">
    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px;">
      <span style="font-size: 10px; font-weight: 700; color: var(--muted); text-transform: uppercase; letter-spacing: .06em;">{{ label }}</span>
      <span style="font-size: 18px;">{{ icon }}</span>
    </div>
    <div class="kpi-value" :style="{ color: color || 'var(--text)' }">{{ value }}</div>
    <div v-if="sub" style="font-size: 11px; font-weight: 500; margin-top: 6px; color: var(--muted);">
      {{ sub }}
    </div>
  </div>
</template>

<script setup>
defineProps({
  label: String,
  value: [String, Number],
  icon: String,
  color: String,
  sub: String,
  trend: String,
})
</script>
