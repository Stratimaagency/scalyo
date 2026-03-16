<template>
  <div class="health-bar">
    <div
      class="health-bar-fill"
      :style="{ width: pct + '%', background: barGradient, boxShadow: `0 0 12px ${barColor}22` }"
    ></div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
const props = defineProps({ val: { type: Number, default: 0 } })
const barColor = computed(() => props.val >= 70 ? 'var(--green)' : props.val >= 40 ? 'var(--amber)' : 'var(--red)')
const barGradient = computed(() => `linear-gradient(90deg, ${barColor.value}cc, ${barColor.value})`)
const pct = computed(() => Math.min(100, Math.max(0, props.val)))
</script>
