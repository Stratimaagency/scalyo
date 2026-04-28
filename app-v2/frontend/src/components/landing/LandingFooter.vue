<template>
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
            <a href="#">{{ t('footer_guides') }}</a>
            <a href="#">{{ t('footer_playbooks') }}</a>
            <a href="#">{{ t('footer_docs') }}</a>
          </div>
          <div class="footer-col">
            <h4>{{ t('footer_col_contact') }}</h4>
            <a href="mailto:contact@scalyo.app">contact@scalyo.app</a>
            <a href="#">{{ t('footer_support') }}</a>
            <a href="javascript:void(0)" @click="showLegal = true">{{ t('footer_rgpd') }}</a>
          </div>
        </div>
        <div class="footer-bottom">
          <span>{{ t('footer_copy') }}</span>
        </div>
      </div>
    </footer>

  </div>

<Transition name="modal-fade">
  <div v-if="showLegal" class="lm-overlay" @click.self="showLegal = false">
    <div class="lm-box">
      <div class="lm-head">
        <div class="lm-legal-tabs">
          <button class="lm-tab" :class="{ active: legalTab === 'rgpd' }" @click="legalTab = 'rgpd'">{{ t('footer_rgpd') }}</button>
          <button class="lm-tab" :class="{ active: legalTab === 'legal' }" @click="legalTab = 'legal'">{{ t('footer_legal') }}</button>
        </div>
        <button class="lm-close" @click="showLegal = false">×</button>
      </div>
      <div class="lm-body">
        <div v-if="legalTab === 'rgpd'" v-html="rgpdContent" />
        <div v-if="legalTab === 'legal'" v-html="legalContent" />
      </div>
    </div>
  </div>
</Transition>
</template>
</template>

<script setup>
import { ref, computed } from 'vue'
import ScalyoLogo from '@/components/ScalyoLogo.vue'
import { useLandingI18n } from '@/composables/useLandingI18n'
const { t, locale } = useLandingI18n()

const showLegal = ref(false)
const legalTab = ref('rgpd')

const rgpdContent = computed(() => {
  const lang = locale.value
  const content = {
    fr: `<p><strong>Dernière mise à jour : Janvier 2025</strong></p><h4>1. Responsable du traitement</h4><p>Scalyo (Stratimaagency) est responsable du traitement de vos données personnelles. Contact DPO : <a href='mailto:contact@scalyo.app'>contact@scalyo.app</a></p><h4>2. Données collectées</h4><ul><li>Identification : nom, email professionnel</li><li>Utilisation : actions sur la plateforme, logs de connexion</li><li>Données métier : comptes clients, KPIs (saisies par vous)</li><li>Facturation : traitée exclusivement par Stripe</li></ul><h4>3. Base légale (RGPD Art. 6)</h4><p>Exécution du contrat pour les données de service. Consentement pour les emails marketing. Obligation légale pour la facturation.</p><h4>4. Conservation</h4><p>Données conservées pendant la durée de l'abonnement + 3 ans après résiliation. Données de facturation conservées 10 ans.</p><h4>5. Hébergement & sécurité</h4><p>Supabase — région Europe (Irlande, conforme RGPD). Chiffrement AES-256, TLS 1.3. Cloudflare CDN.</p><h4>6. Vos droits</h4><ul><li>✓ Accès à vos données</li><li>✓ Rectification</li><li>✓ Effacement (droit à l'oubli)</li><li>✓ Portabilité (export JSON/CSV)</li><li>✓ Opposition au traitement</li></ul><p>Exercer vos droits : <a href='mailto:contact@scalyo.app'>contact@scalyo.app</a> — Réponse sous 30 jours. Réclamation possible auprès de la CNIL.</p><h4>7. Cookies</h4><p>Cookies fonctionnels uniquement (session, langue). Aucun cookie publicitaire.</p>`,
    en: `<p><strong>Last updated: January 2025</strong></p><h4>1. Data Controller</h4><p>Scalyo (Stratimaagency) is the controller of your personal data. DPO contact: <a href='mailto:contact@scalyo.app'>contact@scalyo.app</a></p><h4>2. Data Collected</h4><ul><li>Identification: name, professional email</li><li>Usage: platform actions, login logs</li><li>Business data: client accounts, KPIs (entered by you)</li><li>Billing: processed exclusively by Stripe</li></ul><h4>3. Legal Basis (GDPR Art. 6)</h4><p>Contract performance for service data. Consent for marketing emails. Legal obligation for billing.</p><h4>4. Retention</h4><p>Data retained for subscription duration + 3 years after termination. Billing data retained 10 years.</p><h4>5. Hosting & Security</h4><p>Supabase — Europe region (Ireland, GDPR compliant). AES-256 encryption, TLS 1.3. Cloudflare CDN.</p><h4>6. Your Rights</h4><ul><li>✓ Access to your data</li><li>✓ Rectification</li><li>✓ Erasure (right to be forgotten)</li><li>✓ Portability (JSON/CSV export)</li><li>✓ Right to object</li></ul><p>Exercise your rights: <a href='mailto:contact@scalyo.app'>contact@scalyo.app</a> — Response within 30 days.</p><h4>7. Cookies</h4><p>Functional cookies only (session, language). No advertising cookies.</p>`,
    kr: `<p><strong>최종 업데이트: 2025년 1월</strong></p><h4>1. 데이터 처리 책임자</h4><p>Scalyo(Stratimaagency)는 귀하의 개인정보 처리 책임자입니다. DPO 연락처: <a href='mailto:contact@scalyo.app'>contact@scalyo.app</a></p><h4>2. 수집 데이터</h4><ul><li>식별 정보: 이름, 직장 이메일</li><li>이용 정보: 플랫폼 활동, 로그인 기록</li><li>비즈니스 데이터: 고객사, KPI (사용자 입력)</li><li>결제 정보: Stripe에서 단독 처리</li></ul><h4>3. 법적 근거 (GDPR 제6조)</h4><p>서비스 데이터: 계약 이행. 마케팅 이메일: 동의. 결제 데이터: 법적 의무.</p><h4>4. 보존 기간</h4><p>구독 기간 + 해지 후 3년. 결제 데이터는 10년 보존.</p><h4>5. 호스팅 및 보안</h4><p>Supabase — 유럽 리전 (아일랜드, GDPR 준수). AES-256 암호화, TLS 1.3. Cloudflare CDN.</p><h4>6. 귀하의 권리</h4><ul><li>✓ 개인정보 열람권</li><li>✓ 정정권</li><li>✓ 삭제권 (잊힐 권리)</li><li>✓ 이동권 (JSON/CSV 내보내기)</li><li>✓ 처리 반대권</li></ul><p>권리 행사: <a href='mailto:contact@scalyo.app'>contact@scalyo.app</a> — 30일 이내 답변.</p><h4>7. 쿠키</h4><p>기능적 쿠키만 사용 (세션, 언어). 광고 쿠키 없음.</p>`,
  }
  return content[lang] || content.fr
})

