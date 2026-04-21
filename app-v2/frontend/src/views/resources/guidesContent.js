// Scalyo Guides — Multilingual content (FR/EN/KO)
// Used by GuidesView.vue
// All strings use backticks to avoid apostrophe issues

export function getTranslatedGuides(locale = 'fr') {
  const L = translations[locale] || translations.fr
  return [
    // ===== ONBOARDING STARTER =====
    {
      id: 'ob1', category: 'onboarding', icon: '🎉', duration: '5 min',
      level: 'beginner', plan: 'starter',
      title: L.ob1_title, desc: L.ob1_desc, outcome: L.ob1_outcome,
      steps: [
        { title: L.ob1_s1t, desc: L.ob1_s1d, tip: L.ob1_s1p },
        { title: L.ob1_s2t, desc: L.ob1_s2d, tip: '' },
        { title: L.ob1_s3t, desc: L.ob1_s3d, tip: L.ob1_s3p }
      ]
    },
    {
      id: 'ob2', category: 'onboarding', icon: '📊', duration: '2 min',
      level: 'beginner', plan: 'starter',
      title: L.ob2_title, desc: L.ob2_desc, outcome: L.ob2_outcome,
      steps: [
        { title: L.ob2_s1t, desc: L.ob2_s1d, tip: L.ob2_s1p },
        { title: L.ob2_s2t, desc: L.ob2_s2d, tip: '' },
        { title: L.ob2_s3t, desc: L.ob2_s3d, tip: '' },
        { title: L.ob2_s4t, desc: L.ob2_s4d, tip: L.ob2_s4p }
      ]
    },
    {
      id: 'ob3', category: 'onboarding', icon: '✅', duration: '2 min',
      level: 'beginner', plan: 'starter',
      title: L.ob3_title, desc: L.ob3_desc, outcome: L.ob3_outcome,
      steps: [
        { title: L.ob3_s1t, desc: L.ob3_s1d, tip: '' },
        { title: L.ob3_s2t, desc: L.ob3_s2d, tip: '' },
        { title: L.ob3_s3t, desc: L.ob3_s3d, tip: L.ob3_s3p }
      ]
    },
    {
      id: 'ob4', category: 'onboarding', icon: '📧', duration: '2 min',
      level: 'beginner', plan: 'starter',
      title: L.ob4_title, desc: L.ob4_desc, outcome: L.ob4_outcome,
      steps: [
        { title: L.ob4_s1t, desc: L.ob4_s1d, tip: '' },
        { title: L.ob4_s2t, desc: L.ob4_s2d, tip: L.ob4_s2p },
        { title: L.ob4_s3t, desc: L.ob4_s3d, tip: '' }
      ]
    },
    // ===== ONBOARDING GROWTH =====
    {
      id: 'ob5', category: 'onboarding', icon: '📥', duration: '3 min',
      level: 'beginner', plan: 'growth',
      title: L.ob5_title, desc: L.ob5_desc, outcome: L.ob5_outcome,
      steps: [
        { title: L.ob5_s1t, desc: L.ob5_s1d, tip: L.ob5_s1p },
        { title: L.ob5_s2t, desc: L.ob5_s2d, tip: L.ob5_s2p },
        { title: L.ob5_s3t, desc: L.ob5_s3d, tip: '' }
      ]
    },
    {
      id: 'ob6', category: 'onboarding', icon: '✨', duration: '2 min',
      level: 'beginner', plan: 'growth',
      title: L.ob6_title, desc: L.ob6_desc, outcome: L.ob6_outcome,
      steps: [
        { title: L.ob6_s1t, desc: L.ob6_s1d, tip: '' },
        { title: L.ob6_s2t, desc: L.ob6_s2d, tip: L.ob6_s2p },
        { title: L.ob6_s3t, desc: L.ob6_s3d, tip: '' }
      ]
    },
    {
      id: 'ob7', category: 'onboarding', icon: '📖', duration: '3 min',
      level: 'intermediate', plan: 'growth',
      title: L.ob7_title, desc: L.ob7_desc, outcome: L.ob7_outcome,
      steps: [
        { title: L.ob7_s1t, desc: L.ob7_s1d, tip: '' },
        { title: L.ob7_s2t, desc: L.ob7_s2d, tip: L.ob7_s2p },
        { title: L.ob7_s3t, desc: L.ob7_s3d, tip: L.ob7_s3p }
      ]
    },
    // ===== ONBOARDING ELITE =====
    {
      id: 'ob8', category: 'onboarding', icon: '📬', duration: '3 min',
      level: 'beginner', plan: 'elite',
      title: L.ob8_title, desc: L.ob8_desc, outcome: L.ob8_outcome,
      steps: [
        { title: L.ob8_s1t, desc: L.ob8_s1d, tip: L.ob8_s1p },
        { title: L.ob8_s2t, desc: L.ob8_s2d, tip: '' },
        { title: L.ob8_s3t, desc: L.ob8_s3d, tip: L.ob8_s3p }
      ]
    },
    {
      id: 'ob9', category: 'onboarding', icon: '🚀', duration: '2 min',
      level: 'beginner', plan: 'elite',
      title: L.ob9_title, desc: L.ob9_desc, outcome: L.ob9_outcome,
      steps: [
        { title: L.ob9_s1t, desc: L.ob9_s1d, tip: L.ob9_s1p },
        { title: L.ob9_s2t, desc: L.ob9_s2d, tip: '' },
        { title: L.ob9_s3t, desc: L.ob9_s3d, tip: L.ob9_s3p }
      ]
    },
    {
      id: 'ob10', category: 'onboarding', icon: '⚡', duration: '3 min',
      level: 'intermediate', plan: 'elite',
      title: L.ob10_title, desc: L.ob10_desc, outcome: L.ob10_outcome,
      steps: [
        { title: L.ob10_s1t, desc: L.ob10_s1d, tip: L.ob10_s1p },
        { title: L.ob10_s2t, desc: L.ob10_s2d, tip: '' },
        { title: L.ob10_s3t, desc: L.ob10_s3d, tip: L.ob10_s3p }
      ]
    },
    // ===== INTEGRATIONS =====
    {
      id: 'int1', category: 'integrations', icon: '🔗', duration: '2 min',
      level: 'beginner', plan: 'all',
      title: L.int1_title, desc: L.int1_desc, outcome: L.int1_outcome,
      steps: [
        { title: L.int1_s1t, desc: L.int1_s1d, tip: L.int1_s1p },
        { title: L.int1_s2t, desc: L.int1_s2d, tip: '' },
        { title: L.int1_s3t, desc: L.int1_s3d, tip: '' }
      ]
    },
    // ===== MANAGEMENT CS =====
    {
      id: 'mg1', category: 'management', icon: '🗣', duration: '8 min',
      level: 'intermediate', plan: 'growth',
      title: L.mg1_title, desc: L.mg1_desc, outcome: L.mg1_outcome,
      steps: [
        { title: L.mg1_s1t, desc: L.mg1_s1d, tip: L.mg1_s1p },
        { title: L.mg1_s2t, desc: L.mg1_s2d, tip: L.mg1_s2p },
        { title: L.mg1_s3t, desc: L.mg1_s3d, tip: L.mg1_s3p },
        { title: L.mg1_s4t, desc: L.mg1_s4d, tip: L.mg1_s4p }
      ]
    },
    {
      id: 'mg2', category: 'management', icon: '🌍', duration: '10 min',
      level: 'intermediate', plan: 'growth',
      title: L.mg2_title, desc: L.mg2_desc, outcome: L.mg2_outcome,
      steps: [
        { title: L.mg2_s1t, desc: L.mg2_s1d, tip: L.mg2_s1p },
        { title: L.mg2_s2t, desc: L.mg2_s2d, tip: L.mg2_s2p },
        { title: L.mg2_s3t, desc: L.mg2_s3d, tip: L.mg2_s3p },
        { title: L.mg2_s4t, desc: L.mg2_s4d, tip: '' }
      ]
    },
    {
      id: 'mg3', category: 'management', icon: '📊', duration: '12 min',
      level: 'intermediate', plan: 'growth',
      title: L.mg3_title, desc: L.mg3_desc, outcome: L.mg3_outcome,
      steps: [
        { title: L.mg3_s1t, desc: L.mg3_s1d, tip: L.mg3_s1p },
        { title: L.mg3_s2t, desc: L.mg3_s2d, tip: L.mg3_s2p },
        { title: L.mg3_s3t, desc: L.mg3_s3d, tip: L.mg3_s3p },
        { title: L.mg3_s4t, desc: L.mg3_s4d, tip: L.mg3_s4p }
      ]
    },
    // ===== EXCELLENCE =====
    {
      id: 'ex1', category: 'excellence', icon: '🤝', duration: '12 min',
      level: 'expert', plan: 'elite',
      title: L.ex1_title, desc: L.ex1_desc, outcome: L.ex1_outcome,
      steps: [
        { title: L.ex1_s1t, desc: L.ex1_s1d, tip: L.ex1_s1p },
        { title: L.ex1_s2t, desc: L.ex1_s2d, tip: L.ex1_s2p },
        { title: L.ex1_s3t, desc: L.ex1_s3d, tip: L.ex1_s3p },
        { title: L.ex1_s4t, desc: L.ex1_s4d, tip: L.ex1_s4p }
      ]
    },
    {
      id: 'ex2', category: 'excellence', icon: '📈', duration: '10 min',
      level: 'expert', plan: 'elite',
      title: L.ex2_title, desc: L.ex2_desc, outcome: L.ex2_outcome,
      steps: [
        { title: L.ex2_s1t, desc: L.ex2_s1d, tip: L.ex2_s1p },
        { title: L.ex2_s2t, desc: L.ex2_s2d, tip: L.ex2_s2p },
        { title: L.ex2_s3t, desc: L.ex2_s3d, tip: L.ex2_s3p },
        { title: L.ex2_s4t, desc: L.ex2_s4d, tip: '' }
      ]
    },
    {
      id: 'ex3', category: 'excellence', icon: '🚨', duration: '10 min',
      level: 'expert', plan: 'elite',
      title: L.ex3_title, desc: L.ex3_desc, outcome: L.ex3_outcome,
      steps: [
        { title: L.ex3_s1t, desc: L.ex3_s1d, tip: L.ex3_s1p },
        { title: L.ex3_s2t, desc: L.ex3_s2d, tip: L.ex3_s2p },
        { title: L.ex3_s3t, desc: L.ex3_s3d, tip: L.ex3_s3p },
        { title: L.ex3_s4t, desc: L.ex3_s4d, tip: L.ex3_s4p }
      ]
    },
    {
      id: 'ex4', category: 'excellence', icon: '🎯', duration: '10 min',
      level: 'expert', plan: 'elite',
      title: L.ex4_title, desc: L.ex4_desc, outcome: L.ex4_outcome,
      steps: [
        { title: L.ex4_s1t, desc: L.ex4_s1d, tip: L.ex4_s1p },
        { title: L.ex4_s2t, desc: L.ex4_s2d, tip: L.ex4_s2p },
        { title: L.ex4_s3t, desc: L.ex4_s3d, tip: '' },
        { title: L.ex4_s4t, desc: L.ex4_s4d, tip: L.ex4_s4p }
      ]
    },
    {
      id: 'ex5', category: 'excellence', icon: '📊', duration: '15 min',
      level: 'expert', plan: 'elite',
      title: L.ex5_title, desc: L.ex5_desc, outcome: L.ex5_outcome,
      steps: [
        { title: L.ex5_s1t, desc: L.ex5_s1d, tip: L.ex5_s1p },
        { title: L.ex5_s2t, desc: L.ex5_s2d, tip: L.ex5_s2p },
        { title: L.ex5_s3t, desc: L.ex5_s3d, tip: L.ex5_s3p },
        { title: L.ex5_s4t, desc: L.ex5_s4d, tip: L.ex5_s4p }
      ]
    },
    {
      id: 'ex6', category: 'excellence', icon: '🧩', duration: '10 min',
      level: 'expert', plan: 'elite',
      title: L.ex6_title, desc: L.ex6_desc, outcome: L.ex6_outcome,
      steps: [
        { title: L.ex6_s1t, desc: L.ex6_s1d, tip: L.ex6_s1p },
        { title: L.ex6_s2t, desc: L.ex6_s2d, tip: '' },
        { title: L.ex6_s3t, desc: L.ex6_s3d, tip: L.ex6_s3p },
        { title: L.ex6_s4t, desc: L.ex6_s4d, tip: L.ex6_s4p }
      ]
    },
    {
      id: 'ex7', category: 'excellence', icon: '💰', duration: '15 min',
      level: 'expert', plan: 'elite',
      title: L.ex7_title, desc: L.ex7_desc, outcome: L.ex7_outcome,
      steps: [
        { title: L.ex7_s1t, desc: L.ex7_s1d, tip: L.ex7_s1p },
        { title: L.ex7_s2t, desc: L.ex7_s2d, tip: L.ex7_s2p },
        { title: L.ex7_s3t, desc: L.ex7_s3d, tip: L.ex7_s3p },
        { title: L.ex7_s4t, desc: L.ex7_s4d, tip: L.ex7_s4p },
        { title: L.ex7_s5t, desc: L.ex7_s5d, tip: L.ex7_s5p }
      ]
    },
  ]
}

