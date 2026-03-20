<template>
  <div class="fade-in" style="display: flex; height: 100%; overflow: hidden">
    <!-- Sidebar -->
    <div style="width: 260px; border-right: 1px solid var(--border); overflow: auto; padding: 20px 14px; flex-shrink: 0">
      <h2 style="font-size: 18px; font-weight: 900; margin-bottom: 14px">&#9993;&#65039; Email Studio</h2>

      <!-- Category filter pills -->
      <div style="display: flex; flex-wrap: wrap; gap: 5px; margin-bottom: 14px">
        <button
          v-for="cat in categories"
          :key="cat"
          class="btn-base"
          :style="{
            fontSize: '11px',
            padding: '4px 11px',
            borderRadius: '20px',
            background: activeCat === cat ? 'var(--teal-bg)' : 'var(--surface)',
            border: '1px solid ' + (activeCat === cat ? 'var(--teal-border)' : 'var(--border)'),
            color: activeCat === cat ? 'var(--teal)' : 'var(--muted)',
            cursor: 'pointer'
          }"
          @click="activeCat = cat"
        >
          {{ cat === 'all' ? allLabel : cat }}
        </button>
      </div>

      <!-- Template list -->
      <div
        v-for="tpl in filteredTemplates"
        :key="tpl.id"
        class="row-item"
        :style="{
          padding: '11px 12px',
          borderRadius: '11px',
          marginBottom: '5px',
          cursor: 'pointer',
          background: selected?.id === tpl.id ? 'var(--teal-bg)' : undefined,
          border: '1px solid ' + (selected?.id === tpl.id ? 'var(--teal-border)' : 'transparent')
        }"
        @click="selectTemplate(tpl)"
      >
        <div style="font-size: 10px; color: var(--muted); font-weight: 700; text-transform: uppercase; letter-spacing: .06em; margin-bottom: 3px">
          {{ tpl.cat }}
        </div>
        <div :style="{ fontSize: '13px', fontWeight: 700, color: selected?.id === tpl.id ? 'var(--teal)' : 'var(--text)' }">
          {{ tpl.title }}
        </div>
      </div>
    </div>

    <!-- Main content -->
    <div style="flex: 1; padding: 24px 28px; overflow: auto">
      <template v-if="selected">
        <!-- Header -->
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px">
          <div>
            <h3 style="font-size: 18px; font-weight: 900; margin-bottom: 4px">{{ selected.title }}</h3>
            <span style="display: inline-block; font-size: 11px; font-weight: 700; color: var(--teal); background: var(--teal-bg); border: 1px solid var(--teal-border); padding: 2px 10px; border-radius: 20px">{{ selected.cat }}</span>
          </div>
          <button
            class="btn-base"
            :style="{
              padding: '10px 22px',
              borderRadius: '12px',
              fontSize: '13px',
              cursor: 'pointer',
              background: copied ? 'var(--green-bg)' : 'var(--teal-bg)',
              border: '1px solid ' + (copied ? 'var(--green-border)' : 'var(--teal-border)'),
              color: copied ? 'var(--green)' : 'var(--teal)'
            }"
            @click="copyTemplate"
          >
            {{ copied ? copiedLabel : copyLabel }}
          </button>
        </div>

        <!-- Subject -->
        <div style="margin-bottom: 14px">
          <label style="font-size: 11px; font-weight: 700; color: var(--muted); display: block; margin-bottom: 6px; text-transform: uppercase; letter-spacing: .08em">
            {{ subjectLabel }}
          </label>
          <input
            v-model="editSubject"
            :style="{
              width: '100%',
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: '12px',
              padding: '11px 14px',
              color: 'var(--text)',
              fontSize: '14px',
              boxSizing: 'border-box'
            }"
          />
        </div>

        <!-- Body -->
        <div>
          <label style="font-size: 11px; font-weight: 700; color: var(--muted); display: block; margin-bottom: 6px; text-transform: uppercase; letter-spacing: .08em">
            {{ bodyLabel }}
          </label>
          <textarea
            v-model="editBody"
            rows="18"
            :style="{
              width: '100%',
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: '12px',
              padding: '14px',
              color: 'var(--text)',
              fontSize: '13px',
              fontFamily: '\'JetBrains Mono\', monospace',
              resize: 'vertical',
              lineHeight: 1.7,
              boxSizing: 'border-box'
            }"
          ></textarea>
        </div>

        <!-- Placeholder hint -->
        <div style="margin-top: 14px; padding: 12px 16px; background: var(--amber-bg); border: 1px solid var(--amber-border); border-radius: 12px; font-size: 12px; color: var(--amber)">
          {{ placeholderHint }}
        </div>
      </template>

      <!-- Empty state -->
      <div v-else style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; opacity: .6">
        <div style="font-size: 48px; margin-bottom: 12px">&#9993;&#65039;</div>
        <div style="font-size: 16px; font-weight: 700; margin-bottom: 4px">{{ emptyTitle }}</div>
        <div style="font-size: 13px; color: var(--muted)">{{ emptyDesc }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useI18n } from '../i18n'

