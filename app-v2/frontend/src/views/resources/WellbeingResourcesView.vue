<template>
  <div class="wbr-view">
    <div class="wbr-header">
      <h1>💚 {{ t('nav.wellbeing') }}</h1>
      <p>{{ t('nav.wellbeingSub') }}</p>
      <span class="wbr-season">{{ currentQuarterLabel }}</span>
    </div>

    <!-- Cards bien-être -->
    <div class="wbr-grid">
      <div v-for="card in currentTips" :key="card.title"
           class="wbr-card" :class="'wbr-' + card.color">
        <span class="wbrc-icon">{{ card.icon }}</span>
        <h3>{{ card.title }}</h3>
        <p>{{ card.desc }}</p>
        <ul>
          <li v-for="tip in card.tips" :key="tip">{{ tip }}</li>
        </ul>
      </div>
    </div>

    <!-- Lecture du moment -->
    <div class="wbr-books">
      <div class="wbr-books-header">
        <div>
          <h2>📚 {{ t('wbr_readings') }}</h2>
          <span class="wbr-refresh-note">✨ {{ t('wbr_refresh_note') }}</span>
        </div>
      </div>
      <div class="wbr-book-grid">
        <div v-for="book in currentBooks" :key="book.title" class="wbr-book">
          <div class="wbr-book-cover" :style="{ background: book.color }">
            {{ book.emoji }}
          </div>
          <div class="wbr-book-info">
            <strong>{{ book.title }}</strong>
            <span class="wbrb-author">{{ book.author }}</span>
            <p class="wbrb-why">{{ book.why }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Citation du trimestre -->
    <div class="wbr-quote">
      <div class="wbr-quote-mark">"</div>
      <p>{{ currentQuote.text }}</p>
      <span>— {{ currentQuote.author }}</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
const { t } = useI18n({ useScope: 'global' })

const currentQuarter = computed(() => {
  const month = new Date().getMonth()
  if (month < 3) return 0
  if (month < 6) return 1
  if (month < 9) return 2
  return 3
})

const quarterLabels = ['🌱 Q1 — Nouveau départ', '☀️ Q2 — En plein mouvement', '🍂 Q3 — Récolter ce qu\'on a semé', '❄️ Q4 — Ralentir pour mieux repartir']
const currentQuarterLabel = computed(() => quarterLabels[currentQuarter.value])

const allTips = [
  // Q1
  [
    { icon: '🌱', title: 'Réinitialiser ses rituels', color: 'green', desc: 'Début d\'année = moment idéal pour installer de nouvelles habitudes.', tips: ['5 min de respiration avant le premier call de la journée', 'Journal de gratitude le vendredi soir : 3 choses qui ont bien marché', 'Planifier ses vacances du trimestre dès janvier — les anticiper aide'] },
    { icon: '🔥', title: 'Énergie de janvier : attention au surmenage', color: 'red', desc: 'La motivation de début d\'année peut mener au surmenage dès février.', tips: ['Ne pas tout changer en même temps — 1 nouvelle habitude par mois max', 'Surveiller les signaux précoces : irritabilité, manque de plaisir, fatigue dès le lundi', '"Non" est une phrase complète — refuser des réunions non-essentielles'] },
    { icon: '💬', title: 'Communication claire dès le départ', color: 'blue', desc: 'Poser des attentes claires en début d\'année évite les frustrations de fin.', tips: ['Revoir avec chaque client ses objectifs pour l\'année', 'Clarifier votre propre disponibilité : heures de réponse, canaux préférés', 'Reformuler chaque demande avant d\'agir : "si je comprends bien, vous souhaitez..."'] },
    { icon: '⚖️', title: 'Établir les frontières de l\'année', color: 'purple', desc: 'Janvier est le meilleur moment pour (re)poser des limites saines.', tips: ['Bloquer 1h de deep work chaque matin dans l\'agenda — inviolable', 'Pas de check-in Slack avant 9h ni après 18h30', 'Un déjeuner par semaine sans écran — même 20 minutes'] },
    { icon: '🎭', title: 'Le syndrome de l\'imposteur de janvier', color: 'amber', desc: 'Retour de vacances + nouveaux objectifs = terreau fertile pour le doute.', tips: ['Lire son journal de réussites de l\'année précédente', '"Je n\'ai pas encore la réponse" est différent de "je ne sais pas"', 'Partager ses doutes avec 1 collègue de confiance — vous verrez que vous n\'êtes pas seul'] },
  ],
  // Q2
  [
    { icon: '🧘', title: 'Gérer la pression du milieu d\'année', color: 'green', desc: 'Q2 est souvent le trimestre le plus chargé. Trouver son rythme.', tips: ['Respiration 4-7-8 entre les calls : inspirez 4s, retenez 7s, expirez 8s', 'Technique Pomodoro : 25 min focus + 5 min pause — aussi en calls', 'Marcher 10 min après chaque call difficile avant le suivant'] },
    { icon: '🔥', title: 'Prévenir le burnout de printemps', color: 'red', desc: 'Le pic de charge de Q2 est le moment le plus à risque de l\'année.', tips: ['Si vous avez travaillé plus de 50h cette semaine : posez-vous la question "pourquoi ?"', 'Le perfectionnisme est un multiplicateur de charge : "bien fait" > "parfait"', 'Déléguez 1 tâche par semaine à quelqu\'un d\'autre — même imparfaitement'] },
    { icon: '💬', title: 'Assertivité en période de pression', color: 'blue', desc: 'Quand tout le monde est sous pression, la communication se dégrade.', tips: ['Technique du disque rayé : répéter calmement votre position jusqu\'à être entendu', 'Reformuler avant de répondre : "Si je comprends bien, vous êtes frustré par..."', 'Proposer une alternative plutôt qu\'un refus sec'] },
    { icon: '⚖️', title: 'Maintenir l\'équilibre au coeur de Q2', color: 'purple', desc: 'Les bonnes habitudes de janvier s\'érodent — les réinstaller maintenant.', tips: ['Rituel de fin de journée : noter 3 choses accomplies avant de fermer l\'ordi', 'Un week-end de déconnexion totale par mois minimum', 'Vérifier : avez-vous pris tous vos jours de congé prévus ce trimestre ?'] },
    { icon: '🎭', title: 'Comparer ses progrès', color: 'amber', desc: 'Mi-année = moment de bilan. Comparer à soi-même, pas aux autres.', tips: ['Comparer vos métriques actuelles à votre état de janvier — pas à votre collègue', 'Célébrer les progrès, même petits : chaque compte sauvé compte', 'Un mentor ou un pair qui connaît votre secteur peut changer la perspective'] },
  ],
  // Q3
  [
    { icon: '🌊', title: 'L\'été comme ressource', color: 'green', desc: 'Utiliser les périodes plus calmes pour recharger les batteries.', tips: ['Vacances vraiment déconnectées : désactiver les notifs pro, sans exception', 'Profiter de l\'accalmie pour apprendre quelque chose de nouveau (masterclass, lecture)', 'Body scan de 5 min le matin : suis-je vraiment reposé ?'] },
    { icon: '🔥', title: 'La fatigue de fin d\'été', color: 'red', desc: 'Retour de vacances ≠ repos complet. La fatigue accumulée ressort souvent en septembre.', tips: ['Prévoir une semaine de "montée en charge" douce après les vacances', 'Signaux de fatigue chronique : irritabilité inexpliquée, sommeil non-réparateur', 'Si vous revenez épuisé des vacances : en parler à votre manager'] },
    { icon: '💬', title: 'Préparer la rentrée relationnelle', color: 'blue', desc: 'Reprendre le contact avec vos clients après l\'été avec intention.', tips: ['Email de rentrée proactif : "Comment s\'est passé votre été ?" avant tout business', 'Réunion d\'équipe de rentrée : partager 1 apprentissage de l\'été chacun', 'Réinitialiser les expectatives : ce qui était urgent avant juillet ne l\'est peut-être plus'] },
    { icon: '⚖️', title: 'Préparer son Q4 sans stress', color: 'purple', desc: 'Anticiper Q4 en août = éviter la panique de novembre.', tips: ['Identifier vos renouvellements Q4 dès septembre', 'Bloquer du temps dans l\'agenda pour les fêtes — les clients aussi en auront besoin', 'Revue mi-année des objectifs annuels : réaliste ou ajustement nécessaire ?'] },
    { icon: '🎭', title: 'Le retour de la comparaison sociale', color: 'amber', desc: 'Rentrée = LinkedIn plein de "succès" — attention au biais de comparaison.', tips: ['LinkedIn montre les succès, jamais les échecs — votre propre ratio est similaire', 'Votre parcours a sa propre temporalité — comparer Q3 2026 à Q3 2025 vous', 'Fermer LinkedIn si vous vous sentez moins bien après y être allé'] },
  ],
  // Q4
  [
    { icon: '🕯️', title: 'Ralentir sans culpabiliser', color: 'green', desc: 'Q4 est intense business mais le corps a besoin de ralentir.', tips: ['Rituel du soir : 10 min sans écran avant de dormir', 'Lumière naturelle le matin — le manque de lumière affecte la concentration', 'Accepter que décembre soit différent — la productivité n\'est pas linéaire sur l\'année'] },
    { icon: '🔥', title: 'Le burnout de fin d\'année', color: 'red', desc: 'La pression des objectifs annuels + les fêtes = risque maximal.', tips: ['Identifier les 3 priorités absolues de Q4 — tout le reste peut attendre', 'Dire non aux réunions de bilan inutiles — un email suffit souvent', 'Prendre ses RTT / congés restants vraiment déconnecté'] },
    { icon: '💬', title: 'Clôturer les relations correctement', color: 'blue', desc: 'La fin d\'année est un moment fort pour les relations clients.', tips: ['Message de fin d\'année personnalisé (pas un copié-collé) à vos 10 clients prioritaires', 'Call de bilan avec chaque client clé : "qu\'est-ce qu\'on aurait pu faire mieux ?"', 'Remercier sincèrement — les clients qui se sentent appréciés renouvellent'] },
    { icon: '⚖️', title: 'Préparer la déconnexion des fêtes', color: 'purple', desc: 'Les vacances de fin d\'année méritent d\'être vraiment des vacances.', tips: ['Prévenir clients et équipe de vos dates d\'absence 2 semaines à l\'avance', 'Finir tous les dossiers ouverts avant le 20 décembre — le cerveau a besoin de fermeture', 'Passation formelle si nécessaire — ne pas laisser de dossiers en suspens'] },
    { icon: '🎭', title: 'Bilan de l\'année — avec bienveillance', color: 'amber', desc: 'Un bilan juste et bienveillant envers soi-même.', tips: ['Lister 10 réussites de l\'année avant de noter les échecs — l\'ordre compte', 'Pour chaque échec : qu\'est-ce que j\'ai appris ? Pas : pourquoi j\'ai raté', 'Partager son bilan avec quelqu\'un qui vous connaît bien — la perspective extérieure est précieuse'] },
  ],
]

const allBooks = [
  [
    { title: 'Atomic Habits', author: 'James Clear', emoji: '⚛️', color: '#dbeafe', why: 'Pour installer les bonnes habitudes du début d\'année sans se forcer.' },
    { title: 'Deep Work', author: 'Cal Newport', emoji: '🧠', color: '#f5f3ff', why: 'Reprendre le focus dans un monde de notifications permanentes.' },
    { title: 'The ONE Thing', author: 'Gary Keller', emoji: '🎯', color: '#fef3c7', why: 'Identifier la priorité absolue qui rend tout le reste plus facile.' },
    { title: 'Mindset', author: 'Carol Dweck', emoji: '🌱', color: '#d1fae5', why: 'Le mindset de croissance vs fixe — transforme la façon d\'apprendre.' },
  ],
  [
    { title: 'The Burnout Fix', author: 'Jacinta Jiménez', emoji: '🔋', color: '#fee2e2', why: 'Reconnaître et prévenir le burnout avant qu\'il ne soit trop tard.' },
    { title: 'Never Split the Difference', author: 'Chris Voss', emoji: '🤝', color: '#fef3c7', why: 'Les techniques de négociation du FBI appliquées aux conversations difficiles.' },
    { title: 'Nonviolent Communication', author: 'Marshall Rosenberg', emoji: '💬', color: '#d1fae5', why: 'Transformer les conflits en connexions — essentiel pour les CSMs.' },
    { title: 'Range', author: 'David Epstein', emoji: '🌈', color: '#e0e7ff', why: 'Pourquoi les généralistes réussissent dans un monde de spécialistes.' },
  ],
  [
    { title: 'Four Thousand Weeks', author: 'Oliver Burkeman', emoji: '⏳', color: '#fef3c7', why: 'Une vision radicalement différente de la gestion du temps et de l\'ambition.' },
    { title: 'The Art of Impossible', author: 'Steven Kotler', emoji: '🚀', color: '#f5f3ff', why: 'Comment entrer dans les états de flow pour performer sans s\'épuiser.' },
    { title: 'Rest', author: 'Alex Soojung-Kim Pang', emoji: '🌿', color: '#d1fae5', why: 'La science du repos stratégique — contre-intuitif et libérateur.' },
    { title: 'The Obstacle Is The Way', author: 'Ryan Holiday', emoji: '⚡', color: '#fee2e2', why: 'La philosophie stoïcienne appliquée aux défis professionnels.' },
  ],
  [
    { title: 'Essentialism', author: 'Greg McKeown', emoji: '✂️', color: '#e0e7ff', why: 'Faire moins mais mieux — parfait pour finir l\'année sans se disperser.' },
    { title: 'When', author: 'Daniel Pink', emoji: '🕐', color: '#fef3c7', why: 'La science du timing — quand faire quoi pour être au meilleur de soi.' },
    { title: 'Man\'s Search for Meaning', author: 'Viktor Frankl', emoji: '🕯️', color: '#f5f3ff', why: 'Retrouver le sens quand la charge est lourde.' },
    { title: 'Dare to Lead', author: 'Brené Brown', emoji: '🦁', color: '#d1fae5', why: 'Finir l\'année en identifiant quel leader on veut être l\'année suivante.' },
  ],
]

const allQuotes = [
  { text: 'Le succès n\'est pas la clé du bonheur. Le bonheur est la clé du succès. Si vous aimez ce que vous faites, vous réussirez.', author: 'Albert Schweitzer' },
  { text: 'Prendre soin de vous n\'est pas de l\'égoïsme. C\'est de la gestion de ressources.', author: 'Anonyme' },
  { text: 'Les vacances ne sont pas un luxe. Ce sont une stratégie de performance à long terme.', author: 'Greg McKeown' },
  { text: 'Ce que vous faites en décembre définit qui vous êtes en janvier.', author: 'Anonyme' },
]

const currentTips = computed(() => allTips[currentQuarter.value])
const currentBooks = computed(() => allBooks[currentQuarter.value])
const currentQuote = computed(() => allQuotes[currentQuarter.value])
</script>

<style scoped>
.wbr-view { max-width: 900px; }
.wbr-header { margin-bottom: 24px; }
.wbr-header h1 { font-size: 1.5rem; font-weight: 800; margin-bottom: 4px; }
.wbr-header p { font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 8px; }
.wbr-season { font-size: 0.78rem; background: var(--purple-bg); color: var(--purple); padding: 4px 12px; border-radius: 99px; font-weight: 600; }

.wbr-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 16px; margin-bottom: 40px; }
.wbr-card { background: #fff; border: 1px solid var(--border); border-radius: 12px; padding: 20px; transition: all 0.2s; }
.wbr-card:hover { box-shadow: var(--shadow-sm); transform: translateY(-2px); }
.wbr-green { border-top: 3px solid var(--green); }
.wbr-red { border-top: 3px solid #ef4444; }
.wbr-blue { border-top: 3px solid #3b82f6; }
.wbr-purple { border-top: 3px solid var(--purple); }
.wbr-amber { border-top: 3px solid #f59e0b; }
.wbrc-icon { font-size: 2rem; display: block; margin-bottom: 10px; }
.wbr-card h3 { font-size: 0.95rem; font-weight: 700; margin-bottom: 6px; }
.wbr-card p { font-size: 0.78rem; color: var(--text-secondary); line-height: 1.5; margin-bottom: 12px; }
.wbr-card ul { list-style: none; display: flex; flex-direction: column; gap: 7px; }
.wbr-card li { font-size: 0.78rem; padding-left: 16px; position: relative; line-height: 1.5; color: #374151; }
.wbr-card li::before { content: '→'; position: absolute; left: 0; color: var(--text-muted); }

.wbr-books { margin-bottom: 32px; }
.wbr-books-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px; }
.wbr-books-header h2 { font-size: 1rem; font-weight: 700; margin-bottom: 4px; }
.wbr-refresh-note { font-size: 0.72rem; color: var(--text-muted); }
.wbr-book-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 12px; }
.wbr-book { display: flex; flex-direction: column; gap: 12px; background: #fff; border: 1px solid var(--border); border-radius: 12px; padding: 16px; transition: all 0.2s; }
.wbr-book:hover { box-shadow: var(--shadow-sm); transform: translateY(-2px); }
.wbr-book-cover { width: 48px; height: 64px; border-radius: 6px; display: flex; align-items: center; justify-content: center; font-size: 1.8rem; }
.wbr-book strong { font-size: 0.85rem; display: block; margin-bottom: 2px; }
.wbrb-author { font-size: 0.72rem; color: var(--text-muted); display: block; margin-bottom: 6px; }
.wbrb-why { font-size: 0.75rem; color: var(--text-secondary); line-height: 1.5; margin: 0; }

.wbr-quote { background: linear-gradient(135deg, var(--purple-bg), #ede9fe); border-radius: 16px; padding: 28px 32px; position: relative; }
.wbr-quote-mark { font-size: 5rem; color: var(--purple); opacity: 0.2; line-height: 0.5; margin-bottom: 12px; font-family: Georgia, serif; }
.wbr-quote p { font-size: 1rem; font-style: italic; line-height: 1.7; color: #374151; margin-bottom: 12px; }
.wbr-quote span { font-size: 0.78rem; color: var(--text-muted); }

@media (max-width: 768px) {
  .wbr-grid { grid-template-columns: 1fr; }
  .wbr-book-grid { grid-template-columns: 1fr 1fr; }
}
</style>
