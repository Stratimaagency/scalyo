import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useResourceStore = defineStore('resources', () => {

  const resources = ref([

    // ── GUIDES ──────────────────────────────────────────────

    { id: 'r1', title: 'Réduire le churn en 30 jours', category: 'guide',
      level: 'intermediate', lang: 'fr', duration: '12 min', icon: '📘',
      desc: 'Plan d\'action complet pour réduire le churn rate de votre portefeuille en un mois.',
      content: [
        { week: 'Semaine 1 — Diagnostic', items: [
          'Auditer vos 10 derniers churns : quelle était la vraie raison ?',
          'Calculer votre taux de churn réel = clients perdus / clients début mois × 100',
          'Identifier vos 3 signaux d\'alarme précoces (baisse usage, silence, changement interlocuteur)',
          'Segmenter votre portefeuille : Vert / Orange / Rouge selon health score',
        ]},
        { week: 'Semaine 2 — Intervention', items: [
          'Protocole client Orange : email J+0, call J+3, proposition de valeur J+7',
          'Protocole client Rouge : escalade immédiate, QBR d\'urgence dans 48h',
          'Script appel rétention : les 5 questions qui font parler le client',
          'L\'art du "save" : ne jamais promettre ce qu\'on ne peut pas tenir',
        ]},
        { week: 'Semaine 3 — Systématiser', items: [
          'Automatiser les health checks hebdo (5 min par client)',
          'Créer votre Early Warning System personnalisé sur 3 niveaux',
          'Mettre en place les check-ins proactifs (avant qu\'ils appellent)',
          'Documenter les success stories pour prévenir le churn par comparaison',
        ]},
        { week: 'Semaine 4 — Culture anti-churn', items: [
          'Aligner avec le Product sur les feedbacks churners (réunion mensuelle)',
          'Brief Sales : les profils clients qui ne devraient jamais avoir été signés',
          'Rituel hebdo équipe : "Qui est en danger cette semaine ?" (15 min)',
          'Mesurer : votre taux de churn doit avoir baissé d\'au moins 15%',
        ]},
      ],
      exercise: 'Prenez vos 5 clients orange aujourd\'hui. Pour chacun : 1) Quelle valeur concrète avons-nous apportée ce mois ? 2) Quel est leur prochain renouvellement ? 3) Ont-ils un champion interne ? Si vous ne pouvez pas répondre à ces 3 questions → bloquez 2h cette semaine pour faire le point.',
    },

    { id: 'r2', title: 'Le QBR parfait — De A à Z', category: 'guide',
      level: 'expert', lang: 'fr', duration: '15 min', icon: '📘',
      desc: 'De la préparation au suivi — structure complète pour des QBRs qui renforcent la relation et génèrent de l\'expansion.',
      content: [
        { week: 'J-14 — Préparation data', items: [
          'Collecter : utilisation produit sur 90j (MAU, features actives, tickets)',
          'Calculer : ROI réalisé vs ROI promis lors du closing (en €)',
          'Préparer : 3 success stories avec chiffres client, pas vos chiffres',
          'Identifier : 1-2 opportunités d\'expansion naturelles (pas de forcing)',
          'Envoyer : agenda + objectifs 5j avant pour éviter les surprises',
        ]},
        { week: 'Structure 60 minutes', items: [
          '[00-10] Warm-up : actualité du client, news de son secteur',
          '[10-30] Rétrospective Q passé : succès mesurés, difficultés honnêtes',
          '[30-45] ROI et valeur délivrée — avec leurs chiffres, pas les vôtres',
          '[45-55] Roadmap Q prochain : engagements côté vous + objectifs côté eux',
          '[55-60] Next steps nominatifs avec dates — jamais de "on verra"',
        ]},
        { week: '5 règles d\'or pendant le QBR', items: [
          'Règle 1 : Commencer par LEUR business, pas votre produit',
          'Règle 2 : Données chiffrées uniquement — "beaucoup" n\'existe pas',
          'Règle 3 : Les laisser parler 60% du temps (posez des questions ouvertes)',
          'Règle 4 : Nommer un prochain pas précis avant de raccrocher',
          'Règle 5 : Jamais terminer sans une date de prochain contact confirmée',
        ]},
        { week: 'J+24h — Suivi impeccable', items: [
          'Email récap dans les 24h : ce qu\'on a dit, ce qu\'on va faire, dates',
          'Actions côté client tracées dans Scalyo avec deadline',
          'Rapport QBR partagé avec votre manager et le sponsor client',
          'Rappel J+7 si action côté client en attente',
        ]},
      ],
      exercise: 'Avant votre prochain QBR : calculez le ROI exact que vous avez apporté en €. Si vous ne pouvez pas le calculer, c\'est votre principal travail avant la réunion.',
    },

    { id: 'r3', title: 'Améliorer son NPS de +20 points en 90 jours', category: 'guide',
      level: 'intermediate', lang: 'fr', duration: '18 min', icon: '📘',
      desc: 'Méthodologie pour transformer vos détracteurs en promoteurs — cas réel avec +23 points en 3 mois.',
      content: [
        { week: 'Comprendre votre NPS réel', items: [
          'Le NPS seul ne sert à rien — segmentez par CSM, secteur, taille client',
          'Calculez le NPS de churn prédictif : un Passif a 3× plus de risque de churner qu\'un Promoteur',
          'Vérité inconfortable : 40% des Passifs pensent à partir mais ne vous le diront jamais',
          'Objectif des 90 jours : +8 à +12 pts sur les Passifs, +3 à +5 pts sur les Promoteurs',
        ]},
        { week: 'Levier 1 — Convertir les Passifs (7-8)', items: [
          'Call individuel pour chaque Passif dans les 7 jours suivant l\'enquête',
          'Question clé : "Qu\'est-ce qui nous manquerait pour mériter un 9 ou 10 ?"',
          '80% du temps : c\'est un problème précis, réglable, que vous ignoriez',
          'Plan de remédiation en 30 jours + suivi NPS individuel',
          'Résultat attendu : 50% des Passifs deviennent Promoteurs en 90j',
        ]},
        { week: 'Levier 2 — Amplifier les Promoteurs (9-10)', items: [
          'Programme de référence structuré : incentive clair, process simple',
          'Case studies co-écrits : ils adorent être mis en valeur',
          'Accès bêta exclusif nouvelles fonctionnalités (ils se sentent partenaires)',
          'Communauté utilisateurs premium : ils deviennent vos meilleurs commerciaux',
        ]},
        { week: 'Levier 3 — Récupérer les Détracteurs (0-6)', items: [
          'Ne jamais abandonner un détracteur — c\'est votre meilleure source de feedback',
          'Escalade systématique vers le management (votre N+1 appelle dans les 48h)',
          'Plan de remédiation 60 jours avec SLA formalisé et signé',
          'Si irrécupérable : offboarding propre = ils parleront bien de vous',
        ]},
      ],
      exercise: 'Cette semaine : appelez vos 3 derniers Passifs. Posez uniquement cette question : "Qu\'est-ce qu\'on aurait pu faire différemment ?" Écoutez 10 minutes sans défendre. Notez les verbatims.',
    },

    // ── CHECKLISTS ──────────────────────────────────────────

    { id: 'r4', title: 'Checklist onboarding client (J0→J90)', category: 'checklist',
      level: 'beginner', lang: 'fr', duration: '5 min', icon: '📋',
      desc: '90 jours structurés pour transformer un nouveau client en ambassadeur.',
      content: [
        { week: 'J0 — Signature (dans les 2h)', items: [
          '☐ Email de bienvenue personnalisé (pas un template générique)',
          '☐ Invitation plateforme envoyée à tous les accès identifiés',
          '☐ Agenda kick-off planifié dans les 5 jours ouvrés',
          '☐ Brief interne CS : contexte, enjeux, risques identifiés',
          '☐ Fiche client créée dans Scalyo avec toutes les données contrat',
        ]},
        { week: 'J1-J7 — Kick-off', items: [
          '☐ Appel kick-off 60min : introductions, objectifs, success criteria',
          '☐ Accès confirmés et fonctionnels pour tous les utilisateurs',
          '☐ Premier workflow paramétré ensemble (quick win visible)',
          '☐ 3 quick wins identifiées pour le premier mois',
          '☐ Champion interne nommé et engagé',
        ]},
        { week: 'J8-J30 — Activation', items: [
          '☐ Check-in hebdo 15min (maintenir la cadence)',
          '☐ Feature avancée #1 présentée et adoptée',
          '☐ Time to First Value mesuré et documenté',
          '☐ NPS d\'activation envoyé (J+30)',
          '☐ Premier ticket support géré avec réactivité exemplaire',
        ]},
        { week: 'J31-J60 — Adoption', items: [
          '☐ Revue d\'usage : taux d\'adoption vs objectif',
          '☐ Formation équipe élargie si usage < 60%',
          '☐ Connexion Product si feedback produit identifié',
          '☐ Champion interne : valide-t-il toujours le projet en interne ?',
          '☐ Identification des décideurs pour le renouvellement',
        ]},
        { week: 'J61-J90 — Expansion & Fidélisation', items: [
          '☐ Bilan des 90 jours : ROI mesuré vs promis',
          '☐ 1-2 opportunités d\'expansion naturelles identifiées',
          '☐ Premier QBR planifié (J+90 à J+100)',
          '☐ Témoignage ou case study demandé',
          '☐ Health score ≥ 7/10 validé avant de clore l\'onboarding',
        ]},
      ],
    },

    { id: 'r5', title: 'Checklist renouvellement (J-90 → J0)', category: 'checklist',
      level: 'intermediate', lang: 'fr', duration: '5 min', icon: '📋',
      desc: 'Ne manquez plus jamais un renouvellement — processus en 4 phases sur 90 jours.',
      content: [
        { week: 'J-90 — Préparation stratégique', items: [
          '☐ Alerte renouvellement créée dans Scalyo (automatique)',
          '☐ Bilan de la valeur délivrée depuis le dernier renouvellement',
          '☐ Health score actuel : ≥ 7 = standard, < 7 = plan de remédiation urgent',
          '☐ Décideur renouvellement identifié (peut avoir changé)',
          '☐ Budget client vérifié (changement d\'exercice fiscal ?)',
        ]},
        { week: 'J-60 — Positionnement valeur', items: [
          '☐ QBR de renouvellement planifié',
          '☐ Dossier ROI préparé : valeur délivrée en chiffres',
          '☐ Expansion identifiée à proposer lors du renouvellement',
          '☐ Rapport de satisfaction envoyé (NPS + verbatims positifs)',
          '☐ Références internes activées (champion → décideur)',
        ]},
        { week: 'J-30 — Négociation', items: [
          '☐ Offre de renouvellement envoyée officiellement',
          '☐ Objections anticipées : prix, scope, concurrents',
          '☐ Escalade manager planifiée si blocage',
          '☐ Contrepartie préparée (formation, features, support prioritaire)',
          '☐ Date limite de décision fixée avec le client',
        ]},
        { week: 'J-7 → J0 — Closing', items: [
          '☐ Relance si pas de réponse (appel direct, pas email)',
          '☐ Signature électronique envoyée',
          '☐ Confirmation interne (finance, legal si nécessaire)',
          '☐ Email de remerciement post-signature',
          '☐ Objectifs du prochain cycle documentés dans Scalyo',
        ]},
      ],
    },

    { id: 'r6', title: 'Les 12 signaux de churn à surveiller', category: 'checklist',
      level: 'expert', lang: 'fr', duration: '8 min', icon: '📋',
      desc: 'Détection précoce : ces signaux apparaissent en moyenne 67 jours avant le churn.',
      content: [
        { week: 'Signaux d\'usage (Score -25 si plusieurs présents)', items: [
          '🔴 Baisse du DAU/WAU de plus de 30% sur 4 semaines consécutives',
          '🔴 Nombre de features actives passe sous 40% des features clés',
          '🟠 Tickets support en hausse de 50% : frustration qui monte',
          '🟠 Connexions uniquement par 1 seul utilisateur (dépendance individuelle)',
          '🟡 Téléchargements des données brutes (ils vérifient ou cherchent alternative)',
        ]},
        { week: 'Signaux relationnels (Score -20 si plusieurs présents)', items: [
          '🔴 Champion interne a quitté l\'entreprise ou changé de poste',
          '🔴 Silence de plus de 14 jours malgré vos relances',
          '🟠 Refus de QBR ou report systématique au-delà de 3 semaines',
          '🟠 Nouveaux interlocuteurs qui ne connaissent pas le contexte projet',
          '🟡 Ton des emails devient plus formel ou plus court',
        ]},
        { week: 'Signaux business (Score -15 si présents)', items: [
          '🔴 Restructuration, fusion, ou acquisition annoncée',
          '🔴 Retard de paiement ou demande de réduction budgétaire',
          '🟠 Appel d\'offres concurrent détecté (LinkedIn, presse)',
          '🟡 Nouveau responsable IT ou DSI qui "repart de zéro"',
        ]},
        { week: 'Protocole d\'intervention selon score', items: [
          'Score 0-2 signaux 🟢 : surveillance normale, check-in mensuel',
          'Score 3-4 signaux 🟡 : plan préventif dans 7j, appel proactif',
          'Score 5-6 signaux 🟠 : intervention dans 48h, impliquer manager',
          'Score 7+ signaux 🔴 : escalade immédiate, QBR d\'urgence, save plan',
        ]},
      ],
    },

    // ── FRAMEWORKS ──────────────────────────────────────────

    { id: 'r7', title: 'Framework JTBD pour Customer Success', category: 'framework',
      level: 'expert', lang: 'fr', duration: '18 min', icon: '🎯',
      desc: 'Jobs To Be Done appliqué au CS : comprendre ce que vos clients veulent vraiment accomplir.',
      content: [
        { week: 'Qu\'est-ce que le JTBD en CS ?', items: [
          'Les clients n\'achètent pas un produit — ils "engagent" quelque chose pour accomplir un job',
          'Le job d\'un directeur commercial : "Aider mon équipe à atteindre ses objectifs sans que je micro-manage"',
          'Le job d\'un DSI : "Déployer des outils qui fonctionnent sans créer de friction IT"',
          'Comprendre le job = comprendre pourquoi ils resteraient ou partiraient',
          'Erreur classique : on présente des features, pas la progression vers leur job',
        ]},
        { week: 'Les 3 dimensions du Job', items: [
          'Fonctionnel : la tâche concrète ("réduire le temps de reporting de 2h à 30min")',
          'Émotionnel : comment ils veulent se sentir ("être perçu comme innovant par ma direction")',
          'Social : comment ils veulent être perçus ("être le héros qui a choisi le bon outil")',
          'Les décisions d\'achat et de renouvellement sont faites à 70% sur l\'émotionnel et le social',
          'Votre pitch de valeur couvre-t-il les 3 dimensions ?',
        ]},
        { week: 'Méthode : découvrir le vrai job', items: [
          'Interview JTBD (60 min) : "Racontez-moi le moment où vous avez décidé de chercher une solution"',
          'La règle des 5 pourquoi : ne jamais s\'arrêter à la première réponse',
          'Chercher les "forces" du switch : push (frustration ancienne) + pull (attraction nouvelle)',
          'Questions clés : "Qu\'est-ce qui vous a poussé à agir maintenant ?" / "Comment mesurez-vous le succès ?"',
          'Documenter le job statement : "Quand [situation], j\'ai besoin de [job] pour [résultat]"',
        ]},
        { week: 'Appliquer le JTBD au quotidien CS', items: [
          'Onboarding : "Quel est votre job principal dans 90 jours ?" → adapter la formation',
          'QBR : présenter le ROI en termes de progression vers leur job, pas vos metrics',
          'Expansion : identifier quand leur job évolue → nouvelle opportunité',
          'Rétention : si le job change et que votre produit ne suit pas → churn garanti',
          'Chaque check-in : "Le job qu\'on vous aide à accomplir a-t-il évolué ?"',
        ]},
      ],
      exercise: 'Choisissez votre client le plus important. Appelez-le cette semaine avec une seule question : "Si vous deviez résumer en une phrase ce que vous essayez d\'accomplir avec notre outil, ce serait quoi ?" La réponse va changer votre façon de travailler avec eux.',
    },

    { id: 'r8', title: 'Matrice de santé client — Health Score sur 100', category: 'framework',
      level: 'intermediate', lang: 'fr', duration: '10 min', icon: '🎯',
      desc: 'Système de scoring sur 100 points pour évaluer objectivement la santé de chaque compte.',
      content: [
        { week: 'Les 6 dimensions du Health Score', items: [
          'Utilisation produit (25 pts) : quotidienne=25, hebdo=15, irrégulière=5, <7j/30j=0',
          'Engagement (20 pts) : répond <24h=20, <72h=12, difficile à joindre=5, silence >14j=0',
          'ROI réalisé (20 pts) : documenté et communiqué=20, partiel=12, invisible=5, négatif=0',
          'Relations internes (15 pts) : champion+direction engagés=15, champion seul=10, 1 contact=5, champion parti=0',
          'Santé financière (10 pts) : paiements OK + expansion=10, stable=7, retard <30j=3, litige=0',
          'Satisfaction NPS (10 pts) : Promoteur 9-10=10, Passif 7-8=7, Détracteur 5-6=3, <5=0',
        ]},
        { week: 'Grille d\'interprétation', items: [
          '80-100 🟢 Sain : client ambassadeur potentiel — chercher l\'expansion',
          '60-79 🔵 Stable : surveiller l\'engagement, 1 check-in mensuel',
          '40-59 🟡 Vigilance : plan d\'action préventif à lancer dans les 7 jours',
          '20-39 🟠 À risque : intervention CS dans les 48h, impliquer le management',
          '0-19 🔴 Critique : escalade immédiate, save plan sur 30 jours',
        ]},
        { week: 'Pièges à éviter', items: [
          'Piège 1 : Pondération unique pour tous les clients (une startup ≠ une grande entreprise)',
          'Piège 2 : Mise à jour mensuelle (doit être hebdomadaire minimum)',
          'Piège 3 : Score calculé par le CSM (biais de confirmation — automatiser au maximum)',
          'Piège 4 : Ne pas communiquer le score en interne (Sales, Product, Direction doivent le voir)',
          'Piège 5 : Attendre qu\'un client passe en Critique pour agir (agir dès Vigilance)',
        ]},
      ],
      exercise: 'Calculez le Health Score de vos 10 plus gros clients aujourd\'hui. Pour chacun, si le score est < 60 : bloquez 30 min cette semaine pour un plan d\'action.',
    },

    // ── SCRIPTS ──────────────────────────────────────────────

    { id: 'r9', title: 'Script appel rétention', category: 'script',
      level: 'beginner', lang: 'fr', duration: '7 min', icon: '⚙️',
      desc: 'Script éprouvé pour un appel de rétention avec un client à risque — taux de succès 68%.',
      content: [
        { week: 'Préparation (10 min avant)', items: [
          'Regarder les métriques d\'usage des 30 derniers jours',
          'Identifier 2-3 valeurs concrètes délivrées ce trimestre',
          'Anticiper l\'objection principale (prix ? usage ? interne ?)',
          'Avoir une concession préparée (formation gratuite, feature prioritaire, support dédié)',
          'Mental : votre rôle est de comprendre, pas de convaincre',
        ]},
        { week: 'Ouverture (2 min)', items: [
          '"Bonjour [Prénom], merci de prendre 20 minutes. Je tenais à vous appeler personnellement."',
          '"[Client] est l\'un de nos comptes importants et j\'ai remarqué [observation précise et factuelle]."',
          '"Je voulais comprendre comment vous vivez les choses de votre côté."',
          'NE PAS parler du renouvellement dans les 5 premières minutes',
        ]},
        { week: 'Diagnostic — les 3 questions clés (8-10 min)', items: [
          '"Qu\'est-ce qui se passe de votre côté en ce moment ?" → laisser parler 3 min minimum',
          '"Si vous deviez pointer la chose principale qui vous frustre avec notre solution ?" → ne pas défendre',
          '"Qu\'est-ce qu\'il faudrait changer pour que ça fonctionne vraiment pour vous ?"',
          'Technique : reformuler chaque réponse avant de passer à la suivante',
        ]},
        { week: 'Résolution honnête (5-8 min)', items: [
          'Reformuler ce que vous avez entendu sans minimiser : "Si je comprends bien..."',
          'Ce que vous pouvez faire dans les 48h (concret, avec date)',
          'Ce que vous ne pouvez PAS promettre (honnêteté = confiance à long terme)',
          '"Voici ce que je m\'engage à faire : [1 action précise]. Je vous recontacte [date]."',
        ]},
        { week: 'Closing (2 min)', items: [
          'Résumer les engagements des deux côtés',
          'Fixer la prochaine date de contact avant de raccrocher',
          'Envoyer l\'email récap dans l\'heure : "Comme convenu, voici ce qu\'on a dit..."',
          'Si le client est indécis : "Je préfère qu\'on se reparle dans 15 jours plutôt que de vous presser"',
        ]},
      ],
      exercise: 'Identifiez votre client le plus à risque. Appelez-le cette semaine avec ce script. Notez les verbatims exacts. Partagez-les avec votre manager.',
    },

    { id: 'r10', title: 'Script discovery call expansion', category: 'script',
      level: 'intermediate', lang: 'fr', duration: '8 min', icon: '⚙️',
      desc: 'Questions et structure pour identifier les opportunités d\'upsell sans forcer la vente.',
      content: [
        { week: 'Philosophie de l\'expansion', items: [
          'L\'expansion ne se vend pas — elle se découvre. Votre rôle : révéler un besoin latent',
          'Timing idéal : J+90 (succès prouvé), J+180 (habitude installée), ou après un succès notable',
          'Signe que c\'est le bon moment : ils vous demandent si vous faites X, ou ils bricolent une solution',
          'Jamais d\'expansion avant Health Score ≥ 7/10',
        ]},
        { week: 'Questions de découverte (30 min)', items: [
          '"Comment se passe le déploiement au-delà de votre équipe initiale ?"',
          '"Quels sont les autres équipes ou processus que vous aimeriez connecter à notre solution ?"',
          '"Qu\'est-ce que vous faites encore manuellement que vous aimeriez automatiser ?"',
          '"Si vous deviez doubler votre usage demain, qu\'est-ce qui vous manquerait ?"',
          '"Quel est le prochain défi business de votre équipe pour ce trimestre ?"',
        ]},
        { week: 'Identifier l\'opportunité', items: [
          'Écouter les "on aimerait bien pouvoir...", "on bricolait avant avec...", "on a un outil séparé pour..."',
          'Ne pas pitcher immédiatement : noter et revenir avec une proposition construite',
          'Calculer le ROI potentiel avant de proposer : "Si on résolvait X, ça vous ferait gagner combien ?"',
          'Proposer une démo spécifique au cas d\'usage découvert, pas un pitch générique',
        ]},
        { week: 'Proposer sans forcer', items: [
          '"Suite à notre discussion, j\'ai pensé à quelque chose qui pourrait vous aider avec X..."',
          'Envoyer une proposition courte (1 page) avec : problème identifié + solution + ROI estimé',
          'Délai de réflexion : "Prenez le temps qu\'il faut, je suis disponible pour répondre à vos questions"',
          'Si refus : "OK, c\'est noté. On en reparle dans 6 mois si le contexte évolue"',
        ]},
      ],
    },

    { id: 'r11', title: 'Closing the loop NPS — Répondre aux détracteurs', category: 'script',
      level: 'intermediate', lang: 'fr', duration: '6 min', icon: '⚙️',
      desc: 'Comment transformer un détracteur NPS en opportunité de renforcement de la relation.',
      content: [
        { week: 'Pourquoi c\'est critique', items: [
          'Un détracteur non contacté churne à 65% dans les 12 mois',
          'Un détracteur contacté dans les 48h et dont le problème est résolu devient Passif à 55%',
          'Bonus inattendu : certains deviennent Promoteurs — ils apprécient qu\'on les ait écoutés',
          'Délai maximum de réponse : 48 heures après réception du NPS',
        ]},
        { week: 'Email de contact (envoyer dans les 48h)', items: [
          'Objet : "Merci pour votre retour honnête, [Prénom]"',
          '"Vous nous avez attribué [note]/10. Votre retour est important et je veux comprendre."',
          '"Pas pour défendre notre produit, mais pour apprendre et améliorer votre expérience."',
          '"Pouvez-vous me donner 20 minutes cette semaine ?"',
          'NE PAS demander ce qui n\'allait pas dans l\'email — gardez ça pour l\'appel',
        ]},
        { week: 'Structure de l\'appel (20 min)', items: [
          '[0-5] "Merci. Racontez-moi ce qui s\'est passé — prenez tout le temps nécessaire."',
          '[5-12] Écoute active sans interruption ni défense',
          '[12-17] "Voici ce que j\'ai compris. Est-ce que je me trompe ?" → reformuler',
          '[17-20] "Voici ce que je vais faire et dans quel délai" → engagement précis',
          'Ne jamais terminer sans un next step concret',
        ]},
        { week: 'Après l\'appel', items: [
          'Email récap avec les engagements pris dans les 2h',
          'Ticket interne créé si c\'est un bug ou un problème produit',
          'Suivi J+15 : "Avez-vous vu une amélioration ?" + mini NPS informel',
          'Si résolu : demander un témoignage ou une recommandation (timing parfait)',
        ]},
      ],
    },

    // ── TEMPLATES ──────────────────────────────────────────────

    { id: 'r12', title: 'Template QBR — Structure complète', category: 'template',
      level: 'beginner', lang: 'fr', duration: '3 min', icon: '📊',
      desc: 'Structure de présentation QBR professionnelle — 8 sections, à personnaliser en 30 min.',
      content: [
        { week: 'Structure des 8 sections', items: [
          'Section 1 — Page de couverture : logo client + période + date + vos coordonnées',
          'Section 2 — Rappel des objectifs fixés au dernier QBR',
          'Section 3 — Indicateurs d\'usage : MAU, features actives, NPS, tickets',
          'Section 4 — Valeur délivrée : ROI en €, success stories avec chiffres',
          'Section 5 — Ce qui a bien fonctionné (avec preuves)',
          'Section 6 — Ce qu\'on aurait pu mieux faire (honnêteté = crédibilité)',
          'Section 7 — Plan Q prochain : objectifs, jalons, responsables',
          'Section 8 — Next steps : actions nominatives avec dates',
        ]},
        { week: 'Règles de mise en forme', items: [
          'Max 20 slides — au-delà vous perdez leur attention',
          'Chaque slide = 1 idée. Si vous avez besoin d\'expliquer, c\'est trop complexe',
          'Chiffres en grand (taille 48+) : c\'est eux qui portent le message',
          'Photos de l\'équipe client sur la couverture (ils adorent)',
          'Couleurs de leur charte graphique pour la cover (personnalisation qui marque)',
        ]},
        { week: 'Données à collecter avant', items: [
          'Dans Scalyo : usage, health score, tickets sur 90 jours',
          'Chez le client : leurs KPIs business (CA, taux de conversion, temps gagné)',
          'En interne : engagements pris au dernier QBR → tenus ou pas ?',
          'Sur le marché : 1 actualité de leur secteur à mentionner en intro',
        ]},
      ],
    },
  ])

  // ── MASTERCLASSES ────────────────────────────────────────────────────────────

  const masterclasses = ref([
    {
      id: 'mc1',
      title: 'Maîtriser la rétention client en SaaS B2B',
      quarter: 'Q2 2026',
      isNew: true,
      totalHours: '4h30',
      totalDuration: '4h30',
      level: 'intermediate',
      description: 'La masterclass complète pour construire un système anti-churn robuste et augmenter votre Net Revenue Retention de +15 points en 3 mois.',
      modules: [
        {
          id: 'mod1',
          title: 'Comprendre les vraies raisons du churn',
          duration: '1h',
          lessons: [
            { id: 'l1_1', title: 'Les 7 vraies raisons du churn B2B SaaS', duration: '20 min',
              content: 'Contrairement aux idées reçues, le prix n\'est la vraie raison du churn que dans 9% des cas.\n\nLes vraies raisons par ordre de fréquence :\n\n1. Le champion interne a quitté l\'entreprise (35% des churns)\nSolution préventive : toujours avoir 2-3 contacts qualifiés. Le champion seul = risque maximal.\n\n2. L\'onboarding a échoué silencieusement (22%)\nLe client a signé mais n\'a jamais atteint la valeur promise.\n\n3. La valeur n\'est pas visible pour la direction (18%)\nLe champion voit la valeur mais ne sait pas la communiquer.\n\n4. Un concurrent a fait une offre agressive (11%)\nSi votre valeur est invisible, n\'importe quelle offre peut les prendre.\n\n5. Mauvaise expérience support (8%)\nUn seul mauvais incident peut faire basculer un client à risque.\n\n6. Produit ne résout pas le vrai problème (4%)\n\n7. Budget coupé (3%)\nSouvent une façade qui cache une raison 1-4.', },
            { id: 'l1_2', title: 'L\'autopsie de churn — la méthode complète', duration: '15 min',
              content: 'L\'autopsie de churn est l\'outil le plus sous-utilisé du Customer Success.\n\nQuand la mener : dans les 30 jours suivant le churn.\nQui interroger : le décideur (pas le champion) — il a la vraie raison.\n\nLes 5 questions qui font tout :\n1. "Quel a été le déclencheur de votre décision ?"\n2. "Qu\'est-ce que vous avez essayé avec nous avant de décider ?"\n3. "Qu\'est-ce que vous attendez de votre nouvelle solution ?"\n4. "Si on avait fait X différemment, auriez-vous reconsidéré ?"\n5. "Avez-vous des recommandations pour nous aider à nous améliorer ?"', },
            { id: 'l1_3', title: 'Calculer et présenter le coût réel du churn', duration: '25 min',
              content: 'Formule simplifiée : Coût total churn = ARR perdu × 3\n\nCoût direct : ARR perdu + coût de remplacement (CAC × délai)\nCoût indirect : impact NPS (chaque churner parle à 9 personnes), érosion expansion (-23%), temps CS (40h/dossier).\n\nExemple : client à 60k ARR churne → coût réel estimé à 180k€.\n\nComment présenter à la direction :\n1. Calculez votre coût moyen par client churné\n2. Multipliez par le nombre de churns sur 12 mois\n3. Comparez au coût d\'un CS supplémentaire\n4. Le ratio est toujours favorable au CS.', },
          ],
          exercises: [
            { id: 'ex1_1', title: 'Autopsie de vos 3 derniers churns', duration: '45 min',
              content: 'Pour chaque churn : 1) Raison officielle, 2) Vraie raison (catégorie 1-7), 3) Signal précoce le plus ancien, 4) Écart signal/détection en jours, 5) Action systémique pour les prochains.' },
          ],
        },
        {
          id: 'mod2',
          title: 'Construire un système d\'alertes précoces',
          duration: '1h15',
          lessons: [
            { id: 'l2_1', title: 'Les 12 signaux qui ne trompent pas', duration: '25 min',
              content: 'Ces signaux apparaissent en moyenne 67 jours avant le churn.\n\nSignaux d\'usage (poids 40%) :\n→ Baisse DAU/WAU > 30% sur 4 semaines\n→ Features actives < 40% des features clés\n→ Téléchargements de données brutes\n\nSignaux relationnels (poids 35%) :\n→ Champion parti = risque #1\n→ Silence > 14 jours\n→ Refus de QBR répété\n\nSignaux business (poids 25%) :\n→ Restructuration annoncée\n→ Retard de paiement\n→ Appel d\'offres détecté', },
            { id: 'l2_2', title: 'Construire votre Early Warning System', duration: '20 min',
              content: 'Structure en 3 niveaux :\n\nNiveau 1 — Vert (health > 70) : check-in mensuel, chercher expansion.\nNiveau 2 — Orange (health 40-70) : check-in bimensuel, plan préventif sous 7 jours.\nNiveau 3 — Rouge (health < 40) : contact hebdo, save plan formalisé, escalade sous 48h.\n\nLes 4 composants d\'un EWS efficace :\n1. Données automatisées (usage, paiements)\n2. Données manuelles (qualité échanges, moral champion)\n3. Seuils d\'alerte configurés dans Scalyo\n4. Processus clair : qui est alerté, qui agit, dans quel délai', },
            { id: 'l2_3', title: 'Le rituel hebdomadaire anti-churn', duration: '30 min',
              content: 'Structure du rituel (15 min, chaque lundi matin) :\n\n[3 min] Scanner Scalyo : qui a bougé ?\n[5 min] Prioriser 3 actions de la semaine\n[4 min] Anticiper : renouvellements dans 90j, QBRs à planifier\n[3 min] Documenter : mettre à jour actions semaine précédente\n\nRègle d\'or : si vous ne faites pas ce rituel le lundi, vous passez la semaine à éteindre des feux.', },
            { id: 'l2_4', title: 'Automatiser les alertes dans Scalyo', duration: '15 min',
              content: '5 alertes automatiques à configurer :\n1. Health score < 50 → notification immédiate\n2. Absence de connexion > 14 jours → alerte\n3. Renouvellement dans 90 jours → alerte automatique\n4. NPS reçu ≤ 6 → escalade immédiate\n5. Contact principal inactif > 21 jours → vérification\n\nRègle : automatisez la détection, humanisez la réponse.', },
          ],
          exercises: [
            { id: 'ex2_1', title: 'Configurer votre EWS personnel', duration: '30 min',
              content: '1. Listez vos 15 clients actifs\n2. Calculez leur health score\n3. Classez : Vert / Orange / Rouge\n4. Pour chaque Orange/Rouge : 1 action dans les 7 jours\n5. Bloquez 15 min chaque lundi pour le rituel\n6. Configurez les 5 alertes automatiques dans Scalyo' },
          ],
        },
        {
          id: 'mod3',
          title: 'Maîtriser les conversations difficiles',
          duration: '45 min',
          lessons: [
            { id: 'l3_1', title: 'Psychologie de la rétention — pourquoi les clients ne parlent pas', duration: '15 min',
              content: '68% des clients qui partent n\'ont jamais exprimé leur mécontentement.\n\nPourquoi ils ne parlent pas :\n1. Ils pensent que vous "savez déjà"\n2. Ils ne veulent pas être perçus comme des râleurs\n3. Ils ont essayé une fois et n\'ont pas été entendus\n4. La décision est déjà prise\n\nComment créer un climat où ils parlent :\n→ Demander régulièrement\n→ Réagir visiblement aux feedbacks\n→ Vulnérabilité intentionnelle : "Qu\'est-ce qu\'on rate ?"', },
            { id: 'l3_2', title: 'Script : annoncer une mauvaise nouvelle', duration: '15 min',
              content: 'Méthode ACE-S :\n\nA — Acknowledge : "Je dois vous annoncer quelque chose d\'important. C\'est de notre responsabilité."\nC — Comprendre l\'impact : "Comment est-ce que ça vous impacte concrètement ?" Écouter sans défendre.\nE — Engagements précis : "Voici ce que je vais faire et dans quel délai." Uniquement ce que vous pouvez tenir.\nS — Suivi : "Je vous contacte [date précise] pour faire le point."', },
            { id: 'l3_3', title: 'Gérer un client agressif ou en colère', duration: '15 min',
              content: 'La colère est presque toujours de la peur déguisée. Un client qui crie a encore confiance — sinon il aurait raccroché.\n\nTechnique HEAR :\nH — Hear : laisser parler 2-3 min minimum\nE — Empathize : "Je comprends que c\'est inacceptable"\nA — Apologize : sans "mais"\nR — Resolve : une action concrète dans les 24h\n\nNe jamais dire : "Ce n\'est pas de notre faute", "Calmez-vous", "Je vais voir ce que je peux faire"\n\nAprès l\'appel : 10 min de décompression. Ce n\'est pas personnel.', },
          ],
          exercises: [
            { id: 'ex3_1', title: 'Jeu de rôle : simulation d\'appel difficile', duration: '20 min',
              content: 'Avec un collègue : Scénario A (client qui menace de partir, ARR 80k€) et Scénario B (client en colère suite à un bug). Faites l\'appel, débriefez, recommencez.' },
          ],
        },
      ],
    },
    {
      id: 'mc2',
      title: 'L\'expansion revenue : de CSM à revenue driver',
      quarter: 'Q3 2026',
      isNew: false,
      totalHours: '3h45',
      totalDuration: '3h45',
      level: 'expert',
      description: 'Comment passer d\'un rôle défensif (rétention) à un rôle offensif (croissance) — multiplier votre NRR par 1.3 en 6 mois.',
      modules: [
        {
          id: 'mod4',
          title: 'Identifier les opportunités d\'expansion',
          duration: '1h',
          lessons: [
            { id: 'l4_1', title: 'Les 4 types d\'expansion en SaaS', duration: '20 min',
              content: 'L\'expansion est 7× moins chère que l\'acquisition.\n\nType 1 — Upsell : passer au plan supérieur. Signal : usage proche de la limite.\nType 2 — Cross-sell : module complémentaire. Signal : ils bricolent une solution externe.\nType 3 — Expansion de sièges : plus d\'utilisateurs. Signal : recrutements dans leur équipe.\nType 4 — Renouvellement avec expansion : augmentation au renouvellement. Signal : ROI démontré.\n\nRègle d\'or : pas d\'expansion avant Health Score ≥ 7/10.', },
          ],
          exercises: [],
        },
      ],
    },
  ])

  // ── GUIDES (pour GuidesView) ─────────────────────────────────────────────────

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
      stepDetails: ['Lundi : revue portefeuille 30min — qui est en danger ?', 'Mardi-Mercredi : calls clients (max 4/jour, qualité > quantité)', 'Jeudi : QBR ou meetings internes (Sales/Product)', 'Vendredi matin : admin, documentation, emails en attente', 'Vendredi après-midi : formation perso, veille CS, pas de calls', 'Chaque jour : 30min bloc "proactif" — contacter 1 client sans raison urgente', 'Chaque soir : 5min "bilan" — 3 choses accomplies + 1 priorité demain'] },
    { id: 'g6', title: 'Gérer 30+ comptes sans s\'épuiser', icon: '💚', category: 'organization', steps: 6,
      desc: 'Système de prioritisation et automatisation.',
      stepDetails: ['Segmentation ARR × Risque × Effort : matrice 2x2', 'Règle 60/30/10 : 60% temps clients risqués, 30% stables, 10% expansion', 'Templates pour tout : emails, CR, QBR slides', 'Automatiser les check-ins pour clients stables', 'Bloquer du temps "focus" : 2h/jour sans Slack ni email', 'Dire non aux réunions sans agenda'] },
    { id: 'g7', title: 'COPIL parfait', icon: '📊', category: 'copil', steps: 8,
      desc: 'Guide complet du comité de pilotage.',
      stepDetails: ['Collecter les données 2 semaines avant', 'Préparer 5 slides max : KPIs → Succès → Alertes → Roadmap → Actions', 'Inviter les bonnes personnes (décideurs)', 'Structure 60min : 10min warm-up, 20min KPIs, 15min projets, 15min next steps', 'Métriques incontournables : NRR, Churn, Health Score, ARR, NPS', 'Questions types : "Quel est votre objectif N°1 ce trimestre ?"', 'Anticiper les objections', 'Suivi J+1 : email récapitulatif avec action items datés et assignés'] },
    { id: 'g8', title: 'Collaboration Sales → CS handoff', icon: '🤝', category: 'management', steps: 4,
      desc: 'Process de transition client fluide.',
      stepDetails: ['Brief de transfert obligatoire : ce qui a été promis, les enjeux, le vrai décideur', 'Meeting à 3 (Sales + CSM + Client) pour la passation officielle', 'Documentation dans Scalyo : notes, contacts, red flags', 'Rituel hebdo Sales/CS 30min : cas à risque + opportunités expansion'] },
  ])

  const categories = ['guide', 'checklist', 'framework', 'script', 'template']
  const levels = ['beginner', 'intermediate', 'expert']

  const filteredResources = (cat, level, search) => {
    let r = resources.value
    if (cat !== 'all') r = r.filter(x => x.category === cat)
    if (level !== 'all') r = r.filter(x => x.level === level)
    if (search) {
      const q = search.toLowerCase()
      r = r.filter(x => x.title.toLowerCase().includes(q) || x.desc.toLowerCase().includes(q))
    }
    return r
  }

  return { resources, masterclasses, guides, categories, levels, filteredResources }

}, { persist: true })
