<template>
  <div class="card" :class="[className, { 'card-lift': lift }]" :style="cardStyle">
    <slot />
  </div>
</template>

<script setup>
import { computed } from 'vue'
const props = defineProps({
  glow: Boolean,
  danger: Boolean,
  warning: Boolean,
  success: Boolean,
  lift: { type: Boolean, default: true },
  className: String,
})
const cardStyle = computed(() => {
  if (props.danger) return { background: 'var(--redBg)', borderColor: 'var(--redBorder)' }
  if (props.warning) return { background: 'var(--amberBg)', borderColor: 'var(--amberBorder)' }
  if (props.success) return { background: 'var(--greenBg)', borderColor: 'var(--greenBorder)' }
  if (props.glow) return { boxShadow: '0 0 24px var(--tealGlow)' }
  return {}
})
</script>
