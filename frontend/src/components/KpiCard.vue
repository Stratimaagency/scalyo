<template>
  <div class="kpi-card">
    <div class="kpi-card__top">
      <span class="kpi-card__label">{{ label }}</span>
      <div class="kpi-card__icon" :style="{ background: iconBg, color: iconColor }">
        <ScalyoIcon :name="icon" :size="18" />
      </div>
    </div>
    <div class="kpi-card__value" :style="{ color: color || '#202124' }">{{ value }}</div>
    <div v-if="sub" class="kpi-card__sub" :style="{ color: subColor }">
      <span v-if="trend === 'up'" class="kpi-card__trend kpi-card__trend--up">▲</span>
      <span v-if="trend === 'down'" class="kpi-card__trend kpi-card__trend--down">▼</span>
      {{ sub }}
    </div>
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

const colorMap = {
  'var(--teal)': { bg: '#E8F0FE', fg: '#4285F4' },
  'var(--green)': { bg: '#E6F4EA', fg: '#34A853' },
  'var(--red)': { bg: '#FCE8E6', fg: '#EA4335' },
  'var(--amber)': { bg: '#FEF7E0', fg: '#FBBC05' },
  'var(--purple)': { bg: '#F3E8FF', fg: '#9b5acd' },
  'var(--blue)': { bg: '#E8F0FE', fg: '#4285F4' },
}

const iconBg = computed(() => colorMap[props.color]?.bg || '#E8F0FE')
const iconColor = computed(() => colorMap[props.color]?.fg || '#4285F4')
const subColor = computed(() => {
  if (props.trend === 'up') return '#34A853'
  if (props.trend === 'down') return '#EA4335'
  return '#5F6368'
})
</script>

<style scoped>
.kpi-card {
  background: #FFFFFF;
  border-radius: 16px;
  padding: 20px 22px;
  box-shadow: 0 2px 16px rgba(0,0,0,0.07);
  transition: all 0.2s;
  min-width: 0;
}
.kpi-card:hover {
  box-shadow: 0 4px 24px rgba(0,0,0,0.10);
  transform: translateY(-2px);
}
.kpi-card__top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
}
.kpi-card__label {
  font-family: 'DM Sans', 'Google Sans', 'Segoe UI', sans-serif;
  font-size: 13px;
  font-weight: 700;
  color: #5F6368;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
.kpi-card__icon {
  width: 36px;
  height: 36px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.kpi-card__value {
  font-family: 'Cormorant Garamond', 'Google Sans', serif;
  font-size: 32px;
  font-weight: 800;
  line-height: 1;
  color: #202124;
}
.kpi-card__sub {
  font-family: 'DM Sans', 'Google Sans', sans-serif;
  font-size: 13px;
  font-weight: 500;
  color: #5F6368;
  margin-top: 8px;
  display: flex;
  align-items: center;
  gap: 4px;
}
.kpi-card__trend { font-size: 11px; }
.kpi-card__trend--up { color: #34A853; }
.kpi-card__trend--down { color: #EA4335; }
</style>
