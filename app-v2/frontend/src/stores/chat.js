import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/auth'

const MAX_MESSAGE_LENGTH = 5000
const MESSAGES_PER_PAGE = 100
const SEND_COOLDOWN_MS = 1000
const REALTIME_RECONNECT_DELAYS = [1000, 2000, 5000, 10000, 30000]
const MAX_REALTIME_RETRIES = 10

export const useChatStore = defineStore('chat', () => {
const channels = ref([])
const messages = ref({})
const activeChannel = ref(null)
const editingMessage = ref(null)
const replyingTo = ref(null)
const unreadCounts = ref({})
const connected = ref(false)

const channelsLoading = ref(false)
const messagesLoading = ref(false)
const sending = ref(false)
const lastError = ref(null)

let realtimeSub = null
let realtimeRetryCount = 0
let realtimeRetryTimer = null
let lastSendTime = 0

const activeMessages = computed(() => activeChannel.value ? (messages.value[activeChannel.value] || []) : [])
const pinnedMessages = computed(() => activeMessages.value.filter(m => m.pinned))
const totalUnread = computed(() => Object.values(unreadCounts.value).reduce((a, b) => a + b, 0))

// ─── Init ──────────────────────────────────────────────────────────────────
async function init() {
  try {
    await loadChannels()
    if (channels.value.length > 0 && !activeChannel.value) {
      activeChannel.value = channels.value[0].id
    }
    if (activeChannel.value) await loadMessages(activeChannel.value)
    subscribeRealtime()
  } catch (e) {
    console.error('Chat init failed:', e.message || e)
    lastError.value = 'init_failed'
  }
}

async function loadChannels() {
  channelsLoading.value = true
  try {
    const { data, error } = await supabase.from('chat_channels').select('*').order('created_at')
    if (error) {
      console.error('loadChannels — query failed:', error.message)
      lastError.value = 'load_channels_failed'
      return
    }
    if (data) channels.value = data
  } catch (e) {
    console.error('loadChannels — unexpected failure:', e.message || e)
    lastError.value = 'load_channels_failed'
  } finally {
    channelsLoading.value = false
  }
}

async function loadMessages(channelId, before = null) {
  messagesLoading.value = true
  try {
    let query = supabase
      .from('chat_messages')
      .select('*')
      .eq('channel_id', channelId)
      .order('created_at', { ascending: true })
      .limit(MESSAGES_PER_PAGE)
    if (before) query = query.lt('created_at', before)
    const { data, error } = await query
    if (error) {
      console.error('loadMessages — query failed:', error.message)
      lastError.value = 'load_messages_failed'
      return
    }
    if (data) {
      const mapped = data.map(mapMsg)
      if (before && messages.value[channelId]) {
        messages.value[channelId] = [...mapped, ...messages.value[channelId]]
      } else {
        messages.value[channelId] = mapped
      }
    }
  } catch (e) {
    console.error('loadMessages — unexpected failure:', e.message || e)
    lastError.value = 'load_messages_failed'
  } finally {
    messagesLoading.value = false
  }
}

async function loadOlderMessages(channelId) {
  const existing = messages.value[channelId]
  if (!existing || existing.length === 0) return
  const oldest = existing[0].timestamp
  await loadMessages(channelId, oldest)
}

function mapMsg(m) {
  const ts = m.created_at
  const d = ts ? new Date(ts) : null
  return {
    id: m.id, channelId: m.channel_id, author: m.author_name, authorId: m.user_id,
    content: m.content, timestamp: ts, pinned: m.pinned || false,
    reactions: m.reactions || [], attachments: m.attachments || [],
    replyTo: m.reply_to, editedAt: m.edited_at,
    date: ts ? ts.slice(0, 10) : '',
    time: d ? d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
    edited: !!m.edited_at
  }
}

// ─── Realtime with auto-reconnect ──────────────────────────────────────────
function subscribeRealtime() {
  if (realtimeSub) { try { realtimeSub.unsubscribe() } catch (_) {} }
  if (realtimeRetryTimer) { clearTimeout(realtimeRetryTimer); realtimeRetryTimer = null }
  try {
    realtimeSub = supabase.channel('chat-realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chat_messages' }, (payload) => {
        try {
          const msg = mapMsg(payload.new)
          if (!messages.value[msg.channelId]) messages.value[msg.channelId] = []
          const exists = messages.value[msg.channelId].some(m => m.id === msg.id)
          if (!exists) {
            messages.value[msg.channelId].push(msg)
            if (msg.channelId !== activeChannel.value) {
              unreadCounts.value[msg.channelId] = (unreadCounts.value[msg.channelId] || 0) + 1
            }
          }
        } catch (e) { console.error('Realtime INSERT handler failed:', e.message || e) }
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'chat_messages' }, (payload) => {
        try {
          const updated = mapMsg(payload.new)
          const arr = messages.value[updated.channelId]
          if (arr) {
            const idx = arr.findIndex(m => m.id === updated.id)
            if (idx !== -1) arr[idx] = updated
          }
        } catch (e) { console.error('Realtime UPDATE handler failed:', e.message || e) }
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'chat_messages' }, (payload) => {
        try {
          const old = payload.old
          Object.keys(messages.value).forEach(chId => {
            messages.value[chId] = messages.value[chId].filter(m => m.id !== old.id)
          })
        } catch (e) { console.error('Realtime DELETE handler failed:', e.message || e) }
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          realtimeRetryCount = 0
          connected.value = true
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') {
          connected.value = false
          scheduleRealtimeReconnect()
        }
      })
  } catch (e) {
    console.error('Realtime subscription failed:', e.message || e)
    connected.value = false
    scheduleRealtimeReconnect()
  }
}

