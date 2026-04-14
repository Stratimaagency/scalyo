import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useChatStore = defineStore('chat', () => {
  const channels = ref([
    { id: 'general', nameKey: 'chat_ch_general', icon: '#', type: 'channel' },
    { id: 'cs-team', nameKey: 'chat_ch_csteam', icon: '#', type: 'channel' },
    { id: 'alerts', nameKey: 'chat_ch_alerts', icon: '#', type: 'channel' },
    { id: 'resources', nameKey: 'chat_ch_resources', icon: '#', type: 'channel' },
    { id: 'nova', name: 'Nova — IA', icon: '🤖', type: 'assistant' },
  ])

  const messages = ref({
    general: [
      { id: 'm1', author: 'Sophie M.', authorId: 'tm1', content: 'Bonjour l\'equipe ! Quelqu\'un a des nouvelles de Leroy Finance ?', time: '09:14', date: '2026-04-12', reactions: { '👍': ['tm2'] }, pinned: false },
      { id: 'm2', author: 'Thomas R.', authorId: 'tm2', content: 'J\'ai un call avec eux cet après-midi. Le health score est critique (3.2). Je vous tiens au courant.', time: '09:18', date: '2026-04-12', reactions: {}, pinned: false },
      { id: 'm3', author: 'Julie K.', authorId: 'tm3', content: 'Courage Thomas ! N\'hésite pas si tu as besoin d\'aide sur le script de rétention.', time: '09:22', date: '2026-04-12', reactions: { '❤️': ['tm1', 'tm2'] }, pinned: false },
    ],
    'cs-team': [
      { id: 'm4', author: 'Sophie M.', authorId: 'tm1', content: 'Rappel : QBR Acme Corp prévu le 15 avril. Thomas, tu as les slides ?', time: '10:30', date: '2026-04-11', reactions: {}, pinned: true },
    ],
    alerts: [
      { id: 'm5', author: 'Nova', authorId: 'nova', content: '⚠️ Leroy Finance n\'a pas été contacté depuis 14 jours. Health score: 3.2/10.', time: '08:00', date: '2026-04-12', reactions: {}, pinned: false, actions: [{ label: 'Voir le client', route: '/app/portfolio' }, { label: 'Créer une tâche', action: 'create_task' }] },
      { id: 'm6', author: 'Nova', authorId: 'nova', content: '📅 Rappel : Renouvellement Leroy Finance dans 28 jours (10 mai 2026).', time: '08:01', date: '2026-04-12', reactions: {}, pinned: false },
      { id: 'm7', author: 'Nova', authorId: 'nova', content: '💚 Sophie M. a maintenu un excellent score de bien-être cette semaine (78/100).', time: '08:02', date: '2026-04-12', reactions: {}, pinned: false },
    ],
    resources: [],
    nova: [],
  })

  const activeChannel = ref('general')
  const unreadCounts = ref({ general: 0, 'cs-team': 0, alerts: 2, resources: 0, nova: 0 })

  const totalUnread = computed(() => Object.values(unreadCounts.value).reduce((a, b) => a + b, 0))

  const activeMessages = computed(() => messages.value[activeChannel.value] || [])

  function sendMessage(channelId, content, author = 'Lidia C.', authorId = 'u1') {
    if (!messages.value[channelId]) messages.value[channelId] = []
    messages.value[channelId].push({
      id: 'msg_' + Date.now(),
      author, authorId, content,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      date: new Date().toISOString().slice(0, 10),
      reactions: {}, pinned: false,
    })
  }

  function addReaction(channelId, msgId, emoji, userId = 'u1') {
    const msg = messages.value[channelId]?.find(m => m.id === msgId)
    if (!msg) return
    if (!msg.reactions[emoji]) msg.reactions[emoji] = []
    const idx = msg.reactions[emoji].indexOf(userId)
    if (idx >= 0) msg.reactions[emoji].splice(idx, 1)
    else msg.reactions[emoji].push(userId)
    if (!msg.reactions[emoji].length) delete msg.reactions[emoji]
  }

  function deleteMessage(channelId, msgId) {
    if (messages.value[channelId]) {
      messages.value[channelId] = messages.value[channelId].filter(m => m.id !== msgId)
    }
  }

  function pinMessage(channelId, msgId) {
    const msg = messages.value[channelId]?.find(m => m.id === msgId)
    if (msg) msg.pinned = !msg.pinned
  }

  function setActive(id) {
    activeChannel.value = id
    unreadCounts.value[id] = 0
  }

  return {
    channels, messages, activeChannel, unreadCounts, totalUnread, activeMessages,
    sendMessage, addReaction, deleteMessage, pinMessage, setActive,
  }
}, { persist: true })
