<template>
  <div class="paywall-page">
    <div class="pw-card">
      <div class="pw-logo">
        <ScalyoLogo :size="40" />
        <span class="pw-brand">Scalyo</span>
      </div>

      <div class="pw-icon">⏰</div>
      <h1 class="pw-title">{{ t('paywall_title') }}</h1>
      <p class="pw-sub">{{ t('paywall_subtitle') }}</p>

      <div class="pw-plans">
        <!-- Starter -->
        <div class="pw-plan">
          <div class="pw-plan-icon">⭐</div>
          <div class="pw-plan-name">Starter</div>
          <div class="pw-plan-price">97€<span>/{{ t('profile_month') }}</span></div>
          <ul>
            <li>✓ {{ t('plan_feat_10clients') }}</li>
            <li>✓ {{ t('plan_feat_import') }}</li>
          </ul>
          <a :href="starterUrl" target="_blank" class="btn-plan btn-starter">
            {{ t('paywall_choose') }} →
          </a>
        </div>
        <!-- Growth -->
        <div class="pw-plan pw-plan--featured">
          <div class="pw-popular">{{ t('register_most_popular') }}</div>
          <div class="pw-plan-icon">🚀</div>
          <div class="pw-plan-name">Growth</div>
          <div class="pw-plan-price">297€<span>/{{ t('profile_month') }}</span></div>
          <ul>
            <li>✓ {{ t('plan_feat_50clients') }}</li>
            <li>✓ {{ t('plan_feat_ai') }}</li>
            <li>✓ {{ t('plan_feat_copil') }}</li>
          </ul>
          <a :href="growthUrl" target="_blank" class="btn-plan btn-growth">
            {{ t('paywall_choose') }} →
          </a>
        </div>
        <!-- Elite -->
        <div class="pw-plan">
          <div class="pw-plan-icon">🏆</div>
          <div class="pw-plan-name">Elite</div>
          <div class="pw-plan-price">697€<span>/{{ t('profile_month') }}</span></div>
          <ul>
            <li>✓ {{ t('plan_feat_unlimited') }}</li>
            <li>✓ {{ t('plan_feat_ai') }}</li>
            <li>✓ {{ t('plan_feat_support') }}</li>
          </ul>
          <a :href="eliteUrl" target="_blank" class="btn-plan btn-elite">
            {{ t('paywall_choose') }} →
          </a>
        </div>
      </div>

      <button class="btn-logout" @click="handleLogout">{{ t('paywall_logout') }}</button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import ScalyoLogo from '@/components/ScalyoLogo.vue'

const { t } = useI18n({ useScope: 'global' })
const router = useRouter()
const auth = useAuthStore()

const email = computed(() => auth.user?.email || '')
const starterUrl = computed(() => { const p = []; if (email.value) p.push('prefilled_email=' + encodeURIComponent(email.value)); if (auth.user?.id) p.push('client_reference_id=' + auth.user.id); return 'https://buy.stripe.com/bJebJ1amncpL7mBekAdfG01' + (p.length ? '?' + p.join('&') : '') })
const growthUrl = computed(() => { const p = []; if (email.value) p.push('prefilled_email=' + encodeURIComponent(email.value)); if (auth.user?.id) p.push('client_reference_id=' + auth.user.id); return 'https://buy.stripe.com/eVqbJ10LN6ln5et90gdfG00' + (p.length ? '?' + p.join('&') : '') })
const eliteUrl = computed(() => { const p = []; if (email.value) p.push('prefilled_email=' + encodeURIComponent(email.value)); if (auth.user?.id) p.push('client_reference_id=' + auth.user.id); return 'https://buy.stripe.com/eVqaEXeCD1L736l7WcdfG05' + (p.length ? '?' + p.join('&') : '') })

async function handleLogout() {
  await auth.logout()
  router.push('/login')
}
</script>

<style scoped>
.paywall-page { min-height:100vh;display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,#f5f3ff,#ede9fe);padding:24px; }
.pw-card { background:#fff;border-radius:24px;padding:48px 40px;max-width:860px;width:100%;box-shadow:0 24px 80px rgba(124,58,237,0.12);text-align:center; }
.pw-logo { display:flex;align-items:center;justify-content:center;gap:10px;margin-bottom:24px; }
.pw-brand { font-size:1.3rem;font-weight:800;color:#7c3aed; }
.pw-icon { font-size:3rem;margin-bottom:12px; }
.pw-title { font-size:1.6rem;font-weight:800;margin-bottom:8px;color:#111827; }
.pw-sub { font-size:0.9rem;color:#6b7280;margin-bottom:32px;line-height:1.6; }
.pw-plans { display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-bottom:28px; }
.pw-plan { border:2px solid #e5e7eb;border-radius:16px;padding:24px 16px;display:flex;flex-direction:column;align-items:center;gap:8px;position:relative; }
.pw-plan--featured { border-color:#7c3aed;box-shadow:0 4px 20px rgba(124,58,237,0.15); }
.pw-popular { position:absolute;top:-12px;left:50%;transform:translateX(-50%);background:#7c3aed;color:#fff;font-size:0.7rem;font-weight:700;padding:3px 12px;border-radius:20px;white-space:nowrap; }
.pw-plan-icon { font-size:1.6rem; }
.pw-plan-name { font-size:0.95rem;font-weight:800; }
.pw-plan-price { font-size:1.5rem;font-weight:800;color:#7c3aed; }
.pw-plan-price span { font-size:0.78rem;color:#6b7280;font-weight:400; }
.pw-plan ul { list-style:none;padding:0;margin:0;text-align:left;width:100%; }
.pw-plan ul li { font-size:0.78rem;color:#374151;padding:2px 0; }
.btn-plan { display:block;width:100%;text-align:center;text-decoration:none;padding:10px;border-radius:10px;font-size:0.85rem;font-weight:700;margin-top:8px;transition:all 0.2s; }
.btn-starter { background:#ede9fe;color:#5b21b6; }
.btn-starter:hover { background:#7c3aed;color:#fff; }
.btn-growth { background:#7c3aed;color:#fff; }
.btn-growth:hover { background:#6d28d9;transform:translateY(-1px); }
.btn-elite { background:#1f2937;color:#fff; }
.btn-elite:hover { background:#111827;transform:translateY(-1px); }
.btn-logout { background:none;border:1px solid #e5e7eb;color:#6b7280;padding:10px 24px;border-radius:10px;font-size:0.85rem;cursor:pointer;transition:all 0.2s; }
.btn-logout:hover { border-color:#ef4444;color:#ef4444; }
@media(max-width:640px) { .pw-plans { grid-template-columns:1fr; } .pw-card { padding:32px 20px; } }
</style>