const { t, lang } = useI18n()

// ── Templates FR ──────────────────────────────────
const TEMPLATES_FR = [
  {
    id: 'onboarding_j1',
    cat: 'Onboarding',
    title: 'Bienvenue & premiers pas',
    subject: 'Bienvenue chez [Entreprise] — votre guide de démarrage',
    body: `Bonjour [Prénom],

Bienvenue chez [Entreprise] ! Je suis [Votre prénom], votre Customer Success Manager dédié.

Je suis là pour vous accompagner et m'assurer que vous tirez le maximum de valeur de notre solution.

Pour commencer dans les meilleures conditions, voici vos 3 premières actions :

→ Étape 1 : Complétez votre profil et invitez votre équipe
→ Étape 2 : Planifiez votre session d'onboarding (lien ci-dessous)
→ Étape 3 : Rejoignez notre communauté d'utilisateurs

📅 Je vous propose un appel de démarrage de 30 min cette semaine.
Choisissez le créneau qui vous convient : [Lien Calendly]

En attendant, n'hésitez pas à me contacter pour toute question.

Bien cordialement,
[Votre prénom]
Customer Success Manager`
  },
  {
    id: 'qbr_invite',
    cat: 'QBR',
    title: 'Invitation QBR trimestriel',
    subject: 'QBR Q[N] — Revue trimestrielle de votre succès',
    body: `Bonjour [Prénom],

Le prochain trimestre approche et c'est le bon moment pour faire un point stratégique sur vos résultats.

Je vous propose notre Revue Trimestrielle (QBR) pour :

📊 Analyser vos KPIs et les comparer à vos objectifs
🎯 Valider les priorités du prochain trimestre
💡 Identifier de nouvelles opportunités de valeur
🔮 Aligner votre roadmap avec nos évolutions produit

Durée : 45 minutes · Format : Visio ou présentiel selon votre préférence

📅 Créneaux disponibles : [Semaine du XX au XX]
Réservez directement : [Lien Calendly]

Ce rendez-vous est stratégique pour maximiser votre ROI. Je prépare un rapport personnalisé en amont.

À très bientôt,
[Votre prénom]`
  },
  {
    id: 'health_check',
    cat: 'Suivi',
    title: 'Point de santé mensuel',
    subject: "📊 Votre tableau de bord [Mois] — points d'attention",
    body: `Bonjour [Prénom],

Voici votre récapitulatif mensuel pour [Mois].

📈 Vos indicateurs clés :
• Taux d'adoption : [XX]% (objectif : [YY]%)
• Utilisateurs actifs : [N] sur [Total]
• Tickets résolus : [N] · Temps moyen : [X]h

⚡ Points d'attention ce mois :
→ [Point 1]
→ [Point 2]

✅ Succès à célébrer :
→ [Réalisation]

💡 Ma recommandation pour le mois prochain :
[Conseil personnalisé]

Avez-vous des questions ou des besoins particuliers ? Je suis disponible pour un appel rapide.

Bonne lecture,
[Votre prénom]`
  },
  {
    id: 'churn_alert',
    cat: 'Risque',
    title: 'Relance compte à risque',
    subject: '📞 Je souhaite prendre de vos nouvelles — [Entreprise]',
    body: `Bonjour [Prénom],

J'ai remarqué que l'utilisation de la plateforme a diminué ces dernières semaines. En tant que votre CSM, il est important pour moi de comprendre si vous rencontrez des difficultés.

Mon objectif est simple : m'assurer que vous obtenez la valeur attendue.

Quelques questions rapides :
• Rencontrez-vous des obstacles techniques ou d'usage ?
• Vos besoins ont-ils évolué depuis notre dernier échange ?
• Y a-t-il des fonctionnalités que vous n'utilisez pas encore et qui pourraient vous aider ?

Je vous propose un appel de 20 minutes cette semaine pour faire le point.
Choisissez un créneau : [Lien]

Votre succès est ma priorité.

[Votre prénom]`
  },
  {
    id: 'renewal',
    cat: 'Renouvellement',
    title: 'Préparation renouvellement',
    subject: 'Votre abonnement — renouvellement dans [N] jours',
    body: `Bonjour [Prénom],

Votre abonnement arrive à renouvellement le [Date]. Je souhaitais vous contacter en amont pour préparer cette étape ensemble.

Cette année avec [Produit], voici ce que vous avez accompli :

🏆 Résultats clés :
• [Métrique 1]
• [Métrique 2]
• [ROI estimé]

💼 Ce que nous avons prévu pour la prochaine période :
• [Nouveauté 1]
• [Nouveauté 2]

Je souhaite m'assurer que les conditions de renouvellement correspondent à vos besoins actuels. Souhaitez-vous en discuter lors d'un appel rapide ?

📅 Réservez 30 minutes : [Lien Calendly]

Bien à vous,
[Votre prénom]`
  },
  {
    id: 'expansion',
    cat: 'Expansion',
    title: "Opportunité d'expansion",
    subject: '💡 Opportunité pour aller encore plus loin',
    body: `Bonjour [Prénom],

Au vu de votre utilisation et des résultats que vous obtenez avec [Produit], j'ai identifié une opportunité qui pourrait vous apporter encore plus de valeur.

[Description de l'opportunité d'expansion]

Pourquoi maintenant ?
• Votre équipe est mature sur les fonctionnalités actuelles
• Cette évolution correspond à votre prochain objectif [Objectif]
• Nous avons des clients similaires qui ont obtenu [Résultat]

Cette expansion représente un investissement de [Montant]/mois, pour un ROI estimé à [ROI].

Seriez-vous disponible pour en discuter ?
📅 [Lien Calendly]

[Votre prénom]`
  }
]

