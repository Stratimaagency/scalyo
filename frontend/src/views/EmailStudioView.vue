<template>
  <PlanGate requiredPlan="Growth" moduleName="Email Studio">
  <div class="fade-in" style="display: flex; height: 100%; overflow: hidden">
    <!-- Sidebar -->
    <div class="es-sidebar">
      <!-- Gradient header -->
      <div class="es-sidebar-hero">
        <div class="es-hero-icon">✉️</div>
        <div>
          <h2 class="es-hero-title">{{ t('emailStudioTitle') }}</h2>
          <p class="es-hero-sub">{{ t('emailStudioSubtitle') }}</p>
        </div>
      </div>

      <!-- Role filter -->
      <div style="display: flex; gap: 4px; margin-bottom: 10px; padding: 0 14px;">
        <button v-for="r in ['all', 'csm', 'commercial', 'kam']" :key="r" class="es-role-btn"
          :class="{ 'es-role-btn--on': activeRole === r }"
          @click="activeRole = r">
          {{ roleEmoji(r) }} {{ r === 'all' ? t('emailRoleAll') : r === 'csm' ? t('emailRoleCSM') : r === 'commercial' ? t('emailRoleCommercial') : t('emailRoleKAM') }}
        </button>
      </div>

      <!-- Search -->
      <div style="padding: 0 14px; margin-bottom: 10px;">
        <input v-model="searchQuery" :placeholder="'🔍 ' + t('emailSearch')" class="es-search" />
      </div>

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
      <div style="padding: 0 14px;">
      <div
        v-for="tpl in filteredTemplates"
        :key="tpl.id"
        class="es-tpl-card"
        :class="{ 'es-tpl-card--on': selected?.id === tpl.id }"
        @click="selectTemplate(tpl)"
      >
        <div class="es-tpl-top">
          <span class="es-tpl-emoji">{{ tpl.emoji || '📧' }}</span>
          <span class="es-tpl-cat" :style="{ background: catColor(tpl.cat) + '15', color: catColor(tpl.cat) }">{{ tpl.cat }}</span>
        </div>
        <div class="es-tpl-title" :class="{ 'es-tpl-title--on': selected?.id === tpl.id }">
          {{ tpl.title }}
        </div>
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
  </PlanGate>
</template>

