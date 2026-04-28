<template>
    <section class="final-cta-section anim-section" data-anim="fade-up">
      <div class="final-cta-glow"></div>
      <div class="container center">
        <span class="section-tag light">{{ t('end_section_tag') }}</span>
        <h2 class="final-cta-title" v-html="t('end_h2')"></h2>
        <p class="final-cta-sub">{{ t('end_sub') }}</p>
        <div class="final-cta-btns">
          <a :href="appUrl + '/login'" class="btn-primary lg glow-btn">{{ t('cta_start_free') }}</a>
          <a href="mailto:contact@scalyo.app" class="btn-outline-light lg">{{ t('cta_talk') }}</a>
        </div>
        <p class="final-cta-note">{{ t('end_note') }}</p>
      </div>
    </section>
</template>

<script setup>
import { useLandingI18n } from '@/composables/useLandingI18n'
const { t } = useLandingI18n()
const appUrl = ''
</script>

<style scoped>
/* ═══════════════════ FINAL CTA ═══════════════════ */
.final-cta-section { padding: 120px 0; background: linear-gradient(135deg, #0f0a2e, #1e1145, #2d1b69); position: relative; overflow: hidden; }
.final-cta-glow { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 600px; height: 600px; background: radial-gradient(circle, rgba(124,58,237,0.2) 0%, transparent 70%); pointer-events: none; animation: pulse-glow 5s ease-in-out infinite; }
.final-cta-title { font-size: clamp(2rem, 4vw, 3rem); font-weight: 800; line-height: 1.15; margin-bottom: 16px; position: relative; }
.final-cta-title :deep(em) { font-style: normal; background: linear-gradient(135deg, var(--lp-purple-light), #c084fc); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
.final-cta-sub { font-size: 1rem; color: rgba(255,255,255,0.6); margin-bottom: 36px; }
.final-cta-btns { display: flex; gap: 16px; justify-content: center; flex-wrap: wrap; margin-bottom: 20px; }
.final-cta-note { font-size: 0.78rem; color: rgba(255,255,255,0.4); }

</style>