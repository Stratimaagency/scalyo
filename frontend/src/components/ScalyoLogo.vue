<template>
  <div class="scalyo-logo" :style="{ gap: gap + 'px' }">
    <div class="scalyo-logo-mark" :style="{ width: markSize + 'px', height: markSize + 'px' }">
      <svg :width="markSize" :height="markSize" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient :id="'sg-'+uid" cx="30%" cy="30%" r="70%">
            <stop offset="0%" stop-color="#f9a8d4"/>
            <stop offset="20%" stop-color="#f97316"/>
            <stop offset="40%" stop-color="#facc15"/>
            <stop offset="55%" stop-color="#4ade80"/>
            <stop offset="70%" stop-color="#38bdf8"/>
            <stop offset="85%" stop-color="#818cf8"/>
            <stop offset="100%" stop-color="#c084fc"/>
          </radialGradient>
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
  gap: { type: Number, default: 5 },
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
