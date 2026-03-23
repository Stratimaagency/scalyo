<template>
  <Teleport to="body">
    <div class="modal-overlay" @click.self="$emit('close')">
      <div class="modal-box" :style="{ maxWidth: maxWidth }">
        <div v-if="title" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 18px">
          <h3 style="font-size: 17px; font-weight: 800">{{ title }}</h3>
          <button class="btn btn-secondary btn-sm" @click="$emit('close')">✕</button>
        </div>
        <slot />
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { onMounted, onUnmounted } from 'vue'

defineProps({
  title: String,
  maxWidth: { type: String, default: '520px' },
})
const emit = defineEmits(['close'])

function onEscape(e) {
  if (e.key === 'Escape') emit('close')
}
onMounted(() => document.addEventListener('keydown', onEscape))
onUnmounted(() => document.removeEventListener('keydown', onEscape))
</script>
