<template>
    <nav class="nav" :class="{ scrolled }">
      <div class="nav-inner">
        <router-link to="/" class="logo-link">
          <ScalyoLogo :size="34" />
          <span class="logo-text">Scalyo</span>
        </router-link>

        <div class="nav-links hide-mobile">
          <a href="#features" @click.prevent="scrollTo('features')">{{ t('nav_features') }}</a>
          <a href="#roi" @click.prevent="scrollTo('roi')">{{ t('nav_roi') }}</a>
          <a href="#pricing" @click.prevent="scrollTo('pricing')">{{ t('nav_pricing') }}</a>
          <a href="#faq" @click.prevent="scrollTo('faq')">{{ t('nav_faq') }}</a>
        </div>

        <div class="nav-right hide-mobile">
          <div class="lang-switch">
            <button v-for="l in langs" :key="l.code" :class="{ active: locale === l.code }" @click="locale = l.code">{{ l.label }}</button>
          </div>
          <a :href="appUrl + '/login'" class="btn-ghost-sm">{{ t('nav_login') }}</a>
          <a :href="appUrl + '/login'" class="btn-primary-sm">{{ t('nav_cta') }}</a>
        </div>

        <button class="burger hide-desktop" @click="mobileMenu = !mobileMenu" aria-label="Menu">
          <span /><span /><span />
        </button>
      </div>

      <!-- Mobile menu -->
      <transition name="slide-down">
        <div v-if="mobileMenu" class="mobile-menu">
          <a href="#features" @click.prevent="scrollTo('features'); mobileMenu = false">{{ t('nav_features') }}</a>
          <a href="#roi" @click.prevent="scrollTo('roi'); mobileMenu = false">{{ t('nav_roi') }}</a>
          <a href="#pricing" @click.prevent="scrollTo('pricing'); mobileMenu = false">{{ t('nav_pricing') }}</a>
          <a href="#faq" @click.prevent="scrollTo('faq'); mobileMenu = false">{{ t('nav_faq') }}</a>
          <div class="lang-switch">
            <button v-for="l in langs" :key="l.code" :class="{ active: locale === l.code }" @click="locale = l.code">{{ l.label }}</button>
          </div>
          <a :href="appUrl + '/login'" class="btn-ghost-sm">{{ t('nav_login') }}</a>
          <a :href="appUrl + '/login'" class="btn-primary-sm">{{ t('nav_cta_mobile') }}</a>
        </div>
      </transition>
    </nav>
</template>

<script setup>
import { ref } from 'vue'
import ScalyoLogo from '@/components/ScalyoLogo.vue'
import { useLandingI18n } from '@/composables/useLandingI18n'

const { t, locale, langs } = useLandingI18n()

const appUrl = ''
const scrolled = ref(false)
const mobileMenu = ref(false)

function scrollTo(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  mobileMenu.value = false
}

function onScroll() { scrolled.value = window.scrollY > 30 }

// Lifecycle
import { onMounted, onUnmounted } from 'vue'
onMounted(() => window.addEventListener('scroll', onScroll, { passive: true }))
onUnmounted(() => window.removeEventListener('scroll', onScroll))
</script>

<style scoped>
/* ═══════════════════ NAVBAR ═══════════════════ */
.nav { position: fixed; top: 0; left: 0; right: 0; z-index: 200; background: rgba(248,249,251,0.88); backdrop-filter: blur(20px); border-bottom: 1px solid transparent; transition: all 0.3s; }
.nav.scrolled { border-bottom-color: var(--lp-border); background: rgba(255,255,255,0.97); box-shadow: 0 1px 12px rgba(0,0,0,0.06); }
.nav-inner { max-width: 1160px; margin: 0 auto; padding: 0 24px; height: 64px; display: flex; align-items: center; gap: 20px; }
.logo-link { display: flex; align-items: center; gap: 8px; }
.logo-text { font-weight: 700; font-size: 1.1rem; color: var(--lp-text); }
.nav-links { display: flex; gap: 28px; flex: 1; margin-left: 40px; }
.nav-links a { color: var(--lp-muted); font-size: 0.875rem; font-weight: 500; transition: color 0.2s; }
.nav-links a:hover { color: var(--lp-purple); }
.nav-right { display: flex; align-items: center; gap: 12px; margin-left: auto; }
.lang-switch { display: flex; gap: 2px; background: var(--lp-surface); border-radius: 8px; padding: 2px; }
.lang-switch button { background: none; border: none; color: var(--lp-muted); font-size: 0.75rem; padding: 4px 10px; border-radius: 6px; cursor: pointer; transition: all 0.2s; }
.lang-switch button.active { color: #fff; background: var(--lp-purple); font-weight: 600; }
.burger { display: none; flex-direction: column; gap: 5px; background: none; border: none; cursor: pointer; padding: 4px; margin-left: auto; }
.burger span { display: block; width: 22px; height: 2px; background: var(--lp-text); border-radius: 2px; }
.mobile-menu { padding: 16px 24px 24px; display: flex; flex-direction: column; gap: 14px; border-top: 1px solid var(--lp-border); background: #fff; }
.mobile-menu a { color: var(--lp-muted); font-size: 0.9rem; }

</style>