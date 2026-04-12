<template>
  <div class="wbr-view">
    <h1>💚 Gestion du stress</h1>
    <p class="wbr-sub">Ressources bien-être pour CSMs et chefs de projet</p>

    <div class="wbr-grid">
      <div v-for="r in resources" :key="r.title" class="wbr-card" :class="'wbr-' + r.color">
        <span class="wbrc-icon">{{ r.icon }}</span>
        <h3>{{ r.title }}</h3>
        <p>{{ r.desc }}</p>
        <ul>
          <li v-for="tip in r.tips" :key="tip">{{ tip }}</li>
        </ul>
      </div>
    </div>

    <div class="wbr-books">
      <h2>📚 Lectures recommandées</h2>
      <div class="wbr-book-grid">
        <div v-for="b in books" :key="b.title" class="wbr-book">
          <span class="wbrb-icon">📖</span>
          <div><strong>{{ b.title }}</strong><span class="wbrb-author">{{ b.author }}</span></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const resources = [
  {
    icon: '🧘', title: 'Techniques de gestion du stress', color: 'green',
    desc: 'Méthodes éprouvées pour gérer le stress quotidien en CS.',
    tips: ['Respiration 4-7-8 entre les calls', 'Technique Pomodoro : 25 min focus + 5 min pause', 'Body scan de 2 minutes avant une réunion stressante'],
  },
  {
    icon: '🔥', title: 'Prévention du burnout', color: 'red',
    desc: 'Reconnaître les signaux et agir avant la crise.',
    tips: ['Fatigue constante malgré le repos', 'Cynisme envers les clients', 'Sentiment d\'inefficacité chronique', 'Difficulté à se déconnecter le soir'],
  },
  {
    icon: '💬', title: 'Communication assertive', color: 'blue',
    desc: 'Dire non sans culpabiliser, gérer les clients agressifs.',
    tips: ['Technique du disque rayé pour les demandes répétées', 'Reformulation empathique avant refus', 'Poser des limites claires dès l\'onboarding'],
  },
  {
    icon: '⚖️', title: 'Équilibre pro/perso', color: 'purple',
    desc: 'Déconnexion, rituels, frontières saines.',
    tips: ['Pas de Slack/email après 19h', 'Rituel de fin de journée : 3 choses accomplies', 'Un hobby sans écran minimum 2x/semaine'],
  },
  {
    icon: '🎭', title: 'Syndrome de l\'imposteur', color: 'amber',
    desc: 'Le reconnaître et le dépasser.',
    tips: ['Tenir un journal de réussites', 'En parler avec un pair de confiance', 'Accepter le feedback positif sans le minimiser'],
  },
]

const books = [
  { title: 'Atomic Habits', author: 'James Clear' },
  { title: 'The Burnout Fix', author: 'Jacinta Jiménez' },
  { title: 'Nonviolent Communication', author: 'Marshall Rosenberg' },
  { title: 'Deep Work', author: 'Cal Newport' },
]
</script>

<style scoped>
.wbr-view { max-width: 1000px; }
.wbr-view h1 { font-size: 1.5rem; font-weight: 800; margin-bottom: 4px; }
.wbr-sub { font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 28px; }
.wbr-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px; margin-bottom: 36px; }
.wbr-card { background: #fff; border: 1px solid var(--border); border-radius: var(--radius-md); padding: 20px; transition: all 0.2s; }
.wbr-card:hover { box-shadow: var(--shadow-sm); transform: translateY(-2px); }
.wbr-green { border-top: 3px solid var(--green); }
.wbr-red { border-top: 3px solid var(--red); }
.wbr-blue { border-top: 3px solid var(--blue); }
.wbr-purple { border-top: 3px solid var(--purple); }
.wbr-amber { border-top: 3px solid var(--amber); }
.wbrc-icon { font-size: 2rem; display: block; margin-bottom: 10px; }
.wbr-card h3 { font-size: 0.95rem; font-weight: 700; margin-bottom: 6px; }
.wbr-card p { font-size: 0.8rem; color: var(--text-secondary); line-height: 1.5; margin-bottom: 10px; }
.wbr-card ul { list-style: none; display: flex; flex-direction: column; gap: 6px; }
.wbr-card li { font-size: 0.78rem; padding-left: 16px; position: relative; line-height: 1.4; }
.wbr-card li::before { content: '→'; position: absolute; left: 0; color: var(--text-muted); }

.wbr-books h2 { font-size: 1.05rem; font-weight: 700; margin-bottom: 14px; }
.wbr-book-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 10px; }
.wbr-book { display: flex; align-items: center; gap: 10px; background: #fff; border: 1px solid var(--border); border-radius: var(--radius-sm); padding: 12px; }
.wbrb-icon { font-size: 1.3rem; }
.wbr-book strong { font-size: 0.85rem; display: block; }
.wbrb-author { font-size: 0.72rem; color: var(--text-muted); }
</style>
