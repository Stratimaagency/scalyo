<template>
  <div class="legal-page">
    <div class="legal-container">
      <h1 class="legal-title">{{ content.title }}</h1>

      <div class="legal-tabs">
        <button class="legal-tab" :class="{ active: tab === 'cgu' }" @click="tab = 'cgu'">{{ content.tosTab }}</button>
        <button class="legal-tab" :class="{ active: tab === 'privacy' }" @click="tab = 'privacy'">{{ content.privacyTab }}</button>
      </div>

      <div class="legal-content" v-html="tab === 'cgu' ? content.tos : content.privacy"></div>

      <div class="legal-back">
        <router-link to="/">{{ content.backHome }}</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { usePreferencesStore } from '../stores/preferences'

const prefsStore = usePreferencesStore()
const tab = ref('cgu')

const LEGAL = {
  fr: {
    title: 'Mentions légales',
    tosTab: "Conditions d'utilisation",
    privacyTab: 'Politique de confidentialité',
    backHome: "Retour à l'accueil",
    tos: `<p class="legal-update">Dernière mise à jour : 27 mars 2026</p>
<h2>1. Objet</h2><p>Les présentes Conditions Générales d'Utilisation (CGU) régissent l'accès et l'utilisation de la plateforme Scalyo, éditée par Stratima Agency. En utilisant Scalyo, vous acceptez ces conditions dans leur intégralité.</p>
<h2>2. Inscription</h2><p>L'accès à Scalyo nécessite la création d'un compte. Vous vous engagez à fournir des informations exactes et à jour. Vous êtes responsable de la confidentialité de vos identifiants de connexion.</p>
<h2>3. Services</h2><p>Scalyo est une plateforme SaaS de gestion et de suivi de la performance pour les équipes Customer Success. Les fonctionnalités proposées incluent le suivi de KPIs, la gestion de portefeuille, la planification, le coaching et l'envoi d'emails. Les services peuvent évoluer sans préavis.</p>
<h2>4. Données personnelles</h2><p>La collecte et le traitement de vos données personnelles sont détaillés dans notre Politique de confidentialité. En utilisant Scalyo, vous consentez à ce traitement conformément au RGPD.</p>
<h2>5. Responsabilité</h2><p>Scalyo est fourni « en l'état ». Stratima Agency met tout en œuvre pour assurer la disponibilité et la fiabilité de la plateforme, mais ne saurait être tenue responsable en cas d'interruption temporaire, de perte de données ou de dommages indirects liés à l'utilisation du service.</p>
<h2>6. Propriété intellectuelle</h2><p>L'ensemble du contenu de Scalyo (code, design, textes, marques) est la propriété de Stratima Agency. Toute reproduction ou utilisation non autorisée est interdite.</p>
<h2>7. Résiliation</h2><p>Vous pouvez supprimer votre compte à tout moment depuis les paramètres. Stratima Agency se réserve le droit de suspendre ou supprimer un compte en cas de violation des présentes CGU, sans préavis ni indemnité.</p>
<h2>8. Droit applicable</h2><p>Les présentes CGU sont régies par le droit français. En cas de litige, les parties s'engagent à rechercher une solution amiable avant toute action judiciaire.</p>
<h2>9. Contact</h2><p>Pour toute question : <a href="mailto:contact@scalyo.app">contact@scalyo.app</a></p>`,
    privacy: `<p class="legal-update">Dernière mise à jour : 27 mars 2026</p>
<h2>1. Responsable du traitement</h2><p>Stratima Agency, éditeur de Scalyo. Contact : <a href="mailto:contact@scalyo.app">contact@scalyo.app</a></p>
<h2>2. Données collectées</h2><ul><li><strong>Identification :</strong> nom, email professionnel</li><li><strong>Connexion :</strong> mot de passe (hashé), dates de connexion</li><li><strong>Usage :</strong> actions sur la plateforme, préférences, données de performance</li></ul>
<h2>3. Finalités</h2><ul><li>Gestion de votre compte et authentification</li><li>Fourniture et amélioration des services</li><li>Communication relative au service</li><li>Analyse anonymisée</li></ul>
<h2>4. Base légale</h2><p>Exécution du contrat et consentement pour les communications optionnelles.</p>
<h2>5. Conservation</h2><p>Données conservées pendant l'utilisation du compte. Suppression sous 30 jours après suppression du compte.</p>
<h2>6. Hébergement</h2><p>Cloudflare (Workers, Pages, D1) — données hébergées en Europe conformément au RGPD.</p>
<h2>7. Vos droits (RGPD)</h2><ul><li><strong>Accès :</strong> obtenir une copie de vos données</li><li><strong>Rectification :</strong> corriger vos données</li><li><strong>Effacement :</strong> demander la suppression</li><li><strong>Portabilité :</strong> recevoir vos données</li><li><strong>Opposition :</strong> vous opposer au traitement</li><li><strong>Limitation :</strong> restreindre le traitement</li></ul><p>Contact : <a href="mailto:contact@scalyo.app">contact@scalyo.app</a></p>
<h2>8. Cookies</h2><p>Uniquement des cookies techniques (authentification, préférences). Aucun cookie publicitaire ou de suivi tiers.</p>
<h2>9. Modifications</h2><p>Cette politique peut être mise à jour. Vous serez informé via la plateforme.</p>`,
  },
  en: {
    title: 'Legal Notice',
    tosTab: 'Terms of Service',
    privacyTab: 'Privacy Policy',
    backHome: 'Back to home',
    tos: `<p class="legal-update">Last updated: March 27, 2026</p>
<h2>1. Purpose</h2><p>These Terms of Service govern access to and use of the Scalyo platform, published by Stratima Agency. By using Scalyo, you accept these terms in their entirety.</p>
<h2>2. Registration</h2><p>Access to Scalyo requires creating an account. You agree to provide accurate and up-to-date information. You are responsible for the confidentiality of your login credentials.</p>
<h2>3. Services</h2><p>Scalyo is a SaaS platform for performance management and tracking for Customer Success teams. Features include KPI tracking, portfolio management, planning, coaching, and email sending. Services may change without notice.</p>
<h2>4. Personal Data</h2><p>The collection and processing of your personal data are detailed in our Privacy Policy. By using Scalyo, you consent to this processing in accordance with GDPR.</p>
<h2>5. Liability</h2><p>Scalyo is provided "as is." Stratima Agency makes every effort to ensure the platform's availability and reliability, but cannot be held liable for temporary interruptions, data loss, or indirect damages related to the use of the service.</p>
<h2>6. Intellectual Property</h2><p>All Scalyo content (code, design, text, trademarks) is the property of Stratima Agency. Any unauthorized reproduction or use is prohibited.</p>
<h2>7. Termination</h2><p>You can delete your account at any time from settings. Stratima Agency reserves the right to suspend or delete an account in case of violation of these Terms, without notice or compensation.</p>
<h2>8. Governing Law</h2><p>These Terms are governed by French law. In case of dispute, the parties agree to seek an amicable solution before any legal action.</p>
<h2>9. Contact</h2><p>For any questions: <a href="mailto:contact@scalyo.app">contact@scalyo.app</a></p>`,
    privacy: `<p class="legal-update">Last updated: March 27, 2026</p>
<h2>1. Data Controller</h2><p>Stratima Agency, publisher of Scalyo. Contact: <a href="mailto:contact@scalyo.app">contact@scalyo.app</a></p>
<h2>2. Data Collected</h2><ul><li><strong>Identification:</strong> name, professional email</li><li><strong>Login:</strong> password (hashed), login dates</li><li><strong>Usage:</strong> platform actions, preferences, performance data</li></ul>
<h2>3. Purpose</h2><ul><li>Account management and authentication</li><li>Service provision and improvement</li><li>Service-related communication</li><li>Anonymized analysis</li></ul>
<h2>4. Legal Basis</h2><p>Contract execution and consent for optional communications.</p>
<h2>5. Retention</h2><p>Data retained during account usage. Deleted within 30 days after account deletion.</p>
<h2>6. Hosting</h2><p>Cloudflare (Workers, Pages, D1) — data hosted in Europe in accordance with GDPR.</p>
<h2>7. Your Rights (GDPR)</h2><ul><li><strong>Access:</strong> obtain a copy of your data</li><li><strong>Rectification:</strong> correct your data</li><li><strong>Erasure:</strong> request deletion</li><li><strong>Portability:</strong> receive your data</li><li><strong>Objection:</strong> object to processing</li><li><strong>Restriction:</strong> restrict processing</li></ul><p>Contact: <a href="mailto:contact@scalyo.app">contact@scalyo.app</a></p>
<h2>8. Cookies</h2><p>Only technical cookies (authentication, preferences). No advertising or third-party tracking cookies.</p>
<h2>9. Changes</h2><p>This policy may be updated. You will be notified via the platform.</p>`,
  },
  kr: {
    title: '법적 고지',
    tosTab: '이용약관',
    privacyTab: '개인정보 처리방침',
    backHome: '홈으로 돌아가기',
    tos: `<p class="legal-update">최종 수정일: 2026년 3월 27일</p>
<h2>1. 목적</h2><p>본 이용약관은 Stratima Agency가 운영하는 Scalyo 플랫폼의 접근 및 사용에 관한 사항을 규정합니다. Scalyo를 사용함으로써 본 약관 전체에 동의하는 것으로 간주됩니다.</p>
<h2>2. 가입</h2><p>Scalyo 이용을 위해서는 계정 생성이 필요합니다. 정확하고 최신의 정보를 제공해야 하며, 로그인 정보의 기밀 유지에 대한 책임은 사용자에게 있습니다.</p>
<h2>3. 서비스</h2><p>Scalyo는 Customer Success 팀을 위한 성과 관리 및 추적 SaaS 플랫폼입니다. KPI 추적, 포트폴리오 관리, 플래닝, 코칭, 이메일 전송 등의 기능을 제공합니다. 서비스는 사전 고지 없이 변경될 수 있습니다.</p>
<h2>4. 개인정보</h2><p>개인정보 수집 및 처리에 대한 사항은 개인정보 처리방침에 상세히 명시되어 있습니다. Scalyo를 사용함으로써 GDPR에 따른 정보 처리에 동의합니다.</p>
<h2>5. 책임</h2><p>Scalyo는 "있는 그대로" 제공됩니다. Stratima Agency는 플랫폼의 가용성과 안정성을 보장하기 위해 최선을 다하지만, 일시적 중단, 데이터 손실 또는 서비스 사용과 관련된 간접적 손해에 대해 책임을 지지 않습니다.</p>
<h2>6. 지적재산권</h2><p>Scalyo의 모든 콘텐츠(코드, 디자인, 텍스트, 상표)는 Stratima Agency의 자산입니다. 무단 복제 또는 사용은 금지됩니다.</p>
<h2>7. 해지</h2><p>설정에서 언제든지 계정을 삭제할 수 있습니다. Stratima Agency는 약관 위반 시 사전 고지나 보상 없이 계정을 정지하거나 삭제할 권리를 보유합니다.</p>
<h2>8. 준거법</h2><p>본 약관은 프랑스 법에 의해 규율됩니다. 분쟁 발생 시 법적 조치 전에 우호적인 해결을 모색합니다.</p>
<h2>9. 연락처</h2><p>문의사항: <a href="mailto:contact@scalyo.app">contact@scalyo.app</a></p>`,
    privacy: `<p class="legal-update">최종 수정일: 2026년 3월 27일</p>
<h2>1. 개인정보 관리자</h2><p>Scalyo를 운영하는 Stratima Agency. 연락처: <a href="mailto:contact@scalyo.app">contact@scalyo.app</a></p>
<h2>2. 수집 정보</h2><ul><li><strong>식별 정보:</strong> 이름, 업무용 이메일</li><li><strong>접속 정보:</strong> 비밀번호(해시 처리), 접속 일시</li><li><strong>이용 정보:</strong> 플랫폼 활동, 환경설정, 성과 데이터</li></ul>
<h2>3. 처리 목적</h2><ul><li>계정 관리 및 인증</li><li>서비스 제공 및 개선</li><li>서비스 관련 알림</li><li>익명화된 분석</li></ul>
<h2>4. 법적 근거</h2><p>계약 이행 및 선택적 알림에 대한 동의.</p>
<h2>5. 보관 기간</h2><p>계정 사용 기간 동안 데이터가 보관됩니다. 계정 삭제 후 30일 이내에 삭제됩니다.</p>
<h2>6. 호스팅</h2><p>Cloudflare (Workers, Pages, D1) — GDPR에 따라 유럽에서 데이터 호스팅.</p>
<h2>7. 이용자 권리 (GDPR)</h2><ul><li><strong>접근권:</strong> 개인정보 사본 요청</li><li><strong>정정권:</strong> 부정확한 정보 수정</li><li><strong>삭제권:</strong> 정보 삭제 요청</li><li><strong>이동권:</strong> 데이터 수령</li><li><strong>반대권:</strong> 처리 반대</li><li><strong>제한권:</strong> 처리 제한</li></ul><p>연락처: <a href="mailto:contact@scalyo.app">contact@scalyo.app</a></p>
<h2>8. 쿠키</h2><p>기술적 쿠키(인증, 환경설정)만 사용합니다. 광고 또는 제3자 추적 쿠키는 사용하지 않습니다.</p>
<h2>9. 변경사항</h2><p>본 방침은 업데이트될 수 있습니다. 플랫폼을 통해 안내드립니다.</p>`,
  },
}

