<template>
  <div class="fade-in">
    <div class="mb-lg">
      <h3 style="font-weight: 800; margin-bottom: 4px">{{ t('tipsTitle') }}</h3>
      <p style="font-size: 13px; color: var(--muted)">{{ t('tipsDesc') }}</p>
    </div>

    <!-- Search -->
    <input v-model="search" :placeholder="t('searchTips')" class="field-input mb-md" style="max-width: 400px" />

    <!-- Role tabs -->
    <div class="tab-bar mb-lg">
      <button class="tab-item" :class="{ active: roleTab === 'manager' }" @click="roleTab = 'manager'">{{ t('managerTips') }}</button>
      <button class="tab-item" :class="{ active: roleTab === 'csm' }" @click="roleTab = 'csm'">{{ t('csmTips') }}</button>
    </div>

    <!-- Tips -->
    <div style="display: flex; flex-direction: column; gap: 8px">
      <div
        v-for="tip in filteredTips" :key="tip.id"
        class="card card-lift"
        style="padding: 16px 18px; cursor: pointer"
        @click="openTip = openTip === tip.id ? null : tip.id"
      >
        <div class="flex-between">
          <div style="display: flex; gap: 10px; align-items: center">
            <ScalyoIcon :name="tip.icon" :size="20" />
            <span style="font-weight: 700; font-size: 14px">{{ tip.title }}</span>
          </div>
          <span style="color: var(--muted); font-size: 16px; transition: transform .2s" :style="{ transform: openTip === tip.id ? 'rotate(180deg)' : '' }">▾</span>
        </div>
        <div v-if="openTip === tip.id" style="margin-top: 12px; font-size: 13px; line-height: 1.7; color: var(--muted); white-space: pre-wrap; border-top: 1px solid var(--border); padding-top: 12px">
          {{ tip.content }}
        </div>
      </div>
    </div>

    <EmptyState v-if="!filteredTips.length" icon="lightbulb" :title="t('noResults')" />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useI18n } from '../i18n'
import { usePreferencesStore } from '../stores/preferences'
import EmptyState from '../components/EmptyState.vue'
import ScalyoIcon from '../components/ScalyoIcon.vue'

const { t } = useI18n()
const prefs = usePreferencesStore()
const search = ref('')
const roleTab = ref('manager')
const openTip = ref(null)

