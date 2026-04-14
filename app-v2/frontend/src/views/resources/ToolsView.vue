<template>
  <div class="tools-view">
    <div class="tv-header">
      <h1>🛠️ {{ t('nav.tools') }}</h1>
      <p>{{ t('nav.toolsSub') }}</p>
    </div>

    <!-- Ma stack personnelle -->
    <div class="tv-stack">
      <div class="tv-section-header">
        <h2>⚡ Ma stack personnelle</h2>
        <button class="tv-add-btn" @click="showAdd = true">+ Ajouter un outil</button>
      </div>

      <div v-if="!myTools.length" class="tv-empty">
        <span>🔧</span>
        <p>Notez ici vos outils préférés — ceux que vous utilisez vraiment au quotidien.</p>
        <button class="btn-primary-sm" @click="showAdd = true">Ajouter mon premier outil</button>
      </div>

      <div v-else class="tv-grid">
        <div v-for="(tool, i) in myTools" :key="i" class="tv-card">
          <div class="tv-card-top">
            <span class="tv-tool-icon">{{ tool.icon || '🔧' }}</span>
            <button class="tv-del" @click="removeTool(i)">✕</button>
          </div>
          <strong>{{ tool.name }}</strong>
          <p>{{ tool.desc }}</p>
          <span class="tv-cat-badge">{{ tool.category }}</span>
        </div>
      </div>
    </div>

    <!-- Mes bookmarks / liens utiles -->
    <div class="tv-bookmarks">
      <div class="tv-section-header">
        <h2>🔖 Mes liens utiles</h2>
        <button class="tv-add-btn" @click="showAddLink = true">+ Ajouter un lien</button>
      </div>

      <div v-if="!myLinks.length" class="tv-empty">
        <span>🔗</span>
        <p>Sauvegardez ici vos liens de référence : articles, ressources externes, docs internes...</p>
        <button class="btn-primary-sm" @click="showAddLink = true">Ajouter mon premier lien</button>
      </div>

      <div v-else class="tv-links">
        <a v-for="(link, i) in myLinks" :key="i"
           :href="link.url" target="_blank"
           class="tv-link">
          <span class="tv-link-icon">🔗</span>
          <div>
            <strong>{{ link.title }}</strong>
            <span>{{ link.desc }}</span>
          </div>
          <button class="tv-del-sm" @click.prevent="removeLink(i)">✕</button>
        </a>
      </div>
    </div>

    <!-- Slide-over : Ajouter outil -->
    <div v-if="showAdd" class="tv-overlay" @click.self="showAdd = false">
      <div class="tv-panel">
        <div class="tv-panel-header">
          <strong>Ajouter un outil</strong>
          <button @click="showAdd = false">✕</button>
        </div>
        <div class="tv-panel-body">
          <div class="fg"><label>Nom de l'outil</label>
            <input v-model="newTool.name" placeholder="ex: Notion, Loom, Calendly..." /></div>
          <div class="fg"><label>Catégorie</label>
            <select v-model="newTool.category">
              <option>Communication</option>
              <option>Productivité</option>
              <option>Analytics</option>
              <option>Vidéo</option>
              <option>CRM</option>
              <option>Autre</option>
            </select>
          </div>
          <div class="fg"><label>Emoji</label>
            <input v-model="newTool.icon" placeholder="🔧" maxlength="2" /></div>
          <div class="fg"><label>Description</label>
            <input v-model="newTool.desc" placeholder="Pourquoi vous utilisez cet outil" /></div>
          <button class="btn-primary" @click="addTool">Ajouter</button>
        </div>
      </div>
    </div>

    <!-- Slide-over : Ajouter lien -->
    <div v-if="showAddLink" class="tv-overlay" @click.self="showAddLink = false">
      <div class="tv-panel">
        <div class="tv-panel-header">
          <strong>Ajouter un lien</strong>
          <button @click="showAddLink = false">✕</button>
        </div>
        <div class="tv-panel-body">
          <div class="fg"><label>Titre</label>
            <input v-model="newLink.title" placeholder="Nom du lien" /></div>
          <div class="fg"><label>URL</label>
            <input v-model="newLink.url" placeholder="https://..." /></div>
          <div class="fg"><label>Description</label>
            <input v-model="newLink.desc" placeholder="Pourquoi ce lien est utile" /></div>
          <button class="btn-primary" @click="addLink">Ajouter</button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
const { t } = useI18n({ useScope: 'global' })

const showAdd = ref(false)
const showAddLink = ref(false)

const myTools = ref(JSON.parse(localStorage.getItem('scalyo_my_tools') || '[]'))
const myLinks = ref(JSON.parse(localStorage.getItem('scalyo_my_links') || '[]'))

const newTool = ref({ name: '', category: 'Productivité', icon: '', desc: '' })
const newLink = ref({ title: '', url: '', desc: '' })

