// src/tests/seed.js
// Données mockées pour le cas pratique complet

export const seedClients = [
  {
    id: "client-001",
    name: "Brevo Scale",
    healthScore: 62,
    trend: "-3",
    status: "at-risk",
    arrValue: 55000,
    csmId: "csm-002",
    csmName: "Lucas D.",
    renewal: "2026-09-15",
    issues: ["NPS en baisse", "Usage -15%"],
    metrics: { usage: 58, nps: 61, support: 65, engagement: 64 }
  },
  {
    id: "client-002",
    name: "Finastra SaaS",
    healthScore: 88,
    trend: "+4",
    status: "healthy",
    arrValue: 48000,
    csmId: "csm-001",
    csmName: "Sophie M.",
    renewal: "2026-12-01",
    issues: [],
    metrics: { usage: 85, nps: 90, support: 88, engagement: 89 }
  },
  {
    id: "client-003",
    name: "Payfit Pro",
    healthScore: 74,
    trend: "+2",
    status: "neutral",
    arrValue: 61000,
    csmId: "csm-002",
    csmName: "Lucas D.",
    renewal: "2026-08-20",
    issues: [],
    metrics: { usage: 70, nps: 75, support: 73, engagement: 78 }
  },
  {
    id: "client-004",
    name: "Sellsy Growth",
    healthScore: 91,
    trend: "+6",
    status: "healthy",
    arrValue: 27000,
    csmId: "csm-001",
    csmName: "Sophie M.",
    renewal: "2027-01-10",
    issues: [],
    metrics: { usage: 89, nps: 93, support: 91, engagement: 91 }
  },
  {
    id: "client-005",
    name: "Pennylane SMB",
    healthScore: 79,
    trend: "+1",
    status: "neutral",
    arrValue: 38000,
    csmId: "csm-003",
    csmName: "Amira B.",
    renewal: "2026-11-05",
    issues: [],
    metrics: { usage: 77, nps: 80, support: 78, engagement: 81 }
  }
]

export const seedCSMs = [
  {
    id: "csm-001",
    name: "Sophie M.",
    initials: "SM",
    color: "#4285F4",
    workloadPct: 72,
    clientCount: 2,
    avgHealth: 90,
    atRisk: 0,
  },
  {
    id: "csm-002",
    name: "Lucas D.",
    initials: "LD",
    color: "#EA4335",
    workloadPct: 95,
    clientCount: 2,
    avgHealth: 68,
    atRisk: 1,
  },
  {
    id: "csm-003",
    name: "Amira B.",
    initials: "AB",
    color: "#34A853",
    workloadPct: 48,
    clientCount: 1,
    avgHealth: 79,
    atRisk: 0,
  }
]

export const seedProjects = [
  {
    id: "proj-001",
    name: "Onboarding Payfit Pro",
    emoji: "🚀",
    color: "#4285F4",
    clientName: "Payfit Pro",
    tasks: [
      { id: "t1", title: "Kick-off call", startWeek: 10, durationWeeks: 1, done: true, tag: "Meeting" },
      { id: "t2", title: "Configuration initiale", startWeek: 11, durationWeeks: 2, done: true, tag: "Setup" },
      { id: "t3", title: "Formation équipe", startWeek: 13, durationWeeks: 2, done: false, tag: "Training" },
      { id: "t4", title: "Go-live & validation", startWeek: 15, durationWeeks: 1, done: false, tag: "Livraison" }
    ]
  },
  {
    id: "proj-002",
    name: "Churn Prevention Brevo",
    emoji: "🛡️",
    color: "#EA4335",
    clientName: "Brevo Scale",
    tasks: [
      { id: "t5", title: "Diagnostic santé", startWeek: 8, durationWeeks: 1, done: true, tag: "Analyse" },
      { id: "t6", title: "Plan de remédiation", startWeek: 9, durationWeeks: 2, done: false, tag: "Interne" },
      { id: "t7", title: "Sessions de suivi", startWeek: 11, durationWeeks: 4, done: false, tag: "Suivi" },
      { id: "t8", title: "Bilan final", startWeek: 15, durationWeeks: 2, done: false, tag: "Revue" }
    ]
  }
]

export const seedPlaybooks = [
  {
    id: "pb-001",
    name: "Churn Prevention",
    emoji: "🛡️",
    color: "#EA4335",
    description: "Processus de récupération client à risque",
    trigger: "Score santé < 60",
    totalDays: 30,
    clients: ["Brevo Scale"],
    steps: [
      { id: 1, title: "Alerte équipe CS", type: "🔔 Alerte", auto: true, description: "Notification Slack automatique au CSM + manager." },
      { id: 2, title: "Diagnostic rapide", type: "🔍 Analyse", auto: false, description: "Audit : usage, tickets, NPS." },
      { id: 3, title: "Appel urgence client", type: "📞 Call", auto: false, description: "Contact J+2 max." },
      { id: 4, title: "Plan d'action partagé", type: "📋 Plan", auto: false, description: "Document co-construit." },
      { id: 5, title: "Check-in hebdomadaire", type: "📞 Call", auto: false, description: "Suivi bihebdomadaire." },
      { id: 6, title: "Bilan de récupération", type: "📊 Revue", auto: false, description: "Score > 70 ? → succès." }
    ]
  },
  {
    id: "pb-002",
    name: "Onboarding Standard",
    emoji: "🚀",
    color: "#4285F4",
    description: "Processus d'onboarding nouveau client",
    trigger: "Nouveau client signé",
    totalDays: 45,
    clients: ["Payfit Pro"],
    steps: [
      { id: 1, title: "Email de bienvenue", type: "📧 Email", auto: true, description: "Envoi automatique." },
      { id: 2, title: "Kick-off call", type: "📞 Call", auto: false, description: "Appel 60min." },
      { id: 3, title: "Setup technique", type: "⚙️ Setup", auto: false, description: "Configuration." },
      { id: 4, title: "Formation utilisateurs", type: "🎓 Training", auto: false, description: "Session 2h." },
      { id: 5, title: "Revue J+30", type: "📊 Revue", auto: false, description: "Analyse adoption." },
      { id: 6, title: "Validation Go-Live", type: "✅ Clôture", auto: false, description: "Confirmation." }
    ]
  }
]

export const seedOKRs = [
  {
    id: "okr-001",
    objective: "Accélérer la rétention client",
    emoji: "🚀",
    period: "Q2 2026",
    owner: "Équipe CS",
    keyResults: [
      { id: "kr-1", title: "NRR à 115%", current: 108, target: 115, unit: "%" },
      { id: "kr-2", title: "Churn sous 2%/mois", current: 2.8, target: 2, unit: "%" },
      { id: "kr-3", title: "Score santé moyen > 80", current: 75, target: 80, unit: "/100" },
      { id: "kr-4", title: "100% QBR dans les délais", current: 72, target: 100, unit: "%" }
    ]
  },
  {
    id: "okr-002",
    objective: "Scaler la croissance ARR",
    emoji: "📈",
    period: "Q2 2026",
    owner: "Sophie M.",
    keyResults: [
      { id: "kr-5", title: "3 expansions signées", current: 1, target: 3, unit: "deals" },
      { id: "kr-6", title: "ARR expansion +45K€", current: 18, target: 45, unit: "K€" },
      { id: "kr-7", title: "NPS > 60", current: 54, target: 60, unit: "pts" }
    ]
  }
]

export const seedPlaybookProgress = {
  "pb-001": [0],
  "pb-002": [0, 1, 2],
}
