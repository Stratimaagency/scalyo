<template>
  <div class="sv-panel">
    <!-- Current Plan -->
    <div class="sv-section">
      <h3>{{ t('stg_tab_billing') }}</h3>
      <div class="billing-plan">
        <div class="bp-current">
          <span class="bp-badge">{{ auth.currentPlanLabel }}</span>
          <span class="bp-price">
            {{ planPrice }}{{ t('stg_currency') }}/{{ t('stg_per_month') }}
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
        <p v-if="auth.profile?.subscription_end_date" class="bp-end-date">
          {{ t('stg_sub_ends') }}
          {{ new Date(auth.profile.subscription_end_date).toLocaleDateString(locale || 'fr', { year: 'numeric', month: 'long', day: 'numeric' }) }}
        </p>
        <button
          v-if="auth.hasActiveSubscription"
          class="sv-portal-btn"
          :disabled="portalLoading"
          @click="openPortal"
        >
          {{ portalLoading ? t('stg_portal_loading') : t('stg_manage_sub') }}
        </button>
        <p v-if="portalError" class="sv-field-error">{{ t('stg_portal_error') }}</p>
      </div>
    </div>

    <!-- Plans Grid -->
    <div class="sv-section">
      <h3>{{ t('stg_plan_title') }}</h3>
      <p class="sv-desc">{{ t('stg_plan_desc') }}</p>
      <div class="plan-grid">
        <div
          v-for="plan in plans"
          :key="plan.key"
          class="plan-card"
          :class="{ featured: plan.featured, current: auth.currentPlan === plan.key }"
        >
          <span v-if="plan.featured" class="plan-pop">{{ t('stg_plan_popular') }}</span>
          <h4>{{ plan.name }}</h4>
          <p class="plan-price">{{ plan.price }}{{ t('stg_currency') }}<span>/{{ t('stg_per_seat') }}</span></p>
          <ul>
            <li v-for="f in plan.features" :key="f">{{ t(f) }}</li>
          </ul>
          <button
            class="plan-btn"
            :disabled="auth.currentPlan === plan.key"
            @click="handlePlanChange(plan.url, plan.key)"
          >
            {{ getPlanButtonLabel(plan.key) }}
          </button>
        </div>
      </div>
      <p class="bp-note">{{ t('stg_stripe_note') }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth'
import { supabase } from '@/lib/supabase'

const { t, locale } = useI18n({ useScope: 'global' })
const auth = useAuthStore()

const email = computed(() => auth.user?.email || '')
const portalLoading = ref(false)
const portalError = ref(false)

const planPrice = computed(() => {
  const prices = { elite: '159', growth: '119', starter: '79' }
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
    price: '79',
    featured: false,
    url: starterUrl.value,
    features: ['stg_plan_starter_f1', 'stg_plan_starter_f2', 'stg_plan_starter_f3']
  },
  {
    key: 'growth',
    name: 'Growth',
    price: '119',
    featured: true,
    url: growthUrl.value,
    features: ['stg_plan_growth_f1', 'stg_plan_growth_f2', 'stg_plan_growth_f3']
  },
  {
    key: 'elite',
    name: 'Elite',
    price: '159',
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

async function openPortal() {
  portalLoading.value = true
  portalError.value = false
  try {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.access_token) return

    const res = await fetch('/api/stripe/portal', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + session.access_token,
      },
    })
    const data = await res.json()
    if (res.ok && data.url) {
      window.open(data.url, '_blank')
    } else {
      portalError.value = true
    }
  } catch {
    portalError.value = true
  } finally {
    portalLoading.value = false
  }
}
</script>