// ── Templates EN ──────────────────────────────────
const TEMPLATES_EN = [
  {
    id: 'onboarding_j1',
    cat: 'Onboarding',
    title: 'Welcome & first steps',
    subject: 'Welcome to [Company] — your getting started guide',
    body: `Hi [First Name],

Welcome to [Company]! I'm [Your Name], your dedicated Customer Success Manager.

I'm here to make sure you get the maximum value from our solution, as quickly as possible.

Here are your 3 first steps to get started on the right foot:

→ Step 1: Complete your profile and invite your team
→ Step 2: Schedule your onboarding session (link below)
→ Step 3: Join our user community

📅 I'd love to connect for a 30-min kickoff call this week.
Pick a time that works for you: [Calendly Link]

In the meantime, feel free to reply to this email with any questions.

Best,
[Your Name]
Customer Success Manager`
  },
  {
    id: 'qbr_invite',
    cat: 'QBR',
    title: 'Quarterly Business Review invitation',
    subject: 'QBR Q[N] — Your quarterly success review',
    body: `Hi [First Name],

The new quarter is approaching — it's the perfect time for a strategic check-in on your results.

I'd like to schedule our Quarterly Business Review (QBR) to:

📊 Review your KPIs against your goals
🎯 Align priorities for the next quarter
💡 Identify new value opportunities
🔮 Align your roadmap with our product updates

Duration: 45 minutes · Format: Video or in-person, your preference

📅 Available slots: [Week of XX to XX]
Book directly: [Calendly Link]

This meeting is strategic for maximizing your ROI. I'll prepare a personalized report in advance.

See you soon,
[Your Name]`
  },
  {
    id: 'health_check',
    cat: 'Follow-up',
    title: 'Monthly health check',
    subject: '📊 Your [Month] dashboard — key highlights',
    body: `Hi [First Name],

Here's your monthly summary for [Month].

📈 Key metrics:
• Adoption rate: [XX]% (target: [YY]%)
• Active users: [N] out of [Total]
• Support tickets resolved: [N] · Avg. time: [X]h

⚡ This month's focus points:
→ [Point 1]
→ [Point 2]

✅ Wins to celebrate:
→ [Achievement]

💡 My recommendation for next month:
[Personalized advice]

Any questions or specific needs? I'm available for a quick call.

Best,
[Your Name]`
  },
  {
    id: 'churn_alert',
    cat: 'Risk',
    title: 'At-risk account re-engagement',
    subject: '📞 Checking in — [Company]',
    body: `Hi [First Name],

I noticed that platform usage has decreased over the past few weeks. As your CSM, I want to make sure you're getting the value you expected.

My goal is simple: ensure you're achieving the outcomes we planned together.

A few quick questions:
• Are you running into any technical or usage challenges?
• Have your needs changed since we last spoke?
• Are there features you haven't explored yet that could help?

I'd love to connect for a 20-minute call this week to catch up.
Pick a slot: [Link]

Your success is my priority.

[Your Name]`
  },
  {
    id: 'renewal',
    cat: 'Renewal',
    title: 'Renewal preparation',
    subject: 'Your subscription — renewal in [N] days',
    body: `Hi [First Name],

Your subscription renews on [Date]. I wanted to reach out ahead of time so we can prepare this next step together.

Here's what you've accomplished with [Product] this year:

🏆 Key results:
• [Metric 1]
• [Metric 2]
• [Estimated ROI]

💼 What's coming in the next period:
• [New feature 1]
• [New feature 2]

I want to make sure the renewal terms reflect your current needs. Would you like to discuss this on a quick call?

📅 Book 30 minutes: [Calendly Link]

Best,
[Your Name]`
  },
  {
    id: 'expansion',
    cat: 'Expansion',
    title: 'Expansion opportunity',
    subject: '💡 An opportunity to go even further',
    body: `Hi [First Name],

Looking at your usage and the results you're achieving with [Product], I've identified an opportunity that could create even more value for your team.

[Description of the expansion opportunity]

Why now?
• Your team is fully up to speed on current features
• This upgrade aligns with your next milestone: [Goal]
• Similar clients have achieved [Result]

This expansion represents an investment of [Amount]/month, with an estimated ROI of [ROI].

Would you be open to a conversation?
📅 [Calendly Link]

[Your Name]`
  }
]

