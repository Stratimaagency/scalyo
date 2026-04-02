<template>
  <div class="card card-lift kpi-card">
    <div class="kpi-header">
      <span class="kpi-label">{{ label }}</span>
      <ScalyoIcon :name="icon" :size="20" />
    </div>
    <div class="kpi-value" :style="{ color: color || 'var(--text)' }">{{ value }}</div>
    <div v-if="sub" class="kpi-sub">{{ sub }}</div>
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

<style scoped>
.kpi-card {
  padding: 18px 20px;
}
.kpi-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}
.kpi-label {
  font-size: 11px;
  font-weight: 700;
  color: var(--muted);
  text-transform: uppercase;
  letter-spacing: .06em;
}
.kpi-value {
  font-size: 28px;
  font-weight: 900;
  letter-spacing: -0.5px;
  font-family: 'DM Sans', sans-serif;
  line-height: 1.1;
}
.kpi-sub {
  font-size: 12px;
  font-weight: 500;
  margin-top: 8px;
  color: var(--muted);
}
</style>
