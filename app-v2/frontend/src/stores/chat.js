import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useChatStore = defineStore('chat', () => {

  // Channels — l'utilisateur peut créer/modifier/supprimer
  const channels = ref([
    { id: 'general', name: 'général', icon: '#', type: 'channel',
      description: 'Discussion générale de l\'équipe',
      createdBy: 'system', canDelete: false },
    { id: 'cs-team', name: 'cs-team', icon: '#', type: 'channel',
      description: 'Équipe Customer Success',
      createdBy: 'system', canDelete: false },
    { id: 'alerts', name: 'alertes', icon: '🔔', type: 'channel',
      description: 'Alertes automatiques Scalyo',
      createdBy: 'system', canDelete: false },
    { id: 'nova', name: 'Nova — IA', icon: '🤖', type: 'assistant',
      description: 'Votre assistante IA',
      createdBy: 'system', canDelete: false },
  ])

  // Messages par channel
  const messages = ref({ general: [], csm: [], management: [] })

  const activeChannel = ref('general')
  const unreadCounts = ref({ general: 0, 'cs-team': 1, alerts: 2, nova: 0 })
  const editingMessage = ref(null)
  const replyingTo = ref(null)

  // Computed
  const totalUnread = computed(() =>
    Object.values(unreadCounts.value).reduce((a, b) => a + b, 0)
  )
  const activeMessages = computed(() =>
    messages.value[activeChannel.value] || []
  )
  const pinnedMessages = computed(() =>
    (messages.value[activeChannel.value] || []).filter(m => m.pinned)
  )

  // Actions
  function uid() { return 'msg_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6) }

  function sendMessage(channelId, content, author = 'Lidia C.', authorId = 'u1', attachments = []) {
    if (!messages.value[channelId]) messages.value[channelId] = []
    const msg = {
      id: uid(),
      author, authorId, content,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      date: new Date().toISOString().slice(0, 10),
      reactions: {}, pinned: false, edited: false,
      attachments,
      replyTo: replyingTo.value ? { ...replyingTo.value } : null,
    }
    messages.value[channelId].push(msg)
    replyingTo.value = null
    return msg
  }

  function editMessage(channelId, msgId, newContent) {
    const msg = messages.value[channelId]?.find(m => m.id === msgId)
    if (msg && msg.authorId === 'u1') {
      msg.content = newContent
      msg.edited = true
      editingMessage.value = null
    }
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

  function addReaction(channelId, msgId, emoji, userId = 'u1') {
    const msg = messages.value[channelId]?.find(m => m.id === msgId)
    if (!msg) return
    if (!msg.reactions[emoji]) msg.reactions[emoji] = []
    const idx = msg.reactions[emoji].indexOf(userId)
    if (idx >= 0) msg.reactions[emoji].splice(idx, 1)
    else msg.reactions[emoji].push(userId)
    if (!msg.reactions[emoji].length) delete msg.reactions[emoji]
  }

  function setReplyTo(channelId, msgId) {
    const msg = messages.value[channelId]?.find(m => m.id === msgId)
    if (msg) replyingTo.value = { msgId, author: msg.author, preview: msg.content.slice(0, 80) }
  }

  function setActive(id) {
    activeChannel.value = id
    if (unreadCounts.value[id] !== undefined) unreadCounts.value[id] = 0
  }

  // Channel management
  function createChannel(name, description = '') {
    const id = 'ch_' + Date.now()
    channels.value.push({
      id, name: name.toLowerCase().replace(/\s+/g, '-'),
      icon: '#', type: 'channel',
      description, createdBy: 'u1', canDelete: true,
    })
    messages.value[id] = []
    unreadCounts.value[id] = 0
    return id
  }

  function updateChannel(id, changes) {
    const ch = channels.value.find(c => c.id === id)
    if (ch && ch.canDelete) Object.assign(ch, changes)
  }

  function deleteChannel(id) {
    const ch = channels.value.find(c => c.id === id)
    if (ch?.canDelete) {
      channels.value = channels.value.filter(c => c.id !== id)
      delete messages.value[id]
      delete unreadCounts.value[id]
      if (activeChannel.value === id) activeChannel.value = 'general'
    }
  }

  return {
    channels, messages, activeChannel, unreadCounts, totalUnread,
    activeMessages, pinnedMessages, editingMessage, replyingTo,
    sendMessage, editMessage, deleteMessage, pinMessage,
    addReaction, setReplyTo, setActive,
    createChannel, updateChannel, deleteChannel,
  }
}, { persist: true })