// ── Templates KR ──────────────────────────────────
const TEMPLATES_KR = [
  {
    id: 'onboarding_j1',
    cat: '온보딩',
    title: '환영 & 첫 걸음',
    subject: '환영합니다, [이름]님 — 시작 가이드',
    body: `안녕하세요 [이름]님,

[회사]에 오신 것을 환영합니다! 저는 [담당자 이름]입니다, 전담 Customer Success Manager입니다.

저는 귀하께서 우리 솔루션으로 최대한의 가치를 최대한 빠르게 얻을 수 있도록 돕기 위해 여기 있습니다.

올바른 시작을 위한 첫 3가지 단계:

→ 1단계: 프로필을 완성하고 팀원을 초대하세요
→ 2단계: 온보딩 세션을 예약하세요 (아래 링크)
→ 3단계: 사용자 커뮤니티에 참여하세요

📅 이번 주 30분 킥오프 콜을 원합니다.
편리한 시간을 선택해 주세요: [캘린들리 링크]

궁금한 점이 있으시면 언제든 연락해 주세요.

감사합니다,
[담당자 이름]
Customer Success Manager`
  },
  {
    id: 'qbr_invite',
    cat: 'QBR',
    title: '분기 비즈니스 리뷰 초대',
    subject: 'QBR Q[N] — 분기 성과 리뷰',
    body: `안녕하세요 [이름]님,

새 분기가 다가오고 있습니다 — 결과에 대한 전략적 체크인을 할 좋은 시간입니다.

분기별 비즈니스 리뷰(QBR)를 제안드립니다:

📊 목표 대비 KPI 리뷰
🎯 다음 분기 우선순위 정렬
💡 새로운 가치 기회 파악
🔮 제품 업데이트와 로드맵 정렬

소요 시간: 45분 · 형식: 화상 또는 대면 (선택)

📅 가능한 일정: [XX~XX 주]
직접 예약: [캘린들리 링크]

이 미팅은 ROI를 극대화하는 데 전략적입니다. 개인화된 보고서를 미리 준비하겠습니다.

곧 뵙겠습니다,
[담당자 이름]`
  },
  {
    id: 'health_check',
    cat: '팔로우업',
    title: '월간 헬스 체크',
    subject: '📊 [월]의 대시보드 — 주요 내용',
    body: `안녕하세요 [이름]님,

[월]의 월간 요약입니다.

📈 핵심 지표:
• 도입률: [XX]% (목표: [YY]%)
• 활성 사용자: [총]명 중 [N]명
• 해결된 지원 티켓: [N]건 · 평균 시간: [X]시간

⚡ 이번 달 주의 사항:
→ [포인트 1]
→ [포인트 2]

✅ 축하할 성과:
→ [성과]

💡 다음 달 추천사항:
[개인화 조언]

질문이나 특정 요청이 있으시면 빠른 통화를 위해 언제든 연락 주세요.

감사합니다,
[담당자 이름]`
  },
  {
    id: 'churn_alert',
    cat: '위험',
    title: '위험 계정 재참여',
    subject: '📞 안부 확인 — [회사]',
    body: `안녕하세요 [이름]님,

지난 몇 주간 플랫폼 사용이 감소했음을 확인했습니다. 담당 CSM으로서 기대하신 가치를 얻고 계신지 확인하고 싶습니다.

제 목표는 간단합니다: 함께 계획한 성과를 달성하고 계신지 확인하는 것입니다.

빠른 몇 가지 질문:
• 기술적 또는 사용상 어려움이 있으신가요?
• 마지막 대화 이후 필요가 변경되었나요?
• 아직 탐색하지 않은 도움이 될 수 있는 기능이 있나요?

이번 주 20분 통화를 제안드립니다.
시간을 선택해 주세요: [링크]

귀하의 성공이 저의 최우선입니다.

[담당자 이름]`
  },
  {
    id: 'renewal',
    cat: '갱신',
    title: '갱신 준비',
    subject: '귀하의 구독 — [N]일 후 갱신',
    body: `안녕하세요 [이름]님,

구독이 [날짜]에 갱신됩니다. 이 다음 단계를 함께 준비하기 위해 미리 연락드립니다.

올해 [제품]으로 달성하신 것들:

🏆 주요 결과:
• [지표 1]
• [지표 2]
• [예상 ROI]

💼 다음 기간에 예정된 것들:
• [새 기능 1]
• [새 기능 2]

갱신 조건이 현재 필요에 맞는지 확인하고 싶습니다. 빠른 통화로 논의하시겠어요?

📅 30분 예약: [캘린들리 링크]

감사합니다,
[담당자 이름]`
  },
  {
    id: 'expansion',
    cat: '확장',
    title: '확장 기회',
    subject: '💡 더 나아갈 기회',
    body: `안녕하세요 [이름]님,

[제품]으로 귀하의 사용 현황과 달성하신 결과를 보면, 팀에 더 많은 가치를 창출할 수 있는 기회를 발견했습니다.

[확장 기회 설명]

왜 지금인가요?
• 팀이 현재 기능에 완전히 익숙해졌습니다
• 이 업그레이드는 다음 목표와 일치합니다: [목표]
• 유사한 고객들이 [결과]를 달성했습니다

이 확장은 월 [금액]의 투자이며, 예상 ROI는 [ROI]입니다.

대화를 나눌 의향이 있으신가요?
📅 [캘린들리 링크]

[담당자 이름]`
  }
]

