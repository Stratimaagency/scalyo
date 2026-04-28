<template>
    <!-- ═══════════════════ HERO ═══════════════════ -->
    <section class="hero">
      <div class="hero-glow" />
      <div class="container hero-content anim-section" data-anim="fade-up">
        <div class="hero-badge">
          <span class="badge-dot" />
          {{ t('hero_badge') }}
        </div>

        <h1 class="hero-title" v-html="t('hero_h1')"></h1>

        <p class="hero-sub">{{ t('hero_sub') }}</p>

        <div class="hero-ctas">
          <a :href="appUrl + '/login'" class="btn-primary lg glow-btn">{{ t('cta_free_14') }}</a>
          <a href="#pricing" class="btn-outline lg" @click.prevent="scrollTo('pricing')">{{ t('see_pricing') }}</a>
        </div>

        <div class="proof-row">
          <span class="proof-item">✓ {{ t('proof_14d') }}</span>
          <span class="proof-item">✓ {{ t('proof_rgpd') }}</span>
          <span class="proof-item">✓ {{ t('proof_support') }}</span>
        </div>
      </div>

</template>

<script setup>
import { useLandingI18n } from '@/composables/useLandingI18n'
const { t } = useLandingI18n()
const appUrl = ''

function scrollTo(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
}
</script>

<style scoped>
/* ═══════════════════ HERO ═══════════════════ */
.hero { padding: 140px 0 60px; position: relative; overflow: hidden; }
.hero-glow { position: absolute; top: -200px; left: 50%; transform: translateX(-50%); width: 800px; height: 800px; background: radial-gradient(circle, rgba(124,58,237,0.15) 0%, transparent 70%); pointer-events: none; animation: pulse-glow 6s ease-in-out infinite; }
.hero-content { text-align: center; position: relative; z-index: 1; }
.hero-badge { display: inline-flex; align-items: center; gap: 10px; background: var(--lp-surface); border: 1px solid var(--lp-border); padding: 8px 20px; border-radius: 999px; font-size: 0.82rem; color: var(--lp-muted); margin-bottom: 32px; }
.badge-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--lp-purple); box-shadow: 0 0 12px var(--lp-purple); }
.hero-title { font-size: clamp(2.4rem, 5vw, 3.8rem); font-weight: 800; line-height: 1.1; margin-bottom: 20px; letter-spacing: -0.02em; }
.hero-title :deep(.accent) { background: linear-gradient(135deg, var(--lp-purple-light), #c084fc); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
.hero-sub { font-size: 1.05rem; color: var(--lp-muted); max-width: 580px; margin: 0 auto 36px; line-height: 1.7; }
.hero-ctas { display: flex; gap: 16px; justify-content: center; flex-wrap: wrap; margin-bottom: 24px; }
.proof-row { display: flex; justify-content: center; gap: 20px; flex-wrap: wrap; }
.proof-item { font-size: 0.8rem; color: var(--lp-muted); }

</style>