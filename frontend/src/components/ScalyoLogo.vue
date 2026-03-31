<template>
  <div class="scalyo-logo" :style="{ gap: gap + 'px' }">
    <div class="scalyo-logo-mark" :style="{ width: markSize + 'px', height: markSize + 'px' }">
      <svg :width="markSize" :height="markSize" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient :id="'sg-'+uid" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#f43f5e"/>
            <stop offset="18%" stop-color="#f97316"/>
            <stop offset="33%" stop-color="#eab308"/>
            <stop offset="50%" stop-color="#22c55e"/>
            <stop offset="66%" stop-color="#06b6d4"/>
            <stop offset="82%" stop-color="#3b82f6"/>
            <stop offset="100%" stop-color="#8b5cf6"/>
          </linearGradient>
        </defs>
        <circle cx="20" cy="20" r="20" :fill="'url(#sg-'+uid+')'"/>
        <text x="20" y="21.5" text-anchor="middle" dominant-baseline="central"
          font-family="Georgia, 'Cormorant Garamond', serif" font-weight="700" font-style="italic"
          font-size="22" fill="white">S</text>
      </svg>
    </div>
    <div v-if="showText" class="scalyo-logo-text-wrap">
      <span class="scalyo-logo-text" :style="{ fontSize: fontSize + 'px' }">Scalyo</span>
      <span v-if="showSub" class="scalyo-logo-sub">SMART MATRICE</span>
    </div>
  </div>
</template>

<script setup>
const uid = Math.random().toString(36).slice(2, 8)
defineProps({
  markSize: { type: Number, default: 34 },
  fontSize: { type: Number, default: 20 },
  gap: { type: Number, default: 9 },
  showText: { type: Boolean, default: true },
  showSub: { type: Boolean, default: false },
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
.scalyo-logo-text-wrap {
  display: flex;
  flex-direction: column;
  line-height: 1.1;
}
.scalyo-logo-text {
  font-family: 'DM Sans', sans-serif;
  font-weight: 800;
  letter-spacing: -0.3px;
  color: #0f172a;
}
.scalyo-logo-sub {
  font-family: 'DM Sans', sans-serif;
  font-size: 8px;
  font-weight: 600;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  color: #64748b;
  margin-top: 1px;
}
</style>
