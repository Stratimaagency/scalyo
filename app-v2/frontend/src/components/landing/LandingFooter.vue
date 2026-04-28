<template>
  <div>
    <footer class="footer-section">
      <div class="container">
        <div class="footer-grid">
          <div class="footer-brand">
            <div class="footer-logo"><ScalyoLogo :size="28" /><span>Scalyo</span></div>
            <p>{{ t('footer_desc') }}</p>
            <p class="footer-markets">{{ t('footer_markets') }}</p>
          </div>
          <div class="footer-col">
            <h4>{{ t('footer_col_product') }}</h4>
            <a href="#features" @click.prevent="scrollTo('features')">{{ t('footer_features') }}</a>
            <a href="#pricing" @click.prevent="scrollTo('pricing')">{{ t('footer_pricing') }}</a>
            <a href="#roi" @click.prevent="scrollTo('roi')">{{ t('footer_roi_calc') }}</a>
            <a :href="appUrl + '/login'">{{ t('footer_signin') }}</a>
          </div>
          <div class="footer-col">
            <h4>{{ t('footer_col_resources') }}</h4>
            <a href="#">{{ t('footer_blog') }}</a>
            <a href="#">{{ t('footer_help') }}</a>
            <a href="#">{{ t('footer_api_docs') }}</a>
          </div>
          <div class="footer-col">
            <h4>{{ t('footer_col_contact') }}</h4>
            <a href="mailto:contact@scalyo.app">contact@scalyo.app</a>
            <a href="#">{{ t('footer_support') }}</a>
            <a href="#" @click.prevent="showLegal = true">{{ t('footer_rgpd') }}</a>
          </div>
        </div>
        <div class="footer-bottom">
          <span>{{ t('footer_copy') }}</span>
        </div>
      </div>
    </footer>

    <Transition name="modal-fade">
      <div v-if="showLegal" class="lm-overlay" @click.self="showLegal = false">
        <div class="lm-box">
          <div class="lm-head">
            <div class="lm-legal-tabs">
              <button class="lm-tab" :class="{ active: legalTab === 'rgpd' }" @click="legalTab = 'rgpd'">{{ t('footer_rgpd') }}</button>
              <button class="lm-tab" :class="{ active: legalTab === 'legal' }" @click="legalTab = 'legal'">{{ t('footer_legal') }}</button>
            </div>
            <button class="lm-close" @click="showLegal = false">&times;</button>
          </div>
          <div class="lm-body" v-html="legalTab === 'rgpd' ? rgpdContent : legalContent"></div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import ScalyoLogo from '@/components/ScalyoLogo.vue'

const props = defineProps({
  appUrl: { type: String, default: '' },
  locale: { type: String, default: 'fr' },
  t:      { type: Function, required: true }
})

const showLegal = ref(false)
const legalTab = ref('rgpd')

const rgpdContent = computed(() => {
  const lang = props.locale
  const content = {
    fr: '<h3>Politique de confidentialit\u00e9</h3><p>Scalyo respecte votre vie priv\u00e9e. Vos donn\u00e9es sont stock\u00e9es en Europe (Supabase EU), chiffr\u00e9es au repos et en transit, jamais vendues \u00e0 des tiers. Vous pouvez demander la suppression compl\u00e8te de vos donn\u00e9es \u00e0 tout moment via contact@scalyo.app.</p>',
    en: '<h3>Privacy Policy</h3><p>Scalyo respects your privacy. Your data is stored in Europe (Supabase EU), encrypted at rest and in transit, and never sold to third parties. You can request complete data deletion at any time via contact@scalyo.app.</p>',
    kr: '<h3>\uAC1C\uC778\uC815\uBCF4 \uCC98\uB9AC\uBC29\uCE68</h3><p>Scalyo\uB294 \uADC0\uD558\uC758 \uAC1C\uC778\uC815\uBCF4\uB97C \uC874\uC911\uD569\uB2C8\uB2E4.</p>',
  }
  return content[lang] || content.fr
})

const legalContent = computed(() => {
  const lang = props.locale
  const content = {
    fr: '<h3>Mentions l\u00e9gales</h3><p>Scalyo est un service \u00e9dit\u00e9 par Scalyo SAS. Si\u00e8ge social : France. Contact : contact@scalyo.app. H\u00e9bergement : Cloudflare Pages + Supabase (EU).</p>',
    en: '<h3>Legal Notice</h3><p>Scalyo is published by Scalyo SAS. Headquarters: France. Contact: contact@scalyo.app. Hosting: Cloudflare Pages + Supabase (EU).</p>',
    kr: '<h3>\uBC95\uC801 \uACE0\uC9C0</h3><p>Scalyo\uB294 Scalyo SAS\uC5D0\uC11C \uC81C\uACF5\uD569\uB2C8\uB2E4.</p>',
  }
  return content[lang] || content.fr
})

function scrollTo(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
}
</script>