// ── Reactive state ────────────────────────────────
const activeCat = ref('all')
const selected = ref(null)
const editSubject = ref('')
const editBody = ref('')
const copied = ref(false)

// ── Computed ──────────────────────────────────────
const templateSet = computed(() => {
  if (lang.value === 'en') return TEMPLATES_EN
  if (lang.value === 'kr') return TEMPLATES_KR
  return TEMPLATES_FR
})

const categories = computed(() => {
  const cats = [...new Set(templateSet.value.map(t => t.cat))]
  return ['all', ...cats]
})

const filteredTemplates = computed(() => {
  if (activeCat.value === 'all') return templateSet.value
  return templateSet.value.filter(t => t.cat === activeCat.value)
})

const allLabel = computed(() => {
  if (lang.value === 'en') return 'All'
  if (lang.value === 'kr') return '전체'
  return 'Tous'
})

const subjectLabel = computed(() => {
  if (lang.value === 'en') return 'Subject'
  if (lang.value === 'kr') return '제목'
  return 'Objet'
})

const bodyLabel = computed(() => {
  if (lang.value === 'en') return 'Message body'
  if (lang.value === 'kr') return '메시지 본문'
  return 'Corps du message'
})

const copyLabel = computed(() => {
  if (lang.value === 'en') return '📋 Copy email'
  if (lang.value === 'kr') return '📋 이메일 복사'
  return "📋 Copier l'email"
})

