<template>
  <div class="loader-screen">
    <div class="loader-icon"><ScalyoIcon name="bolt" :size="22" /></div>
    <div class="spin loader-spinner"></div>
    <p class="loader-text">{{ text }}</p>
  </div>
</template>

<script setup>
import ScalyoIcon from './ScalyoIcon.vue'

defineProps({ text: { type: String, default: 'Loading...' } })
</script>

<style scoped>
.loader-screen {
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  background: var(--bg);
}
.loader-icon {
  width: 44px;
  height: 44px;
  background: var(--teal);
  border-radius: 13px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
}
.loader-spinner {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 2px solid var(--border);
  border-top-color: var(--teal);
}
.loader-text { color: var(--muted); font-size: 14px; }
</style>
