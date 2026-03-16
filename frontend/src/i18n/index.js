import { computed } from 'vue'
import { useAuthStore } from '../stores/auth'
import fr from './fr'
import en from './en'
import kr from './kr'

const messages = { fr, en, kr }

export function useI18n() {
  const authStore = useAuthStore()
  const lang = computed(() => authStore.lang || 'fr')

  function t(key) {
    return (messages[lang.value] || messages.fr)[key] || key
  }

  return { t, lang }
}
