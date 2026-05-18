<template>
  <div class="sv-panel">
    <!-- Language -->
    <div class="sv-section">
      <h3>🌐 {{ t('stg_lang_title') }}</h3>
      <p class="sv-note">{{ t('stg_lang_desc') }}</p>
      <div class="lang-cards">
        <button
          v-for="lang in langOptions"
          :key="lang.code"
          class="lang-card"
          :class="{ active: selectedLang === lang.code }"
          @click="changeLang(lang.code)"
        >
          <span class="lang-flag">{{ lang.flag }}</span>
          <span class="lang-name">{{ lang.name }}</span>
          <span v-if="selectedLang === lang.code" class="lang-check">✓</span>
        </button>
      </div>
      <p v-if="langSaved" class="stg-saved">✓ {{ t('stg_lang_saved') }}</p>
    </div>

    <!-- Theme -->
    <div class="sv-section">
      <h3>🌙 {{ t('stg_dark_title') }}</h3>
      <p class="sv-note">{{ t('stg_appearance_note') }}</p>
      <div class="theme-cards">
        <button
          class="theme-card"
          :class="{ active: theme === 'light' }"
          @click="setTheme('light')"
        >
          ☀️ {{ t('stg_theme_light') }}
        </button>
        <button class="theme-card disabled" disabled>
          🌙 {{ t('stg_theme_dark') }}
          <span class="coming-soon">Bientôt</span>
        </button>
        <button class="theme-card disabled" disabled>
          🖥️ {{ t('stg_theme_auto') }}
          <span class="coming-soon">Bientôt</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth'

const { t, locale } = useI18n({ useScope: 'global' })
const auth = useAuthStore()

/* ── Language ──────────────────────────────── */
const langOptions = [
  { code: 'fr', flag: '🇫🇷', name: 'Français' },
  { code: 'en', flag: '🇬🇧', name: 'English' },
  { code: 'ko', flag: '🇰🇷', name: '한국어' }
]

const selectedLang = ref(auth.userLocale || locale.value || 'fr')
const langSaved = ref(false)

async function changeLang(code) {
  selectedLang.value = code
  locale.value = code
  await auth.saveLocale(code)
  langSaved.value = true
  setTimeout(() => { langSaved.value = false }, 2000)
}

/* ── Theme ─────────────────────────────────── */
const theme = ref(localStorage.getItem('scalyo_theme') || 'auto')

function setTheme(value) {
  if (value !== 'light') return // Dark mode not ready for alpha
  theme.value = value
  localStorage.setItem('scalyo_theme', value)
  applyTheme(value)
}

function applyTheme(value) {
  const root = document.documentElement
  if (value === 'dark') {
    root.setAttribute('data-theme', 'dark')
  } else if (value === 'light') {
    root.setAttribute('data-theme', 'light')
  } else {
    root.removeAttribute('data-theme')
  }
}

// Force light mode for alpha — dark mode CSS not implemented yet
theme.value = 'light'
localStorage.setItem('scalyo_theme', 'light')
applyTheme('light')
</script>

<style scoped>
.theme-card.disabled {
  opacity: 0.4;
  cursor: not-allowed;
  position: relative;
}
.coming-soon {
  display: block;
  font-size: 0.7rem;
  color: #9ca3af;
  margin-top: 2px;
}
</style>