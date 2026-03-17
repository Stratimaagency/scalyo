import { computed } from 'vue'
import { usePreferencesStore } from '../stores/preferences'
import fr from './fr'
import en from './en'
import kr from './kr'

const messages = { fr, en, kr }

export function useI18n() {
  const prefsStore = usePreferencesStore()
  const lang = computed(() => prefsStore.lang || 'fr')

  function t(key) {
    return (messages[lang.value] || messages.fr)[key] || messages.fr[key] || key
  }

  return { t, lang }
}
