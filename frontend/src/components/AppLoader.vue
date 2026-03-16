<template>
  <div class="loader-screen">
    <div class="loader-icon">⚡</div>
    <div class="spin loader-spinner"></div>
    <p class="loader-text">{{ text }}</p>
  </div>
</template>

<script setup>
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
  background: linear-gradient(135deg, var(--teal), var(--blue));
  border-radius: 13px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  box-shadow: 0 8px 32px var(--tealGlow);
}
.loader-spinner {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-top: 2px solid var(--teal);
}
.loader-text { color: var(--muted); font-size: 14px; }
</style>
