<template>
  <div class="profile-view">
    <div class="pv-header">
      <h1>{{ t('profile_title') }}</h1>
      <p class="pv-sub">{{ t('profile_subtitle') }}</p>
    </div>

    <div class="pv-grid">
      <!-- Left: user info -->
      <div class="pv-card pv-identity">
        <div class="pv-avatar">
          <span>{{ initials }}</span>
        </div>
        <div class="pv-user-info">
          <h2 class="pv-name">{{ auth.fullName || t('profile_no_name') }}</h2>
          <p class="pv-email">{{ auth.user?.email }}</p>
          <span class="pv-badge pv-role">{{ auth.user?.roleLabel || 'User' }}</span>
        </div>
      </div>

      <!-- Right: plan info -->
      <div class="pv-card pv-plan">
        <div class="pv-plan-header">
          <span class="pv-plan-icon">{{ planIcon }}</span>
          <div>
            <span class="pv-plan-label">{{ t('profile_current_plan') }}</span>
            <strong class="pv-plan-name">{{ planDisplay }}</strong>
          </div>
          <span class="pv-plan-badge" :class="planClass">{{ auth.currentPlanLabel || 'Starter' }}</span>
        </div>
        <div class="pv-plan-price">
          <span class="pv-price">{{ planPrice }}</span>
          <span class="pv-period">/{{ t('profile_month') }}</span>
        </div>
        <div class="pv-plan-features">
          <div v-for="f in planFeatures" :key="f" class="pv-feature">
            <span class="pv-feat-dot">✓</span>
            <span>{{ t(f) }}</span>
          </div>
        </div>
        <div class="pv-plan-actions">
          <button class="btn-outline" @click="$router.push('/app/settings')">
            {{ t('profile_manage_plan') }} →
          </button>
        </div>
      </div>

      <!-- Member info -->
      <div class="pv-card pv-meta">
        <h3 class="pv-meta-title">{{ t('profile_account_info') }}</h3>
        <div class="pv-meta-rows">
          <div class="pv-meta-row">
            <span class="pv-meta-label">{{ t('profile_email') }}</span>
            <span class="pv-meta-val">{{ auth.user?.email }}</span>
          </div>
          <div class="pv-meta-row">
            <span class="pv-meta-label">{{ t('profile_name') }}</span>
            <span class="pv-meta-val">{{ auth.fullName || '—' }}</span>
          </div>
          <div class="pv-meta-row">
            <span class="pv-meta-label">{{ t('profile_member_since') }}</span>
            <span class="pv-meta-val">{{ memberSince }}</span>
          </div>
          <div class="pv-meta-row">
            <span class="pv-meta-label">{{ t('profile_plan') }}</span>
            <span class="pv-meta-val"><span class="pv-plan-badge" :class="planClass">{{ auth.currentPlanLabel || 'Starter' }}</span></span>
          </div>
        </div>
      </div>

      <!-- Quick links -->
      <div class="pv-card pv-quick">
        <h3 class="pv-meta-title">{{ t('profile_quick_links') }}</h3>
        <div class="pv-links">
          <button class="pv-link-btn" @click="$router.push('/app/dashboard')">
            <span>📊</span> {{ t('sidebar_dashboard') }}
          </button>
          <button class="pv-link-btn" @click="$router.push('/app/settings')">
            <span>⚙️</span> {{ t('profile_billing_settings') }}
          </button>
          <button class="pv-link-btn pv-link-danger" @click="handleLogout">
            <span>🚪</span> {{ t('logout') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const { t, locale } = useI18n({ useScope: 'global' })
const router = useRouter()
const auth = useAuthStore()

const initials = computed(() => {
  const name = auth.fullName || auth.user?.email || '?'
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
})

const planIcon = computed(() => {
  const p = auth.currentPlan
  if (p === 'elite') return '🏆'
  if (p === 'growth') return '🚀'
  return '⭐'
})

const planDisplay = computed(() => {
  const p = auth.currentPlan || 'starter'
  return p.charAt(0).toUpperCase() + p.slice(1)
})

const planPrice = computed(() => {
  const p = auth.currentPlan
  if (p === 'elite') return t('paywall_price_elite')
  if (p === 'growth') return t('paywall_price_growth')
  return t('paywall_price_starter')
})

const planClass = computed(() => {
  const p = auth.currentPlan
  if (p === 'elite') return 'badge-elite'
  if (p === 'growth') return 'badge-growth'
  return 'badge-starter'
})

const planFeatures = computed(() => {
  const p = auth.currentPlan
  if (p === 'elite') return ['plan_feat_unlimited', 'plan_feat_ai', 'plan_feat_copil', 'plan_feat_support']
  if (p === 'growth') return ['plan_feat_50clients', 'plan_feat_ai', 'plan_feat_copil']
  return ['plan_feat_10clients', 'plan_feat_basic', 'plan_feat_import']
})

const memberSince = computed(() => {
  const d = auth.user?.created_at
  if (!d) return '—'
  return new Date(d).toLocaleDateString(locale.value === 'fr' ? 'fr-FR' : locale.value === 'ko' ? 'ko-KR' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' })
})

async function handleLogout() {
  await auth.logout?.()
  router.push('/login')
}
</script>

<style scoped>
.profile-view { max-width: 900px; margin: 0 auto; padding: 0 0 60px; }
.pv-header { margin-bottom: 32px; }
.pv-header h1 { font-size: 1.5rem; font-weight: 800; }
.pv-sub { font-size: 0.85rem; color: var(--text-muted); margin-top: 4px; }
.pv-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.pv-card {
  background: #fff;
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 24px;
}
/* Identity */
.pv-identity { display: flex; align-items: center; gap: 20px; }
.pv-avatar {
  width: 72px; height: 72px;
  background: linear-gradient(135deg, #7c3aed, #a78bfa);
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 1.5rem; font-weight: 800; color: #fff;
  flex-shrink: 0;
}
.pv-user-info { display: flex; flex-direction: column; gap: 4px; }
.pv-name { font-size: 1.1rem; font-weight: 800; margin: 0; }
.pv-email { font-size: 0.82rem; color: var(--text-muted); margin: 0; }
.pv-badge { font-size: 0.72rem; font-weight: 600; padding: 2px 10px; border-radius: 20px; }
.pv-role { background: #ede9fe; color: #5b21b6; }
/* Plan */
.pv-plan-header { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; }
.pv-plan-icon { font-size: 1.8rem; }
.pv-plan-label { font-size: 0.72rem; color: var(--text-muted); display: block; margin-bottom: 1px; }
.pv-plan-name { font-size: 1rem; font-weight: 800; display: block; }
.pv-plan-badge { margin-left: auto; font-size: 0.72rem; font-weight: 700; padding: 3px 12px; border-radius: 20px; }
.badge-elite { background: #fef3c7; color: #92400e; }
.badge-growth { background: #dcfce7; color: #166534; }
.badge-starter { background: #ede9fe; color: #5b21b6; }
.pv-plan-price { margin-bottom: 16px; }
.pv-price { font-size: 1.8rem; font-weight: 800; color: #7c3aed; }
.pv-period { font-size: 0.82rem; color: var(--text-muted); margin-left: 2px; }
.pv-plan-features { display: flex; flex-direction: column; gap: 6px; margin-bottom: 20px; }
.pv-feature { display: flex; align-items: center; gap: 8px; font-size: 0.82rem; color: var(--text-secondary); }
.pv-feat-dot { color: var(--green); font-weight: 700; font-size: 0.8rem; }
.pv-plan-actions { border-top: 1px solid var(--border); padding-top: 16px; }
/* Meta */
.pv-meta-title { font-size: 0.88rem; font-weight: 700; margin: 0 0 16px; }
.pv-meta-rows { display: flex; flex-direction: column; gap: 12px; }
.pv-meta-row { display: flex; justify-content: space-between; align-items: center; font-size: 0.83rem; }
.pv-meta-label { color: var(--text-muted); }
.pv-meta-val { font-weight: 600; }
/* Quick links */
.pv-links { display: flex; flex-direction: column; gap: 8px; }
.pv-link-btn {
  display: flex; align-items: center; gap: 10px;
  background: none; border: 1px solid var(--border);
  border-radius: var(--radius-sm); padding: 10px 14px;
  font-size: 0.85rem; cursor: pointer; transition: all 0.18s;
  text-align: left; width: 100%;
}
.pv-link-btn:hover { border-color: var(--purple); color: var(--purple); background: #f5f3ff; }
.pv-link-danger:hover { border-color: #ef4444; color: #ef4444; background: #fef2f2; }
.btn-outline {
  background: none; border: 1px solid var(--border); color: var(--text-secondary);
  padding: 8px 16px; border-radius: var(--radius-sm); font-size: 0.84rem;
  cursor: pointer; transition: all 0.18s; width: 100%;
}
.btn-outline:hover { border-color: var(--purple); color: var(--purple); }
@media (max-width: 640px) { .pv-grid { grid-template-columns: 1fr; } }
</style>