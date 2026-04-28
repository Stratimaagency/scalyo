<template>
    <section id="faq" class="faq-section">
      <div class="container">
        <div class="section-header anim-section" data-anim="fade-up">
          <span class="section-tag">{{ t('faq_tag') }}</span>
          <h2 v-html="t('faq_h2')"></h2>
        </div>

        <div class="faq-list anim-section" data-anim="fade-up">
          <div v-for="(item, i) in faqItems" :key="i" class="faq-item" :class="{ open: openFaq === i }" @click="openFaq = openFaq === i ? null : i">
            <div class="faq-q">
              <span>{{ item.q }}</span>
              <span class="faq-toggle">{{ openFaq === i ? '−' : '+' }}</span>
            </div>
            <div class="faq-a">
              <p>{{ item.a }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useLandingI18n } from '@/composables/useLandingI18n'
const { t } = useLandingI18n()

const openFaq = ref(null)
const faqItems = computed(() => [
  { q: t('faq_q1'), a: t('faq_a1') },
  { q: t('faq_q2'), a: t('faq_a2') },
  { q: t('faq_q3'), a: t('faq_a3') },
  { q: t('faq_q4'), a: t('faq_a4') },
  { q: t('faq_q5'), a: t('faq_a5') },
  { q: t('faq_q6'), a: t('faq_a6') },
  { q: t('faq_q7'), a: t('faq_a7') },
  { q: t('faq_q8'), a: t('faq_a8') },
])
</script>

<style scoped>
/* ═══════════════════ FAQ ═══════════════════ */
.faq-section { padding: 80px 0; background: var(--lp-bg2); }
.faq-list { max-width: 700px; margin: 0 auto; }
.faq-item { border-bottom: 1px solid var(--lp-border); cursor: pointer; transition: background 0.2s; }
.faq-item:hover { background: rgba(124,58,237,0.03); }
.faq-q { display: flex; justify-content: space-between; align-items: center; padding: 18px 0; font-size: 0.95rem; font-weight: 500; }
.faq-toggle { color: var(--lp-purple-light); font-size: 1.3rem; flex-shrink: 0; margin-left: 16px; }
.faq-a { max-height: 0; overflow: hidden; transition: max-height 0.4s ease, padding 0.4s ease; }
.faq-item.open .faq-a { max-height: 250px; padding-bottom: 18px; }
.faq-a p { font-size: 0.88rem; color: var(--lp-muted); line-height: 1.7; }

</style>