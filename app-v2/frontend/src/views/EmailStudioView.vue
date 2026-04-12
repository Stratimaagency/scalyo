<template>
  <div class="email-studio">
    <div class="es-header">
      <h1>📧 {{ t('es_title') }}</h1>
      <p class="es-sub">{{ t('es_subtitle') }}</p>
    </div>

    <div class="es-layout">
      <!-- LEFT: Template list -->
      <div class="es-left">
        <div class="es-tabs">
          <button v-for="tab in tabs" :key="tab.key" class="es-tab" :class="{ active: activeTab === tab.key }" @click="activeTab = tab.key">{{ t(tab.label) }}</button>
        </div>
        <div class="es-search"><span>🔍</span><input v-model="search" :placeholder="t('es_search')" /></div>

        <!-- Category filters -->
        <div class="es-cats">
          <button v-for="cat in categories" :key="cat" class="es-cat" :class="{ active: activeCat === cat, [catClass(cat)]: true }" @click="activeCat = activeCat === cat ? 'all' : cat">{{ cat }}</button>
        </div>

        <!-- Template list -->
        <div class="es-list">
          <div v-for="tpl in filteredTemplates" :key="tpl.id" class="es-item" :class="{ active: selectedId === tpl.id }" @click="selectedId = tpl.id">
            <span class="esi-cat" :class="catClass(tpl.category)">{{ tpl.category }}</span>
            <strong>{{ tpl.name }}</strong>
          </div>
        </div>
      </div>

      <!-- RIGHT: Preview -->
      <div class="es-right">
        <div v-if="selected" class="es-preview">
          <div class="esp-header">
            <h2>{{ selected.name }}</h2>
            <div class="esp-actions">
              <span class="esp-cat" :class="catClass(selected.category)">{{ selected.category }}</span>
              <button class="btn-primary" @click="copyEmail">{{ copied ? t('es_copied') : t('es_copy') }}</button>
            </div>
          </div>
          <div class="esp-field"><strong>{{ t('es_subject') }}</strong><p>{{ selected.subject }}</p></div>
          <div class="esp-body">
            <strong>{{ t('es_body') }}</strong>
            <div class="esp-content" v-html="selected.body" />
          </div>
        </div>
        <div v-else class="esp-empty">
          <span class="esp-empty-icon">📧</span>
          <p>{{ t('es_preview') }}</p>
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
const activeCat = ref('all')
const search = ref('')
const selectedId = ref(null)
const copied = ref(false)

const tabs = [
  { key: 'all', label: 'es_tab_all' },
  { key: 'csm', label: 'es_tab_csm' },
  { key: 'commercial', label: 'es_tab_commercial' },
  { key: 'kam', label: 'es_tab_kam' },
]

