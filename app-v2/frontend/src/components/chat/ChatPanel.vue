<template>
  <div class="chat-panel-full">
    <!-- Sidebar -->
    <div class="cp-sidebar">
      <div class="cp-sidebar-header">
        <strong>{{ t('chat_title') }}</strong>
        <button class="cp-close" @click="$emit('close')">✕</button>
      </div>

      <!-- Search -->
      <div class="cp-search"><span>🔍</span><input v-model="search" :placeholder="t('chat_search_msg')" /></div>

      <!-- Channels -->
      <div class="cp-section-label">{{ t('chat_channels') }}</div>
      <button v-for="ch in chatChannels" :key="ch.id" class="cp-ch" :class="{ active: store.activeChannel === ch.id }" @click="store.setActive(ch.id)">
        <span class="cp-ch-icon">{{ ch.icon }}</span>
        <span class="cp-ch-name">{{ ch.name }}</span>
        <span v-if="store.unreadCounts[ch.id]" class="cp-ch-badge">{{ store.unreadCounts[ch.id] }}</span>
      </button>

      <!-- Direct Messages -->
      <div class="cp-section-label">{{ t('chat_direct') }}</div>
      <button v-for="m in team.members" :key="m.id" class="cp-dm" :class="{ active: store.activeChannel === 'dm_' + m.id }" @click="openDM(m.id)">
        <span class="cp-dm-avatar" :class="m.status">{{ m.name[0] }}</span>
        <span class="cp-dm-name">{{ m.name }}</span>
        <span class="cp-dm-status" :class="m.status === 'healthy' ? 'online' : 'busy'" />
      </button>

      <!-- Nova -->
      <div class="cp-section-label">{{ t('chat_nova') }}</div>
      <button class="cp-ch nova" :class="{ active: store.activeChannel === 'nova' }" @click="store.setActive('nova')">
        <span class="cp-ch-icon">🤖</span>
        <span class="cp-ch-name">Nova</span>
      </button>
    </div>

    <!-- Messages area -->
    <div class="cp-main">
      <div class="cp-main-header">
        <strong>{{ activeChannelName }}</strong>
        <div class="cp-main-actions">
          <span v-if="store.activeChannel !== 'nova'" class="cp-members">{{ memberCount }}</span>
        </div>
      </div>

      <!-- Messages -->
      <div class="cp-messages" ref="msgRef">
        <!-- Nova greeting -->
        <div v-if="store.activeChannel === 'nova' && !store.activeMessages.length" class="cp-nova-welcome">
          <div class="nova-avatar">🤖</div>
          <div class="nova-bubble">
            <p>{{ t('chat_nova_greeting') }}</p>
            <div class="nova-sugs">
              <button v-for="s in novaSugs" :key="s" class="nova-sug" @click="sendNova(t(s))">{{ t(s) }}</button>
            </div>
          </div>
        </div>

        <!-- Message list -->
        <div v-for="msg in store.activeMessages" :key="msg.id" class="cp-msg" :class="{ own: msg.authorId === 'u1', nova: msg.authorId === 'nova', pinned: msg.pinned }">
          <div class="cp-msg-avatar">{{ msg.authorId === 'nova' ? '🤖' : msg.author[0] }}</div>
          <div class="cp-msg-body">
            <div class="cp-msg-meta">
              <strong>{{ msg.author }}</strong>
              <span class="cp-msg-time">{{ msg.time }}</span>
              <span v-if="msg.pinned" class="cp-pin-badge">📌</span>
            </div>
            <div class="cp-msg-text" v-html="formatMsg(msg.content)" />

            <!-- Actions on message (visible on hover) -->
            <div v-if="msg.actions?.length" class="cp-msg-actions-row">
              <button v-for="a in msg.actions" :key="a.label" class="cp-action-btn" @click="a.route ? $router.push(a.route) : null">{{ a.label }}</button>
            </div>

            <!-- Reactions -->
            <div v-if="Object.keys(msg.reactions).length" class="cp-reactions">
              <button v-for="(users, emoji) in msg.reactions" :key="emoji" class="cp-reaction" :class="{ mine: users.includes('u1') }" @click="store.addReaction(store.activeChannel, msg.id, emoji)">
                {{ emoji }} {{ users.length }}
              </button>
            </div>
          </div>

          <!-- Hover menu -->
          <div class="cp-msg-hover">
            <button @click="store.addReaction(store.activeChannel, msg.id, '👍')" title="👍">👍</button>
            <button @click="store.addReaction(store.activeChannel, msg.id, '❤️')" title="❤️">❤️</button>
            <button @click="store.pinMessage(store.activeChannel, msg.id)" :title="t('chat_pin')">📌</button>
            <button v-if="msg.authorId === 'u1'" @click="store.deleteMessage(store.activeChannel, msg.id)" :title="t('chat_delete_msg')">🗑️</button>
          </div>
        </div>

        <!-- Nova thinking -->
        <div v-if="novaThinking" class="cp-msg nova">
          <div class="cp-msg-avatar">🤖</div>
          <div class="cp-msg-body"><div class="cp-thinking"><span /><span /><span /></div></div>
        </div>
      </div>

      <!-- Share menu -->
      <transition name="fade">
        <div v-if="shareMenuOpen" class="cp-share-menu">
          <button @click="shareItem('client')"><span>👤</span> {{ t('chat_share_client') }}</button>
          <button @click="shareItem('task')"><span>📋</span> {{ t('chat_share_task') }}</button>
          <button @click="shareItem('kpi')"><span>📊</span> {{ t('chat_share_kpi') }}</button>
          <button @click="shareItem('email')"><span>📧</span> {{ t('chat_share_email') }}</button>
          <button @click="shareItem('roadmap')"><span>🗺️</span> {{ t('chat_share_roadmap') }}</button>
        </div>
      </transition>

      <!-- Input -->
      <div class="cp-input-area">
        <button class="cp-btn-attach" @click="shareMenuOpen = !shareMenuOpen" :title="t('chat_share')">📊</button>
        <button class="cp-btn-attach" :title="t('chat_attach')">📎</button>
        <input v-model="input" :placeholder="t('chat_placeholder')" @keydown.enter="send" />
        <button class="cp-btn-send" @click="send" :disabled="!input.trim()">→</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, nextTick, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useChatStore } from '@/stores/chat'