const legalContent = computed(() => {
  const lang = locale.value
  const content = {
    fr: `<h4>Éditeur</h4><p><strong>Stratimaagency</strong> (marque commerciale Scalyo)<br>Email : <a href='mailto:contact@scalyo.app'>contact@scalyo.app</a><br>Site : scalyo.app</p><h4>Hébergement</h4><p>Cloudflare Pages — San Francisco, CA, USA<br>Supabase — infrastructure Europe (Irlande, conforme RGPD)<br>Stripe — paiements sécurisés, San Francisco, CA, USA</p><h4>Propriété intellectuelle</h4><p>Tous les éléments de Scalyo (marque, logo, code, contenus) sont la propriété exclusive de Stratimaagency. Toute reproduction sans autorisation écrite est interdite.</p><h4>Droit applicable</h4><p>Droit français. En cas de litige, compétence exclusive des tribunaux français.</p><h4>Contact</h4><p><a href='mailto:contact@scalyo.app'>contact@scalyo.app</a></p>`,
    en: `<h4>Publisher</h4><p><strong>Stratimaagency</strong> (trading as Scalyo)<br>Email: <a href='mailto:contact@scalyo.app'>contact@scalyo.app</a><br>Website: scalyo.app</p><h4>Hosting</h4><p>Cloudflare Pages — San Francisco, CA, USA<br>Supabase — Europe infrastructure (Ireland, GDPR compliant)<br>Stripe — secure payments, San Francisco, CA, USA</p><h4>Intellectual Property</h4><p>All Scalyo elements (brand, logo, code, content) are the exclusive property of Stratimaagency. Any reproduction without prior written authorization is prohibited.</p><h4>Applicable Law</h4><p>French law. In case of dispute, French courts have exclusive jurisdiction.</p><h4>Contact</h4><p><a href='mailto:contact@scalyo.app'>contact@scalyo.app</a></p>`,
    kr: `<h4>발행자</h4><p><strong>Stratimaagency</strong> (Scalyo 브랜드)<br>이메일: <a href='mailto:contact@scalyo.app'>contact@scalyo.app</a><br>웹사이트: scalyo.app</p><h4>호스팅</h4><p>Cloudflare Pages — San Francisco, CA, USA<br>Supabase — 유럽 인프라 (아일랜드, GDPR 준수)<br>Stripe — 안전한 결제, San Francisco, CA, USA</p><h4>지적 재산권</h4><p>Scalyo의 모든 요소(브랜드, 로고, 코드, 콘텐츠)는 Stratimaagency의 독점 자산입니다. 사전 서면 동의 없이 복제는 금지됩니다.</p><h4>준거법</h4><p>프랑스 법률 적용. 분쟁 시 프랑스 법원 단독 관할.</p><h4>문의</h4><p><a href='mailto:contact@scalyo.app'>contact@scalyo.app</a></p>`,
  }
  return content[lang] || content.fr
})
</script>

<style scoped>
/* ═══════════════════ FOOTER ═══════════════════ */
.footer-section { background: #080a14; padding: 60px 0 24px; }
.footer-grid { display: grid; grid-template-columns: 2fr 1fr 1fr 1fr; gap: 40px; padding-bottom: 36px; border-bottom: 1px solid var(--lp-border); }
.footer-logo { display: flex; align-items: center; gap: 8px; font-weight: 700; font-size: 1rem; margin-bottom: 14px; }
.footer-brand p { font-size: 0.82rem; color: var(--lp-muted); line-height: 1.6; margin-bottom: 8px; }
.footer-markets { font-size: 0.78rem; }
.footer-col h4 { font-size: 0.875rem; font-weight: 600; margin-bottom: 14px; }
.footer-col a { display: block; font-size: 0.82rem; color: var(--lp-muted); margin-bottom: 10px; transition: color 0.2s; }
.footer-col a:hover { color: var(--lp-purple-light); }
.footer-bottom { padding-top: 20px; text-align: center; font-size: 0.75rem; color: rgba(255,255,255,0.3); }

</style>