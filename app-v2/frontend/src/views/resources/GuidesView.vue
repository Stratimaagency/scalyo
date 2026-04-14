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

const { t } = useI18n({ useScope: 'global' })
const activeTab = ref('all')
const openId = ref(null)

const categories = [
  { key: 'all', icon: '🗂', label: 'Tous' },
  { key: 'client', icon: '👤', label: 'Gestion client' },
  { key: 'crisis', icon: '🚨', label: 'Situations de crise' },
  { key: 'growth', icon: '📈', label: 'Croissance' },
  { key: 'organization', icon: '📅', label: 'Organisation' },
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
  },
]

const filteredProcesses = computed(() =>
  activeTab.value === 'all'
    ? processes
    : processes.filter(p => p.category === activeTab.value)
)

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
