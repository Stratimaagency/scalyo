<template>
  <div class="sv-panel">
    <!-- Current Plan -->
    <div class="sv-section">
      <h3>{{ t('stg_tab_billing') }}</h3>
      <div class="billing-plan">
        <div class="bp-current">
          <span class="bp-badge">{{ auth.currentPlanLabel }}</span>
          <span class="bp-price">
            {{ planPrice }}€/{{ t('stg_per_month') }}
          </span>
        </div>
        <div class="plan-status-row">
          <span
            class="plan-status"
            :class="{ active: auth.hasActiveSubscription, trial: auth.isOnTrial }"
          >
            {{
              auth.hasActiveSubscription
                ? t('stg_plan_active')
                : auth.isOnTrial
                  ? t('stg_trial_days', { days: auth.trialDaysLeft })
                  : t('stg_plan_none')
            }}
          </span>
        </div>
      </div>
    </div>

    <!-- Plans Grid -->
    <div class="sv-section">
      <h3>{{ t('stg_change_plan') }}</h3>
      <div class="plans-grid">
        <div
          v-for="plan in plans"
          :key="plan.key"
          class="plan-card"
          :class="{ active: auth.currentPlan === plan.key, featured: plan.featured }"
        >
          <div v-if="plan.featured" class="plan-badge-popular">
            {{ t('stg_plan_popular') }}
          </div>
          <div class="plan-header">
            <span class="plan-name">{{ plan.name }}</span>
            <span class="plan-price">
              {{ plan.price }}€<span class="plan-period">/{{ t('stg_per_month') }}</span>
            </span>
          </div>
          <ul class="plan-features">
            <li v-for="(feat, idx) in plan.features" :key="idx">{{ t(feat) }}</li>
          </ul>
          <button
            class="btn-plan"
            :class="{ current: auth.currentPlan === plan.key }"
            :disabled="auth.currentPlan === plan.key"
            @click="handlePlanChange(plan.url, plan.key)"
          >
            {{ getPlanButtonLabel(plan.key) }}
          </button>
        </div>
      </div>
      <p class="bp-note">{{ t('stg_stripe_soon') }}</p>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth'

const { t } = useI18n({ useScope: 'global' })
const auth = useAuthStore()

const email = computed(() => auth.user?.email || '')

const planPrice = computed(() => {
  const prices = { elite: '697', growth: '297', starter: '97' }
  return prices[auth.currentPlan] || '0'
})

function buildStripeUrl(base) {
  return base + (email.value ? '?prefilled_email=' + encodeURIComponent(email.value) : '')
}

const starterUrl = computed(() =>
  buildStripeUrl('https://buy.stripe.com/bJebJ1amncpL7mBekAdfG01')
)
const growthUrl = computed(() =>
  buildStripeUrl('https://buy.stripe.com/eVqbJ10LN6ln5et90gdfG00')
)
const eliteUrl = computed(() =>
  buildStripeUrl('https://buy.stripe.com/eVqaEXeCD1L736l7WcdfG05')
)

const plans = computed(() => [
  {
    key: 'starter',
    name: 'Starter',
    price: '97',
    featured: false,
    url: starterUrl.value,
    features: ['stg_plan_starter_f1', 'stg_plan_starter_f2', 'stg_plan_starter_f3']
  },
  {
    key: 'growth',
    name: 'Growth',
    price: '297',
    featured: true,
    url: growthUrl.value,
    features: ['stg_plan_growth_f1', 'stg_plan_growth_f2', 'stg_plan_growth_f3']
  },
  {
    key: 'elite',
    name: 'Elite',
    price: '697',
    featured: false,
    url: eliteUrl.value,
    features: ['stg_plan_elite_f1', 'stg_plan_elite_f2', 'stg_plan_elite_f3']
  }
])

function getPlanButtonLabel(planKey) {
  if (auth.currentPlan === planKey) return t('stg_plan_current')
  const tiers = { starter: 0, growth: 1, elite: 2 }
  const current = tiers[auth.currentPlan] || 0
  const target = tiers[planKey] || 0
  return target > current ? t('stg_plan_upgrade') : t('stg_plan_downgrade')
}

function handlePlanChange(url, plan) {
  if (auth.currentPlan !== plan) window.open(url, '_blank')
}
</script>