const templates = [
  { id: 1, name: 'Bienvenue & premiers pas', category: 'Onboarding', type: 'csm', subject: 'Bienvenue chez [Entreprise] — vos premiers pas', body: '<p>Bonjour [Prénom],</p><p>Bienvenue chez <strong>[Entreprise]</strong> ! Je suis [Votre prénom], votre Customer Success Manager dédié.</p><p>Je serai votre point de contact principal pour vous accompagner dans la prise en main de notre solution.</p><p>Voici les prochaines étapes :</p><ul><li>Session de kick-off (30 min)</li><li>Configuration de votre espace</li><li>Formation utilisateurs</li></ul><p>Quand êtes-vous disponible cette semaine pour notre premier échange ?</p><p>À très vite,<br/>[Votre prénom]</p>' },
  { id: 2, name: 'Invitation QBR trimestriel', category: 'QBR', type: 'csm', subject: 'QBR Q2 2026 — [Entreprise]', body: '<p>Bonjour [Prénom],</p><p>J\'aimerais organiser notre revue trimestrielle (QBR) pour faire le point sur vos résultats et définir les priorités du prochain trimestre.</p><p><strong>Agenda proposé (45 min) :</strong></p><ul><li>Bilan des KPIs du trimestre</li><li>Retours utilisateurs</li><li>Roadmap produit</li><li>Objectifs Q3</li></ul><p>Quelle date vous conviendrait ?</p><p>Cordialement,<br/>[Votre prénom]</p>' },
  { id: 3, name: 'Point de santé mensuel', category: 'Suivi', type: 'csm', subject: 'Point mensuel — [Entreprise]', body: '<p>Bonjour [Prénom],</p><p>J\'espère que tout se passe bien de votre côté. Voici votre résumé mensuel :</p><ul><li>Utilisation : stable</li><li>Tickets support : 2 résolus</li><li>Prochaine échéance : renouvellement dans 4 mois</li></ul><p>Avez-vous des questions ou des besoins spécifiques ?</p><p>Bien à vous,<br/>[Votre prénom]</p>' },
  { id: 4, name: 'Relance compte à risque', category: 'Risque', type: 'csm', subject: 'Comment puis-je vous aider ? — [Entreprise]', body: '<p>Bonjour [Prénom],</p><p>J\'ai remarqué une baisse d\'utilisation de notre solution ces dernières semaines. Je voulais prendre de vos nouvelles.</p><p>Y a-t-il quelque chose que nous pourrions améliorer pour mieux répondre à vos besoins ?</p><p>Je serais ravi(e) d\'en discuter lors d\'un appel rapide de 15 minutes.</p><p>À bientôt,<br/>[Votre prénom]</p>' },
  { id: 5, name: 'Préparation renouvellement', category: 'Renouvellement', type: 'csm', subject: 'Votre renouvellement approche — [Entreprise]', body: '<p>Bonjour [Prénom],</p><p>Votre contrat arrive à échéance dans 60 jours. J\'aimerais anticiper votre renouvellement.</p><p><strong>Ce que nous avons accompli ensemble :</strong></p><ul><li>Réduction du churn de 15%</li><li>NPS passé de 32 à 58</li><li>3 upsells réalisés</li></ul><p>Pouvons-nous planifier un appel pour discuter des conditions ?</p><p>Cordialement,<br/>[Votre prénom]</p>' },
  { id: 6, name: 'Opportunité d\'expansion', category: 'Expansion', type: 'csm', subject: 'Nouvelle opportunité pour [Entreprise]', body: '<p>Bonjour [Prénom],</p><p>Au vu de votre utilisation croissante, je pense que notre module avancé pourrait vous apporter une valeur significative.</p><p><strong>Bénéfices attendus :</strong></p><ul><li>Gain de productivité de 20%</li><li>Automatisation des rapports</li><li>Intégrations avancées</li></ul><p>Souhaitez-vous une démo personnalisée ?</p><p>[Votre prénom]</p>' },
  { id: 7, name: 'Enquête NPS', category: 'NPS', type: 'csm', subject: 'Votre avis compte — 30 secondes', body: '<p>Bonjour [Prénom],</p><p>Sur une échelle de 0 à 10, quelle est la probabilité que vous recommandiez notre solution à un collègue ?</p><p>Votre retour nous aide à nous améliorer constamment.</p><p>Merci,<br/>[Votre prénom]</p>' },
  { id: 8, name: 'Prise de contact prospect', category: 'Prospection', type: 'commercial', subject: 'Optimisez votre Customer Success — [Entreprise]', body: '<p>Bonjour [Prénom],</p><p>Je me permets de vous contacter car [Entreprise] correspond exactement au profil d\'équipes CS que nous aidons à performer.</p><p>Nos clients réduisent en moyenne leur churn de 34% en 90 jours.</p><p>Seriez-vous disponible pour un échange de 15 minutes cette semaine ?</p><p>[Votre prénom]</p>' },
  { id: 9, name: 'Envoi de proposition', category: 'Négociation', type: 'commercial', subject: 'Proposition commerciale — Scalyo pour [Entreprise]', body: '<p>Bonjour [Prénom],</p><p>Suite à notre échange, veuillez trouver ci-joint notre proposition commerciale adaptée à vos besoins.</p><p><strong>Points clés :</strong></p><ul><li>Plan Growth — 297€/mois</li><li>Onboarding dédié inclus</li><li>Support prioritaire</li></ul><p>Je reste disponible pour toute question.</p><p>[Votre prénom]</p>' },
  { id: 10, name: 'Relance après démo', category: 'Relance', type: 'commercial', subject: 'Suite à notre démo — [Entreprise]', body: '<p>Bonjour [Prénom],</p><p>Merci pour le temps accordé lors de notre démonstration. J\'espère que la solution vous a convaincu(e).</p><p>Avez-vous eu l\'occasion d\'en discuter en interne ? Je suis disponible pour répondre à toute question.</p><p>[Votre prénom]</p>' },
  { id: 11, name: 'Intervention compte à risque', category: 'Rétention', type: 'kam', subject: 'Plan d\'action prioritaire — [Entreprise]', body: '<p>Bonjour [Prénom],</p><p>Votre compte a été identifié comme prioritaire. Je souhaite mettre en place un plan d\'action personnalisé.</p><p><strong>Actions immédiates :</strong></p><ul><li>Appel de diagnostic cette semaine</li><li>Audit d\'utilisation complet</li><li>Plan de remédiation sous 48h</li></ul><p>Quand êtes-vous disponible ?</p><p>[Votre prénom]</p>' },
  { id: 12, name: 'Relance décision finale', category: 'Closing', type: 'commercial', subject: 'Dernière étape — [Entreprise]', body: '<p>Bonjour [Prénom],</p><p>Je voulais faire un point sur l\'avancement de votre décision. Notre offre spéciale expire vendredi.</p><p>Puis-je vous aider à finaliser ?</p><p>[Votre prénom]</p>' },
]