function scheduleRealtimeReconnect() {
  if (realtimeRetryTimer) return
  if (realtimeRetryCount >= MAX_REALTIME_RETRIES) {
    console.error('Chat realtime — max retries reached, giving up')
    connected.value = false
    return
  }
  const delay = REALTIME_RECONNECT_DELAYS[Math.min(realtimeRetryCount, REALTIME_RECONNECT_DELAYS.length - 1)]
  realtimeRetryCount++
  console.warn('Chat realtime — reconnecting in ' + delay + 'ms (attempt ' + realtimeRetryCount + ')')
  realtimeRetryTimer = setTimeout(() => {
    realtimeRetryTimer = null
    subscribeRealtime()
  }, delay)
}

function destroy() {
  if (realtimeSub) { try { realtimeSub.unsubscribe() } catch (_) {} realtimeSub = null }
  if (realtimeRetryTimer) { clearTimeout(realtimeRetryTimer); realtimeRetryTimer = null }
  connected.value = false
  realtimeRetryCount = 0
}

// ─── Send with validation ─────────────────────────────────────────────────
async function sendMessage(channelId, content, author, authorId, attachments = []) {
  const trimmed = (content || '').trim()
  if (!trimmed) return
  if (trimmed.length > MAX_MESSAGE_LENGTH) {
    lastError.value = 'msg_too_long'
    return
  }
  const now = Date.now()
  if (now - lastSendTime < SEND_COOLDOWN_MS) return
  lastSendTime = now
  sending.value = true
  try {
    const auth = useAuthStore()
    const userId = authorId || auth.user?.id
    const name = author || auth.profile?.first_name || 'user_default'
    const { error } = await supabase.from('chat_messages').insert({
      channel_id: channelId, user_id: userId, author_name: name,
      content: trimmed, attachments: attachments.length ? attachments : [],
      reply_to: replyingTo.value || null
    })
    if (error) {
      console.error('sendMessage — insert failed:', error.message)
      lastError.value = 'send_failed'
      return
    }
    replyingTo.value = null
  } catch (e) {
    console.error('sendMessage — unexpected failure:', e.message || e)
    lastError.value = 'send_failed'
  } finally {
    sending.value = false
  }
}

async function editMessage(channelId, msgId, newContent) {
  const trimmed = (newContent || '').trim()
  if (!trimmed || trimmed.length > MAX_MESSAGE_LENGTH) return
  try {
    const { error } = await supabase.from('chat_messages')
      .update({ content: trimmed, edited_at: new Date().toISOString() })
      .eq('id', msgId)
    if (error) {
      console.error('editMessage — update failed:', error.message)
      lastError.value = 'edit_failed'
    }
    editingMessage.value = null
  } catch (e) {
    console.error('editMessage — unexpected failure:', e.message || e)
    lastError.value = 'edit_failed'
  }
}

