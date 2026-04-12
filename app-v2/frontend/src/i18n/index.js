import { createI18n } from 'vue-i18n'
import fr from './fr'
import en from './en'
import ko from './ko'

export const i18n = createI18n({
  legacy: false,
  locale: localStorage.getItem('scalyo_locale') || 'fr',
  fallbackLocale: 'fr',
  messages: { fr, en, ko },
})
