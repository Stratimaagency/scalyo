<template>
  <Teleport to="body">
    <div class="toast-container" v-if="toasts.length">
      <TransitionGroup name="toast">
        <div v-for="toast in toasts" :key="toast.id" class="toast-item" :class="'toast-' + toast.type" @click="dismiss(toast.id)">
          <span class="toast-icon">{{ icons[toast.type] || 'ℹ️' }}</span>
          <span class="toast-msg">{{ toast.message }}</span>
          <button class="toast-close" @click.stop="dismiss(toast.id)">&times;</button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup>
import { useToast } from '../composables/useToast'

const { toasts, dismiss } = useToast()

const icons = {
  success: '✓',
  error: '✕',
  warning: '⚠',
  info: 'ℹ',
}
</script>

<style scoped>
.toast-container {
  position: fixed;
  top: 16px;
  right: 16px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-width: 380px;
  width: 100%;
  pointer-events: none;
}
.toast-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  pointer-events: auto;
  backdrop-filter: blur(12px);
  box-shadow: 0 4px 20px rgba(0,0,0,.15);
  border: 1px solid rgba(255,255,255,.1);
}
.toast-icon {
  font-size: 14px;
  font-weight: 900;
  width: 22px;
  height: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  flex-shrink: 0;
}
.toast-msg { flex: 1; line-height: 1.4; }
.toast-close {
  background: none;
  border: none;
  color: inherit;
  font-size: 16px;
  cursor: pointer;
  opacity: .6;
  padding: 0 2px;
  flex-shrink: 0;
}
.toast-close:hover { opacity: 1; }

.toast-success {
  background: rgba(16, 185, 129, .15);
  color: #10b981;
  border-color: rgba(16, 185, 129, .25);
}
.toast-success .toast-icon { background: rgba(16, 185, 129, .2); }

.toast-error {
  background: rgba(239, 68, 68, .15);
  color: #ef4444;
  border-color: rgba(239, 68, 68, .25);
}
.toast-error .toast-icon { background: rgba(239, 68, 68, .2); }

.toast-warning {
  background: rgba(245, 158, 11, .15);
  color: #f59e0b;
  border-color: rgba(245, 158, 11, .25);
}
.toast-warning .toast-icon { background: rgba(245, 158, 11, .2); }

.toast-info {
  background: rgba(59, 130, 246, .15);
  color: #3b82f6;
  border-color: rgba(59, 130, 246, .25);
}
.toast-info .toast-icon { background: rgba(59, 130, 246, .2); }

/* Transitions */
.toast-enter-active { animation: toast-in .3s ease; }
.toast-leave-active { animation: toast-out .2s ease; }
.toast-move { transition: transform .3s ease; }

@keyframes toast-in {
  from { opacity: 0; transform: translateX(40px) scale(.95); }
  to { opacity: 1; transform: translateX(0) scale(1); }
}
@keyframes toast-out {
  from { opacity: 1; transform: translateX(0) scale(1); }
  to { opacity: 0; transform: translateX(40px) scale(.95); }
}
</style>