const translations = {
  fr: {
    // ob1
    ob1_title: "Premier pas — Créer votre premier client",
    ob1_desc: "4 champs, 30 secondes. Votre portefeuille démarre ici.",
    ob1_outcome: "Votre premier client est vivant dans Scalyo avec un Health Score initial.",
    ob1_s1t: "Ouvrir le Portefeuille", ob1_s1d: "Sidebar → Portefeuille → + Nouveau client", ob1_s1p: "Commencez par vos 3 clients les plus importants, pas les 50.",
    ob1_s2t: "Remplir les infos", ob1_s2d: "Nom, contact principal, ARR, date de renouvellement. Le Health Score démarre à 5/10.",
    ob1_s3t: "Enregistrer", ob1_s3d: "Cliquez Enregistrer. Votre client apparaît dans le Dashboard.", ob1_s3p: "Ajoutez 3 clients pour commencer, maîtrisez l'outil, puis importez le reste.",
    // ob2
    ob2_title: "Votre Dashboard en 30 secondes",
    ob2_desc: "Les 4 chiffres qui comptent. Chaque matin. Sans Excel.",
    ob2_outcome: "Vous savez lire votre Dashboard et réagir aux signaux.",
    ob2_s1t: "ARR Portfolio", ob2_s1d: "Combien vos clients vous rapportent au total.", ob2_s1p: "S'il baisse, un client est parti.",
    ob2_s2t: "Santé moyenne", ob2_s2d: "Score de 0 à 10 de tous vos clients. Sous 7 = attention.",
    ob2_s3t: "Comptes critiques", ob2_s3d: "Nombre de clients en danger. Au-dessus de 0 = agissez.",
    ob2_s4t: "Roadmap 90 jours", ob2_s4d: "Les renouvellements qui arrivent. Préparez-vous 30 jours avant.", ob2_s4p: "Ouvrez Scalyo chaque matin : 30 secondes pour savoir où vous en êtes.",
    // ob3
    ob3_title: "Task Board — Vos premières tâches",
    ob3_desc: "Un CSM organisé est un CSM qui garde ses clients.",
    ob3_outcome: "3 tâches créées, votre organisation CS démarre.",
    ob3_s1t: "Créer une tâche", ob3_s1d: "Task Board → + Nouvelle tâche. Titre, priorité, échéance, client lié.",
    ob3_s2t: "Vue Kanban", ob3_s2d: "Glissez-déposez entre les colonnes : A faire → En cours → Terminé.",
    ob3_s3t: "3 tâches pour démarrer", ob3_s3d: "Check-in client principal (3j), Préparer renouvellement (30j), Envoyer NPS (fin du mois).", ob3_s3p: "Créez-les maintenant. 1 minute. Peut sauver un client demain.",
    // ob4
    ob4_title: "Email Studio — Templates CS",
    ob4_desc: "Des templates d'emails CS prêts. Copiez. Collez. Envoyez.",
    ob4_outcome: "Vous savez utiliser les templates email et les personnaliser.",
    ob4_s1t: "Choisir un template", ob4_s1d: "Email Studio → parcourez : bienvenue, check-in, relance, QBR, renouvellement.",
    ob4_s2t: "Personnaliser", ob4_s2d: "Changez le nom du client, ajoutez un détail personnel.", ob4_s2p: "Un email générique, ça se voit. Un email personnalisé, ça se sent.",
    ob4_s3t: "Copier et envoyer", ob4_s3d: "Cliquez Copier → collez dans Gmail ou Outlook. L'envoi direct est réservé au plan Elite.",
  },
  en: {
    ob1_title: "First Step — Create your first client",
    ob1_desc: "4 fields, 30 seconds. Your portfolio starts here.",
    ob1_outcome: "Your first client is live in Scalyo with an initial Health Score.",
    ob1_s1t: "Open Portfolio", ob1_s1d: "Sidebar → Portfolio → + New client", ob1_s1p: "Start with your 3 most important clients, not all 50.",
    ob1_s2t: "Fill in the details", ob1_s2d: "Name, main contact, ARR, renewal date. Health Score starts at 5/10.",
    ob1_s3t: "Save", ob1_s3d: "Click Save. Your client appears in the Dashboard.", ob1_s3p: "Add 3 clients to start, master the tool, then import the rest.",
    ob2_title: "Your Dashboard in 30 seconds",
    ob2_desc: "The 4 numbers that matter. Every morning. No spreadsheet.",
    ob2_outcome: "You can read your Dashboard and react to signals.",
    ob2_s1t: "ARR Portfolio", ob2_s1d: "How much your clients bring in total.", ob2_s1p: "If it drops, a client has left.",
    ob2_s2t: "Average Health", ob2_s2d: "Score from 0 to 10 across all clients. Below 7 = needs attention.",
    ob2_s3t: "Critical accounts", ob2_s3d: "Number of at-risk clients. Above 0 = take action.",
    ob2_s4t: "90-day Roadmap", ob2_s4d: "Upcoming renewals. Prepare 30 days ahead.", ob2_s4p: "Open Scalyo every morning: 30 seconds to know where you stand.",
    ob3_title: "Task Board — Your first tasks",
    ob3_desc: "An organized CSM is a CSM who keeps their clients.",
    ob3_outcome: "3 tasks created, your CS organization starts.",
    ob3_s1t: "Create a task", ob3_s1d: "Task Board → + New task. Title, priority, due date, linked client.",
    ob3_s2t: "Kanban view", ob3_s2d: "Drag and drop between columns: To do → In progress → Done.",
    ob3_s3t: "3 starter tasks", ob3_s3d: "Check-in with main client (3d), Prepare renewal (30d), Send NPS (end of month).", ob3_s3p: "Create them now. 1 minute. Could save a client tomorrow.",
    ob4_title: "Email Studio — CS Templates",
    ob4_desc: "Ready-to-use CS email templates. Copy. Paste. Send.",
    ob4_outcome: "You know how to use and customize email templates.",
    ob4_s1t: "Choose a template", ob4_s1d: "Email Studio → browse: welcome, check-in, follow-up, QBR, renewal.",
    ob4_s2t: "Customize", ob4_s2d: "Change the client name, add a personal detail.", ob4_s2p: "A generic email shows. A personalized email connects.",
    ob4_s3t: "Copy and send", ob4_s3d: "Click Copy → paste into Gmail or Outlook. Direct sending is available on the Elite plan.",
  },
  ko: {
    ob1_title: "첫 번째 단계 — 첫 고객 등록",
    ob1_desc: "4개 필드, 30초. 포트폴리오가 시작됩니다.",
    ob1_outcome: "첫 고객이 Scalyo에 등록되고 Health Score가 초기화됩니다.",
    ob1_s1t: "포트폴리오 열기", ob1_s1d: "사이드바 → 포트폴리오 → + 새 고객", ob1_s1p: "가장 중요한 고객 3명부터 시작하세요.",
    ob1_s2t: "정보 입력", ob1_s2d: "이름, 담당자, ARR, 갱신일. Health Score는 5/10으로 시작됩니다.",
    ob1_s3t: "저장", ob1_s3d: "저장을 클릭하면 대시보드에 표시됩니다.", ob1_s3p: "먼저 3명의 고객으로 시작하고, 도구에 익숙해진 후 나머지를 가져오세요.",
    ob2_title: "30초 만에 보는 대시보드",
    ob2_desc: "중요한 4가지 수치. 매일 아침. 엑셀 없이.",
    ob2_outcome: "대시보드를 읽고 신호에 반응할 수 있습니다.",
    ob2_s1t: "ARR 포트폴리오", ob2_s1d: "고객이 총 얼마를 가져다주는지.", ob2_s1p: "감소하면 고객이 떠난 것입니다.",
    ob2_s2t: "평균 건강도", ob2_s2d: "모든 고객의 0~10 점수. 7 미만 = 주의 필요.",
    ob2_s3t: "위험 계정", ob2_s3d: "위험에 처한 고객 수. 0 이상 = 조치 필요.",
    ob2_s4t: "90일 로드맵", ob2_s4d: "다가오는 갱신. 30일 전에 준비하세요.", ob2_s4p: "매일 아침 Scalyo를 여세요: 30초면 현황을 파악할 수 있습니다.",
    ob3_title: "태스크 보드 — 첫 작업 만들기",
    ob3_desc: "조직적인 CSM이 고객을 지킵니다.",
    ob3_outcome: "3개의 작업이 생성되고, CS 조직이 시작됩니다.",
    ob3_s1t: "작업 만들기", ob3_s1d: "태스크 보드 → + 새 작업. 제목, 우선순위, 마감일, 고객 연결.",
    ob3_s2t: "칸반 뷰", ob3_s2d: "컬럼 간 드래그 앤 드롭: 할 일 → 진행 중 → 완료.",
    ob3_s3t: "시작 3개 작업", ob3_s3d: "주요 고객 체크인(3일), 갱신 준비(30일), NPS 발송(월말).", ob3_s3p: "지금 만드세요. 1분. 내일 고객을 구할 수 있습니다.",
    ob4_title: "이메일 스튜디오 — CS 템플릿",
    ob4_desc: "바로 사용할 수 있는 CS 이메일 템플릿. 복사. 붙여넣기. 발송.",
    ob4_outcome: "이메일 템플릿 사용법과 커스터마이즈 방법을 알게 됩니다.",
    ob4_s1t: "템플릿 선택", ob4_s1d: "이메일 스튜디오 → 환영, 체크인, 팔로우업, QBR, 갱신 템플릿 탐색.",
    ob4_s2t: "커스터마이즈", ob4_s2d: "고객 이름을 변경하고 개인적인 내용을 추가하세요.", ob4_s2p: "일반적인 이메일은 팔리고, 개인화된 이메일은 연결됩니다.",
    ob4_s3t: "복사 및 발송", ob4_s3d: "복사 클릭 → Gmail 또는 Outlook에 붙여넣기. 직접 발송은 Elite 플랜에서 가능합니다.",
  }
}