const categories = computed(() => {
  const cats = [...new Set(templates.map(t => t.category))]
  return ['all', ...cats]
})

const filteredTemplates = computed(() => {
  let list = templates
  if (activeTab.value !== 'all') list = list.filter(t => t.type === activeTab.value)
  if (activeCat.value !== 'all') list = list.filter(t => t.category === activeCat.value)
  if (search.value) { const q = search.value.toLowerCase(); list = list.filter(t => t.name.toLowerCase().includes(q) || t.category.toLowerCase().includes(q)) }
  return list
})

const selected = computed(() => templates.find(t => t.id === selectedId.value) || filteredTemplates.value[0] || null)

function catClass(cat) {
  const map = { Onboarding: 'cat-blue', QBR: 'cat-purple', Suivi: 'cat-teal', Risque: 'cat-red', Renouvellement: 'cat-amber', Expansion: 'cat-green', NPS: 'cat-pink', Prospection: 'cat-indigo', Négociation: 'cat-orange', Relance: 'cat-slate', Closing: 'cat-dark', Rétention: 'cat-red', all: 'cat-gray' }
  return map[cat] || 'cat-gray'
}

function copyEmail() {
  if (!selected.value) return
  const text = selected.value.subject + '\n\n' + selected.value.body.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ')
  navigator.clipboard.writeText(text)
  copied.value = true
  setTimeout(() => copied.value = false, 2000)
}
</script>

<style scoped>
.email-studio { max-width: 1200px; }
.es-header { margin-bottom: 20px; }
.es-header h1 { font-size: 1.5rem; font-weight: 800; }
.es-sub { font-size: 0.85rem; color: var(--text-secondary); margin-top: 4px; }

.es-layout { display: grid; grid-template-columns: 340px 1fr; gap: 20px; min-height: 600px; }

