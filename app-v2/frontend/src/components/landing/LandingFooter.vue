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
        </div>
      </div>
      <div class="footer-legal">
        <router-link to="/cgu">{{ t('footer_cgu') }}</router-link>
        <span class="footer-legal-sep">·</span>
        <router-link to="/privacy">{{ t('footer_rgpd') }}</router-link>
      </div>
      <div class="footer-bottom">
        <span>{{ t('footer_copy') }}</span>
      </div>
    </div>
  </footer>
</div>
</template>
<script setup>
import ScalyoLogo from '@/components/ScalyoLogo.vue'

const props = defineProps({
  appUrl: { type: String, default: '' },
  locale: { type: String, default: 'fr' },
  t: { type: Function, required: true }
})

function scrollTo(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
}
</script>
