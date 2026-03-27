<template>
  <div class="scalyo-logo" :style="{ gap: gap + 'px' }">
    <div class="scalyo-logo-mark" :style="{ width: markSize + 'px', height: markSize + 'px' }">
      <svg :width="Math.round(markSize * 0.75)" :height="Math.round(markSize * 0.75)" viewBox="0 0 100 100" fill="none">
        <defs>
          <linearGradient :id="'lienA-'+uid" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="#0d9488"/>
            <stop offset="100%" stop-color="#5eead4"/>
          </linearGradient>
          <linearGradient :id="'lienB-'+uid" x1="100%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stop-color="#5eead4"/>
            <stop offset="100%" stop-color="#0f766e"/>
          </linearGradient>
        </defs>
        <!-- Courbe Client -->
        <path d="M 28 72 C 18 58, 18 42, 28 32 C 38 22, 48 20, 50 28 C 52 36, 54 42, 56 48"
          :stroke="'url(#lienA-'+uid+')'" stroke-width="8" fill="none" stroke-linecap="round"/>
        <!-- Courbe Entreprise -->
        <path d="M 72 28 C 82 42, 82 58, 72 68 C 62 78, 52 80, 50 72 C 48 64, 46 58, 44 52"
          :stroke="'url(#lienB-'+uid+')'" stroke-width="8" fill="none" stroke-linecap="round"/>
        <!-- Point de connexion -->
        <circle cx="50" cy="50" r="5" fill="#5eead4" opacity="0.9"/>
        <circle cx="50" cy="50" r="10" fill="#5eead4" opacity="0.15"/>
      </svg>
    </div>
    <span v-if="showText" class="scalyo-logo-text" :style="{ fontSize: fontSize + 'px' }">
      scal<span class="scalyo-logo-accent">yo</span>
    </span>
  </div>
</template>

<script setup>
const uid = Math.random().toString(36).slice(2, 8)
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
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
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