<template>
  <Teleport to="body">
    <transition name="slide-over">
      <div v-if="open" class="slide-over-backdrop" @click.self="$emit('close')">
        <div class="slide-over-panel" :style="{ maxWidth: width + 'px' }" @keydown.esc="$emit('close')">
          <div class="slide-over-header">
            <h2 class="slide-over-title">{{ title }}</h2>
            <button class="slide-over-close" @click="$emit('close')" aria-label="Fermer">✕</button>
          </div>
          <div class="slide-over-body">
            <slot />
          </div>
        </div>
      </div>
    </transition>
  </Teleport>
</template>

<script setup>
defineProps({
  open: { type: Boolean, default: false },
  title: { type: String, default: '' },
  width: { type: Number, default: 480 },
})
defineEmits(['close'])
</script>

<style scoped>
.slide-over-backdrop { position: fixed; inset: 0; z-index: 500; background: rgba(0,0,0,0.3); display: flex; justify-content: flex-end; backdrop-filter: blur(2px); }
.slide-over-panel { width: 100%; max-width: 480px; background: #fff; height: 100vh; display: flex; flex-direction: column; box-shadow: -8px 0 30px rgba(0,0,0,0.12); }
.slide-over-header { display: flex; align-items: center; justify-content: space-between; padding: 20px 24px; border-bottom: 1px solid var(--border); }
.slide-over-title { font-size: 1.1rem; font-weight: 700; color: var(--text); }
.slide-over-close { width: 32px; height: 32px; border-radius: 8px; border: none; background: var(--bg-hover); color: var(--text-secondary); font-size: 1rem; display: flex; align-items: center; justify-content: center; transition: background 0.15s; }
.slide-over-close:hover { background: var(--border); }
.slide-over-body { flex: 1; overflow: hidden; padding: 24px; display: flex; flex-direction: column; min-height: 0; }

/* Transitions */
.slide-over-enter-active .slide-over-panel, .slide-over-leave-active .slide-over-panel { transition: transform 0.3s ease; }
.slide-over-enter-active, .slide-over-leave-active { transition: opacity 0.3s ease; }
.slide-over-enter-from { opacity: 0; }
.slide-over-enter-from .slide-over-panel { transform: translateX(100%); }
.slide-over-leave-to { opacity: 0; }
.slide-over-leave-to .slide-over-panel { transform: translateX(100%); }

@media (max-width: 600px) { .slide-over-panel { max-width: 100% !important; } }
</style>