/* Left */
.es-left { background: #fff; border: 1px solid var(--border); border-radius: var(--radius-md); display: flex; flex-direction: column; overflow: hidden; }
.es-tabs { display: flex; border-bottom: 1px solid var(--border-light); }
.es-tab { flex: 1; padding: 10px; background: none; border: none; font-size: 0.78rem; font-weight: 500; color: var(--text-muted); cursor: pointer; border-bottom: 2px solid transparent; transition: all 0.15s; }
.es-tab.active { color: var(--purple); border-bottom-color: var(--purple); font-weight: 600; }
.es-search { display: flex; align-items: center; gap: 6px; padding: 8px 12px; border-bottom: 1px solid var(--border-light); }
.es-search input { border: none; outline: none; font-size: 0.82rem; width: 100%; background: transparent; }

.es-cats { display: flex; flex-wrap: wrap; gap: 4px; padding: 8px 10px; border-bottom: 1px solid var(--border-light); }
.es-cat { font-size: 0.65rem; font-weight: 600; padding: 3px 8px; border-radius: 4px; border: none; cursor: pointer; opacity: 0.6; transition: all 0.15s; }
.es-cat.active { opacity: 1; }
.es-cat:hover { opacity: 0.9; }
.cat-blue { background: #dbeafe; color: #1d4ed8; }
.cat-purple { background: #ede9fe; color: #7c3aed; }
.cat-teal { background: #ccfbf1; color: #0d9488; }
.cat-red { background: #fee2e2; color: #dc2626; }
.cat-amber { background: #fef3c7; color: #d97706; }
.cat-green { background: #d1fae5; color: #059669; }
.cat-pink { background: #fce7f3; color: #db2777; }
.cat-indigo { background: #e0e7ff; color: #4338ca; }
.cat-orange { background: #ffedd5; color: #ea580c; }
.cat-slate { background: #f1f5f9; color: #475569; }
.cat-dark { background: #1e293b; color: #f1f5f9; }
.cat-gray { background: #f3f4f6; color: #6b7280; }

.es-list { flex: 1; overflow-y: auto; }
.es-item { padding: 12px 14px; border-bottom: 1px solid var(--border-light); cursor: pointer; transition: background 0.15s; }
.es-item:hover { background: var(--bg-hover); }
.es-item.active { background: var(--purple-bg); border-left: 3px solid var(--purple); }
.esi-cat { font-size: 0.6rem; font-weight: 600; padding: 2px 6px; border-radius: 3px; display: inline-block; margin-bottom: 4px; }
.es-item strong { font-size: 0.82rem; display: block; }

/* Right */
.es-right { background: #fff; border: 1px solid var(--border); border-radius: var(--radius-md); overflow: hidden; }
.es-preview { padding: 24px; }
.esp-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; gap: 12px; }
.esp-header h2 { font-size: 1.1rem; font-weight: 700; }
.esp-actions { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
.esp-cat { font-size: 0.68rem; font-weight: 600; padding: 3px 10px; border-radius: 4px; }
.btn-primary { background: var(--purple); color: #fff; border: none; padding: 8px 16px; border-radius: var(--radius-sm); font-size: 0.82rem; font-weight: 600; cursor: pointer; transition: all 0.15s; }
.btn-primary:hover { background: var(--purple-dark); }

.esp-field { margin-bottom: 16px; }
.esp-field strong { font-size: 0.7rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.04em; display: block; margin-bottom: 4px; }
.esp-field p { font-size: 0.9rem; padding: 10px 14px; background: var(--bg); border-radius: var(--radius-sm); }

.esp-body strong { font-size: 0.7rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.04em; display: block; margin-bottom: 8px; }
.esp-content { font-size: 0.88rem; line-height: 1.7; padding: 16px; background: var(--bg); border-radius: var(--radius-sm); border: 1px solid var(--border-light); }
.esp-content :deep(p) { margin-bottom: 10px; }
.esp-content :deep(ul) { margin: 8px 0 8px 20px; list-style: disc; }
.esp-content :deep(li) { margin-bottom: 4px; }

.esp-empty { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; min-height: 400px; color: var(--text-muted); }
.esp-empty-icon { font-size: 3rem; margin-bottom: 12px; }
.esp-empty p { font-size: 0.9rem; }

@media (max-width: 900px) { .es-layout { grid-template-columns: 1fr; } .es-right { min-height: 300px; } }
</style>