const copiedLabel = computed(() => {
  if (lang.value === 'en') return '✅ Copied!'
  if (lang.value === 'kr') return '✅ 복사됨!'
  return '✅ Copié !'
})

const placeholderHint = computed(() => {
  if (lang.value === 'en') return '💡 Replace the elements in brackets [XXX] with your specific data before sending.'
  if (lang.value === 'kr') return '💡 전송 전에 [XXX]를 실제 데이터로 교체하세요.'
  return "💡 Remplacez les éléments entre crochets [XXX] par vos données spécifiques avant d'envoyer."
})

const emptyTitle = computed(() => {
  if (lang.value === 'en') return 'Select a template'
  if (lang.value === 'kr') return '템플릿을 선택하세요'
  return 'Sélectionnez un template'
})

const emptyDesc = computed(() => {
  if (lang.value === 'en') return 'Choose an email template from the list on the left.'
  if (lang.value === 'kr') return '왼쪽 목록에서 이메일 템플릿을 선택하세요.'
  return "Choisissez un modèle d'email dans la liste à gauche."
})

// ── Methods ───────────────────────────────────────
function selectTemplate(tpl) {
  selected.value = tpl
  editSubject.value = tpl.subject
  editBody.value = tpl.body
  copied.value = false
}

function copyTemplate() {
  const prefix = lang.value === 'en' ? 'Subject' : lang.value === 'kr' ? '제목' : 'Objet'
  const text = `${prefix} : ${editSubject.value}\n\n${editBody.value}`
  navigator.clipboard.writeText(text).then(() => {
    copied.value = true
    setTimeout(() => { copied.value = false }, 2000)
  })
}

// ── Watch language changes ────────────────────────
watch(lang, () => {
  // Select first template of new language set
  const tpls = templateSet.value
  if (tpls.length > 0) {
    selectTemplate(tpls[0])
  } else {
    selected.value = null
  }
  activeCat.value = 'all'
}, { immediate: true })
</script>