function addTool() {
  if (!newTool.value.name.trim()) return
  myTools.value.push({ ...newTool.value })
  localStorage.setItem('scalyo_my_tools', JSON.stringify(myTools.value))
  newTool.value = { name: '', category: 'Productivité', icon: '', desc: '' }
  showAdd.value = false
}
function removeTool(i) {
  myTools.value.splice(i, 1)
  localStorage.setItem('scalyo_my_tools', JSON.stringify(myTools.value))
}
function addLink() {
  if (!newLink.value.title.trim() || !newLink.value.url.trim()) return
  myLinks.value.push({ ...newLink.value })
  localStorage.setItem('scalyo_my_links', JSON.stringify(myLinks.value))
  newLink.value = { title: '', url: '', desc: '' }
  showAddLink.value = false
}
function removeLink(i) {
  myLinks.value.splice(i, 1)
  localStorage.setItem('scalyo_my_links', JSON.stringify(myLinks.value))
}
</script>

<style scoped>
.tools-view { max-width: 900px; }
.tv-header { margin-bottom: 28px; }
.tv-header h1 { font-size: 1.5rem; font-weight: 800; margin-bottom: 4px; }
.tv-header p { font-size: 0.85rem; color: var(--text-secondary); }
.tv-stack, .tv-bookmarks { margin-bottom: 36px; }
.tv-section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
.tv-section-header h2 { font-size: 1rem; font-weight: 700; }
.tv-add-btn { background: none; border: 1px dashed var(--border); padding: 6px 14px; border-radius: 6px; font-size: 0.78rem; color: var(--text-muted); cursor: pointer; transition: all 0.15s; }
.tv-add-btn:hover { border-color: var(--purple); color: var(--purple); }
.tv-empty { text-align: center; padding: 32px; background: var(--bg); border-radius: 12px; border: 1px dashed var(--border); }
.tv-empty span { font-size: 2rem; display: block; margin-bottom: 8px; }
.tv-empty p { font-size: 0.82rem; color: var(--text-muted); margin-bottom: 16px; }
.btn-primary-sm { background: var(--purple); color: #fff; border: none; padding: 8px 18px; border-radius: 6px; font-size: 0.78rem; font-weight: 600; cursor: pointer; }
.tv-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 12px; }
.tv-card { background: #fff; border: 1px solid var(--border); border-radius: 10px; padding: 16px; position: relative; }
.tv-card-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
.tv-tool-icon { font-size: 1.8rem; }
.tv-del { background: none; border: none; color: var(--text-muted); cursor: pointer; font-size: 0.75rem; opacity: 0.5; }
.tv-del:hover { opacity: 1; color: var(--red); }
.tv-card strong { font-size: 0.88rem; display: block; margin-bottom: 4px; }
.tv-card p { font-size: 0.75rem; color: var(--text-secondary); margin-bottom: 8px; }
.tv-cat-badge { font-size: 0.65rem; background: var(--bg); color: var(--text-muted); padding: 2px 8px; border-radius: 4px; }
.tv-links { display: flex; flex-direction: column; gap: 8px; }
.tv-link { display: flex; align-items: center; gap: 12px; background: #fff; border: 1px solid var(--border); border-radius: 8px; padding: 12px 16px; text-decoration: none; color: var(--text); transition: all 0.15s; }
.tv-link:hover { border-color: var(--purple-border); background: var(--purple-bg); }
.tv-link-icon { font-size: 1.2rem; flex-shrink: 0; }
.tv-link strong { font-size: 0.85rem; display: block; }
.tv-link span { font-size: 0.72rem; color: var(--text-muted); }
.tv-del-sm { background: none; border: none; color: var(--text-muted); cursor: pointer; font-size: 0.75rem; margin-left: auto; flex-shrink: 0; opacity: 0.4; }
.tv-del-sm:hover { opacity: 1; color: var(--red); }
.tv-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.3); z-index: 100; display: flex; justify-content: flex-end; }
.tv-panel { width: 360px; background: #fff; height: 100vh; box-shadow: -4px 0 20px rgba(0,0,0,0.1); display: flex; flex-direction: column; }
.tv-panel-header { display: flex; justify-content: space-between; align-items: center; padding: 20px 24px; border-bottom: 1px solid var(--border); }
.tv-panel-header button { background: none; border: none; cursor: pointer; font-size: 1rem; color: var(--text-muted); }
.tv-panel-body { padding: 24px; display: flex; flex-direction: column; gap: 16px; }
.fg { display: flex; flex-direction: column; gap: 6px; }
.fg label { font-size: 0.78rem; font-weight: 600; color: var(--text-secondary); }
.fg input, .fg select { padding: 9px 12px; border: 1px solid var(--border); border-radius: 6px; font-size: 0.85rem; outline: none; }
.fg input:focus, .fg select:focus { border-color: var(--purple); }
.btn-primary { background: var(--purple); color: #fff; border: none; padding: 10px; border-radius: 8px; font-size: 0.85rem; font-weight: 600; cursor: pointer; }
</style>
