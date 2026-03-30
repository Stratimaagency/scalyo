<template>
  <div class="scalyo-logo" :style="{ gap: gap + 'px' }">
    <div class="scalyo-logo-mark" :style="{ width: markSize + 'px', height: markSize + 'px' }">
      <svg :width="markSize" :height="markSize" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient :id="'hg-'+uid" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#e8603a"/>
            <stop offset="35%" stop-color="#e8507a"/>
            <stop offset="70%" stop-color="#9b5acd"/>
            <stop offset="100%" stop-color="#e8a020"/>
          </linearGradient>
          <!-- 3D shine top-left -->
          <linearGradient :id="'hs-'+uid" x1="25%" y1="0%" x2="75%" y2="100%">
            <stop offset="0%" stop-color="#fff" stop-opacity="0.45"/>
            <stop offset="45%" stop-color="#fff" stop-opacity="0.08"/>
            <stop offset="100%" stop-color="#000" stop-opacity="0.12"/>
          </linearGradient>
          <!-- 3D radial highlight -->
          <radialGradient :id="'hr-'+uid" cx="35%" cy="30%" r="55%">
            <stop offset="0%" stop-color="#fff" stop-opacity="0.35"/>
            <stop offset="100%" stop-color="#fff" stop-opacity="0"/>
          </radialGradient>
          <filter :id="'hd-'+uid">
            <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="#e8603a" flood-opacity="0.35"/>
          </filter>
        </defs>
        <!-- Heart body -->
        <path d="M32 56 C32 56, 7 39, 7 24 C7 14, 14 8, 22 8 C27 8, 30.4 11, 32 14 C33.6 11, 37 8, 42 8 C50 8, 57 14, 57 24 C57 39, 32 56, 32 56Z"
          :fill="'url(#hg-'+uid+')'" :filter="'url(#hd-'+uid+')'"/>
        <!-- 3D shine -->
        <path d="M32 56 C32 56, 7 39, 7 24 C7 14, 14 8, 22 8 C27 8, 30.4 11, 32 14 C33.6 11, 37 8, 42 8 C50 8, 57 14, 57 24 C57 39, 32 56, 32 56Z"
          :fill="'url(#hs-'+uid+')'"/>
        <path d="M32 56 C32 56, 7 39, 7 24 C7 14, 14 8, 22 8 C27 8, 30.4 11, 32 14 C33.6 11, 37 8, 42 8 C50 8, 57 14, 57 24 C57 39, 32 56, 32 56Z"
          :fill="'url(#hr-'+uid+')'"/>
        <!-- Big S -->
        <text x="32" y="33.5" text-anchor="middle" dominant-baseline="central"
          font-family="Georgia, 'Cormorant Garamond', serif" font-weight="700" font-style="italic"
          font-size="32" fill="white" fill-opacity="0.95">S</text>
      </svg>
    </div>
    <span v-if="showText" class="scalyo-logo-text" :style="{ fontSize: fontSize + 'px' }">
      Scal<span class="scalyo-logo-accent">yo</span>
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
  filter: drop-shadow(0 2px 8px rgba(232, 96, 58, 0.25));
}
.scalyo-logo-text {
  font-family: 'Cormorant Garamond', serif;
  font-weight: 700;
  letter-spacing: -0.5px;
  color: var(--text);
}
.scalyo-logo-accent {
  background: linear-gradient(135deg, #e8603a 0%, #e8507a 35%, #9b5acd 70%, #e8a020 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
</style>
