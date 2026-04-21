<template>
  <div class="gv">
    <div class="gv-header">
      <h1>📖 {{ t('nav.guides') }}</h1>
      <p>{{ t('nav.guidesSub') }}</p>
    </div>

    <!-- Filtres par catégorie -->
    <div class="gv-tabs">
      <button v-for="cat in categories" :key="cat.key"
              class="gv-tab" :class="{ active: activeTab === cat.key }"
              @click="activeTab = cat.key">
        {{ cat.icon }} {{ cat.label }}
      </button>
    </div>

    <!-- Liste des process -->
    <div class="gv-list">
      <div v-for="process in filteredProcesses" :key="process.id"
           class="gv-card"
           :class="{ open: openId === process.id }">

        <!-- Header cliquable -->
        <div class="gv-card-header" @click="openId = openId === process.id ? null : process.id">
          <div class="gv-card-left">
            <span class="gv-icon">{{ process.icon }}</span>
            <div>
              <strong>{{ process.title }}</strong>
              <p>{{ process.desc }}</p>
              <div class="gv-meta">
                <span class="gv-steps-count">{{ process.steps.length }} étapes</span>
                <span class="gv-time">⏱ {{ process.duration }}</span>
                <span class="gv-level" :class="process.level">{{ levelLabel(process.level) }}</span>
              </div>
            </div>
          </div>
          <span class="gv-chev">{{ openId === process.id ? '▾' : '▸' }}</span>
        </div>

        <!-- Steps expandés -->
        <div v-if="openId === process.id" class="gv-steps">
          <div v-for="(step, i) in process.steps" :key="i" class="gv-step">
            <div class="gv-step-num">{{ i + 1 }}</div>
            <div class="gv-step-body">
              <strong>{{ step.title }}</strong>
              <p>{{ step.desc }}</p>
              <div v-if="step.tips" class="gv-step-tips">
                <span v-for="tip in step.tips" :key="tip" class="gv-tip">💡 {{ tip }}</span>
              </div>
              <div v-if="step.warning" class="gv-step-warning">⚠️ {{ step.warning }}</div>
            </div>
          </div>

          <div v-if="process.outcome" class="gv-outcome">
            <span>🎯 Résultat attendu :</span> {{ process.outcome }}
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth'

const { t } = useI18n({ useScope: 'global' })
const auth = useAuthStore()
const plan = computed(() => auth.currentPlan || 'starter')
const activeTab = ref('all')
const openId = ref(null)

const categories = [
  { key: 'all', icon: '🗂', label: 'Tous' },
  { key: 'client', icon: '👤', label: 'Gestion client' },
  { key: 'crisis', icon: '🚨', label: 'Situations de crise' },
  { key: 'growth', icon: '📈', label: 'Croissance' },
  { key: 'organization', icon: '📅', label: 'Organisation' },
  { key: 'onboarding', icon: '🎓', label: 'Onboarding' },
  { key: 'integrations', icon: '🔗', label: 'Intégrations' },
  { key: 'management', icon: '🎯', label: 'Management CS' },
  { key: 'excellence', icon: '💎', label: 'Excellence' },
]

