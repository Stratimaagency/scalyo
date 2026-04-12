<template>
  <div class="tools-view">
    <h1>🛠️ Outils & Templates</h1>
    <p class="tv-sub">Outils recommandés et templates téléchargeables pour CSMs</p>

    <h2>📊 Templates téléchargeables</h2>
    <div class="tv-grid">
      <div v-for="tpl in templates" :key="tpl.title" class="tv-card">
        <span class="tvc-icon">{{ tpl.icon }}</span>
        <div class="tvc-body">
          <strong>{{ tpl.title }}</strong>
          <p>{{ tpl.desc }}</p>
        </div>
        <button class="btn-dl">⬇ Télécharger</button>
      </div>
    </div>

    <h2 class="mt">⚙️ Outils recommandés</h2>
    <div class="tv-tools-grid">
      <div v-for="cat in toolCategories" :key="cat.title" class="tv-tool-cat">
        <h3>{{ cat.title }}</h3>
        <div class="tv-tool-list">
          <span v-for="tool in cat.tools" :key="tool" class="tv-tool">{{ tool }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const templates = [
  { icon: '📊', title: 'Template QBR PowerPoint', desc: '20 slides prêtes à personnaliser pour votre prochain QBR.' },
  { icon: '📋', title: 'Template compte-rendu client', desc: 'Word/Notion pour documenter chaque interaction client.' },
  { icon: '📈', title: 'Template roadmap client', desc: 'Excel/Sheets pour planifier le succès de chaque compte.' },
  { icon: '📧', title: 'Pack 20 templates emails', desc: 'Voir Email Studio pour tous les templates disponibles.' },
  { icon: '🎯', title: 'Template scoring santé client', desc: 'Excel avec formules pour scorer la santé de chaque compte.' },
  { icon: '📅', title: 'Template planning onboarding 90j', desc: 'Plan jour par jour pour les 90 premiers jours client.' },
]

const toolCategories = [
  { title: 'CRM', tools: ['HubSpot', 'Salesforce', 'Pipedrive'] },
  { title: 'Vidéo', tools: ['Loom', 'Zoom', 'Teams'] },
  { title: 'Calendrier', tools: ['Calendly', 'Cal.com'] },
  { title: 'Notes', tools: ['Notion', 'Obsidian'] },
  { title: 'Analytics', tools: ['Mixpanel', 'Amplitude', 'Heap'] },
  { title: 'NPS', tools: ['Delighted', 'Typeform', 'SatisMeter'] },
  { title: 'Communication', tools: ['Slack', 'Teams', 'Intercom'] },
]
</script>

<style scoped>
.tools-view { max-width: 1000px; }
.tools-view h1 { font-size: 1.5rem; font-weight: 800; margin-bottom: 4px; }
.tv-sub { font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 28px; }
.tools-view h2 { font-size: 1.05rem; font-weight: 700; margin-bottom: 14px; }
.mt { margin-top: 36px; }
.tv-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 12px; margin-bottom: 16px; }
.tv-card { background: #fff; border: 1px solid var(--border); border-radius: var(--radius-md); padding: 16px; display: flex; gap: 12px; align-items: flex-start; transition: all 0.2s; }
.tv-card:hover { box-shadow: var(--shadow-sm); }
.tvc-icon { font-size: 1.5rem; flex-shrink: 0; }
.tvc-body { flex: 1; }
.tvc-body strong { font-size: 0.88rem; display: block; margin-bottom: 4px; }
.tvc-body p { font-size: 0.75rem; color: var(--text-secondary); line-height: 1.5; }
.btn-dl { background: var(--purple-bg); color: var(--purple); border: none; padding: 6px 14px; border-radius: 6px; font-size: 0.75rem; font-weight: 600; cursor: pointer; white-space: nowrap; flex-shrink: 0; align-self: center; }
.btn-dl:hover { background: var(--purple); color: #fff; }
.tv-tools-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 14px; }
.tv-tool-cat { background: #fff; border: 1px solid var(--border); border-radius: var(--radius-md); padding: 16px; }
.tv-tool-cat h3 { font-size: 0.85rem; font-weight: 700; margin-bottom: 10px; }
.tv-tool-list { display: flex; flex-wrap: wrap; gap: 6px; }
.tv-tool { background: var(--bg); padding: 4px 10px; border-radius: 6px; font-size: 0.78rem; color: var(--text-secondary); }
</style>
