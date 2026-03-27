<template>
  <div class="loader-screen">
    <ScalyoLogo :markSize="48" :fontSize="28" :gap="12" />
    <div class="spin loader-spinner"></div>
    <p class="loader-text">{{ text }}</p>
  </div>
</template>

<script setup>
import ScalyoLogo from './ScalyoLogo.vue'

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
.loader-spinner {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 2px solid var(--border);
  border-top-color: var(--teal);
}
.loader-text { color: var(--muted); font-size: 14px; }
</style>