const processes = [
  {
    id: 'p1', category: 'client', icon: '🚀', duration: '10 min',
    level: 'beginner',
    title: 'Process onboarding client — J0 à J90',
    desc: 'De la signature au premier QBR — les étapes qui définissent le succès à long terme.',
    outcome: 'Un client activé, avec un champion engagé et un Health Score > 7/10 à J90.',
    steps: [
      { title: 'J0 — Email de bienvenue (dans les 2h)', desc: 'Envoyer un email personnalisé (pas de template générique) mentionnant le contexte de leur décision d\'achat. Joindre : accès plateforme, agenda kick-off, votre contact direct.', tips: ['Mentionner 1 chose précise de la conversation de vente', 'Proposer 3 créneaux pour le kick-off cette semaine'], warning: 'Un email de bienvenue envoyé après 24h réduit le taux d\'activation de 40%.' },
      { title: 'J1-J7 — Kick-off 60 minutes', desc: 'Réunion de lancement avec tous les utilisateurs clés. Objectif : aligner sur les success criteria, nommer le champion interne, identifier les 3 quick wins du premier mois.', tips: ['Préparer un compte-rendu envoyé dans les 2h', 'Nommer les responsables de chaque action'] },
      { title: 'J8-J30 — Activation des quick wins', desc: 'Check-in hebdo de 15 minutes. Focus sur 1 quick win visible par semaine. Présenter la feature qui résout le problème principal identifié au kick-off.', tips: ['Quick win = valeur visible par la direction, pas seulement par l\'utilisateur'], warning: 'Si J+30 et aucun quick win → plan de remédiation immédiat.' },
      { title: 'J30 — NPS d\'activation', desc: 'Envoyer le premier NPS avec 1 seule question qualitative : "Qu\'est-ce qu\'on aurait pu faire mieux ?". Appeler tous les Passifs (7-8) et Détracteurs (<6) dans les 48h.', tips: ['Ne pas attendre de mauvais retour — anticiper avec cette question'] },
      { title: 'J31-J60 — Adoption de l\'équipe', desc: 'Revue d\'usage : taux d\'adoption vs objectif. Si < 60% : organiser une session de formation pour l\'équipe élargie. Identifier le champion interne et valider son engagement.', tips: ['Le champion idéal = quelqu\'un qui a défendu le projet en interne'] },
      { title: 'J61-J90 — Bilan et expansion', desc: 'Bilan des 90 jours avec ROI mesuré en €. Identifier 1-2 opportunités d\'expansion naturelles. Planifier le premier QBR à J+90/J+100.', tips: ['Le ROI doit être calculé avec leurs chiffres, pas les vôtres', 'Ne proposer l\'expansion que si Health Score > 7/10'] },
    ]
  },
  {
    id: 'p2', category: 'crisis', icon: '🚨', duration: '15 min',
    level: 'expert',
    title: 'Process client en risque critique — Save plan',
    desc: 'Quand le Health Score passe sous 40 — les 7 étapes pour sauver le compte.',
    outcome: 'Health Score remonté > 60 dans les 45 jours ou décision éclairée d\'offboarding.',
    steps: [
      { title: 'H+0 — Déclenchement du save plan', desc: 'Dès que le Health Score passe sous 40 : créer un ticket "Save Plan" dans Scalyo, alerter votre manager dans les 2h, bloquer 30 min pour préparer l\'appel.', warning: 'Chaque heure perdue à ce stade coûte de la relation.' },
      { title: 'H+24 — Appel de diagnostic', desc: 'Appel avec le champion interne. Questions clés : "Qu\'est-ce qui se passe de votre côté ?" / "Si vous deviez pointer 1 chose principale ?" / "Qu\'est-ce qu\'il faudrait changer ?". NE PAS défendre, écouter.', tips: ['Prendre des notes mot pour mot — le verbatim est précieux'] },
      { title: 'H+48 — Engagement du management', desc: 'Si Health Score < 30 : votre N+1 envoie un email au sponsor client (DG, VP). Message : reconnaissance du problème + engagement de remédiation + proposition de call dans les 72h.', tips: ['Un email du management = signal fort que vous prenez ça au sérieux'], warning: 'Ne pas "sauter" cette étape même si vous êtes confiant.' },
      { title: 'J+3 — Plan de remédiation 30 jours', desc: 'Document partagé : 3 actions maximum avec responsable + deadline + critère de succès. Pas plus de 3 — trop d\'actions = aucune n\'est faite. Validation par le client avant lancement.', tips: ['Actions côté vous ET côté client — c\'est un co-engagement'] },
      { title: 'J+7, J+14, J+21 — Check-ins hebdo', desc: 'Call de 20 minutes chaque semaine. Format strict : état des 3 actions, blocage éventuel, ajustement si nécessaire. Documenter chaque appel dans Scalyo.', warning: 'Manquer un seul check-in pendant un save plan = perte de confiance immédiate.' },
      { title: 'J+30 — Bilan mi-parcours', desc: 'Mesurer les progrès objectivement : le Health Score a-t-il bougé ? Si oui → continuer. Si non → décision : escalade supplémentaire ou offboarding propre.', tips: ['Soyez honnête avec vous-même : est-ce qu\'on peut vraiment sauver ce compte ?'] },
      { title: 'J+45 — Conclusion', desc: 'Si Health Score > 60 → célébrer, planifier le QBR. Si Health Score < 40 malgré tout → offboarding propre : maintenir la relation, faciliter la transition, rester professionnel.', tips: ['Un offboarding propre = un client qui reviendra peut-être', 'Documenter les learnings pour les prochains save plans'] },
    ]
  },
  {
    id: 'p3', category: 'client', icon: '🔄', duration: '8 min',
    level: 'intermediate',
    title: 'Process renouvellement — J-90 à J0',
    desc: 'Ne plus jamais être surpris par un non-renouvellement — processus en 4 phases.',
    outcome: 'Taux de renouvellement > 90% avec expansion sur 30% des comptes renouvelés.',
    steps: [
      { title: 'J-90 — Lancement du processus', desc: 'Alerte automatique Scalyo. Vérifier : Health Score actuel, décideur renouvellement (peut avoir changé), budget client pour le prochain exercice fiscal.', warning: 'Si Health Score < 60 à J-90 : déclencher un save plan en parallèle.' },
      { title: 'J-60 — QBR de renouvellement', desc: 'Présenter le bilan de valeur délivrée (en €), les objectifs atteints, la roadmap du prochain cycle. Identifier et mentionner 1 opportunité d\'expansion. Ne pas parler du prix maintenant.', tips: ['Ce QBR est stratégique — impliquer votre manager pour les gros comptes'] },
      { title: 'J-45 — Envoi de la proposition', desc: 'Proposition 1 page : valeur délivrée résumée, nouveau cycle, tarif. Si expansion : présenter séparément comme une évolution naturelle. Délai de réflexion : 2 semaines.', tips: ['1 page maximum — au-delà ça ne se lit pas'] },
      { title: 'J-30 — Négociation', desc: 'Si pas de réponse : appel direct (pas email). Si objection prix : avoir une contrepartie prête (formation, support dédié, accès feature). Escalade manager si blocage.', warning: 'Ne jamais baisser le prix sans contrepartie — ça dévalue votre service.' },
      { title: 'J-7 — Closing', desc: 'Relance finale si pas de signature. Format : appel court, "Je voulais m\'assurer qu\'il n\'y avait pas de blocage de votre côté". Signature électronique envoyée avec deadline J0.', tips: ['La relance par appel = 3× plus efficace que l\'email à ce stade'] },
    ]
  },
  {
    id: 'p4', category: 'crisis', icon: '👤', duration: '5 min',
    level: 'expert',
    title: 'Process champion parti — remplacer en 30 jours',
    desc: 'Quand votre interlocuteur principal quitte l\'entreprise — les étapes pour ne pas perdre le compte.',
    outcome: 'Nouveau champion identifié et engagé dans les 30 jours.',
    steps: [
      { title: 'J+0 — Alerte immédiate', desc: 'Dès que vous apprenez le départ : email de congratulations sincère à l\'ancien champion (LinkedIn), alerte interne à votre manager, recherche du successeur potentiel.', tips: ['L\'ancien champion peut vous recommander son successeur — demandez-lui'] },
      { title: 'J+3 — Identifier le nouveau contact', desc: 'Qui reprend les missions ? Demander à l\'ancien champion OU contacter directement le DG/RH de l\'entreprise. Objectif : avoir un nom dans les 72h.', warning: 'Ne pas attendre qu\'ils vous contactent — soyez proactif.' },
      { title: 'J+7 — Premier appel avec le nouveau contact', desc: 'Introduction rapide. NE PAS faire de pitch produit. Questions : "Quel est votre contexte ?" / "Quelles sont vos priorités ?" / "Qu\'est-ce qui est important pour vous ?". Écouter.', tips: ['Ce call est un call de découverte, pas de défense du produit'] },
      { title: 'J+14 — Présentation de la valeur', desc: 'Second call avec bilan de valeur délivrée adapté à leurs priorités découvertes au J+7. Présenter avec leurs mots, pas les vôtres. Proposer une formation si nécessaire.', tips: ['Repartir de zéro dans la présentation — ne pas supposer qu\'ils savent tout'] },
      { title: 'J+30 — Engagement confirmé', desc: 'Le nouveau champion doit être engagé : au moins 1 session de travail commune, ses objectifs documentés dans Scalyo, prochain QBR planifié avec lui.', warning: 'Si aucun engagement après 30 jours : escalade immédiate — le compte est en danger.' },
    ]
  },
  {
    id: 'p5', category: 'growth', icon: '📈', duration: '8 min',
    level: 'intermediate',
    title: 'Process expansion revenue — identifier et proposer',
    desc: 'Comment détecter les opportunités d\'expansion et les convertir sans paraître commercial.',
    outcome: 'Expansion proposée au bon moment, avec un taux de conversion > 40%.',
    steps: [
      { title: 'Vérifier les prérequis', desc: 'Avant toute proposition d\'expansion : Health Score ≥ 7/10, NPS ≥ 7, au moins 6 mois de relation, ROI prouvé sur le périmètre actuel. Sans ces 4 critères : attendre.', warning: 'Une expansion proposée trop tôt détruit plus de relation qu\'elle n\'en crée.' },
      { title: 'Détecter le signal d\'expansion', desc: 'Signaux naturels : ils demandent "vous faites ça aussi ?", ils mentionnent un autre outil, ils recrutent dans l\'équipe, leur usage approche la limite du plan actuel.', tips: ['Ne pas forcer — attendre le signal. Il arrive toujours si le client est satisfait'] },
      { title: 'Discovery call expansion', desc: 'Call dédié de 30 min. Questions : "Comment se passe le déploiement ?" / "Qu\'est-ce que vous faites encore manuellement ?" / "Si vous pouviez changer 1 chose ?". Ne pas pitcher.', tips: ['Ce call est pour comprendre, pas pour vendre'] },
      { title: 'Calculer le ROI de l\'expansion', desc: 'Avant de proposer : calculer le ROI en € de ce que l\'expansion résoudrait. Si vous ne pouvez pas le calculer, votre proposition ne sera pas convaincante.', tips: ['Utiliser leurs chiffres, pas des estimations sectorielles'] },
      { title: 'Proposition ciblée', desc: 'Email 1 page : problème identifié pendant le call, solution, ROI estimé. Pas de catalogue, pas de tarif dans l\'email — inviter à un call de 30 min pour en parler.', tips: ['Faire référence à leurs mots exacts du discovery call'] },
      { title: 'Follow-up sans pression', desc: 'Si pas de réponse après 1 semaine : 1 relance max. "Pas de pression de ma part — si ce n\'est pas le bon moment, on peut en reparler dans 3 mois." Et respecter ce délai.', warning: 'Relancer plus de 2 fois = pression = destruction de la relation.' },
    ]
  },
  {
    id: 'p6', category: 'organization', icon: '📅', duration: '5 min',
    level: 'beginner',
    title: 'Organisation hebdomadaire — le rituel du CSM performant',
    desc: 'Comment structurer sa semaine pour ne rien manquer et garder la tête hors de l\'eau.',
    outcome: 'Zéro surprise, zéro urgence non anticipée, chaque client suivi au bon rythme.',
    steps: [
      { title: 'Lundi matin — Review Scalyo (15 min)', desc: 'Scanner le dashboard : quels comptes ont bougé ? Quelles alertes ? Quels renouvellements dans les 90 jours ? Définir les 3 priorités de la semaine.', tips: ['Bloquer ce créneau dans l\'agenda — c\'est non-négociable'] },
      { title: 'Lundi → Mercredi — Calls et check-ins', desc: 'Concentrer les calls clients en début de semaine. Préparer chaque call 10 minutes avant : métriques, dernière interaction, objectif du call.', tips: ['Un call sans objectif = un call inutile'] },
      { title: 'Jeudi — Tâches internes et documentation', desc: 'Mise à jour de Scalyo, réponse aux emails non-urgents, préparation des QBRs à venir. Pas de calls si possible — temps de concentration.', warning: 'La documentation faite le jour même = 10× plus rapide que le vendredi.' },
      { title: 'Vendredi — Review et planning', desc: '30 minutes de review : les 3 priorités ont-elles été faites ? Qu\'est-ce qui a été reporté et pourquoi ? Planning de la semaine suivante.', tips: ['Finir la semaine avec Scalyo à jour = un week-end sans culpabilité'] },
    ]
  },,
  // ===== ONBOARDING STARTER (visible par tous) =====
  {
    id: 'ob1', category: 'onboarding', icon: '🎉', duration: '5 min',
    level: 'beginner', plan: 'starter',
    title: 'Premier pas — Créer votre premier client',
    desc: '4 champs, 30 secondes. Votre portefeuille démarre ici.',
    outcome: 'Votre premier client est vivant dans Scalyo avec un Health Score initial.',
    steps: [
      { title: 'Ouvrir le Portefeuille', desc: 'Sidebar → Portefeuille → + Nouveau client', tip: 'Commencez par vos 3 clients les plus importants, pas les 50.' },
      { title: 'Remplir les infos', desc: 'Nom, contact principal, ARR, date de renouvellement. Le Health Score démarre à 5/10.', tip: '' },
      { title: 'Enregistrer', desc: 'Cliquez Enregistrer. Votre client apparaît dans le Dashboard.', tip: 'Ajoutez un maximum de 3 clients pour commencer, maîtrisez l\'outil, puis importez le reste.' }
    ]
  },
  {
    id: 'ob2', category: 'onboarding', icon: '📊', duration: '2 min',
    level: 'beginner', plan: 'starter',
    title: 'Votre Dashboard en 30 secondes',
    desc: 'Les 4 chiffres qui comptent. Chaque matin. Sans Excel.',
    outcome: 'Vous savez lire votre Dashboard et réagir aux signaux.',
    steps: [
      { title: 'ARR Portfolio', desc: 'Combien vos clients vous rapportent au total.', tip: 'S'il baisse, un client est parti.' },
      { title: 'Santé moyenne', desc: 'Score de 0 à 10 de tous vos clients. Sous 7 = attention.', tip: '' },
      { title: 'Comptes critiques', desc: 'Nombre de clients en danger. Au-dessus de 0 = agissez.', tip: '' },
      { title: 'Roadmap 90 jours', desc: 'Les renouvellements qui arrivent. Préparez-vous 30 jours avant.', tip: 'Ouvrez Scalyo chaque matin : 30 secondes pour savoir où vous en êtes.' }
    ]
  },
  {
    id: 'ob3', category: 'onboarding', icon: '✅', duration: '2 min',
    level: 'beginner', plan: 'starter',
    title: 'Task Board — Vos premières tâches',
    desc: 'Un CSM organisé est un CSM qui garde ses clients.',
    outcome: '3 tâches créées, votre organisation CS démarre.',
    steps: [
      { title: 'Créer une tâche', desc: 'Task Board → + Nouvelle tâche. Titre, priorité, échéance, client lié.', tip: '' },
      { title: 'Vue Kanban', desc: 'Glissez-déposez entre les colonnes : A faire → En cours → Terminé.', tip: '' },
      { title: '3 tâches pour démarrer', desc: 'Check-in client principal (3j), Préparer renouvellement (30j), Envoyer NPS (fin de mois).', tip: 'Créez-les maintenant. 1 minute. Peut sauver un client demain.' }
    ]
  },
  {
    id: 'ob4', category: 'onboarding', icon: '📧', duration: '2 min',
    level: 'beginner', plan: 'starter',
    title: 'Email Studio — Templates CS',
    desc: 'Des templates d\'emails CS prêts à l\'emploi. Copiez. Collez. Envoyez.',
    outcome: 'Vous savez utiliser les templates email et les personnaliser.',
    steps: [
      { title: 'Choisir un template', desc: 'Email Studio → parcourez : bienvenue, check-in, relance, QBR, renouvellement.', tip: '' },
      { title: 'Personnaliser', desc: 'Changez le nom du client, ajoutez un détail personnel.', tip: 'Un email générique, ça se voit. Un email personnalisé, ça se sent.' },
      { title: 'Copier et envoyer', desc: 'Cliquez Copier → collez dans Gmail/Outlook. L'envoi direct est réservé au plan Elite.', tip: '' }
    ]
  },
  // ===== ONBOARDING GROWTH (visible Growth + Elite) =====
  {
    id: 'ob5', category: 'onboarding', icon: '📥', duration: '3 min',
    level: 'beginner', plan: 'growth',
    title: 'Import CSV/Excel — 200 clients en 2 minutes',
    desc: 'Glissez votre fichier. Scalyo fait le reste.',
    outcome: 'Votre portefeuille complet est importé dans Scalyo.',
    steps: [
      { title: 'Déposer le fichier', desc: 'Import → glissez votre CSV ou Excel dans la zone.', tip: 'Importez d\'abord 5-10 clients pour tester.' },
      { title: 'Vérifier le mapping', desc: 'Scalyo détecte les colonnes automatiquement : nom, email, ARR, renouvellement.', tip: 'Pas de colonne Health Score ? Tous les clients démarrent à 5/10.' },
      { title: 'Importer', desc: 'Cliquez Importer. C'est fait.', tip: '' }
    ]
  },
  {
    id: 'ob6', category: 'onboarding', icon: '✨', duration: '2 min',
    level: 'beginner', plan: 'growth',
    title: 'Email Studio IA — Génération automatisée',
    desc: 'Dites ce que vous voulez. Scalyo l\'écrit pour vous.',
    outcome: 'Vous savez générer du contenu email adapté à chaque client.',
    steps: [
      { title: 'Choisir un template', desc: 'Email Studio → choisissez le type d\'email.', tip: '' },
      { title: 'Génération IA', desc: 'Le contenu est généré et adapté au contexte de votre client.', tip: 'Relisez toujours avant d\'envoyer. L'IA est un assistant, pas un remplaçant.' },
      { title: 'Personnaliser et copier', desc: 'Ajoutez votre touche personnelle, puis copiez-collez.', tip: '' }
    ]
  },
  {
    id: 'ob7', category: 'onboarding', icon: '📖', duration: '3 min',
    level: 'intermediate', plan: 'growth',
    title: 'Playbooks manuels — Vos premières règles',
    desc: 'Créez des règles de surveillance. Déclenchez-les d\'un clic.',
    outcome: 'Votre première règle playbook est active.',
    steps: [
      { title: 'Créer une règle', desc: 'Playbooks → + Nouvelle règle. Nom, déclencheur, seuil, action.', tip: '' },
      { title: 'Les 4 déclencheurs', desc: 'Health < seuil, Renouvellement dans X jours, NPS < seuil, Churn > seuil.', tip: 'Commencez par "Health sous 60" — c\'est le plus utile.' },
      { title: 'Tester manuellement', desc: 'Cliquez "Tester maintenant" pour scanner votre portefeuille. Les tâches sont créées automatiquement.', tip: 'Le mode automatique (24/7) est disponible sur le plan Elite.' }
    ]
  },
  // ===== ONBOARDING ELITE (visible Elite uniquement) =====
  {
    id: 'ob8', category: 'onboarding', icon: '📬', duration: '3 min',
    level: 'beginner', plan: 'elite',
    title: 'Connecter Resend — 3 étapes, 3 minutes',
    desc: 'Activez l\'envoi d\'emails réels depuis Scalyo.',
    outcome: 'Votre compte Resend est connecté. Vous pouvez envoyer.',
    steps: [
      { title: 'Créer un compte Resend', desc: 'Allez sur resend.com/signup. Email + mot de passe. Aucune carte bancaire. 30 secondes.', tip: '3 000 emails/mois gratuits inclus par Resend.' },
      { title: 'Récupérer la clé API', desc: 'resend.com/api-keys → Create API Key → Full access → Copiez la clé (re_...).', tip: '' },
      { title: 'Coller dans Scalyo', desc: 'Email Studio → Envoyer → le wizard s\'ouvre → collez la clé → Tester la connexion → Validé.', tip: 'Besoin d\'aide ? Contactez support@scalyo.app pour un accompagnement en 15 min.' }
    ]
  },
  {
    id: 'ob9', category: 'onboarding', icon: '🚀', duration: '2 min',
    level: 'beginner', plan: 'elite',
    title: 'Premier email réel + tracking',
    desc: 'Envoyez. Trackez. Savez qui ouvre.',
    outcome: 'Votre premier email est envoyé et tracké.',
    steps: [
      { title: 'Choisir et personnaliser', desc: 'Email Studio → template Check-in → personnalisez.', tip: 'Testez d\'abord sur votre propre adresse email.' },
      { title: 'Envoyer', desc: 'Cliquez Envoyer → adresse destinataire → nom d\'expéditeur → Envoyer.', tip: '' },
      { title: 'Vérifier le tracking', desc: 'Onglet Historique : envoyé ✅ / ouvert 👀 / pas encore ouvert ⏳. Visez > 50% de taux d\'ouverture.', tip: 'Le tracking détecte l\'ouverture, pas la lecture. Certains clients email bloquent les pixels.' }
    ]
  },
  {
    id: 'ob10', category: 'onboarding', icon: '⚡', duration: '3 min',
    level: 'intermediate', plan: 'elite',
    title: 'Playbooks automatiques — Scalyo surveille pour vous',
    desc: 'Le game changer. Scalyo détecte les risques 24/7 et crée les tâches tout seul.',
    outcome: 'Vos règles tournent en continu. Vous n\'intervenez que quand c\'est nécessaire.',
    steps: [
      { title: 'Créer vos 3 règles essentielles', desc: 'Health sous 60 (haute, 3j, cooldown 7j), Renouvellement dans 30j (haute, 5j, cooldown 30j), NPS sous 7 (moyenne, 5j, cooldown 14j).', tip: 'Ces 3 règles couvrent 90% des risques.' },
      { title: 'Activer le mode automatique', desc: 'Vos règles sont en mode auto : Scalyo scanne votre portefeuille en continu.', tip: '' },
      { title: 'Vérifier l\'historique', desc: 'Playbooks → Historique : chaque déclenchement est loggé avec le client, le trigger, et l\'action.', tip: 'Argument investisseur : "Scalyo dit attention, tu vas perdre ce client" = ROI immédiat.' }
    ]
  },
  // ===== INTEGRATIONS (visible par tous) =====
  {
    id: 'int1', category: 'integrations', icon: '🔗', duration: '2 min',
    level: 'beginner', plan: 'all',
    title: 'Intégrations disponibles',
    desc: 'Connecter Scalyo à vos outils existants.',
    outcome: 'Vous savez quelles intégrations sont disponibles et comment les configurer.',
    steps: [
      { title: 'Resend (Elite)', desc: 'Service d\'envoi d\'emails. Créez un compte gratuit sur resend.com, récupérez votre clé API, collez dans Settings.', tip: '3 000 emails/mois gratuits. Au-delà : $0,80/1 000 emails facturés par Resend.' },
      { title: 'Chat interne', desc: 'Déjà intégré dans Scalyo. 3 channels par défaut : général, cs-team, alertes. Messages en temps réel.', tip: '' },
      { title: 'Prochainement', desc: 'Slack, HubSpot/Salesforce, Intercom/Zendesk, Google Calendar, Zapier/Make. Contactez support@scalyo.app pour prioriser.', tip: '' }
    ]
  },
  // ===== MANAGEMENT CS — GROWTH+ =====
  {
    id: 'mg1', category: 'management', icon: '🗣', duration: '8 min',
    level: 'intermediate', plan: 'growth',
    title: 'Communication transverse — CS × Sales × Produit',
    desc: 'Comment collaborer avec les autres équipes sans friction ni perte d’information.',
    outcome: 'Un framework de communication inter-équipes que votre équipe peut appliquer dès demain.',
    steps: [
      { title: 'Identifier vos interlocuteurs clés', desc: 'Cartographiez qui parle à qui entre CS, Sales, Produit et Support. Chaque équipe a un point de contact principal.', tip: 'Un Slack/channel dédié par sujet (pas un channel fourre-tout) réduit le bruit de 60%.' },
      { title: 'Le rituel hebdo 15 min', desc: 'Un stand-up cross-équipes de 15 min le lundi : CS partage les comptes à risque, Sales partage les deals en cours, Produit partage les releases.', tip: '15 min max. Pas de PowerPoint. Tour de table debout.' },
      { title: 'Le document partagé de handoff', desc: 'Quand Sales signe un client, un document structuré est transmis au CS : attentes, promesses faites, contacts clés, délais.', tip: 'Le pire ennemi du CS : les promesses de Sales dont personne ne parle.' },
      { title: 'Feedback loop Produit', desc: 'Chaque mois, envoyez au Produit les 3 features les plus demandées par vos clients. Pas 30 — juste 3. Avec des vrais verbatims.', tip: 'Un verbatim client vaut 100 tickets Jira.' }
    ]
  },
  {
    id: 'mg2', category: 'management', icon: '🌍', duration: '10 min',
    level: 'intermediate', plan: 'growth',
    title: 'Manager une équipe CS à distance',
    desc: 'Rituels, check-ins et feedback constructif pour une équipe distribuée qui performe.',
    outcome: 'Un système de management à distance structuré et humain.',
    steps: [
      { title: 'Les 3 rituels non négociables', desc: 'Lundi : stand-up équipe 15 min (objectifs semaine). Mercredi : 1:1 avec chaque CSM 20 min (blocages + moral). Vendredi : célébration équipe 10 min (victoires de la semaine).', tip: 'Ne jamais annuler le 1:1. C’est le moment où les vrais problèmes remontent.' },
      { title: 'Le feedback constructif', desc: 'Utilisez le modèle SBI : Situation (quand), Behavior (ce que tu as fait), Impact (l’effet). Jamais de jugement de personne — toujours des faits.', tip: 'Un bon feedback commence par "J’ai observé que..." jamais par "Tu es..."' },
      { title: 'Détecter la surcharge à distance', desc: 'Les signaux : réponses plus courtes, caméra désactivée, retards répétés. Utilisez le module Bien-être de Scalyo pour tracker.', tip: 'Demandez "Comment tu vas vraiment ?" — pas "Tout va bien ?"' },
      { title: 'Créer de la cohésion', desc: 'Un rituel mensuel informel : café virtuel, quiz, partage de lecture. L’humain d’abord, le travail ensuite.', tip: '' }
    ]
  },
  {
    id: 'mg3', category: 'management', icon: '📊', duration: '12 min',
    level: 'intermediate', plan: 'growth',
    title: 'Préparer et animer un QBR parfait',
    desc: 'Le Quarterly Business Review de A à Z — structure, données, questions, suivi.',
    outcome: 'Un template QBR prêt à l’emploi + la méthode pour que le client en redemande.',
    steps: [
      { title: 'J-14 : collecter les données', desc: 'Utilisez Scalyo pour extraire : Health Score, évolution ARR, tickets ouverts, NPS, adoption des features. Pas de données = pas de QBR.', tip: 'Un QBR sans chiffres, c’est une conversation. Un QBR avec chiffres, c’est une décision.' },
      { title: 'J-7 : structurer la présentation', desc: '4 slides max : Résultats (ce qu’on a fait), Valeur (ce que ça a rapporté), Défis (ce qui bloque), Prochaines étapes (ce qu’on va faire).', tip: 'Le client ne veut pas un rapport — il veut savoir si son investissement est rentable.' },
      { title: 'Jour J : l’animation', desc: 'Règle des 50/50 : vous parlez 50% du temps, le client parle 50%. Posez des questions ouvertes : "Qu’est-ce qui a le plus d’impact pour vous ?"', tip: 'Si le client ne parle pas, votre QBR est un monologue. Changez de méthode.' },
      { title: 'J+1 : le suivi', desc: 'Email récap dans les 24h avec les actions, les propriétaires, les deadlines. Créez les tâches dans Scalyo immédiatement.', tip: 'Un QBR sans suivi est un QBR oublié dans 48h.' }
    ]
  },
  // ===== EXCELLENCE — ELITE =====
  {
    id: 'ex1', category: 'excellence', icon: '🤝', duration: '12 min',
    level: 'expert', plan: 'elite',
    title: 'Négociation de renouvellement',
    desc: 'Le renouvellement ne se joue pas le jour de la signature. Il se prépare 90 jours avant.',
    outcome: 'Un framework de préparation qui maximise le taux de renouvellement.',
    steps: [
      { title: 'J-90 : audit du compte', desc: 'Analysez l’usage réel, les features utilisées, la satisfaction des utilisateurs clés. Identifiez le ROI concret que le client a obtenu.', tip: 'Si vous ne pouvez pas prouver le ROI, le client ne renouvellera pas.' },
      { title: 'J-60 : multi-thread', desc: 'Ne dépendez jamais d’un seul interlocuteur. Assurez-vous d’avoir une relation avec le sponsor économique, l’utilisateur principal, ET le décideur.', tip: 'Si votre seul contact quitte l’entreprise, votre renouvellement est en danger.' },
      { title: 'J-30 : présenter la valeur', desc: 'Organisez un "Business Review" ciblé renouvellement : résultats obtenus, ROI prouvé, feuille de route pour la période suivante.', tip: 'Chiffrez toujours : "Nous avons réduit votre churn de 12% — soit 180K€ de revenus protégés."' },
      { title: 'Les objections fréquentes', desc: '"C’est trop cher" → comparez au coût du churn sans solution. "On n’utilise pas tout" → proposez un plan d’adoption des features sous-utilisées. "On veut voir les alternatives" → respectez, proposez un pilot comparatif.', tip: 'Ne bradez jamais votre prix. Négociez de la valeur ajoutée, pas des remises.' }
    ]
  },
  {
    id: 'ex2', category: 'excellence', icon: '📈', duration: '10 min',
    level: 'expert', plan: 'elite',
    title: 'Expansion de compte — Upsell & Cross-sell',
    desc: 'Comment faire grandir un compte sans devenir un vendeur. L’expansion naturelle.',
    outcome: 'Vous savez identifier les signaux d’expansion et positionner la valeur.',
    steps: [
      { title: 'Les 5 signaux d’expansion', desc: '1) Usage en croissance. 2) Demande de features premium. 3) Ajout d’utilisateurs. 4) Sponsor qui monte en grade. 5) Le client vous recommande.', tip: 'L’expansion se détecte — elle ne se force pas.' },
      { title: 'Le bon timing', desc: 'Après une victoire (un problème résolu, un QBR positif, un NPS élevé). Jamais quand le client est en crise ou insatisfait.', tip: 'La meilleure phrase : "D’autres équipes chez vous pourraient bénéficier de ce qu’on fait ensemble ?"' },
      { title: 'Positionner sans vendre', desc: 'Partagez un cas d’usage d’un client similaire qui a étendu. Montrez l’impact, pas le prix. Laissez le client demander.', tip: 'Le CS qui vend le mieux est celui qui ne vend pas — il recommande.' },
      { title: 'Collaborer avec Sales', desc: 'Préparez un brief pour Sales avec le contexte, les besoins identifiés, les contacts. Vous introduisez, Sales conclut. Rôles clairs.', tip: 'Votre rôle : ouvrir la porte. Le rôle de Sales : signer. Ne mélangez pas.' }
    ]
  },
  {
    id: 'ex3', category: 'excellence', icon: '🚨', duration: '10 min',
    level: 'expert', plan: 'elite',
    title: 'Gestion de crise client — Le framework CARE',
    desc: 'Quand un client est en colère, la vitesse et la méthode font la différence.',
    outcome: 'Un process d’escalade structuré que toute l’équipe peut suivre sous pression.',
    steps: [
      { title: 'C — Contenir', desc: 'Première réponse en moins de 2h. Accusez réception, montrez que vous prenez au sérieux. Pas de solution encore — de l’empathie.', tip: '"Je comprends que c’est frustrant. Je prends personnellement en charge votre dossier."' },
      { title: 'A — Analyser', desc: 'Identifiez la cause racine en interne AVANT de répondre. Parlez aux équipes techniques, support, produit. Ne spéculez jamais devant le client.', tip: 'Un client pardonne un problème. Il ne pardonne pas un mensonge.' },
      { title: 'R — Résoudre', desc: 'Proposez une solution concrète avec un calendrier précis. "Nous corrigeons d’ici mercredi" — pas "on va regarder".', tip: 'Sous-promettez, sur-délivrez. Si vous dites mercredi, livrez mardi.' },
      { title: 'E — Évaluer', desc: '72h après la résolution : appelez le client. "Est-ce que tout fonctionne comme prévu ?" Documentez l’incident pour éviter la répétition.', tip: 'Un client bien géré en crise devient souvent votre meilleur ambassadeur.' }
    ]
  },
  {
    id: 'ex4', category: 'excellence', icon: '🎯', duration: '10 min',
    level: 'expert', plan: 'elite',
    title: 'Présenter au C-Level — L’art du storytelling CS',
    desc: 'Comment présenter des résultats CS à un comité de direction en 15 minutes.',
    outcome: 'Un format de présentation C-Level que vous réutilisez chaque trimestre.',
    steps: [
      { title: 'La règle des 3 slides', desc: 'Slide 1 : Le chiffre qui compte (NRR, churn évité, ARR protégé). Slide 2 : Ce qu’on a fait (3 actions max). Slide 3 : Ce qu’on demande (budget, ressources, décision).', tip: 'Un C-Level lit un email en 11 secondes. Votre slide doit se lire en 5.' },
      { title: 'Parler en argent', desc: 'Ne dites pas "le NPS est à 42". Dites "notre NPS de 42 corrèle avec un taux de renouvellement de 94% — soit 2.1M€ d’ARR protégé."', tip: 'Le C-Level ne comprend qu’un seul langage : l’impact financier.' },
      { title: 'Anticiper les questions', desc: 'Préparez des réponses pour : "Pourquoi ce client a churné ?", "Quel est le coût d’acquisition vs rétention ?", "Quel ROI de l’équipe CS ?"', tip: '' },
      { title: 'Le suivi immédiat', desc: 'Envoyez un one-pager dans l’heure après la présentation. 3 paragraphes max. Les décisions, les actions, les deadlines.', tip: 'Un CEO ne revient pas chercher votre deck. Votre one-pager est tout ce qui reste.' }
    ]
  },
  {
    id: 'ex5', category: 'excellence', icon: '📊', duration: '15 min',
    level: 'expert', plan: 'elite',
    title: 'KPIs avancés — Les métriques qui comptent vraiment',
    desc: 'Au-delà du NPS et du churn : les KPIs que les meilleurs Head of CS suivent.',
    outcome: 'Vous savez calculer et interpréter les KPIs qui pilotent une stratégie CS de classe mondiale.',
    steps: [
      { title: 'NRR (Net Revenue Retention)', desc: 'La métrique reine. NRR = (ARR début + expansion - contraction - churn) / ARR début. Au-dessus de 110% = excellence. En dessous de 90% = problème structurel.', tip: 'Un NRR > 120% veut dire que vos clients existants génèrent plus de revenus que ce que vous perdez.' },
      { title: 'Time to Value (TTV)', desc: 'Combien de temps entre la signature et le premier "aha moment" du client. Les meilleurs CS réduisent le TTV de 60 à 14 jours.', tip: 'Chaque jour entre la signature et la valeur est un jour où le client peut regretter.' },
      { title: 'Logo Retention vs Revenue Retention', desc: 'Logo = combien de clients vous gardez. Revenue = combien d’argent vous gardez. Les deux sont importants mais racontent des histoires différentes.', tip: 'Perdre 10 petits clients ≠ perdre 1 gros client. Segmentez toujours.' },
      { title: 'Health Score Predictive', desc: 'Votre Health Score prédit-il vraiment le churn ? Backtestez : parmi les clients qui ont churné les 12 derniers mois, quel était leur Health Score 90 jours avant ?', tip: 'Si votre Health Score ne prédit pas le churn, il ne sert à rien. Recalibrez.' }
    ]
  },
  {
    id: 'ex6', category: 'excellence', icon: '🧩', duration: '10 min',
    level: 'expert', plan: 'elite',
    title: 'Segmentation de portefeuille — Le bon CSM au bon client',
    desc: 'Comment allouer le temps de votre équipe pour maximiser le ROI de chaque interaction.',
    outcome: 'Un modèle de segmentation actionnable pour toute équipe CS.',
    steps: [
      { title: 'Les 3 niveaux', desc: 'High-touch (vos top 20% en ARR) : 1 CSM dédié, QBR trimestriel, check-in hebdo. Mid-touch (60%) : CSM partagé, check-in mensuel, playbooks. Tech-touch (20%) : automatisé, emails, in-app, self-service.', tip: 'La règle de Pareto s’applique : 20% de vos clients génèrent 80% de votre ARR.' },
      { title: 'Critères de segmentation', desc: 'ARR seul ne suffit pas. Combinez : ARR + potentiel d’expansion + complexité technique + risque de churn. Un petit client strateg’ique vaut un gros client stable.', tip: '' },
      { title: 'Le ratio CSM/clients', desc: 'High-touch : 1 CSM pour 10-15 comptes. Mid-touch : 1 CSM pour 30-50 comptes. Tech-touch : 1 CSM pour 200+ comptes (avec automatisation Scalyo).', tip: 'Si vos CSMs gèrent plus de 50 comptes en high-touch, ils ne font du high-touch pour personne.' },
      { title: 'Réviser tous les trimestres', desc: 'Un client peut changer de segment : expansion → monte en high-touch. Désengagement → descend en tech-touch pour libérer du temps CSM.', tip: 'La segmentation n’est pas un dogme. C’est un outil de priorisation.' }
    ]
  },
  {
    id: 'ex7', category: 'excellence', icon: '💰', duration: '15 min',
    level: 'expert', plan: 'elite',
    title: 'Construire le business case du Customer Success',
    desc: 'Comment prouver le ROI de votre équipe CS à la direction. Le contenu que les Head of CS cherchent partout.',
    outcome: 'Un business case chiffré qui justifie chaque euro investi dans votre équipe CS.',
    steps: [
      { title: 'Le coût du churn', desc: 'Calculez : nombre de clients perdus × ARR moyen = revenus perdus. Ajoutez le coût d’acquisition d’un nouveau client pour remplacer (généralement 5-7x le coût de rétention).', tip: 'La phrase qui fait mouche : "Il coûte 7x plus cher d’acquérir un client que de le garder."' },
      { title: 'Le ROI du CS', desc: 'Formule : (Revenus protégés par le CS + Expansion générée par le CS) / Coût total de l’équipe CS. Un ratio > 5x est excellent. > 10x est exceptionnel.', tip: 'Un bon Head of CS prouve que son équipe rapporte 10€ pour chaque 1€ dépensé.' },
      { title: 'Les métriques de présentation', desc: 'Churn évité (en €), NRR (en %), expansion générée (en €), Time to Value réduit (en jours), NPS amélioré (en points). Toujours en euros ou en pourcentage — jamais en "nombre de tickets résolus".', tip: 'Le CFO ne comprend pas les tickets. Il comprend les euros.' },
      { title: 'Demander des ressources', desc: 'Structure : "Avec 1 CSM supplémentaire (à X€/an), nous pouvons passer Y comptes de tech-touch à mid-touch, ce qui réduira le churn de Z% et protégera W€ d’ARR."', tip: 'Ne demandez pas un budget. Proposez un investissement avec un retour chiffré.' },
      { title: 'L’argument ultime', desc: 'Montrez la corrélation entre Health Score et renouvellement sur vos propres données. "Les clients avec un Health Score > 7 renouvellent à 96%. Ceux sous 5 renouvellent à 34%. Chaque point de Health Score vaut X€."', tip: 'C’est l’argument que personne ne peut contester — ce sont VOS données, pas une étude externe.' }
    ]
  }
]

const filteredProcesses = computed(() => {
  const planOrder = ['starter', 'growth', 'elite']
  const userIdx = planOrder.indexOf(plan.value)
  const visible = processes.filter(p => {
    if (!p.plan || p.plan === 'all') return true
    const pIdx = planOrder.indexOf(p.plan)
    return pIdx <= userIdx
  })
  return activeTab.value === 'all' ? visible : visible.filter(p => p.category === activeTab.value)
})

function levelLabel(l) {
  return l === 'beginner' ? '🟢 Débutant' : l === 'intermediate' ? '🟡 Intermédiaire' : '🔴 Expert'
}
</script>

<style scoped>
.gv { max-width: 900px; }
.gv-header { margin-bottom: 24px; }
.gv-header h1 { font-size: 1.5rem; font-weight: 800; margin-bottom: 4px; }
.gv-header p { font-size: 0.85rem; color: var(--text-secondary); }

.gv-tabs { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 24px; }
.gv-tab { background: var(--bg); border: none; padding: 7px 16px; border-radius: 8px; font-size: 0.78rem; font-weight: 500; color: var(--text-muted); cursor: pointer; transition: all 0.15s; }
.gv-tab.active { background: var(--purple-bg); color: var(--purple); font-weight: 600; }
.gv-tab:hover:not(.active) { background: var(--bg-hover); }

.gv-list { display: flex; flex-direction: column; gap: 12px; }
.gv-card { background: #fff; border: 1px solid var(--border); border-radius: 12px; overflow: hidden; transition: all 0.2s; }
.gv-card:hover { box-shadow: var(--shadow-sm); }
.gv-card.open { border-color: var(--purple-border); }

.gv-card-header { display: flex; align-items: flex-start; justify-content: space-between; padding: 20px; cursor: pointer; transition: background 0.15s; gap: 16px; }
.gv-card-header:hover { background: var(--bg-hover); }
.gv-card-left { display: flex; gap: 14px; flex: 1; min-width: 0; }
.gv-icon { font-size: 1.8rem; flex-shrink: 0; }
.gv-card-left strong { font-size: 0.95rem; font-weight: 700; display: block; margin-bottom: 4px; }
.gv-card-left p { font-size: 0.78rem; color: var(--text-secondary); line-height: 1.5; margin-bottom: 8px; }
.gv-meta { display: flex; gap: 8px; flex-wrap: wrap; align-items: center; }
.gv-steps-count { font-size: 0.65rem; background: var(--purple-bg); color: var(--purple); padding: 2px 8px; border-radius: 4px; font-weight: 600; }
.gv-time { font-size: 0.65rem; color: var(--text-muted); }
.gv-level { font-size: 0.65rem; color: var(--text-muted); }
.gv-chev { font-size: 0.85rem; color: var(--text-muted); flex-shrink: 0; margin-top: 4px; }

.gv-steps { border-top: 1px solid var(--border-light); padding: 20px 24px; display: flex; flex-direction: column; gap: 0; }
.gv-step { display: flex; gap: 16px; padding: 16px 0; border-bottom: 1px solid var(--border-light); position: relative; }
.gv-step:last-child { border-bottom: none; }
.gv-step-num { width: 32px; height: 32px; border-radius: 50%; background: var(--purple); color: #fff; font-size: 0.82rem; font-weight: 700; display: flex; align-items: center; justify-content: center; flex-shrink: 0; margin-top: 2px; }
.gv-step-body { flex: 1; }
.gv-step-body strong { font-size: 0.9rem; display: block; margin-bottom: 6px; }
.gv-step-body p { font-size: 0.82rem; color: var(--text-secondary); line-height: 1.65; margin-bottom: 8px; }
.gv-step-tips { display: flex; flex-direction: column; gap: 4px; margin-bottom: 6px; }
.gv-tip { font-size: 0.75rem; color: #92400e; background: #fef3c7; padding: 4px 10px; border-radius: 6px; }
.gv-step-warning { font-size: 0.75rem; color: #991b1b; background: #fee2e2; padding: 6px 12px; border-radius: 6px; }

.gv-outcome { margin-top: 12px; padding: 14px 16px; background: #d1fae5; border-radius: 8px; font-size: 0.82rem; color: #065f46; }
.gv-outcome span { font-weight: 700; }

@media (max-width: 768px) { .gv-card-left { flex-direction: column; } }
</style>