<script setup>
import { ref, computed, watch, onUnmounted } from 'vue'
import { useI18n } from '../i18n'
import PlanGate from '../components/PlanGate.vue'

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
  },
  // === NPS ===
  { id: 'nps_survey', cat: 'NPS', role: 'csm', emoji: '⭐', title: 'Enquête NPS', subject: 'Votre avis compte — 30 secondes pour nous aider',
    body: `Bonjour [Prénom],\n\nSur une échelle de 0 à 10, quelle est la probabilité que vous recommandiez [Entreprise] à un collègue ?\n\n→ Répondez en 1 clic : [Lien NPS]\n\nVotre retour nous aide à nous améliorer continuellement.\n\nMerci !\n[Votre prénom]` },
  { id: 'nps_thanks', cat: 'NPS', role: 'csm', emoji: '🙏', title: 'Remerciement NPS promoteur', subject: 'Merci pour votre confiance !',
    body: `Bonjour [Prénom],\n\nMerci d'avoir pris le temps de nous évaluer ! Votre score de [Score] nous fait très plaisir.\n\nSeriez-vous ouvert(e) à :\n• Partager un témoignage sur notre site ?\n• Nous recommander auprès de votre réseau ?\n• Participer à une étude de cas ?\n\nBien cordialement,\n[Votre prénom]` },
  { id: 'nps_detractor', cat: 'NPS', role: 'csm', emoji: '💬', title: 'Suivi NPS détracteur', subject: 'Nous voulons nous améliorer — votre retour est précieux',
    body: `Bonjour [Prénom],\n\nMerci pour votre retour honnête. Votre score nous indique que nous pouvons faire mieux.\n\nJ'aimerais comprendre ce qui vous freine :\n• Quels points posent problème ?\n• Que pourrions-nous améliorer en priorité ?\n\nJe vous propose un appel de 15 min pour en discuter.\n\n📅 Réservez : [Lien Calendly]\n\n[Votre prénom]` },
  // === COMMERCIAL ===
  { id: 'prospect_intro', cat: 'Prospection', role: 'commercial', emoji: '🎯', title: 'Prise de contact prospect', subject: '[Prénom], une solution pour [Problème]',
    body: `Bonjour [Prénom],\n\nJe me permets de vous contacter car [Entreprise] aide des entreprises comme la vôtre à [Bénéfice principal].\n\nNos clients constatent en moyenne :\n• [Résultat 1]\n• [Résultat 2]\n• [Résultat 3]\n\nSeriez-vous disponible pour un échange de 15 min ?\n\n📅 Réservez : [Lien Calendly]\n\nCordialement,\n[Votre prénom]` },
  { id: 'prospect_demo', cat: 'Prospection', role: 'commercial', emoji: '🎬', title: 'Invitation démo', subject: 'Découvrez [Produit] en 20 min',
    body: `Bonjour [Prénom],\n\nSuite à notre échange, je vous propose une démo personnalisée de [Produit].\n\nDurée : 20 min\nFormat : Visio\nContenu : cas d'usage adaptés à votre contexte\n\n📅 Réservez votre créneau : [Lien Calendly]\n\nÀ très bientôt,\n[Votre prénom]` },
  { id: 'prospect_proposal', cat: 'Négociation', role: 'commercial', emoji: '📋', title: 'Envoi de proposition', subject: 'Votre proposition personnalisée — [Entreprise]',
    body: `Bonjour [Prénom],\n\nVeuillez trouver ci-joint votre proposition personnalisée.\n\nRécapitulatif :\n• Plan : [Plan choisi]\n• Montant : [Montant]€/mois\n• Engagement : [Durée]\n• Début : [Date]\n\nCette offre est valable jusqu'au [Date limite].\n\nJe reste disponible pour toute question.\n\n[Votre prénom]` },
  // === KAM ===
  { id: 'kam_upsell', cat: 'Expansion', role: 'kam', emoji: '📈', title: 'Proposition upsell', subject: 'Passez au niveau supérieur — offre exclusive',
    body: `Bonjour [Prénom],\n\nAu vu de votre utilisation croissante, je pense que le plan [Plan supérieur] serait plus adapté.\n\nCe que vous gagnez :\n• [Fonctionnalité 1]\n• [Fonctionnalité 2]\n• [Support prioritaire]\n\nOffre exclusive : -[X]% sur les 3 premiers mois.\n\nOn en discute ?\n\n[Votre prénom]` },
  { id: 'kam_crosssell', cat: 'Expansion', role: 'kam', emoji: '🔗', title: 'Cross-sell nouveau module', subject: 'Nouveau : [Module] — parfait pour votre équipe',
    body: `Bonjour [Prénom],\n\nNous venons de lancer [Module], et je pense que ça correspond parfaitement à vos besoins.\n\nEn bref :\n• [Avantage 1]\n• [Avantage 2]\n\nJe vous propose un essai gratuit de 14 jours.\n\nIntéressé(e) ?\n\n[Votre prénom]` },
  { id: 'kam_escalation', cat: 'Risque', role: 'kam', emoji: '🚨', title: 'Escalade compte stratégique', subject: 'Urgent — situation compte [Client]',
    body: `Bonjour [Prénom],\n\nJe vous alerte sur la situation du compte [Client] :\n\n⚠️ Score santé : [Score]/100\n📉 Usage en baisse de [X]%\n🔄 Renouvellement dans [X] jours\n\nActions proposées :\n1. [Action 1]\n2. [Action 2]\n3. [Action 3]\n\nPouvons-nous en discuter en urgence ?\n\n[Votre prénom]` }
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
  },
  { id: 'nps_survey', cat: 'NPS', role: 'csm', emoji: '⭐', title: 'NPS Survey', subject: 'Your feedback matters — 30 seconds to help us improve',
    body: `Hi [First Name],\n\nOn a scale of 0-10, how likely are you to recommend [Company] to a colleague?\n\n→ Answer in 1 click: [NPS Link]\n\nYour feedback helps us continuously improve.\n\nThank you!\n[Your Name]` },
  { id: 'nps_thanks', cat: 'NPS', role: 'csm', emoji: '🙏', title: 'NPS Promoter Thank You', subject: 'Thank you for your trust!',
    body: `Hi [First Name],\n\nThank you for rating us [Score]! We're thrilled.\n\nWould you be open to:\n• Sharing a testimonial on our website?\n• Referring us to your network?\n• Participating in a case study?\n\nBest regards,\n[Your Name]` },
  { id: 'nps_detractor', cat: 'NPS', role: 'csm', emoji: '💬', title: 'NPS Detractor Follow-up', subject: 'We want to do better — your input is valuable',
    body: `Hi [First Name],\n\nThank you for your honest feedback. Your score tells us we can do better.\n\nI'd love to understand:\n• What's not working for you?\n• What should we prioritize?\n\nCould we schedule a 15-min call?\n\n📅 Book here: [Calendly Link]\n\n[Your Name]` },
  { id: 'prospect_intro', cat: 'Prospecting', role: 'commercial', emoji: '🎯', title: 'Prospect Introduction', subject: '[First Name], a solution for [Problem]',
    body: `Hi [First Name],\n\nI'm reaching out because [Company] helps businesses like yours [Key Benefit].\n\nOur clients typically see:\n• [Result 1]\n• [Result 2]\n• [Result 3]\n\nWould you be available for a 15-min chat?\n\n📅 Book: [Calendly Link]\n\nBest,\n[Your Name]` },
  { id: 'prospect_demo', cat: 'Prospecting', role: 'commercial', emoji: '🎬', title: 'Demo Invitation', subject: 'See [Product] in action — 20 min',
    body: `Hi [First Name],\n\nFollowing our conversation, I'd love to show you a personalized demo of [Product].\n\nDuration: 20 min\nFormat: Video call\nContent: Use cases tailored to your context\n\n📅 Book your slot: [Calendly Link]\n\nLooking forward,\n[Your Name]` },
  { id: 'prospect_proposal', cat: 'Negotiation', role: 'commercial', emoji: '📋', title: 'Proposal Submission', subject: 'Your custom proposal — [Company]',
    body: `Hi [First Name],\n\nPlease find attached your personalized proposal.\n\nSummary:\n• Plan: [Plan]\n• Amount: $[Amount]/month\n• Commitment: [Duration]\n• Start: [Date]\n\nThis offer is valid until [Expiry Date].\n\nHappy to answer any questions.\n\n[Your Name]` },
  { id: 'kam_upsell', cat: 'Expansion', role: 'kam', emoji: '📈', title: 'Upsell Proposal', subject: 'Level up — exclusive offer inside',
    body: `Hi [First Name],\n\nBased on your growing usage, I think [Higher Plan] would be a better fit.\n\nWhat you gain:\n• [Feature 1]\n• [Feature 2]\n• [Priority Support]\n\nExclusive: [X]% off the first 3 months.\n\nShall we discuss?\n\n[Your Name]` },
  { id: 'kam_crosssell', cat: 'Expansion', role: 'kam', emoji: '🔗', title: 'Cross-sell New Module', subject: 'New: [Module] — perfect for your team',
    body: `Hi [First Name],\n\nWe just launched [Module], and I think it's a great fit for your needs.\n\nKey benefits:\n• [Benefit 1]\n• [Benefit 2]\n\nI'd like to offer you a free 14-day trial.\n\nInterested?\n\n[Your Name]` },
  { id: 'kam_escalation', cat: 'Risk', role: 'kam', emoji: '🚨', title: 'Strategic Account Escalation', subject: 'Urgent — [Client] account situation',
    body: `Hi [First Name],\n\nI'm flagging the [Client] account:\n\n⚠️ Health score: [Score]/100\n📉 Usage down [X]%\n🔄 Renewal in [X] days\n\nProposed actions:\n1. [Action 1]\n2. [Action 2]\n3. [Action 3]\n\nCan we discuss urgently?\n\n[Your Name]` }
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
  },
  { id: 'nps_survey', cat: 'NPS', role: 'csm', emoji: '⭐', title: 'NPS 설문', subject: '소중한 의견을 들려주세요 — 30초면 충분합니다',
    body: `안녕하세요 [이름]님,\n\n0~10점 중 [회사명]을 동료에게 추천할 가능성은 얼마나 되시나요?\n\n→ 1클릭으로 답변: [NPS 링크]\n\n소중한 피드백 감사합니다.\n\n[담당자 이름]` },
  { id: 'nps_thanks', cat: 'NPS', role: 'csm', emoji: '🙏', title: 'NPS 추천인 감사', subject: '신뢰에 감사드립니다!',
    body: `안녕하세요 [이름]님,\n\n[점수]점을 주셔서 정말 감사합니다!\n\n혹시 다음 중 가능한 것이 있으신가요?\n• 웹사이트에 후기 공유\n• 지인에게 추천\n• 사례 연구 참여\n\n감사합니다,\n[담당자 이름]` },
  { id: 'nps_detractor', cat: 'NPS', role: 'csm', emoji: '💬', title: 'NPS 비추천인 후속', subject: '더 나은 서비스를 위한 소중한 의견',
    body: `안녕하세요 [이름]님,\n\n솔직한 피드백 감사합니다. 더 나아질 수 있다고 생각합니다.\n\n궁금한 점이 있습니다:\n• 어떤 부분이 불편하셨나요?\n• 우선 개선해야 할 사항은?\n\n15분 통화가 가능하실까요?\n\n📅 예약: [캘린들리 링크]\n\n[담당자 이름]` },
  { id: 'prospect_intro', cat: '영업 개발', role: 'commercial', emoji: '🎯', title: '신규 고객 소개', subject: '[이름]님, [문제]에 대한 솔루션',
    body: `안녕하세요 [이름]님,\n\n[회사명]은 귀사와 같은 기업이 [핵심 이점]을 달성할 수 있도록 돕고 있습니다.\n\n고객사 평균 성과:\n• [결과 1]\n• [결과 2]\n• [결과 3]\n\n15분 통화가 가능하실까요?\n\n📅 예약: [캘린들리 링크]\n\n[담당자 이름]` },
  { id: 'prospect_demo', cat: '영업 개발', role: 'commercial', emoji: '🎬', title: '데모 초대', subject: '[제품] 20분 체험',
    body: `안녕하세요 [이름]님,\n\n대화에 이어 [제품] 맞춤 데모를 제안드립니다.\n\n소요시간: 20분\n형식: 화상 통화\n내용: 귀사 상황에 맞는 사례\n\n📅 예약: [캘린들리 링크]\n\n곧 뵙겠습니다,\n[담당자 이름]` },
  { id: 'prospect_proposal', cat: '협상', role: 'commercial', emoji: '📋', title: '제안서 발송', subject: '맞춤 제안서 — [회사명]',
    body: `안녕하세요 [이름]님,\n\n맞춤 제안서를 첨부합니다.\n\n요약:\n• 플랜: [플랜]\n• 금액: [금액]원/월\n• 기간: [기간]\n• 시작일: [날짜]\n\n본 제안은 [만료일]까지 유효합니다.\n\n문의사항이 있으시면 연락 주세요.\n\n[담당자 이름]` },
  { id: 'kam_upsell', cat: '확장', role: 'kam', emoji: '📈', title: '업셀 제안', subject: '다음 단계로 — 특별 혜택',
    body: `안녕하세요 [이름]님,\n\n사용량 증가를 보면 [상위 플랜]이 더 적합할 것 같습니다.\n\n추가 혜택:\n• [기능 1]\n• [기능 2]\n• [우선 지원]\n\n특별 혜택: 첫 3개월 [X]% 할인\n\n논의해 볼까요?\n\n[담당자 이름]` },
  { id: 'kam_crosssell', cat: '확장', role: 'kam', emoji: '🔗', title: '크로스셀 신규 모듈', subject: '신규: [모듈] — 팀에 딱 맞습니다',
    body: `안녕하세요 [이름]님,\n\n[모듈]을 새로 출시했는데, 귀사에 잘 맞을 것 같습니다.\n\n핵심 장점:\n• [장점 1]\n• [장점 2]\n\n14일 무료 체험을 제안드립니다.\n\n관심 있으신가요?\n\n[담당자 이름]` },
  { id: 'kam_escalation', cat: '위험', role: 'kam', emoji: '🚨', title: '전략 계정 에스컬레이션', subject: '긴급 — [고객] 계정 상황',
    body: `안녕하세요 [이름]님,\n\n[고객] 계정 상황을 알려드립니다:\n\n⚠️ 건강 점수: [점수]/100\n📉 사용량 [X]% 감소\n🔄 갱신까지 [X]일\n\n제안 조치:\n1. [조치 1]\n2. [조치 2]\n3. [조치 3]\n\n긴급 논의 가능하신가요?\n\n[담당자 이름]` }
]

