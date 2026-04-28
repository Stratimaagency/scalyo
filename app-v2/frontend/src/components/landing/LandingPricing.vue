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

const locale = ref('fr')

const rgpdContent = computed(() => {
  const lang = locale.value
  const content = {
    fr: `<p><strong>Dernière mise à jour : Janvier 2025</strong></p><h4>1. Responsable du traitement</h4><p>Scalyo (Stratimaagency) est responsable du traitement de vos données personnelles. Contact DPO : <a href='mailto:contact@scalyo.app'>contact@scalyo.app</a></p><h4>2. Données collectées</h4><ul><li>Identification : nom, email professionnel</li><li>Utilisation : actions sur la plateforme, logs de connexion</li><li>Données métier : comptes clients, KPIs (saisies par vous)</li><li>Facturation : traitée exclusivement par Stripe</li></ul><h4>3. Base légale (RGPD Art. 6)</h4><p>Exécution du contrat pour les données de service. Consentement pour les emails marketing. Obligation légale pour la facturation.</p><h4>4. Conservation</h4><p>Données conservées pendant la durée de l'abonnement + 3 ans après résiliation. Données de facturation conservées 10 ans.</p><h4>5. Hébergement & sécurité</h4><p>Supabase — région Europe (Irlande, conforme RGPD). Chiffrement AES-256, TLS 1.3. Cloudflare CDN.</p><h4>6. Vos droits</h4><ul><li>✓ Accès à vos données</li><li>✓ Rectification</li><li>✓ Effacement (droit à l'oubli)</li><li>✓ Portabilité (export JSON/CSV)</li><li>✓ Opposition au traitement</li></ul><p>Exercer vos droits : <a href='mailto:contact@scalyo.app'>contact@scalyo.app</a> — Réponse sous 30 jours. Réclamation possible auprès de la CNIL.</p><h4>7. Cookies</h4><p>Cookies fonctionnels uniquement (session, langue). Aucun cookie publicitaire.</p>`,
    en: `<p><strong>Last updated: January 2025</strong></p><h4>1. Data Controller</h4><p>Scalyo (Stratimaagency) is the controller of your personal data. DPO contact: <a href='mailto:contact@scalyo.app'>contact@scalyo.app</a></p><h4>2. Data Collected</h4><ul><li>Identification: name, professional email</li><li>Usage: platform actions, login logs</li><li>Business data: client accounts, KPIs (entered by you)</li><li>Billing: processed exclusively by Stripe</li></ul><h4>3. Legal Basis (GDPR Art. 6)</h4><p>Contract performance for service data. Consent for marketing emails. Legal obligation for billing.</p><h4>4. Retention</h4><p>Data retained for subscription duration + 3 years after termination. Billing data retained 10 years.</p><h4>5. Hosting & Security</h4><p>Supabase — Europe region (Ireland, GDPR compliant). AES-256 encryption, TLS 1.3. Cloudflare CDN.</p><h4>6. Your Rights</h4><ul><li>✓ Access to your data</li><li>✓ Rectification</li><li>✓ Erasure (right to be forgotten)</li><li>✓ Portability (JSON/CSV export)</li><li>✓ Right to object</li></ul><p>Exercise your rights: <a href='mailto:contact@scalyo.app'>contact@scalyo.app</a> — Response within 30 days.</p><h4>7. Cookies</h4><p>Functional cookies only (session, language). No advertising cookies.</p>`,
    kr: `<p><strong>최종 업데이트: 2025년 1월</strong></p><h4>1. 데이터 처리 책임자</h4><p>Scalyo(Stratimaagency)는 귀하의 개인정보 처리 책임자입니다. DPO 연락처: <a href='mailto:contact@scalyo.app'>contact@scalyo.app</a></p><h4>2. 수집 데이터</h4><ul><li>식별 정보: 이름, 직장 이메일</li><li>이용 정보: 플랫폼 활동, 로그인 기록</li><li>비즈니스 데이터: 고객사, KPI (사용자 입력)</li><li>결제 정보: Stripe에서 단독 처리</li></ul><h4>3. 법적 근거 (GDPR 제6조)</h4><p>서비스 데이터: 계약 이행. 마케팅 이메일: 동의. 결제 데이터: 법적 의무.</p><h4>4. 보존 기간</h4><p>구독 기간 + 해지 후 3년. 결제 데이터는 10년 보존.</p><h4>5. 호스팅 및 보안</h4><p>Supabase — 유럽 리전 (아일랜드, GDPR 준수). AES-256 암호화, TLS 1.3. Cloudflare CDN.</p><h4>6. 귀하의 권리</h4><ul><li>✓ 개인정보 열람권</li><li>✓ 정정권</li><li>✓ 삭제권 (잊힐 권리)</li><li>✓ 이동권 (JSON/CSV 내보내기)</li><li>✓ 처리 반대권</li></ul><p>권리 행사: <a href='mailto:contact@scalyo.app'>contact@scalyo.app</a> — 30일 이내 답변.</p><h4>7. 쿠키</h4><p>기능적 쿠키만 사용 (세션, 언어). 광고 쿠키 없음.</p>`,
  }
  return content[lang] || content.fr
}

function scrollTo(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
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