import { useTeamStore } from '@/stores/team'
import { useClientStore } from '@/stores/clients'
import { useTaskStore } from '@/stores/tasks'

const { t } = useI18n({ useScope: 'global' })
const store = useChatStore()
const team = useTeamStore()
const clients = useClientStore()
const tasks = useTaskStore()

defineEmits(['close'])

const input = ref('')
const search = ref('')
const msgRef = ref(null)
const shareMenuOpen = ref(false)
const novaThinking = ref(false)

const novaSugs = ['chat_nova_sug1', 'chat_nova_sug2', 'chat_nova_sug3', 'chat_nova_sug4']

const chatChannels = computed(() => store.channels.filter(c => c.type === 'channel'))
const memberCount = computed(() => team.members.length + ' membres')

const activeChannelName = computed(() => {
  const ch = store.channels.find(c => c.id === store.activeChannel)
  if (ch) return (ch.icon === '#' ? '#' : '') + ch.name
  if (store.activeChannel.startsWith('dm_')) {
    const m = team.members.find(m => m.id === store.activeChannel.replace('dm_', ''))
    return m?.name || ''
  }
  return ''
})

function openDM(memberId) {
  const key = 'dm_' + memberId
  if (!store.messages[key]) store.messages[key] = []
  store.setActive(key)
}

