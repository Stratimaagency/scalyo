<template>
  <div class="scalyo-logo" :style="{ gap: gap + 'px' }">
    <div class="scalyo-logo-mark" :style="{ width: markSize + 'px', height: markSize + 'px' }">
      <svg :width="markSize" :height="markSize" :viewBox="'0 0 ' + markSize + ' ' + markSize" fill="none">
        <defs>
          <linearGradient :id="'heart-grad-'+uid" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#e8603a"/>
            <stop offset="35%" stop-color="#e8507a"/>
            <stop offset="70%" stop-color="#9b5acd"/>
            <stop offset="100%" stop-color="#e8a020"/>
          </linearGradient>
          <linearGradient :id="'heart-shine-'+uid" x1="20%" y1="0%" x2="80%" y2="100%">
            <stop offset="0%" stop-color="#fff" stop-opacity="0.35"/>
            <stop offset="100%" stop-color="#fff" stop-opacity="0"/>
          </linearGradient>
        </defs>
        <!-- Heart shape -->
        <path :d="heartPath" :fill="'url(#heart-grad-'+uid+')'" />
        <!-- Shine overlay -->
        <path :d="heartPath" :fill="'url(#heart-shine-'+uid+')'" />
        <!-- S letter -->
        <text
          :x="markSize / 2"
          :y="markSize * 0.6"
          text-anchor="middle"
          dominant-baseline="central"
          :style="{
            fontSize: Math.round(markSize * 0.42) + 'px',
            fontFamily: 'Cormorant Garamond, Georgia, serif',
            fontWeight: 700,
            fontStyle: 'italic',
            fill: 'white',
            filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.15))',
          }"
        >S</text>
      </svg>
    </div>
    <span v-if="showText" class="scalyo-logo-text" :style="{ fontSize: fontSize + 'px' }">
      Scal<span class="scalyo-logo-accent">yo</span>
    </span>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const uid = Math.random().toString(36).slice(2, 8)
const props = defineProps({
  markSize: { type: Number, default: 34 },
  fontSize: { type: Number, default: 22 },
  gap: { type: Number, default: 9 },
  showText: { type: Boolean, default: true },
})

// Heart SVG path scaled to markSize
const heartPath = computed(() => {
  const s = props.markSize
  const scale = s / 100
  // Heart centered in 100x100 viewbox, scaled
  return `M ${50*scale} ${88*scale}
    C ${50*scale} ${88*scale}, ${12*scale} ${60*scale}, ${12*scale} ${38*scale}
    C ${12*scale} ${22*scale}, ${24*scale} ${12*scale}, ${38*scale} ${12*scale}
    C ${46*scale} ${12*scale}, ${50*scale} ${18*scale}, ${50*scale} ${22*scale}
    C ${50*scale} ${18*scale}, ${54*scale} ${12*scale}, ${62*scale} ${12*scale}
    C ${76*scale} ${12*scale}, ${88*scale} ${22*scale}, ${88*scale} ${38*scale}
    C ${88*scale} ${60*scale}, ${50*scale} ${88*scale}, ${50*scale} ${88*scale} Z`
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