const managerTips = computed(() => {
  const l = prefs.lang
  return [
    { id: 1, icon: 'target',
      title: l === 'kr' ? '효과적인 CS 1:1 미팅을 진행하는 방법' : l === 'en' ? 'How to run an effective CS 1-on-1' : 'Comment mener un 1-on-1 CS efficace ?',
      content: l === 'kr'
        ? "1. 최대 3개 항목으로 안건을 준비하세요\n2. 긍정적인 내용부터 시작하세요: 최근 성과, 성공 사례\n3. 열린 질문으로 장애 요인을 논의하세요\n4. 함께 다음 실행 항목을 정하세요\n5. 웰빙 체크로 마무리하세요\n\n적정 시간: 30분\n주기: 주니어는 매주, 시니어는 격주"
        : l === 'en'
        ? "1. Prepare an agenda with 3 items max\n2. Start with positives: recent wins and successes\n3. Address blockers with open-ended questions\n4. Define next actions together\n5. Close with a well-being check-in\n\nIdeal duration: 30 minutes\nFrequency: weekly for juniors, bi-weekly for seniors"
        : "1. Préparez un agenda avec 3 points maximum\n2. Commencez par le positif : succès récents, wins\n3. Abordez les points de blocage avec des questions ouvertes\n4. Définissez ensemble les prochaines actions\n5. Terminez par un point bien-être\n\nDurée idéale : 30 minutes\nFréquence : hebdomadaire pour les juniors, bi-mensuelle pour les seniors" },
    { id: 2, icon: 'chart-up',
      title: l === 'kr' ? '경영진에게 CS의 가치를 입증하는 방법' : l === 'en' ? 'How to demonstrate CS value to the C-suite' : 'Comment démontrer la valeur du CS au COMEX ?',
      content: l === 'kr'
        ? "제시할 지표:\n- 순수익 유지율 (NRR)\n- CS가 이탈률에 미친 영향 (도입 이후 -X%)\n- CS 기반 확장 매출\n- 가치 실현 시간 (단축)\n\n형식:\n- 월간 대시보드 (1페이지)\n- 분기별 비즈니스 리뷰 (최대 5슬라이드)\n- CS KPI를 항상 매출과 연결하세요"
        : l === 'en'
        ? "Metrics to present:\n- Net Revenue Retention (NRR)\n- CS impact on churn (-X% since implementation)\n- Expansion revenue driven by CS\n- Time to Value (reduction)\n\nFormat:\n- Monthly dashboard (1 page)\n- Quarterly business review (5 slides max)\n- Always tie CS KPIs back to revenue"
        : "Métriques à présenter :\n- Net Revenue Retention (NRR)\n- Impact du CS sur le churn (-X% depuis mise en place)\n- Expansion revenue driven by CS\n- Time to Value (réduction)\n\nFormat :\n- Dashboard mensuel (1 page)\n- QBR trimestriel (5 slides max)\n- Toujours lier les KPIs CS aux revenus" },
    { id: 3, icon: 'fire',
      title: l === 'kr' ? 'CSM의 번아웃을 예방하는 방법' : l === 'en' ? 'How to prevent CSM burnout' : 'Comment prévenir le burn-out de mes CSMs ?',
      content: l === 'kr'
        ? "경고 신호:\n- 점점 짧아지는 응답\n- 응답 시간 증가\n- 상호작용 품질 저하\n- 결근 또는 프레젠티즘\n\n조치 사항:\n1. 주간 웰빙 체크인\n2. 어려운 계정 로테이션\n3. CSM당 계정 수 상한 설정\n4. 지속적인 교육 (운영 교육만이 아닌)\n5. 판단 없이 소통할 수 있는 공간 조성"
        : l === 'en'
        ? "Warning signs:\n- Increasingly short responses\n- Rising response times\n- Declining interaction quality\n- Absenteeism or presenteeism\n\nActions:\n1. Weekly well-being check-in\n2. Rotate difficult accounts\n3. Cap the number of accounts per CSM\n4. Ongoing training (not just operational)\n5. Create a safe space for open dialogue"
        : "Signaux d'alerte :\n- Réponses de plus en plus courtes\n- Temps de réponse en hausse\n- Baisse de qualité des interactions\n- Absentéisme ou présentéisme\n\nActions :\n1. Check-in bien-être hebdomadaire\n2. Rotation des comptes difficiles\n3. Plafond de comptes par CSM\n4. Formation continue (pas seulement opérationnelle)\n5. Créer un espace de parole sans jugement" },
    { id: 4, icon: 'people',
      title: l === 'kr' ? '신규 CSM 온보딩을 체계화하는 방법' : l === 'en' ? 'How to structure new CSM onboarding' : "Comment structurer l'intégration d'un nouveau CSM ?",
      content: l === 'kr'
        ? "1주차: 관찰\n- 3명의 다른 CSM 섀도잉\n- 문서 읽기\n- 팀 소개\n\n2-3주차: 동반 성장\n- 간단한 계정 3~5개 담당\n- 시니어 CSM과 버디 시스템\n- 일일 체크인\n\n4-8주차: 점진적 자율 운영\n- 포트폴리오 확대\n- 첫 번째 QBR (감독 하에)\n- 입사 30일 후 360도 피드백\n\n입사 90일: 종합 평가"
        : l === 'en'
        ? "Week 1: Observation\n- Shadow 3 different CSMs\n- Read through documentation\n- Meet the team\n\nWeeks 2-3: Guided ramp-up\n- Take on 3-5 straightforward accounts\n- Buddy system with a senior CSM\n- Daily check-in\n\nWeeks 4-8: Progressive autonomy\n- Growing portfolio\n- First supervised QBR\n- 360 feedback at Day 30\n\nDay 90: Full performance review"
        : "Semaine 1 : Observation\n- Shadow de 3 CSMs différents\n- Lecture de la documentation\n- Présentation de l'équipe\n\nSemaine 2-3 : Accompagnement\n- Prise en charge de 3-5 comptes simples\n- Buddy system avec un CSM senior\n- Daily check-in\n\nSemaine 4-8 : Autonomie progressive\n- Portefeuille croissant\n- Premier QBR supervisé\n- Feedback 360 à J+30\n\nJ+90 : Évaluation complète" },
    { id: 5, icon: 'trophy',
      title: l === 'kr' ? '균형 잡힌 CS 목표를 설정하는 방법' : l === 'en' ? 'How to set balanced CS objectives' : 'Comment fixer des objectifs CS équilibrés ?',
      content: l === 'kr'
        ? "목표 카테고리:\n\n1. 유지율 (40%)\n- GRR > 90%\n- NRR > 105%\n- 이탈률 < 5%\n\n2. 만족도 (30%)\n- NPS > 40\n- CSAT > 8/10\n- 평균 헬스 스코어 > 70\n\n3. 성장 (20%)\n- 확장 MRR\n- 업셀/크로스셀 파이프라인\n\n4. 운영 (10%)\n- 최초 가치 실현 시간\n- SLA 준수"
        : l === 'en'
        ? "Objective categories:\n\n1. Retention (40%)\n- GRR > 90%\n- NRR > 105%\n- Churn < 5%\n\n2. Satisfaction (30%)\n- NPS > 40\n- CSAT > 8/10\n- Average Health Score > 70\n\n3. Growth (20%)\n- Expansion MRR\n- Upsell/Cross-sell pipeline\n\n4. Operational (10%)\n- Time to first value\n- SLA compliance"
        : "Catégories d'objectifs :\n\n1. Rétention (40%)\n- GRR > 90%\n- NRR > 105%\n- Churn < 5%\n\n2. Satisfaction (30%)\n- NPS > 40\n- CSAT > 8/10\n- Health Score moyen > 70\n\n3. Développement (20%)\n- Expansion MRR\n- Upsell/Cross-sell pipeline\n\n4. Opérationnel (10%)\n- Time to first value\n- SLA respect" },
  ]
})