// ── Reactive state ────────────────────────────────
const activeCat = ref('all')
const activeRole = ref('all')
const searchQuery = ref('')
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
  let list = templateSet.value
  if (activeRole.value !== 'all') list = list.filter(t => t.role === activeRole.value)
  const cats = [...new Set(list.map(t => t.cat))]
  return ['all', ...cats]
})

const filteredTemplates = computed(() => {
  let list = templateSet.value
  if (activeRole.value !== 'all') list = list.filter(t => t.role === activeRole.value)
  if (activeCat.value !== 'all') list = list.filter(t => t.cat === activeCat.value)
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase()
    list = list.filter(t => t.title.toLowerCase().includes(q) || t.cat.toLowerCase().includes(q) || t.body.toLowerCase().includes(q))
  }
  return list
})

function roleEmoji(r) { return r === 'csm' ? '💼' : r === 'commercial' ? '🎯' : r === 'kam' ? '📈' : '✨' }
function catColor(cat) {
  const c = cat.toLowerCase()
  if (c.includes('onboarding')) return '#3b82f6'
  if (c.includes('qbr')) return '#8b5cf6'
  if (c.includes('risque') || c.includes('risk') || c.includes('위험')) return '#ef4444'
  if (c.includes('renouv') || c.includes('renewal') || c.includes('갱신')) return '#f97316'
  if (c.includes('suivi') || c.includes('follow') || c.includes('후속')) return '#06b6d4'
  if (c.includes('nps')) return '#eab308'
  if (c.includes('prospect') || c.includes('영업')) return '#ec4899'
  if (c.includes('expans') || c.includes('확장')) return '#22c55e'
  if (c.includes('négoci') || c.includes('negoti') || c.includes('협상')) return '#f43f5e'
  return '#6366f1'
}

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

