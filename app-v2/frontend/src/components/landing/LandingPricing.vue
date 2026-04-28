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
              <li>✓ {{ t('feat_s1') }}</li>
              <li>✓ {{ t('feat_s2') }}</li>
              <li>✓ {{ t('feat_s3') }}</li>
              <li>✓ {{ t('feat_s4') }}</li>
              <li>✓ {{ t('feat_s5') }}</li>
              <li>✓ {{ t('feat_s6') }}</li>
            </ul>
            <a :href="stripeUrl('starter')" target="_blank" rel="noopener" class="btn-outline plan-btn">{{ t('cta_trial') }}</a>
          </div>

          <!-- Growth -->
          <div class="plan-card popular">
            <div class="popular-badge">⭐ {{ t('badge_popular') }}</div>
            <div class="plan-top">
              <div class="plan-name">GROWTH</div>
              <div class="plan-price-wrap">
                <div class="plan-price"><span class="currency">{{ t('plan_currency') }}</span>{{ t('plan_growth_price') }}</div>
                <div class="plan-period">{{ t('plan_per_user') }}</div>
              </div>
              <div class="plan-desc">{{ t('plan_growth_desc') }}</div>
            </div>
            <ul class="plan-features">
              <li>✓ {{ t('feat_g1') }}</li>
              <li>✓ {{ t('feat_g2') }}</li>
              <li>✓ {{ t('feat_g3') }}</li>
              <li>✓ {{ t('feat_g4') }}</li>
              <li>✓ {{ t('feat_g5') }}</li>
              <li>✓ {{ t('feat_g6') }}</li>
            </ul>
            <a :href="stripeUrl('growth')" target="_blank" rel="noopener" class="btn-primary plan-btn">{{ t('cta_trial') }}</a>
          </div>

          <!-- Scale -->
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
              <li>✓ {{ t('feat_all_growth') }}</li>
              <li>✓ {{ t('feat_playbooks') }}</li>
              <li>✓ {{ t('feat_coach_elite') }}</li>
              <li>✓ {{ t('feat_coaching') }}</li>
              <li>✓ {{ t('feat_onboarding') }}</li>
              <li>✓ {{ t('feat_sla') }}</li>
              <li>✓ {{ t('feat_multi') }}</li>
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
              <li>✓ {{ t('feat_e1') }}</li>
              <li>✓ {{ t('feat_e2') }}</li>
              <li>✓ {{ t('feat_e3') }}</li>
              <li>✓ {{ t('feat_e4') }}</li>
              <li>✓ {{ t('feat_e5') }}</li>
              <li>✓ {{ t('feat_e6') }}</li>
            </ul>
            <a href="mailto:contact@scalyo.app" class="btn-outline plan-btn">{{ t('cta_contact') }}</a>
          </div>
        </div>

        <p class="plan-footnote" v-html="t('plan_footnote')"></p>
      </div>
    </section>
</template>

<script setup>
import { useLandingI18n } from '@/composables/useLandingI18n'
import { useAuthStore } from '@/stores/auth'
const { t } = useLandingI18n()
const authStore = useAuthStore()
const appUrl = ''

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

<style scoped>
/* ═══════════════════ PRICING ═══════════════════ */
.pricing-section { padding: 80px 0; }
.pricing-sub { font-size: 1rem; color: var(--lp-muted); max-width: 640px; margin: 10px auto 0; line-height: 1.6; text-align: center; }
.plans-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-top: 40px; align-items: stretch; }
.plan-card { background: var(--lp-surface); border: 1px solid var(--lp-border); border-radius: 20px; padding: 40px 28px 32px; position: relative; transition: transform 0.3s, box-shadow 0.3s; display: flex; flex-direction: column; text-align: center; }
.plan-card:hover { transform: translateY(-6px); box-shadow: 0 20px 60px rgba(0,0,0,0.2); }
.plan-card.popular { border-color: var(--lp-purple); box-shadow: 0 0 40px rgba(124,58,237,0.15); background: linear-gradient(180deg, rgba(124,58,237,0.04), transparent 60%); }
.popular-badge { position: absolute; top: -14px; left: 50%; transform: translateX(-50%); background: var(--lp-purple); color: #fff; font-size: 0.72rem; font-weight: 700; padding: 4px 16px; border-radius: 20px; white-space: nowrap; letter-spacing: 0.04em; }
.plan-top { min-height: 160px; display: flex; flex-direction: column; align-items: center; }
.plan-name { font-size: 1.2rem; font-weight: 900; letter-spacing: 0.14em; color: #111827; margin-bottom: 20px; text-transform: uppercase; }
.plan-price-wrap { margin-bottom: 12px; text-align: center; }
.plan-price { font-size: 3.2rem; font-weight: 900; color: var(--lp-purple); text-shadow: 0 0 20px rgba(124,58,237,0.35), 0 0 50px rgba(124,58,237,0.15); line-height: 1; }
.plan-price .currency { font-size: 1.6rem; vertical-align: top; margin-right: 2px; position: relative; top: 6px; }
.plan-price-custom { font-size: 2rem; }
.plan-period { font-size: 0.95rem; color: #4B5563; font-weight: 500; margin-top: 4px; }
.plan-desc { font-size: 0.95rem; color: #374151; font-weight: 400; line-height: 1.45; margin-top: 4px; }
.plan-features { list-style: none; padding: 0; margin: 0 0 24px 0; text-align: left; flex: 1; }
.plan-features li { padding: 9px 0; font-size: 0.95rem; color: #1F2937; font-weight: 500; border-bottom: 1px solid rgba(255,255,255,0.04); }
.plan-btn { display: block; text-align: center; padding: 16px 24px; border-radius: 14px; font-weight: 700; font-size: 1.05rem; text-decoration: none; transition: all 0.3s; margin-top: auto; }
.plan-footnote { text-align: center; font-size: 0.75rem; color: var(--lp-muted); margin-top: 28px; line-height: 1.6; }
.plan-footnote :deep(strong) { color: var(--lp-purple-light); }
</style>