async function deleteMessage(channelId, msgId) {
  try {
    const { error } = await supabase.from('chat_messages').delete().eq('id', msgId)
    if (error) {
      console.error('deleteMessage — delete failed:', error.message)
      lastError.value = 'delete_failed'
    }
  } catch (e) {
    console.error('deleteMessage — unexpected failure:', e.message || e)
    lastError.value = 'delete_failed'
  }
}

async function pinMessage(channelId, msgId) {
  try {
    const msg = (messages.value[channelId] || []).find(m => m.id === msgId)
    if (!msg) return
    const { error } = await supabase.from('chat_messages')
      .update({ pinned: !msg.pinned })
      .eq('id', msgId)
    if (error) {
      console.error('pinMessage — update failed:', error.message)
      lastError.value = 'edit_failed'
    }
  } catch (e) {
    console.error('pinMessage — unexpected failure:', e.message || e)
    lastError.value = 'edit_failed'
  }
}

async function addReaction(channelId, msgId, emoji, userId) {
  try {
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
    if (error) {
      console.error('addReaction — update failed:', error.message)
      lastError.value = 'edit_failed'
    }
  } catch (e) {
    console.error('addReaction — unexpected failure:', e.message || e)
    lastError.value = 'edit_failed'
  }
}

function setReplyTo(channelId, msgId) {
  replyingTo.value = msgId || null
}

async function setActive(id) {
  activeChannel.value = id
  unreadCounts.value[id] = 0
  if (!messages.value[id]) {
    try {
      await loadMessages(id)
    } catch (e) {
      console.error('setActive — loadMessages failed:', e.message || e)
    }
  }
}

async function createChannel(name, description = '') {
  const trimmed = (name || '').trim()
  if (!trimmed) return
  try {
    const auth = useAuthStore()
    const { error } = await supabase.from('chat_channels').insert({
      name: trimmed, description: description.trim(), type: 'channel',
      created_by: auth.user?.id
    })
    if (error) {
      console.error('createChannel — insert failed:', error.message)
      lastError.value = 'create_channel_failed'
      return
    }
    await loadChannels()
  } catch (e) {
    console.error('createChannel — unexpected failure:', e.message || e)
    lastError.value = 'create_channel_failed'
  }
}

async function updateChannel(id, changes) {
  try {
    const { error } = await supabase.from('chat_channels').update(changes).eq('id', id)
    if (error) {
      console.error('updateChannel — update failed:', error.message)
      lastError.value = 'edit_failed'
      return
    }
    await loadChannels()
  } catch (e) {
    console.error('updateChannel — unexpected failure:', e.message || e)
    lastError.value = 'edit_failed'
  }
}

async function deleteChannel(id) {
  try {
    const { error } = await supabase.from('chat_channels').delete().eq('id', id)
    if (error) {
      console.error('deleteChannel — delete failed:', error.message)
      lastError.value = 'delete_failed'
      return
    }
    if (activeChannel.value === id) activeChannel.value = null
    await loadChannels()
  } catch (e) {
    console.error('deleteChannel — unexpected failure:', e.message || e)
    lastError.value = 'delete_failed'
  }
}

function clearError() { lastError.value = null }

// ─── RGPD Art. 17 — Droit à l'effacement ─────────────────────────────────
async function deleteUserChatData(userId) {
  if (!userId) return
  try {
    const { error: anonErr } = await supabase.from('chat_messages')
      .update({ author_name: '[deleted]', content: '[Message deleted — GDPR request]', attachments: [], reactions: [] })
      .eq('user_id', userId)
    if (anonErr) {
      console.error('RGPD deleteUserChatData — anonymisation failed:', anonErr.message)
      lastError.value = 'delete_failed'
      return false
    }
    if (activeChannel.value) await loadMessages(activeChannel.value)
    return true
  } catch (e) {
    console.error('RGPD deleteUserChatData — unexpected failure:', e.message || e)
    lastError.value = 'delete_failed'
    return false
  }
}

return {
  channels, messages, activeChannel, unreadCounts, totalUnread,
  activeMessages, pinnedMessages, editingMessage, replyingTo,
  channelsLoading, messagesLoading, sending, lastError, connected,
  init, sendMessage, editMessage, deleteMessage, pinMessage,
  addReaction, setReplyTo, setActive, loadOlderMessages,
  createChannel, updateChannel, deleteChannel, clearError, deleteUserChatData, destroy
}
})
