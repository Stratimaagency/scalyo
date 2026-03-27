<template>
  <div class="scalyo-logo" :style="{ gap: gap + 'px' }">
    <div class="scalyo-logo-mark" :style="{ width: markSize + 'px', height: markSize + 'px', borderRadius: Math.round(markSize * 0.28) + 'px' }">
      <svg :width="Math.round(markSize * 0.55)" :height="Math.round(markSize * 0.55)" viewBox="0 0 20 20" fill="none">
        <path d="M13.5 5.5C13.5 5.5 12 4 9.5 4 7.5 4 6 5 6 6.8c0 1.8 1.5 2.6 4 3.3 2.5.7 4.5 1.7 4.5 3.9 0 2.2-2 3.5-4.5 3.5-2.8 0-4.5-1.7-4.5-1.7" stroke="#fff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </div>
    <span v-if="showText" class="scalyo-logo-text" :style="{ fontSize: fontSize + 'px' }">
      scal<span class="scalyo-logo-accent">yo</span>
    </span>
  </div>
</template>

<script setup>
defineProps({
  markSize: { type: Number, default: 34 },
  fontSize: { type: Number, default: 22 },
  gap: { type: Number, default: 9 },
  showText: { type: Boolean, default: true },
})
</script>

<style scoped>
.scalyo-logo {
  display: flex;
  align-items: center;
}
.scalyo-logo-mark {
  background: linear-gradient(135deg, #0D9488, #14b8a6);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 2px 8px rgba(13, 148, 136, .3);
}
.scalyo-logo-text {
  font-weight: 900;
  letter-spacing: -0.8px;
  color: var(--text);
}
.scalyo-logo-accent {
  background: linear-gradient(135deg, #0D9488, #2dd4bf);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
</style>
