<template>
  <div class="health-bar" :style="{ height: size === 'sm' ? '4px' : '6px' }">
    <div
      class="health-bar-fill"
      :style="{ width: pct + '%', background: barColor }"
    ></div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
const props = defineProps({
  val: { type: Number, default: 0 },
  size: { type: String, default: 'md' },
})
const barColor = computed(() => props.val >= 70 ? 'var(--green)' : props.val >= 40 ? 'var(--amber)' : 'var(--red)')
const pct = computed(() => Math.min(100, Math.max(0, props.val)))
</script>
