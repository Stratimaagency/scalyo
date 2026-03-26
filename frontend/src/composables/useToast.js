import { ref } from 'vue'

const toasts = ref([])
let nextId = 0

export function useToast() {
  function show(message, type = 'info', duration = 4000) {
    const id = ++nextId
    toasts.value.push({ id, message, type })
    if (duration > 0) {
      setTimeout(() => dismiss(id), duration)
    }
    return id
  }

  function dismiss(id) {
    const idx = toasts.value.findIndex(t => t.id === id)
    if (idx !== -1) toasts.value.splice(idx, 1)
  }

  function success(message, duration) { return show(message, 'success', duration) }
  function error(message, duration) { return show(message, 'error', duration || 6000) }
  function warning(message, duration) { return show(message, 'warning', duration) }
  function info(message, duration) { return show(message, 'info', duration) }

  return { toasts, show, dismiss, success, error, warning, info }
}
