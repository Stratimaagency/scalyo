import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useResourceStore = defineStore('resources', () => {
  const resources = ref([
    { id: 'r1', title: 'Réduire le churn en 30 jours', category: 'guide', level: 'intermediate', lang: 'fr', duration: '12 min', icon: '📘',
      desc: 'Plan d\'action complet pour réduire le churn rate de votre portefeuille en un mois.',
      content: [
        { week: 'Semaine 1 — Diagnostic', items: ['Auditer vos 10 derniers churns : quelle était la vraie raison ?', 'Calculer votre taux de churn réel = clients perdus / clients début mois × 100', 'Identifier vos 3 signaux d\'alarme précoces (baisse usage, silence, changement interlocuteur)', 'Segmenter votre portefeuille : Vert / Orange / Rouge'] },
        { week: 'Semaine 2 — Intervention', items: ['Protocole client Orange : email J+0, call J+3, proposition valeur J+7', 'Protocole client Rouge : escalade immédiate, QBR d\'urgence dans 48h', 'Script d\'appel de rétention (les 5 questions magiques)', 'L\'art du "save" : ne jamais promettre ce qu\'on ne peut pas tenir'] },
        { week: 'Semaine 3 — Système', items: ['Automatiser les health checks hebdo (5 min par client)', 'Créer votre "Early Warning System" personnalisé', 'Mettre en place les check-ins proactifs (avant qu\'ils appellent)', 'Documenter les success stories pour prévenir le churn par comparaison'] },
        { week: 'Semaine 4 — Culture', items: ['Aligner avec le Product sur les feedbacks churners', 'Brief Sales : les clients qui ne devraient jamais avoir été signés', 'Créer votre rituel hebdo équipe : "Qui est en danger cette semaine ?"', 'Mesurer : votre taux de churn doit avoir baissé d\'au moins 15%'] },
      ],
      exercise: 'Prenez vos 5 clients orange aujourd\'hui. Pour chacun : 1) Quelle valeur leur avons-nous apportée ce mois ? 2) Quel est leur prochain renouvellement ? 3) Ont-ils un champion interne ? Si vous ne pouvez pas répondre → bloquez 2h cette semaine.' },
    { id: 'r2', title: 'Le QBR parfait', category: 'guide', level: 'expert', lang: 'fr', duration: '15 min', icon: '📘',
      desc: 'De la préparation au suivi — structure complète pour des QBRs impactants.',
      content: [
        { week: 'J-14 — Préparation data', items: ['Collecter : utilisation produit (MAU, features, tickets)', 'Calculer : ROI réalisé vs promis lors du closing', 'Préparer : 3 success stories avec chiffres', 'Identifier : 1-2 opportunités d\'expansion naturelles'] },
        { week: 'J-7 — Agenda (60 min)', items: ['[00-10] Warm-up : news client, actualités secteur', '[10-30] Rétrospective Q passé : succès, difficultés', '[30-45] Présentation ROI et valeur délivrée (avec chiffres)', '[45-55] Roadmap Q prochain : engagements, objectifs', '[55-60] Next steps avec responsables et dates'] },
        { week: 'Pendant — 5 règles d\'or', items: ['Commencer par LEUR business, pas votre produit', 'Données chiffrées uniquement (jamais "beaucoup")', 'Les laisser parler 60% du temps', 'Nommer un prochain pas précis avant de raccrocher', 'Jamais terminer sans une date de prochain contact'] },
        { week: 'J+24h — Suivi', items: ['Email récapitulatif dans les 24h', 'Actions côté client trackées dans Scalyo', 'Rapport QBR partagé avec votre manager'] },
      ] },
    { id: 'r3', title: 'Améliorer son NPS de +20 points', category: 'guide', level: 'intermediate', lang: 'fr', duration: '18 min', icon: '📘',
      desc: 'Méthodologie pour transformer vos détracteurs en promoteurs en 90 jours.',
      content: [
        { week: 'Levier 1 — Convertir les Passifs (+8 à +12 pts)', items: ['Call individuel pour chaque Passif : "Qu\'est-ce qui nous manque pour un 9 ou 10 ?"', '80% du temps, c\'est un problème précis et réglable', 'Suivi dans 30 jours avec la même question'] },
        { week: 'Levier 2 — Amplifier les Promoteurs (+3 à +5 pts)', items: ['Programme de référence structuré', 'Case studies co-écrits', 'Accès bêta exclusif nouvelles fonctionnalités', 'Communauté utilisateurs premium'] },
        { week: 'Levier 3 — Récupérer les Détracteurs (éviter -5 à -10 pts)', items: ['Ne jamais abandonner un détracteur', 'Escalade systématique vers le management', 'Plan de remédiation sur 60 jours avec SLA', 'Si irrécupérable : offboarding propre'] },
      ] },
    { id: 'r4', title: 'Checklist onboarding client (D0→D90)', category: 'checklist', level: 'beginner', lang: 'fr', duration: '5 min', icon: '📋',
      desc: '90 jours structurés pour un onboarding réussi.',
      content: [
        { week: 'J0 — Signature', items: ['☐ Email de bienvenue dans les 2h', '☐ Invitation plateforme envoyée', '☐ Agenda kick-off planifié', '☐ Brief interne envoyé'] },
        { week: 'J1-J7 — Kick-off', items: ['☐ Appel kick-off 60min', '☐ Accès confirmés pour tous', '☐ Premier workflow paramétré ensemble', '☐ Quick wins identifiées'] },
        { week: 'J8-J30 — Activation', items: ['☐ Check-in hebdo (15min)', '☐ Feature avancée présentée', '☐ Time to First Value mesuré', '☐ NPS d\'activation envoyé (J+30)'] },
        { week: 'J31-J60 — Adoption', items: ['☐ Revue d\'usage', '☐ Formation équipe élargie si nécessaire', '☐ Connexion avec le Product si feedback', '☐ Identifier le champion interne'] },
        { week: 'J61-J90 — Expansion', items: ['☐ Bilan des 90 jours', '☐ 1-2 opportunités d\'expansion identifiées', '☐ Premier QBR planifié', '☐ Demander un témoignage'] },
      ] },
    { id: 'r5', title: 'Checklist préparation renouvellement', category: 'checklist', level: 'intermediate', lang: 'fr', duration: '5 min', icon: '📋', desc: 'Ne manquez plus aucun renouvellement.' },
    { id: 'r6', title: 'Détection précoce churn', category: 'checklist', level: 'expert', lang: 'fr', duration: '8 min', icon: '📋', desc: 'Les 12 signaux faibles à surveiller.' },
    { id: 'r7', title: 'Framework JTBD pour CS', category: 'framework', level: 'expert', lang: 'fr', duration: '18 min', icon: '🎯', desc: 'Jobs To Be Done appliqué au Customer Success.' },
    { id: 'r8', title: 'Matrice de santé client — scoring', category: 'framework', level: 'intermediate', lang: 'fr', duration: '10 min', icon: '🎯',
      desc: 'Système de scoring sur 100 points pour évaluer la santé de chaque compte.',
      content: [
        { week: '6 dimensions du Health Score', items: ['Utilisation produit (25 pts) : quotidienne=25, hebdo=15, irrégulière=5, <7j/30j=0', 'Engagement (20 pts) : réponse <24h=20, <72h=12, difficile=5, silence >14j=0', 'ROI réalisé (20 pts) : clairement documenté=20, partiel=12, difficile=5, invisible=0', 'Relations internes (15 pts) : champion+direction=15, champion seul=10, unique=5, parti=0', 'Santé financière (10 pts) : paiements OK+expansion=10, stable=7, retard=3, litige=0', 'Satisfaction (10 pts) : NPS 9-10=10, 7-8=7, 5-6=3, <5=0'] },
        { week: 'Interprétation', items: ['80-100 🟢 Sain — client ambassadeur potentiel', '60-79 🔵 Stable — surveiller et chercher expansion', '40-59 🟡 Vigilance — plan d\'action préventif dans 7j', '20-39 🟠 À risque — intervention dans 48h', '0-19 🔴 Critique — escalade immédiate'] },
      ] },
    { id: 'r9', title: 'Script appel rétention', category: 'script', level: 'beginner', lang: 'fr', duration: '7 min', icon: '⚙️',
      desc: 'Script éprouvé pour un appel de rétention client à risque.',
      content: [
        { week: 'Avant l\'appel (10 min)', items: ['Regarder les métriques des 30 derniers jours', 'Identifier 2-3 points de valeur délivrée', 'Anticiper l\'objection principale', 'Avoir une concession préparée'] },
        { week: 'Ouverture (2 min)', items: ['"Bonjour [Prénom], merci de prendre le temps. [Client] est important pour nous et j\'ai vu que [observation précise]."'] },
        { week: 'Diagnostic (8 min)', items: ['"Qu\'est-ce qui se passe de votre côté en ce moment ?"', '"Si vous deviez pointer la chose principale qui vous frustre ?"', '"Qu\'est-ce qu\'il faudrait changer pour que ça fonctionne vraiment ?"'] },
        { week: 'Résolution (8 min)', items: ['Reformuler ce que vous avez entendu (empathie)', 'Ce que vous pouvez faire maintenant (concret, avec date)', 'Ce que vous ne pouvez pas promettre (honnêteté = confiance)'] },
        { week: 'Engagement (2 min)', items: ['"Voici ce que je m\'engage à faire : [1 action dans les 48h]. Je vous recontacte [date]."'] },
      ] },
    { id: 'r10', title: 'Script discovery call expansion', category: 'script', level: 'intermediate', lang: 'fr', duration: '8 min', icon: '⚙️', desc: 'Questions et structure pour identifier les opportunités d\'upsell.' },
    { id: 'r11', title: 'Closing the loop NPS', category: 'script', level: 'intermediate', lang: 'fr', duration: '6 min', icon: '⚙️', desc: 'Comment répondre aux détracteurs NPS et les transformer.' },
    { id: 'r12', title: 'Template QBR PowerPoint', category: 'template', level: 'beginner', lang: 'fr', duration: '3 min', icon: '📊', desc: '20 slides prêtes à personnaliser pour votre prochain QBR.' },
  ])

  const masterclasses = ref([
    {
      id: 'mc1', title: 'Maîtriser la rétention client en SaaS B2B', quarter: 'Q2 2026', isNew: true, totalHours: '4h30',
      modules: [
        { id: 'mod1', title: 'Comprendre les vraies raisons du churn', lessons: 3, exercises: 2, completed: false, duration: '1h',
          lessonDetails: [
            { title: 'Les 7 vraies raisons du churn B2B SaaS', duration: '20 min', summary: 'Le produit ne résout pas le vrai problème, le champion est parti (35% des churns), l\'onboarding a échoué silencieusement, la valeur n\'est pas visible pour la direction, un concurrent a fait une offre, budget coupé, mauvaise expérience support.' },
            { title: 'L\'autopsie de churn — méthode', duration: '15 min', summary: 'Quand mener une autopsie (dans les 30j), qui interroger (le décideur), les 5 questions de l\'exit interview, transformer les learnings en actions.' },
            { title: 'Calculer le coût réel du churn', duration: '25 min', summary: 'ARR perdu + coût d\'acquisition manqué + impact NPS. Chaque point de churn vous coûte X€/an. Présenter ce chiffre à votre direction.' },
          ] },
        { id: 'mod2', title: 'Construire un système d\'alertes précoces', lessons: 4, exercises: 3, completed: false, duration: '1h15',
          lessonDetails: [
            { title: 'Les 12 signaux qui ne trompent pas', duration: '25 min', summary: 'Signaux d\'usage, relationnels et business. Comment chaque signal se traduit en score dans Scalyo.' },
            { title: 'Construire votre Early Warning System', duration: '20 min', summary: '3 niveaux d\'alerte : Vert/Orange/Rouge. Critères de passage, notifications, délais d\'action.' },
            { title: 'Le tableau de bord churn prédictif', duration: '30 min', summary: '5 métriques à suivre chaque semaine. Health Score qui prédit le churn à 90j avec 80% de précision.' },
            { title: 'Automatiser les alertes', duration: '15 min', summary: 'Configurer Scalyo pour ne rien manquer. Rituels hebdo "qui est en danger ?"' },
          ] },
        { id: 'mod3', title: 'Les conversations difficiles', lessons: 3, exercises: 2, completed: false, duration: '45 min',
          lessonDetails: [
            { title: 'Annoncer une mauvaise nouvelle', duration: '15 min', summary: 'Toujours eux avant qu\'ils l\'apprennent autrement. Structure : Annonce → Impact → Action → Next steps.' },
            { title: 'Le client agressif — garder son calme', duration: '15 min', summary: 'Technique VOCA : Valider, Observer, Comprendre, Agir. Scripts par type de situation.' },
            { title: 'Négocier un renouvellement sous pression', duration: '15 min', summary: 'Préparer votre BATNA. Ancrer la valeur avant le prix. Les 3 concessions acceptables.' },
          ] },
        { id: 'mod4', title: 'Transformer les détracteurs NPS en promoteurs', lessons: 3, exercises: 2, completed: false, duration: '45 min',
          lessonDetails: [
            { title: 'Anatomie d\'un détracteur', duration: '15 min', summary: '0-2 crise ouverte, 3-4 déception, 5-6 frustration précise. Ils parlent à 10 personnes en moyenne.' },
            { title: 'Le protocole Closing the Loop', duration: '20 min', summary: 'Appel dans 48h, écoute 35min, plan de remédiation sous 7j, suivi J+30. 40% deviennent Passifs en 90j.' },
            { title: 'Du Passif au Promoteur', duration: '10 min', summary: '"Qu\'est-ce qu\'il manque pour un 10 ?" Les 3 actions qui transforment un 7 en 9.' },
          ] },
        { id: 'mod5', title: 'Mesurer et prouver la valeur CS', lessons: 3, exercises: 1, completed: false, duration: '45 min',
          lessonDetails: [
            { title: 'Les métriques qui comptent', duration: '20 min', summary: 'NRR (LA métrique suprême), GRR, Time to Value, CLV, CAC Payback. Benchmarks : Bon >105%, Excellent >115%, World-class >130%.' },
            { title: 'Construire votre business case CS', duration: '15 min', summary: '1 slide, 3 chiffres, 1 histoire. Churn évité en € = votre ROI le plus tangible.' },
            { title: 'Votre rapport COPIL parfait', duration: '10 min', summary: 'Structure 5 min : KPIs / Succès / Alertes / Besoins. Ce que la direction veut vraiment savoir.' },
          ] },
      ],
    },
    { id: 'mc2', title: 'L\'expansion revenue : upsell et cross-sell éthiques', quarter: 'Q1 2026', isNew: false, totalHours: '3h30',
      modules: [
        { id: 'mod6', title: 'Identifier les vraies opportunités d\'expansion', lessons: 3, exercises: 2, completed: false, duration: '45 min', lessonDetails: [] },
        { id: 'mod7', title: 'Timing et approche', lessons: 3, exercises: 2, completed: false, duration: '45 min', lessonDetails: [] },
        { id: 'mod8', title: 'Les objections à l\'expansion', lessons: 4, exercises: 2, completed: false, duration: '1h', lessonDetails: [] },
        { id: 'mod9', title: 'Mesurer et optimiser votre expansion', lessons: 2, exercises: 1, completed: false, duration: '1h', lessonDetails: [] },
      ] },
    { id: 'mc3', title: 'Construire une équipe CS haute performance', quarter: 'Q4 2025', isNew: false, totalHours: '4h',
      modules: [
        { id: 'mod10', title: 'Recruter les bons profils CSM', lessons: 3, exercises: 1, completed: false, duration: '1h', lessonDetails: [] },
        { id: 'mod11', title: 'Onboarder et former vite et bien', lessons: 3, exercises: 2, completed: false, duration: '1h', lessonDetails: [] },
        { id: 'mod12', title: 'Manager sans microgérer', lessons: 4, exercises: 1, completed: false, duration: '1h', lessonDetails: [] },
        { id: 'mod13', title: 'Créer une culture CS', lessons: 4, exercises: 1, completed: false, duration: '1h', lessonDetails: [] },
      ] },
  ])

  const guides = ref([
    { id: 'g1', title: 'Client en risque de churn', icon: '🔴', category: 'client', steps: 5,
      desc: 'Protocole complet de rétention en 5 étapes.',
      stepDetails: ['Identifier les signaux : baisse usage >20%, tickets non résolus, silence >14j', 'Diagnostic rapide : call 15min pour comprendre le problème réel', 'Plan d\'action : 1 action concrète dans les 48h avec date de suivi', 'Escalade si nécessaire : impliquer le management et le Product', 'Suivi : check-in hebdo pendant 30j, mesurer le retour à la normale'] },
    { id: 'g2', title: 'Client silencieux', icon: '🟡', category: 'client', steps: 4,
      desc: 'Stratégie de réengagement pour clients qui ne répondent plus.',
      stepDetails: ['Vérifier les métriques d\'usage (pas les emails) — usage en hausse = OK, en baisse = danger', 'Email court et direct : "[Prénom], une question rapide" — pas de formalités', 'Si pas de réponse en 7j : appel direct au champion interne', 'Règle des 14 jours : tout client sans contact depuis 14j = alerte automatique'] },
    { id: 'g3', title: 'Client prêt pour expansion', icon: '🟢', category: 'client', steps: 3,
      desc: 'Qualification et approche pour upsell.',
      stepDetails: ['Signaux d\'expansion : usage >80% capacité, demandes features avancées, équipe en croissance', 'Timing : après un QBR réussi, après résolution d\'un problème, lors du renouvellement', 'Approche : montrer le ROI actuel puis présenter la valeur additionnelle avec chiffres'] },
    { id: 'g4', title: 'Escalade client mécontent', icon: '🔵', category: 'client', steps: 5,
      desc: 'Gestion de crise et désescalade.',
      stepDetails: ['Écouter sans interrompre — laisser la frustration s\'exprimer', 'Reformuler : "Si je comprends bien, le problème principal est..."', 'Action immédiate visible : 1 chose concrète dans l\'heure', 'Suivi écrit dans les 2h avec plan et timeline', 'Débrief interne : qu\'est-ce qu\'on aurait pu faire en amont ?'] },
    { id: 'g5', title: 'La semaine type du CSM efficace', icon: '📅', category: 'organization', steps: 7,
      desc: 'Planning type pour maximiser votre impact.',
      stepDetails: ['Lundi : revue portefeuille 30min — qui est en danger ? Qui mérite attention ?', 'Mardi-Mercredi : calls clients (max 4/jour, qualité > quantité)', 'Jeudi : QBR ou meetings internes (Sales/Product)', 'Vendredi matin : admin, documentation, emails en attente', 'Vendredi après-midi : formation perso, veille CS, pas de calls', 'Chaque jour : 30min bloc "proactif" — contacter 1 client sans raison urgente', 'Chaque soir : 5min "bilan" — 3 choses accomplies + 1 priorité demain'] },
    { id: 'g6', title: 'Gérer 30+ comptes sans s\'épuiser', icon: '💚', category: 'organization', steps: 6,
      desc: 'Système de prioritisation et automatisation.',
      stepDetails: ['Segmentation ARR × Risque × Effort : matrice 2x2 pour décider où investir', 'Règle 60/30/10 : 60% temps clients risqués, 30% stables, 10% expansion', 'Templates pour tout : emails, CR, QBR slides — ne jamais repartir de zéro', 'Automatiser les check-ins : séquence email automatique pour clients stables', 'Bloquer du temps "focus" : 2h/jour sans Slack ni email', 'Dire non aux réunions sans agenda — protéger son temps projet'] },
    { id: 'g7', title: 'COPIL parfait', icon: '📊', category: 'copil', steps: 8,
      desc: 'Guide complet du comité de pilotage : préparation → exécution → suivi.',
      stepDetails: ['Collecter les données 2 semaines avant (usage, tickets, NPS, ARR)', 'Préparer 5 slides max : KPIs → Succès → Alertes → Roadmap → Actions', 'Inviter les bonnes personnes (décideurs, pas observateurs)', 'Structure 60min : 10min warm-up, 20min KPIs, 15min projets, 15min next steps', 'Métriques incontournables : NRR, Churn, Health Score, ARR, NPS', 'Questions types : "Quel est votre objectif N°1 ce trimestre ?"', 'Anticiper les objections : préparer réponses aux 3 questions difficiles', 'Suivi J+1 : email récapitulatif avec action items datés et assignés'] },
    { id: 'g8', title: 'Collaboration Sales → CS handoff', icon: '🤝', category: 'management', steps: 4,
      desc: 'Process de transition client fluide.',
      stepDetails: ['Brief de transfert obligatoire : ce qui a été promis, les enjeux business, le vrai décideur', 'Meeting à 3 (Sales + CSM + Client) pour la passation officielle', 'Documentation dans Scalyo : notes, contacts, red flags identifiés pendant la vente', 'Rituel hebdo Sales/CS 30min : cas à risque + opportunités expansion'] },
  ])

  const categories = ['guide', 'checklist', 'framework', 'script', 'template']
  const levels = ['beginner', 'intermediate', 'expert']

  const filteredResources = (cat, level, search) => {
    let list = resources.value
    if (cat && cat !== 'all') list = list.filter(r => r.category === cat)
    if (level && level !== 'all') list = list.filter(r => r.level === level)
    if (search) {
      const q = search.toLowerCase()
      list = list.filter(r => r.title.toLowerCase().includes(q) || r.desc.toLowerCase().includes(q))
    }
    return list
  }

  return { resources, masterclasses, guides, categories, levels, filteredResources }
}, { persist: true })
