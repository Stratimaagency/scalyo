import { ref } from 'vue'

/**
 * Reusable chat composable — used by both CoachView and WellbeingView (Nova).
 * Eliminates duplicated chat state/logic.
 */
export function useChat(apiFn) {
  const messages = ref([])
  const input = ref('')
  const sending = ref(false)

  async function send(directText) {
    const text = (directText || input.value).trim()
    if (!text || sending.value) return

    messages.value.push({ role: 'user', content: text })
    input.value = ''
    sending.value = true

    try {
      const result = await apiFn(messages.value)
      messages.value.push({ role: 'assistant', content: result })
    } catch {
      messages.value.push({ role: 'assistant', content: 'Sorry, an error occurred. Please try again.' })
    }

    sending.value = false
  }

  function clear() {
    messages.value = []
    input.value = ''
  }

  return { messages, input, sending, send, clear }
}
