<template>
  <div class="kpi-bubble">
    <div class="kpi-bubble__header">
      <span class="kpi-bubble__label">{{ label }}</span>
      <div class="kpi-bubble__icon" :style="{ background: iconBg }">
        <ScalyoIcon :name="icon" :size="16" />
      </div>
    </div>
    <div class="kpi-bubble__value" :style="{ color: color || '#0f172a' }">{{ value }}</div>
    <div v-if="sub" class="kpi-bubble__sub">{{ sub }}</div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import ScalyoIcon from './ScalyoIcon.vue'

const props = defineProps({
  label: String,
  value: [String, Number],
  icon: String,
  color: String,
  sub: String,
  trend: String,
})

const iconBg = computed(() => {
  if (!props.color) return '#f1f5f9'
  // Extract color and make a light background
  const c = props.color.replace('var(--', '').replace(')', '')
  const map = {
    teal: '#eff6ff', green: '#f0fdf4', red: '#fef2f2',
    amber: '#fffbeb', purple: '#f5f3ff', blue: '#eff6ff',
  }
  return map[c] || '#f1f5f9'
})
</script>

<style scoped>
.kpi-bubble {
  background: #ffffff;
  border: 1.5px solid #e2e8f0;
  border-radius: 16px;
  padding: 18px 20px;
  box-shadow: 0 2px 12px rgba(0,0,0,.04), 0 0 0 1px rgba(0,0,0,.02);
  transition: all .2s;
}
.kpi-bubble:hover {
  border-color: #cbd5e1;
  box-shadow: 0 4px 20px rgba(0,0,0,.06);
  transform: translateY(-1px);
}
.kpi-bubble__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}
.kpi-bubble__label {
  font-size: 12px;
  font-weight: 800;
  color: #1e293b;
  text-transform: uppercase;
  letter-spacing: .04em;
}
.kpi-bubble__icon {
  width: 32px;
  height: 32px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #64748b;
}
.kpi-bubble__value {
  font-family: 'Cormorant Garamond', serif;
  font-size: 28px;
  font-weight: 800;
  line-height: 1;
  margin-bottom: 4px;
}
.kpi-bubble__sub {
  font-size: 13px;
  font-weight: 500;
  color: #64748b;
  margin-top: 6px;
}
</style>
