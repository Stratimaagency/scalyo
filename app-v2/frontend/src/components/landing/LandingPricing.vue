<template>
  <section id="pricing" class="pricing-section">
    <div class="container">
      <div class="section-header anim-section" data-anim="fade-up">
        <span class="section-tag">{{ t('pricing_tag') }}</span>
        <h2 v-html="t('pricing_h2')"></h2>
        <p class="pricing-sub">{{ t('pricing_sub') }}</p>
      </div>

      <div class="plans-grid anim-section" data-anim="fade-up">
        <!-- Starter -->
        <div class="plan-card">
          <div class="plan-top">
            <div class="plan-name">STARTER</div>
            <div class="plan-price-wrap">
              <div class="plan-price"><span class="currency">{{ t('plan_currency') }}</span>{{ t('plan_starter_price') }}</div>
              <div class="plan-period">{{ t('plan_per_user') }}</div>
            </div>
            <div class="plan-desc">{{ t('plan_starter_desc') }}</div>
          </div>
          <ul class="plan-features">
            <li>&#10003; {{ t('feat_s1') }}</li>
            <li>&#10003; {{ t('feat_s2') }}</li>
            <li>&#10003; {{ t('feat_s3') }}</li>
            <li>&#10003; {{ t('feat_s4') }}</li>
            <li>&#10003; {{ t('feat_s5') }}</li>
            <li>&#10003; {{ t('feat_s6') }}</li>
          </ul>
          <a :href="stripeUrl('starter')" target="_blank" rel="noopener" class="btn-outline plan-btn">{{ t('cta_trial') }}</a>
        </div>

        <!-- Growth -->
        <div class="plan-card popular">
          <div class="popular-badge">&#11088; {{ t('badge_popular') }}</div>
          <div class="plan-top">
            <div class="plan-name">GROWTH</div>
            <div class="plan-price-wrap">
              <div class="plan-price"><span class="currency">{{ t('plan_currency') }}</span>{{ t('plan_growth_price') }}</div>
              <div class="plan-period">{{ t('plan_per_user') }}</div>
            </div>
            <div class="plan-desc">{{ t('plan_growth_desc') }}</div>
          </div>
          <ul class="plan-features">
            <li>&#10003; {{ t('feat_g1') }}</li>
            <li>&#10003; {{ t('feat_g2') }}</li>
            <li>&#10003; {{ t('feat_g3') }}</li>
            <li>&#10003; {{ t('feat_g4') }}</li>
            <li>&#10003; {{ t('feat_g5') }}</li>
            <li>&#10003; {{ t('feat_g6') }}</li>
          </ul>
          <a :href="stripeUrl('growth')" target="_blank" rel="noopener" class="btn-primary plan-btn">{{ t('cta_trial') }}</a>
        </div>

        <!-- Scale / Elite -->
        <div class="plan-card">
          <div class="plan-top">
            <div class="plan-name">ELITE</div>
            <div class="plan-price-wrap">
              <div class="plan-price"><span class="currency">{{ t('plan_currency') }}</span>{{ t('plan_elite_price') }}</div>
              <div class="plan-period">{{ t('plan_per_user') }}</div>
            </div>
            <div class="plan-desc">{{ t('plan_elite_desc') }}</div>
          </div>
          <ul class="plan-features">
            <li>&#10003; {{ t('feat_sc1') }}</li>
            <li>&#10003; {{ t('feat_sc2') }}</li>
            <li>&#10003; {{ t('feat_sc3') }}</li>
            <li>&#10003; {{ t('feat_sc4') }}</li>
            <li>&#10003; {{ t('feat_sc5') }}</li>
            <li>&#10003; {{ t('feat_sc6') }}</li>
          </ul>
          <a :href="stripeUrl('elite')" target="_blank" rel="noopener" class="btn-outline plan-btn">{{ t('cta_trial') }}</a>
        </div>

        <!-- Enterprise -->
        <div class="plan-card">
          <div class="plan-top">
            <div class="plan-name">ENTERPRISE</div>
            <div class="plan-price-wrap">
              <div class="plan-price plan-price-custom">{{ t('plan_custom') }}</div>
              <div class="plan-period">{{ t('plan_viewers') }}</div>
            </div>
            <div class="plan-desc">{{ t('plan_enterprise_desc') }}</div>
          </div>
          <ul class="plan-features">
            <li>&#10003; {{ t('feat_e1') }}</li>
            <li>&#10003; {{ t('feat_e2') }}</li>
            <li>&#10003; {{ t('feat_e3') }}</li>
            <li>&#10003; {{ t('feat_e4') }}</li>
            <li>&#10003; {{ t('feat_e5') }}</li>
            <li>&#10003; {{ t('feat_e6') }}</li>
          </ul>
          <a href="mailto:contact@scalyo.app" class="btn-outline plan-btn">{{ t('cta_contact') }}</a>
        </div>
      </div>

      <p class="plan-footnote" v-html="t('plan_footnote')"></p>
    </div>
  </section>
</template>

<script setup>
import { useAuthStore } from '@/stores/auth'

const props = defineProps({
  t: { type: Function, required: true }
})

const authStore = useAuthStore()

const STRIPE_LINKS = {
  starter: 'https://buy.stripe.com/4gM3cvdyzcpLbCRb8odfG06',
  growth:  'https://buy.stripe.com/eVqfZh2TVdtPdKZccsdfG07',
  elite:   'https://buy.stripe.com/14A3cv667gG18qFccsdfG08',
}

function stripeUrl(plan) {
  const base = STRIPE_LINKS[plan]
  const email = authStore.user?.email
  return email ? base + '?prefilled_email=' + encodeURIComponent(email) : base
}
</script>