const csmTips = computed(() => {
  const l = prefs.lang
  return [
    { id: 10, icon: 'handshake',
      title: l === 'kr' ? '동료 CSM과의 갈등을 해결하는 방법' : l === 'en' ? 'How to handle conflict with a fellow CSM' : 'Comment gérer un conflit avec un collègue CSM ?',
      content: l === 'kr'
        ? "1. 근본 원인을 파악하세요 (증상이 아닌)\n2. 비공식 1:1 미팅을 요청하세요\n3. \"나\" 메시지를 사용하세요: \"~할 때 저는 ~하게 느낍니다\"\n4. 윈-윈 해결책을 찾으세요\n5. 필요하면 중재자를 참여시키세요\n\n피해야 할 것:\n- 이메일/슬랙으로 해결하려는 것\n- 팀 전체에 이야기하는 것\n- 소통 없이 쌓아두는 것"
        : l === 'en'
        ? "1. Identify the root cause (not the symptoms)\n2. Request an informal 1-on-1\n3. Use \"I\" statements: \"I feel... when...\"\n4. Look for a win-win solution\n5. Involve a mediator if needed\n\nAvoid:\n- Resolving it over email/Slack\n- Talking about it with the entire team\n- Bottling things up without communicating"
        : "1. Identifiez le problème de fond (pas les symptômes)\n2. Demandez un 1-on-1 informel\n3. Utilisez le format \"je\" : \"Je ressens... quand...\"\n4. Cherchez une solution win-win\n5. Si nécessaire, impliquez un médiateur\n\nÀ éviter :\n- Régler ça par email/Slack\n- En parler à toute l'équipe\n- Accumuler sans communiquer" },
    { id: 11, icon: 'dashboard',
      title: l === 'kr' ? '역량 개발을 가속화하는 방법' : l === 'en' ? 'How to accelerate your skill development' : 'Comment accélérer la montée en compétences ?',
      content: l === 'kr'
        ? "1. 부족한 역량을 파악하세요 (자기 평가)\n2. 팀 내 멘토를 찾으세요\n3. 어려운 상호작용을 모두 기록하세요\n4. 정기적으로 피드백을 요청하세요\n5. 매일 CS 관련 아티클 1개를 읽으세요\n\n추천 리소스:\n- Gainsight Pulse\n- CS Insider\n- SuccessHACKER\n- The Customer Success Cafe (팟캐스트)"
        : l === 'en'
        ? "1. Identify your gaps (self-assessment)\n2. Find a mentor on the team\n3. Document every difficult interaction\n4. Ask for regular feedback\n5. Read 1 CS article per day\n\nRecommended resources:\n- Gainsight Pulse\n- CS Insider\n- SuccessHACKER\n- The Customer Success Cafe (podcast)"
        : "1. Identifiez vos lacunes (auto-évaluation)\n2. Trouvez un mentor dans l'équipe\n3. Documentez chaque interaction difficile\n4. Demandez des feedbacks réguliers\n5. Lisez 1 article CS par jour\n\nRessources recommandées :\n- Gainsight Pulse\n- CS Insider\n- SuccessHACKER\n- The Customer Success Café (podcast)" },
    { id: 12, icon: 'lightbulb',
      title: l === 'kr' ? '공식적 권한 없이 영향력을 행사하는 방법' : l === 'en' ? 'How to influence without formal authority' : 'Comment influencer sans autorité formelle ?',
      content: l === 'kr'
        ? "1. 데이터로 신뢰를 구축하세요\n2. 특정 분야의 전문가가 되세요\n3. 인사이트를 선제적으로 공유하세요\n4. 요청하기 전에 먼저 도움을 주세요\n5. 문제가 아닌 해결책을 제안하세요\n\n기법: \"푸시\"가 아닌 \"풀\"\n- 결론으로 이끄는 질문을 하세요\n- 다른 사람이 아이디어를 자신의 것으로 받아들이게 하세요\n- 인내심을 갖고 꾸준히 하세요"
        : l === 'en'
        ? "1. Build credibility through data\n2. Become the go-to expert in a specific area\n3. Share your insights proactively\n4. Help others before asking for help\n5. Propose solutions, not problems\n\nTechnique: \"pull\" rather than \"push\"\n- Ask questions that lead to your conclusion\n- Let others take ownership of the idea\n- Be patient and consistent"
        : "1. Construisez votre crédibilité par les données\n2. Devenez expert d'un domaine spécifique\n3. Partagez vos insights proactivement\n4. Aidez les autres avant de demander\n5. Proposez des solutions, pas des problèmes\n\nTechnique : le \"pull\" plutôt que le \"push\"\n- Posez des questions qui mènent à votre conclusion\n- Laissez les autres s'approprier l'idée\n- Soyez patient et constant" },
    { id: 13, icon: 'brain',
      title: l === 'kr' ? '매니저에게 알리지 않고 업무 과부하를 관리하는 방법' : l === 'en' ? 'How to manage overload without escalating to your manager' : 'Comment gérer la surcharge sans alerter le manager ?',
      content: l === 'kr'
        ? "먼저: 매니저에게 알리는 것은 괜찮습니다! 그것이 매니저의 역할입니다.\n\n하지만 먼저 직접 시도해 보고 싶다면:\n1. 비즈니스 임팩트 기준으로 우선순위를 정하세요 (ARR x 리스크)\n2. 반복 업무를 자동화하세요\n3. 반복되는 이메일에 템플릿을 활용하세요\n4. 유사한 업무를 묶어서 처리하세요 (배치)\n5. 안건 없는 회의는 거절하세요\n\n2주 이상 지속되면 매니저와 소통하세요."
        : l === 'en'
        ? "First: it is OK to flag this to your manager! That is literally their job.\n\nBut if you want to try on your own first:\n1. Prioritize by business impact (ARR x risk)\n2. Automate repetitive tasks\n3. Use templates for recurring emails\n4. Batch similar tasks together\n5. Decline meetings without an agenda\n\nIf it persists for more than 2 weeks, loop in your manager."
        : "D'abord : il est OK d'alerter votre manager ! C'est leur rôle de vous aider.\n\nMais si vous voulez d'abord essayer :\n1. Priorisez par impact business (ARR × risque)\n2. Automatisez les tâches répétitives\n3. Utilisez des templates pour les emails récurrents\n4. Regroupez les tâches similaires (batch)\n5. Dites non aux réunions sans agenda\n\nSi ça persiste > 2 semaines, communiquez avec votre manager." },
    { id: 14, icon: 'star-glow',
      title: l === 'kr' ? '팀에서 레퍼런스가 되는 방법' : l === 'en' ? 'How to become a go-to person on your team' : "Comment devenir une référence dans l'équipe ?",
      content: l === 'kr'
        ? "1. 전문성: 2~3가지 주제를 완벽하게 숙달하세요\n2. 공유: 가이드와 템플릿을 만드세요\n3. 멘토링: 신입을 도와주세요\n4. 혁신: 프로세스 개선을 제안하세요\n5. 신뢰성: 꾸준한 품질을 유지하세요\n\n가시성:\n- 팀 미팅에서 발표하세요\n- 베스트 프랙티스를 문서화하세요\n- 부서 간 프로젝트에 참여하세요"
        : l === 'en'
        ? "1. Expertise: Master 2-3 topics thoroughly\n2. Sharing: Create guides and templates\n3. Mentoring: Help newcomers get up to speed\n4. Innovation: Propose process improvements\n5. Reliability: Be consistent in quality\n\nVisibility:\n- Present in team meetings\n- Document your best practices\n- Participate in cross-functional projects"
        : "1. Expertise : Maîtrisez parfaitement 2-3 sujets\n2. Partage : Créez des guides, des templates\n3. Mentorat : Aidez les nouveaux arrivants\n4. Innovation : Proposez des améliorations de process\n5. Fiabilité : Soyez constant dans la qualité\n\nVisibilité :\n- Présentez en réunion d'équipe\n- Documentez vos best practices\n- Participez aux projets transverses" },
  ]
})

const filteredTips = computed(() => {
  const list = roleTab.value === 'manager' ? managerTips.value : csmTips.value
  if (!search.value) return list
  const q = search.value.toLowerCase()
  return list.filter(t => t.title.toLowerCase().includes(q) || t.content.toLowerCase().includes(q))
})
</script>