const content = computed(() => LEGAL[prefsStore.lang] || LEGAL.fr)
</script>

<style scoped>
.legal-page {
  min-height: 100vh;
  background: var(--surface);
  color: var(--text);
  padding: 48px 20px;
  display: flex;
  justify-content: center;
}

.legal-container {
  max-width: 720px;
  width: 100%;
}

.legal-title {
  font-size: 24px;
  font-weight: 800;
  margin-bottom: 24px;
}

.legal-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 32px;
  border-bottom: 1px solid var(--border);
  padding-bottom: 12px;
}

.legal-tab {
  padding: 8px 16px;
  border-radius: 8px;
  border: 1px solid var(--border);
  background: transparent;
  color: var(--muted);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
}

.legal-tab.active {
  background: var(--teal);
  color: #fff;
  border-color: var(--teal);
}

.legal-content h2 {
  font-size: 16px;
  font-weight: 700;
  margin: 24px 0 8px;
  color: var(--text);
}

.legal-content p {
  font-size: 14px;
  line-height: 1.7;
  color: var(--muted);
  margin-bottom: 12px;
}

.legal-content ul {
  padding-left: 20px;
  margin-bottom: 12px;
}

.legal-content li {
  font-size: 14px;
  line-height: 1.7;
  color: var(--muted);
  margin-bottom: 4px;
}

.legal-content a {
  color: var(--teal);
  text-decoration: none;
}

.legal-content a:hover {
  text-decoration: underline;
}

.legal-update {
  font-size: 12px !important;
  color: var(--muted) !important;
  font-style: italic;
  margin-bottom: 20px !important;
}

.legal-back {
  margin-top: 40px;
  padding-top: 20px;
  border-top: 1px solid var(--border);
}

.legal-back a {
  color: var(--teal);
  font-size: 13px;
  text-decoration: none;
  font-weight: 600;
}

.legal-back a:hover {
  text-decoration: underline;
}
</style>
