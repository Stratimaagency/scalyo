import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/auth'

export const useChatStore = defineStore('chat', () => {
  const channels = ref([])
  const messages = ref({})
  const activeChannel = ref(null)
  const editingMessage = ref(null)
  const replyingTo = ref(null)
  const unreadCounts = ref({})
  let realtimeSub = null

  const activeMessages = computed(() => activeChannel.value ? (messages.value[activeChannel.value] || []) : [])
  const pinnedMessages = computed(() => activeMessages.value.filter(m => m.pinned))
  const totalUnread = computed(() => Object.values(unreadCounts.value).reduce((a, b) => a + b, 0))

  async function init() {
    await loadChannels()
    if (channels.value.length > 0 && !activeChannel.value) {
      activeChannel.value = channels.value[0].id
    }
    if (activeChannel.value) await loadMessages(activeChannel.value)
    subscribeRealtime()
  }

  async function loadChannels() {
    const { data, error } = await supabase.from('chat_channels').select('*').order('created_at')
    if (!error && data) {
      channels.value = data.map(c => ({ id: c.id, name: c.name, description: c.description || '', type: c.type || 'channel' }))
    }
  }

  async function loadMessages(channelId) {
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('channel_id', channelId)
      .order('created_at', { ascending: true })
      .limit(100)
    if (!error && data) {
      messages.value[channelId] = data.map(mapMsg)
    }
  }

  function mapMsg(m) {
    return {
      id: m.id, channelId: m.channel_id, author: m.author_name, authorId: m.user_id,
      content: m.content, timestamp: m.created_at, pinned: m.pinned || false,
      reactions: m.reactions || [], attachments: m.attachments || [],
      replyTo: m.reply_to, editedAt: m.edited_at
    }
  }

  function subscribeRealtime() {
    if (realtimeSub) realtimeSub.unsubscribe()
    realtimeSub = supabase.channel('chat-realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chat_messages' }, (payload) => {
        const msg = mapMsg(payload.new)
        if (!messages.value[msg.channelId]) messages.value[msg.channelId] = []
        const exists = messages.value[msg.channelId].some(m => m.id === msg.id)
        if (!exists) {
          messages.value[msg.channelId].push(msg)
          if (msg.channelId !== activeChannel.value) {
            unreadCounts.value[msg.channelId] = (unreadCounts.value[msg.channelId] || 0) + 1
          }
        }
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'chat_messages' }, (payload) => {
        const updated = mapMsg(payload.new)
        const arr = messages.value[updated.channelId]
        if (arr) {
          const idx = arr.findIndex(m => m.id === updated.id)
          if (idx !== -1) arr[idx] = updated
        }
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'chat_messages' }, (payload) => {
        const old = payload.old
        Object.keys(messages.value).forEach(chId => {
          messages.value[chId] = messages.value[chId].filter(m => m.id !== old.id)
        })
      })
      .subscribe()
  }

  async function sendMessage(channelId, content, author, authorId, attachments = []) {
    const auth = useAuthStore()
    const userId = authorId || auth.user?.id
    const name = author || auth.profile?.first_name || 'User'
    const { error } = await supabase.from('chat_messages').insert({
      channel_id: channelId, user_id: userId, author_name: name,
      content, attachments: attachments.length ? attachments : [],
      reply_to: replyingTo.value || null
    })
    if (error) console.error('[chat] sendMessage error', error)
    replyingTo.value = null
  }

  async function editMessage(channelId, msgId, newContent) {
    const { error } = await supabase.from('chat_messages')
      .update({ content: newContent, edited_at: new Date().toISOString() })
      .eq('id', msgId)
    if (error) console.error('[chat] editMessage error', error)
    editingMessage.value = null
  }

  async function deleteMessage(channelId, msgId) {
    const { error } = await supabase.from('chat_messages').delete().eq('id', msgId)
    if (error) console.error('[chat] deleteMessage error', error)
  }

  async function pinMessage(channelId, msgId) {
    const msg = (messages.value[channelId] || []).find(m => m.id === msgId)
    if (!msg) return
    const { error } = await supabase.from('chat_messages')
      .update({ pinned: !msg.pinned })
      .eq('id', msgId)
    if (error) console.error('[chat] pinMessage error', error)
  }

  async function addReaction(channelId, msgId, emoji, userId) {
    const auth = useAuthStore()
    const uid = userId || auth.user?.id
    const msg = (messages.value[channelId] || []).find(m => m.id === msgId)
    if (!msg) return
    let reactions = [...(msg.reactions || [])]
    const idx = reactions.findIndex(r => r.emoji === emoji)
    if (idx !== -1) {
      if (reactions[idx].users?.includes(uid)) {
        reactions[idx].users = reactions[idx].users.filter(u => u !== uid)
        if (reactions[idx].users.length === 0) reactions.splice(idx, 1)
      } else {
        reactions[idx].users = [...(reactions[idx].users || []), uid]
      }
    } else {
      reactions.push({ emoji, users: [uid] })
    }
    const { error } = await supabase.from('chat_messages')
      .update({ reactions })
      .eq('id', msgId)
    if (error) console.error('[chat] addReaction error', error)
  }

  function setReplyTo(channelId, msgId) {
    replyingTo.value = msgId || null
  }

  async function setActive(id) {
    activeChannel.value = id
    unreadCounts.value[id] = 0
    if (!messages.value[id]) await loadMessages(id)
  }

  async function createChannel(name, description = '') {
    const auth = useAuthStore()
    const { data, error } = await supabase.from('chat_channels').insert({
      name, description, type: 'channel', created_by: auth.user?.id
    }).select().single()
    if (!error && data) {
      channels.value.push({ id: data.id, name: data.name, description: data.description, type: data.type })
    }
  }

  async function updateChannel(id, changes) {
    const { error } = await supabase.from('chat_channels').update(changes).eq('id', id)
    if (!error) {
      const ch = channels.value.find(c => c.id === id)
      if (ch) Object.assign(ch, changes)
    }
  }

  async function deleteChannel(id) {
    const { error } = await supabase.from('chat_channels').delete().eq('id', id)
    if (!error) {
      channels.value = channels.value.filter(c => c.id !== id)
      delete messages.value[id]
      if (activeChannel.value === id) activeChannel.value = channels.value[0]?.id || null
    }
  }

  return {
    channels, messages, activeChannel, unreadCounts, totalUnread,
    activeMessages, pinnedMessages, editingMessage, replyingTo,
    init, sendMessage, editMessage, deleteMessage, pinMessage,
    addReaction, setReplyTo, setActive, createChannel, updateChannel, deleteChannel
  }
})