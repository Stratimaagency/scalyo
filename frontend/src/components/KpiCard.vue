<template>
  <div class="kpi-card">
    <div class="kpi-card__top">
      <span class="kpi-card__label">{{ label }}</span>
      <div class="kpi-card__icon" :style="{ background: iconBg, color: iconFg }">
        <ScalyoIcon :name="icon" :size="18" />
      </div>
    </div>
    <div class="kpi-card__value" :style="{ color: valueFg }">{{ value }}</div>
    <div v-if="sub" class="kpi-card__sub">
      <span v-if="trend === 'up'" style="color: #34A853;">▲</span>
      <span v-if="trend === 'down'" style="color: #EA4335;">▼</span>
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

const palette = {
  'var(--teal)':   { bg: '#E8F0FE', fg: '#4285F4', val: '#4285F4' },
  'var(--green)':  { bg: '#E6F4EA', fg: '#34A853', val: '#34A853' },
  'var(--red)':    { bg: '#FCE8E6', fg: '#EA4335', val: '#EA4335' },
  'var(--amber)':  { bg: '#FEF7E0', fg: '#FBBC05', val: '#d97706' },
  'var(--purple)': { bg: '#F3E8FF', fg: '#7C3AED', val: '#7C3AED' },
  'var(--blue)':   { bg: '#E8F0FE', fg: '#4285F4', val: '#4285F4' },
}

const p = computed(() => palette[props.color] || palette['var(--teal)'])
const iconBg = computed(() => p.value.bg)
const iconFg = computed(() => p.value.fg)
const valueFg = computed(() => p.value.val)
</script>

<style scoped>
.kpi-card {
  background: #FFFFFF;
  border: 2px solid #f0e6d3;
  border-radius: 16px;
  padding: 20px 22px;
  box-shadow: 0 2px 16px rgba(0,0,0,0.05), inset 0 0 0 1px rgba(251,188,5,0.06);
  transition: all 0.2s;
}
.kpi-card:hover {
  border-color: #e8d5b5;
  box-shadow: 0 6px 28px rgba(0,0,0,0.08);
  transform: translateY(-2px);
}
.kpi-card__top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
}
.kpi-card__label {
  font-family: 'DM Sans', sans-serif;
  font-size: 13px;
  font-weight: 800;
  color: #1a1f36;
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
  font-family: 'Cormorant Garamond', serif;
  font-size: 32px;
  font-weight: 800;
  line-height: 1;
}
.kpi-card__sub {
  font-family: 'DM Sans', sans-serif;
  font-size: 13px;
  font-weight: 600;
  color: #2d3748;
  margin-top: 8px;
  display: flex;
  align-items: center;
  gap: 4px;
}
</style>