function formatMsg(text) {
  return text.replace(/\n/g, '<br>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
}

async function send() {
  if (!input.value.trim()) return
  const text = input.value.trim()
  input.value = ''
  shareMenuOpen.value = false

  store.sendMessage(store.activeChannel, text)
  await nextTick()
  scrollBottom()

  // Nova auto-reply
  if (store.activeChannel === 'nova') {
    await sendNova(text)
  }
}

async function sendNova(text) {
  if (store.activeChannel !== 'nova') {
    store.setActive('nova')
    store.sendMessage('nova', text)
  }

  novaThinking.value = true
  await nextTick()
  scrollBottom()

  await new Promise(r => setTimeout(r, 1500))

  const context = buildContext()
  const response = generateNovaResponse(text, context)

  store.sendMessage('nova', response, 'Nova', 'nova')
  novaThinking.value = false
  await nextTick()
  scrollBottom()
}

function buildContext() {
  return {
    totalClients: clients.clients.length,
    totalArr: clients.totalArr,
    avgHealth: clients.avgHealth,
    criticalCount: clients.criticalCount,
    criticalClients: clients.clients.filter(c => c.status === 'critical').map(c => ({ name: c.name, health: c.health, arr: c.arr, renewalDate: c.renewalDate })),
    overdueTasks: tasks.overdueTasks.map(t => t.title),
    teamScore: team.teamHealthScore,
  }
}

function generateNovaResponse(question, ctx) {
  const q = question.toLowerCase()

  if (q.includes('risque') || q.includes('risk') || q.includes('위험')) {
    const crit = ctx.criticalClients[0]
    if (crit) return `**${crit.name}** est votre client le plus à risque.\n\n• Health score : **${crit.health}/10** 🔴\n• ARR : **${crit.arr.toLocaleString()}€**\n• Renouvellement : **${crit.renewalDate}**\n\nJe recommande un appel urgent cette semaine. Voici les actions prioritaires :\n1. Analyser l'utilisation des 30 derniers jours\n2. Préparer un script de rétention\n3. Planifier un call de 30 min avant vendredi`
    return 'Aucun client en risque critique détecté. Votre portefeuille est en bonne santé !'
  }

  if (q.includes('semaine') || q.includes('week') || q.includes('요약')) {
    return `**Résumé de votre semaine** 📊\n\n• **${ctx.totalClients} clients** actifs, ARR total **${(ctx.totalArr / 1000).toFixed(0)}K€**\n• Health score moyen : **${ctx.avgHealth}/10**\n• **${ctx.criticalCount}** comptes critiques à surveiller\n• **${ctx.overdueTasks.length}** tâches en retard\n• Score bien-être équipe : **${ctx.teamScore}/100**\n\n${ctx.overdueTasks.length ? '⚠️ Tâches en retard : ' + ctx.overdueTasks.join(', ') : '✅ Aucune tâche en retard'}`
  }

  if (q.includes('copil') || q.includes('rapport') || q.includes('report') || q.includes('보고서')) {
    return `**Rapport COPIL — Avril 2026** 📊\n\n| KPI | Valeur | Tendance |\n|-----|--------|----------|\n| ARR | ${(ctx.totalArr / 1000).toFixed(0)}K€ | ↗️ +12% |\n| Health Score | ${ctx.avgHealth}/10 | → stable |\n| Comptes critiques | ${ctx.criticalCount} | ⚠️ |\n| Équipe | ${ctx.teamScore}/100 | → |\n\n**Actions recommandées :**\n1. Prioriser les ${ctx.criticalCount} comptes critiques\n2. Planifier les QBR du Q2\n3. Réviser les playbooks de rétention`
  }

  if (q.includes('retard') || q.includes('overdue') || q.includes('지연')) {
    if (ctx.overdueTasks.length) return `**${ctx.overdueTasks.length} tâches en retard** ⚠️\n\n${ctx.overdueTasks.map((t, i) => `${i + 1}. ${t}`).join('\n')}\n\nJe recommande de reprioritiser ces tâches dans le Kanban.`
    return '✅ Aucune tâche en retard ! Votre équipe est dans les temps.'
  }

  return `Je comprends votre question. Voici ce que je peux vous dire :\n\n• Vous gérez **${ctx.totalClients} clients** pour un ARR de **${(ctx.totalArr / 1000).toFixed(0)}K€**\n• Score santé moyen : **${ctx.avgHealth}/10**\n• Score équipe : **${ctx.teamScore}/100**\n\nN'hésitez pas à me poser une question plus précise sur vos clients, tâches ou KPIs.`
}

function shareItem(type) {
  shareMenuOpen.value = false
  let content = ''
  if (type === 'client') {
    const c = clients.clients[0]
    if (c) content = `👤 **${c.name}** | Health: ${c.health}/10 | ARR: ${c.arr.toLocaleString()}€ | CSM: ${c.csm}`
  } else if (type === 'task') {
    const t = tasks.tasks.find(t => t.status !== 'done')
    if (t) content = `📋 **${t.title}** | Due: ${t.dueDate} | Status: ${t.status}`
  } else if (type === 'kpi') {
    content = `📊 **ARR Portfolio** : ${(clients.totalArr / 1000).toFixed(0)}K€ | Health: ${clients.avgHealth}/10 | Critiques: ${clients.criticalCount}`
  } else if (type === 'roadmap') {
    content = `🗺️ **Roadmap** partagée — consultez /app/roadmap`
  }
  if (content) store.sendMessage(store.activeChannel, content)
}

function scrollBottom() {
  if (msgRef.value) msgRef.value.scrollTop = msgRef.value.scrollHeight
}

watch(() => store.activeChannel, () => { nextTick(scrollBottom) })
</script>

<style scoped>
.chat-panel-full { display: flex; height: 100%; background: #fff; }

/* Sidebar */
.cp-sidebar { width: 220px; border-right: 1px solid var(--border); display: flex; flex-direction: column; overflow-y: auto; flex-shrink: 0; }
.cp-sidebar-header { display: flex; justify-content: space-between; align-items: center; padding: 14px 16px; border-bottom: 1px solid var(--border-light); }
.cp-sidebar-header strong { font-size: 0.95rem; }
.cp-close { background: none; border: none; font-size: 1rem; color: var(--text-muted); cursor: pointer; padding: 4px; }
.cp-search { display: flex; align-items: center; gap: 6px; padding: 8px 12px; border-bottom: 1px solid var(--border-light); }
.cp-search input { border: none; outline: none; font-size: 0.78rem; width: 100%; background: transparent; }
.cp-section-label { font-size: 0.65rem; font-weight: 700; color: var(--text-muted); letter-spacing: 0.06em; padding: 12px 16px 4px; text-transform: uppercase; }
.cp-ch, .cp-dm { display: flex; align-items: center; gap: 8px; padding: 7px 16px; background: none; border: none; width: 100%; text-align: left; font-size: 0.82rem; color: var(--text-secondary); cursor: pointer; transition: background 0.15s; }
.cp-ch:hover, .cp-dm:hover { background: var(--bg-hover); }
.cp-ch.active, .cp-dm.active { background: var(--purple-bg); color: var(--purple); font-weight: 600; }
.cp-ch.nova { color: var(--purple); }
.cp-ch-icon { font-size: 0.9rem; width: 20px; text-align: center; }
.cp-ch-name { flex: 1; }
.cp-ch-badge { background: var(--red); color: #fff; font-size: 0.6rem; font-weight: 700; padding: 1px 5px; border-radius: 8px; }
.cp-dm-avatar { width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #fff; font-size: 0.65rem; font-weight: 700; flex-shrink: 0; }
.cp-dm-avatar.healthy { background: var(--green); }
.cp-dm-avatar.overloaded { background: var(--red); }
.cp-dm-name { flex: 1; }
.cp-dm-status { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
.cp-dm-status.online { background: var(--green); }
.cp-dm-status.busy { background: var(--amber); }

/* Main area */
.cp-main { flex: 1; display: flex; flex-direction: column; min-width: 0; }
.cp-main-header { display: flex; justify-content: space-between; align-items: center; padding: 12px 16px; border-bottom: 1px solid var(--border-light); }
.cp-main-header strong { font-size: 0.95rem; }
.cp-members { font-size: 0.72rem; color: var(--text-muted); }

/* Messages */
.cp-messages { flex: 1; overflow-y: auto; padding: 16px; display: flex; flex-direction: column; gap: 12px; }

.cp-nova-welcome { display: flex; gap: 12px; padding: 16px; background: var(--purple-bg); border-radius: var(--radius-md); }
.nova-avatar { font-size: 2rem; }
.nova-bubble p { font-size: 0.88rem; margin-bottom: 12px; line-height: 1.5; }
.nova-sugs { display: flex; flex-wrap: wrap; gap: 6px; }
.nova-sug { background: #fff; border: 1px solid var(--purple-border); color: var(--purple); padding: 6px 14px; border-radius: 999px; font-size: 0.75rem; cursor: pointer; transition: all 0.15s; }
.nova-sug:hover { background: var(--purple); color: #fff; }

.cp-msg { display: flex; gap: 10px; position: relative; padding: 4px 0; }
.cp-msg.own { flex-direction: row-reverse; }
.cp-msg.pinned { background: rgba(251, 191, 36, 0.06); border-radius: 8px; padding: 6px 8px; }
.cp-msg-avatar { width: 32px; height: 32px; border-radius: 50%; background: var(--purple); color: #fff; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.78rem; flex-shrink: 0; }
.cp-msg.nova .cp-msg-avatar { background: transparent; font-size: 1.5rem; }
.cp-msg-body { max-width: 75%; min-width: 0; }
.cp-msg-meta { display: flex; align-items: center; gap: 6px; margin-bottom: 3px; }
.cp-msg-meta strong { font-size: 0.78rem; }
.cp-msg-time { font-size: 0.65rem; color: var(--text-muted); }
.cp-pin-badge { font-size: 0.65rem; }
.cp-msg-text { font-size: 0.85rem; line-height: 1.55; padding: 8px 12px; background: var(--bg); border-radius: 12px; border-top-left-radius: 4px; word-break: break-word; }
.cp-msg.own .cp-msg-text { background: var(--purple); color: #fff; border-top-left-radius: 12px; border-top-right-radius: 4px; }
.cp-msg.nova .cp-msg-text { background: var(--purple-bg); border-color: var(--purple-border); }
.cp-msg-text :deep(strong) { font-weight: 700; }

/* Actions on alert messages */
.cp-msg-actions-row { display: flex; gap: 6px; margin-top: 6px; }
.cp-action-btn { background: #fff; border: 1px solid var(--border); padding: 4px 12px; border-radius: 6px; font-size: 0.72rem; cursor: pointer; transition: all 0.15s; }
.cp-action-btn:hover { border-color: var(--purple); color: var(--purple); }

/* Reactions */
.cp-reactions { display: flex; gap: 4px; margin-top: 4px; }
.cp-reaction { background: var(--bg); border: 1px solid var(--border-light); padding: 2px 8px; border-radius: 999px; font-size: 0.72rem; cursor: pointer; transition: all 0.15s; }
.cp-reaction.mine { background: var(--purple-bg); border-color: var(--purple-border); }
.cp-reaction:hover { border-color: var(--purple); }

/* Hover menu */
.cp-msg-hover { display: none; position: absolute; top: 0; right: 0; background: #fff; border: 1px solid var(--border); border-radius: 6px; box-shadow: var(--shadow-sm); padding: 2px; }
.cp-msg:hover .cp-msg-hover { display: flex; gap: 1px; }
.cp-msg.own .cp-msg-hover { right: auto; left: 0; }
.cp-msg-hover button { background: none; border: none; font-size: 0.8rem; padding: 4px 6px; cursor: pointer; border-radius: 4px; }
.cp-msg-hover button:hover { background: var(--bg-hover); }

/* Thinking */
.cp-thinking { display: flex; gap: 4px; padding: 10px 14px; background: var(--purple-bg); border-radius: 12px; border-top-left-radius: 4px; }
.cp-thinking span { width: 7px; height: 7px; background: var(--purple); border-radius: 50%; animation: think-b 1.4s infinite; }
.cp-thinking span:nth-child(2) { animation-delay: 0.2s; }
.cp-thinking span:nth-child(3) { animation-delay: 0.4s; }
@keyframes think-b { 0%, 60%, 100% { transform: translateY(0); } 30% { transform: translateY(-5px); } }

/* Share menu */
.cp-share-menu { position: absolute; bottom: 60px; left: 240px; background: #fff; border: 1px solid var(--border); border-radius: var(--radius-md); box-shadow: var(--shadow-lg); padding: 6px; z-index: 20; }
.cp-share-menu button { display: flex; align-items: center; gap: 10px; padding: 8px 14px; width: 100%; background: none; border: none; font-size: 0.82rem; cursor: pointer; border-radius: 6px; text-align: left; }
.cp-share-menu button:hover { background: var(--bg-hover); }
.cp-share-menu button span { font-size: 1rem; width: 20px; text-align: center; }

/* Input */
.cp-input-area { display: flex; align-items: center; gap: 6px; padding: 10px 14px; border-top: 1px solid var(--border-light); }
.cp-btn-attach { background: none; border: none; font-size: 1.1rem; cursor: pointer; padding: 4px; opacity: 0.6; transition: opacity 0.15s; }
.cp-btn-attach:hover { opacity: 1; }
.cp-input-area input { flex: 1; padding: 9px 14px; border: 1px solid var(--border); border-radius: 20px; font-size: 0.85rem; outline: none; }
.cp-input-area input:focus { border-color: var(--purple); }
.cp-btn-send { background: var(--purple); color: #fff; border: none; width: 36px; height: 36px; border-radius: 50%; font-size: 1rem; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.15s; }
.cp-btn-send:disabled { opacity: 0.4; cursor: not-allowed; }
.cp-btn-send:hover:not(:disabled) { background: var(--purple-dark); }

@media (max-width: 600px) {
  .cp-sidebar { width: 64px; }
  .cp-sidebar-header strong, .cp-ch-name, .cp-dm-name, .cp-section-label, .cp-search { display: none; }
  .cp-ch, .cp-dm { justify-content: center; padding: 10px; }
  .cp-share-menu { left: 80px; }
}
</style>