let copyTimer = null
function copyTemplate() {
  const prefix = lang.value === 'en' ? 'Subject' : lang.value === 'kr' ? '제목' : 'Objet'
  const text = `${prefix} : ${editSubject.value}\n\n${editBody.value}`
  navigator.clipboard.writeText(text).then(() => {
    copied.value = true
    clearTimeout(copyTimer)
    copyTimer = setTimeout(() => { copied.value = false }, 2000)
  })
}

onUnmounted(() => { clearTimeout(copyTimer) })

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

<style scoped>
.es-sidebar { width: 280px; border-right: 1px solid var(--border); overflow: auto; flex-shrink: 0; }
.es-sidebar-hero { background: linear-gradient(135deg, #f43f5e 0%, #f97316 30%, #eab308 60%, #22c55e 80%, #3b82f6 100%); padding: 18px 16px; display: flex; align-items: center; gap: 12px; color: #fff; margin-bottom: 14px; }
.es-hero-icon { font-size: 28px; width: 44px; height: 44px; background: rgba(255,255,255,.2); border-radius: 12px; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(4px); }
.es-hero-title { font-size: 16px; font-weight: 900; margin: 0; color: #fff; }
.es-hero-sub { font-size: 10px; opacity: .85; margin-top: 2px; }

.es-role-btn { font-size: 10px; padding: 4px 10px; border-radius: 20px; border: 1px solid var(--border); background: var(--surface); color: var(--muted); cursor: pointer; font-weight: 600; font-family: 'DM Sans', sans-serif; transition: all .12s; }
.es-role-btn:hover { border-color: #f43f5e; color: #f43f5e; }
.es-role-btn--on { background: linear-gradient(135deg, #f43f5e, #f97316); color: #fff !important; border-color: transparent; box-shadow: 0 2px 8px rgba(244,63,94,.25); }

.es-search { width: 100%; background: var(--surface); border: 1px solid var(--border); border-radius: 10px; padding: 8px 12px; color: var(--text); font-size: 12px; outline: none; font-family: 'DM Sans', sans-serif; }
.es-search:focus { border-color: #f43f5e; box-shadow: 0 0 0 3px rgba(244,63,94,.08); }

.es-tpl-card { padding: 10px 12px; border-radius: 12px; margin-bottom: 6px; cursor: pointer; border: 1px solid transparent; transition: all .15s; }
.es-tpl-card:hover { background: rgba(244,63,94,.04); border-color: rgba(244,63,94,.15); transform: translateX(2px); }
.es-tpl-card--on { background: linear-gradient(135deg, rgba(244,63,94,.08), rgba(249,115,22,.08)); border-color: rgba(244,63,94,.25); box-shadow: 0 2px 8px rgba(244,63,94,.1); }
.es-tpl-top { display: flex; align-items: center; gap: 6px; margin-bottom: 4px; }
.es-tpl-emoji { font-size: 16px; }
.es-tpl-cat { font-size: 9px; font-weight: 700; padding: 1px 7px; border-radius: 8px; text-transform: uppercase; letter-spacing: .04em; }
.es-tpl-title { font-size: 12px; font-weight: 600; color: var(--text); }
.es-tpl-title--on { color: #f43f5e; font-weight: 800; }
</style>
