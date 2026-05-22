<template>
  <div class="cp">

    <!-- SIDEBAR -->
    <div class="cp-sidebar">
      <div class="cp-sidebar-top">
        <strong class="cp-workspace">Scalyo</strong>
        <button class="cp-close" @click="$emit('close')">✕</button>
      </div>

      <!-- Channels -->
      <div class="cp-section">
        <div class="cp-section-header">
          <span class="cp-section-label">{{ t('chat_channels') }}</span>
          <button class="cp-add-btn" @click="showCreateChannel = true" :title="t('chat_add_channel')">+</button>
        </div>
        <button v-for="ch in store.channels.filter(c => c.type === 'channel')" :key="ch.id" class="cp-ch" :class="{ active: store.activeChannel === ch.id }" @click="store.setActive(ch.id)" @contextmenu.prevent="openChannelMenu($event, ch)">
          <span class="cp-ch-hash">{{ ch.icon === '#' ? '#' : ch.icon }}</span>
          <span class="cp-ch-name">{{ ch.name }}</span>
          <span v-if="store.unreadCounts[ch.id]" class="cp-badge">{{ store.unreadCounts[ch.id] }}</span>
        </button>
      </div>

      <!-- Direct Messages -->
      <div class="cp-section">
        <div class="cp-section-header">
          <span class="cp-section-label">{{ t('chat_direct') }}</span>
        </div>
        <button v-for="m in teamMembers" :key="m.id" class="cp-dm" :class="{ active: store.activeChannel === 'dm_' + m.id }" @click="openDM(m.id)">
          <div class="cp-dm-avatar" :style="{ background: m.color }">{{ m.name[0] }}</div>
          <span class="cp-dm-name">{{ m.name }}</span>
          <div class="cp-status-dot" :class="m.status" />
        </button>
      </div>


      <!-- User info bottom -->
      <div class="cp-user-bottom">
        <div class="cp-user-av">L</div>
        <div class="cp-user-info">
          <span class="cp-user-name">Lidia C.</span>
          <span class="cp-user-status">● {{ t('chat_online') }}</span>
        </div>
      </div>
    </div>

    <!-- MAIN -->
    <div class="cp-main">

      <!-- Header -->
      <div class="cp-header">
        <div class="cp-header-left">
          <span class="cp-header-icon">{{ activeChannelMeta?.icon === '#' ? '#' : activeChannelMeta?.icon || '#' }}</span>
          <div>
            <strong class="cp-header-name">{{ activeChannelMeta?.name || store.activeChannel }}</strong>
            <p class="cp-header-desc">{{ activeChannelMeta?.description || '' }}</p>
          </div>
        </div>
        <div class="cp-header-actions">
          <button v-if="store.pinnedMessages.length" class="cp-header-btn" @click="showPinned = !showPinned" :title="t('chat_pinned')">📌 {{ store.pinnedMessages.length }}</button>
          <button class="cp-header-btn" @click="showSearch = !showSearch">🔍</button>
        </div>
      </div>

      <!-- Search bar -->
      <div v-if="showSearch" class="cp-searchbar">
        <input v-model="searchQuery" :placeholder="t('chat_search_msg')" @keydown.esc="showSearch = false; searchQuery = ''" />
        <button @click="showSearch = false; searchQuery = ''">✕</button>
      </div>

      <!-- Pinned messages panel -->
      <div v-if="showPinned" class="cp-pinned-panel">
        <div class="cp-pinned-header">
          <span>📌 {{ t('chat_pinned') }} ({{ store.pinnedMessages.length }})</span>
          <button @click="showPinned = false">✕</button>
        </div>
        <div v-for="msg in store.pinnedMessages" :key="msg.id" class="cp-pinned-item">
          <strong>{{ msg.author }}</strong> : {{ msg.content.slice(0, 80) }}
        </div>
      </div>

      <!-- Messages -->
      <div class="cp-messages" ref="msgRef">


        <!-- Messages groupés par date -->
        <template v-for="(group, date) in groupedMessages" :key="date">
          <div class="cp-date-divider"><span>{{ formatDate(date) }}</span></div>
          <div v-for="msg in filterMessages(group)" :key="msg.id" class="cp-msg" :class="{ own: msg.authorId === 'u1', pinned: msg.pinned, editing: store.editingMessage?.msgId === msg.id }">
            <div class="cp-msg-av" :style="{ background: getAvatarColor(msg.authorId) }">{{ msg.author[0] }}</div>
            <div class="cp-msg-content">
              <!-- Reply preview -->
              <div v-if="msg.replyTo" class="cp-reply-preview">
                <span>↩ {{ msg.replyTo.author }}</span>
                <span>{{ msg.replyTo.preview }}</span>
              </div>
              <div class="cp-msg-meta">
                <strong>{{ msg.author }}</strong>
                <span class="cp-msg-time">{{ msg.time }}</span>
                <span v-if="msg.edited" class="cp-edited">({{ t('chat_edited') }})</span>
                <span v-if="msg.pinned" class="cp-pin">📌</span>
              </div>
              <!-- Editing mode -->
              <div v-if="store.editingMessage?.msgId === msg.id" class="cp-edit-input">
                <input v-model="editContent" @keydown.enter="confirmEdit(msg)" @keydown.esc="store.editingMessage = null" />
                <button @click="confirmEdit(msg)">✓</button>
                <button @click="store.editingMessage = null">✕</button>
              </div>
              <!-- Normal message -->
              <div v-else class="cp-msg-text" v-html="renderMessage(msg.content)" />
              <!-- Attachments -->
              <div v-if="msg.attachments?.length" class="cp-attachments">
                <div v-for="att in msg.attachments" :key="att.name" class="cp-attachment">
                  <img v-if="att.type === 'image'" :src="att.data" :alt="att.name" class="cp-img-preview" />
                  <span v-else class="cp-file-card">📎 {{ att.name }} ({{ att.size }})</span>
                </div>
              </div>
              <!-- Alert actions -->
              <div v-if="msg.actions?.length" class="cp-actions-row">
                <button v-for="action in msg.actions" :key="action.label" class="cp-action-btn" @click="handleAction(action)">{{ action.label }}</button>
              </div>
              <!-- Reactions -->
              <div v-if="Object.keys(msg.reactions).length" class="cp-reactions">
                <button v-for="(users, emoji) in msg.reactions" :key="emoji" class="cp-reaction" :class="{ mine: users.includes('u1') }" @click="store.addReaction(store.activeChannel, msg.id, emoji)">{{ emoji }} {{ users.length }}</button>
              </div>
            </div>
            <!-- Hover toolbar -->
            <div class="cp-msg-toolbar">
              <button @click="store.addReaction(store.activeChannel, msg.id, '👍')" title="👍">👍</button>
              <button @click="store.addReaction(store.activeChannel, msg.id, '❤️')" title="❤️">❤️</button>
              <button @click="store.setReplyTo(store.activeChannel, msg.id)" :title="t('chat_reply')">↩</button>
              <button @click="store.pinMessage(store.activeChannel, msg.id)" :title="t('chat_pin')">📌</button>
              <button v-if="msg.authorId === 'u1'" @click="startEdit(msg)" :title="t('chat_edit_msg')">✏️</button>
              <button v-if="msg.authorId === 'u1'" @click="store.deleteMessage(store.activeChannel, msg.id)" :title="t('chat_delete_msg')">🗑</button>
            </div>
          </div>
        </template>

      </div>

      <!-- Reply banner -->
      <div v-if="store.replyingTo" class="cp-reply-banner">
        <span>↩ {{ t('chat_reply') }} <strong>{{ store.replyingTo.author }}</strong> :</span>
        <span class="cp-reply-text">{{ store.replyingTo.preview }}</span>
        <button @click="store.replyingTo = null">✕</button>
      </div>

      <!-- Share picker -->
      <div v-if="showSharePicker" class="cp-picker">
        <div class="cp-picker-header">
          <span>{{ shareType === 'client' ? t('chat_share_client') : shareType === 'task' ? t('chat_share_task') : t('chat_share_email') }}</span>
          <button @click="showSharePicker = false">✕</button>
        </div>
        <div v-if="!sharePickerItems.length" class="cp-picker-empty">Aucun élément disponible</div>
        <button v-for="item in sharePickerItems" :key="item.id" class="cp-picker-item" @click="confirmSharePick(item)">
          <span class="cp-picker-label">{{ item.label }}</span>
          <span class="cp-picker-meta">{{ item.meta }}</span>
        </button>
      </div>

      <!-- Input area -->
      <div class="cp-input-wrap">
        <div class="cp-fmt-bar">
          <button @click="insertFmt('**')"><strong>B</strong></button>
          <button @click="insertFmt('_')"><em>I</em></button>
          <button @click="insertFmt('`')"><code style="font-size:0.75rem">code</code></button>
        </div>
        <div class="cp-input-row">
          <input type="file" ref="fileRef" @change="onFileSelect" style="display:none" accept="image/*,.pdf,.xlsx,.docx,.csv,.txt" />
          <button class="cp-tool-btn" @click="fileRef?.click()" :title="t('chat_attach')">📎</button>
          <div class="cp-share-wrap">
            <button class="cp-tool-btn" @click="shareMenuOpen = !shareMenuOpen" :title="t('chat_share')">📊</button>
            <div v-if="shareMenuOpen" class="cp-share-menu">
              <div class="cp-share-title">{{ t('chat_share') }}</div>
              <button @click="shareItem('client')">👤 {{ t('chat_share_client') }}</button>
              <button @click="shareItem('task')">📋 {{ t('chat_share_task') }}</button>
              <button @click="shareItem('email')">📧 {{ t('chat_share_email') }}</button>
            </div>
          </div>
          <div class="cp-emoji-wrap">
            <button class="cp-tool-btn" @click="emojiOpen = !emojiOpen" :title="t('chat_emoji')">😊</button>
            <div v-if="emojiOpen" class="cp-emoji-picker">
              <button v-for="e in quickEmojis" :key="e" @click="input += e; emojiOpen = false">{{ e }}</button>
            </div>
          </div>
          <textarea ref="inputRef" v-model="input" :placeholder="t('chat_placeholder')" class="cp-textarea" rows="1" @keydown.enter.exact.prevent="send" @input="autoResize" />
          <button class="cp-send-btn" @click="send" :disabled="!input.trim()">→</button>
        </div>
      </div>
    </div>

    <!-- SLIDE-OVER : Renommer un channel -->
    <div v-if="renamingChannel" class="cp-overlay" @click.self="renamingChannel = null">
      <div class="cp-slideover">
        <div class="cp-so-header">
          <strong>Renommer le channel</strong>
          <button @click="renamingChannel = null">✕</button>
        </div>
        <div class="cp-so-body">
          <div class="fg">
            <label>Nouveau nom</label>
            <input v-model="renamingChannel.name" @keydown.enter="confirmRename" />
          </div>
          <button class="btn-primary" @click="confirmRename">Enregistrer</button>
        </div>
      </div>
    </div>

    <!-- SLIDE-OVER : Créer un channel -->
    <div v-if="showCreateChannel" class="cp-overlay" @click.self="showCreateChannel = false">
      <div class="cp-slideover">
        <div class="cp-so-header">
          <strong>{{ t('chat_create_channel') }}</strong>
          <button @click="showCreateChannel = false">✕</button>
        </div>
        <div class="cp-so-body">
          <div class="fg"><label>{{ t('chat_channel_name') }}</label><input v-model="newChannelName" :placeholder="t('chat_channel_name_ph')" /></div>
          <div class="fg"><label>{{ t('chat_channel_desc') }}</label><input v-model="newChannelDesc" :placeholder="t('chat_channel_desc_ph')" /></div>
          <button class="btn-primary" @click="createChannel">{{ t('chat_create_channel') }}</button>
        </div>
      </div>
    </div>

    <!-- SLIDE-OVER : Créer une tâche -->
    <div v-if="showCreateTask" class="cp-overlay" @click.self="showCreateTask = false">
      <div class="cp-slideover">
        <div class="cp-so-header">
          <strong>{{ t('chat_create_task') }}</strong>
          <button @click="showCreateTask = false">✕</button>
        </div>
        <div class="cp-so-body">
          <div class="fg"><label>{{ t('chat_task_title') }}</label><input v-model="newTask.title" /></div>
          <div class="fg"><label>{{ t('chat_task_priority') }}</label>
            <select v-model="newTask.priority">
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>
          <div class="fg"><label>{{ t('chat_task_due') }}</label><input type="date" v-model="newTask.dueDate" /></div>
          <button class="btn-primary" @click="confirmCreateTask">{{ t('create') }}</button>
        </div>
      </div>
    </div>

    <!-- Context menu channel -->
    <div v-if="channelMenu.visible" class="cp-ctx-menu" :style="{ top: channelMenu.y + 'px', left: channelMenu.x + 'px' }">
      <button @click="renameChannel">✏️ {{ t('chat_edit_msg') }}</button>
      <button v-if="channelMenu.channel?.canDelete" @click="deleteChannelAction" class="danger">🗑 {{ t('chat_delete_msg') }}</button>
      <button @click="channelMenu.visible = false">✕</button>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, nextTick, watch, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useChatStore } from '@/stores/chat'
import { useTeamStore } from '@/stores/team'
import { useClientStore } from '@/stores/clients'
import { useTaskStore } from '@/stores/tasks'
import { sanitizeHtml } from '@/utils/sanitize'

const { t, locale } = useI18n({ useScope: 'global' })
const router = useRouter()
const store = useChatStore()
const teamStore = useTeamStore()
const clientsStore = useClientStore()
const tasksStore = useTaskStore()

defineEmits(['close'])

// Refs UI
const msgRef = ref(null)
const inputRef = ref(null)
const fileRef = ref(null)
const input = ref('')
const editContent = ref('')
const searchQuery = ref('')
const showSearch = ref(false)
const showPinned = ref(false)
const shareMenuOpen = ref(false)
const shareType = ref(null)
const showSharePicker = ref(false)
const sharePickerItems = ref([])
const emojiOpen = ref(false)
const showCreateChannel = ref(false)
const showCreateTask = ref(false)
const newChannelName = ref('')
const newChannelDesc = ref('')
const newTask = ref({ title: '', priority: 'medium', dueDate: '' })
const channelMenu = ref({ visible: false, x: 0, y: 0, channel: null })
const renamingChannel = ref(null)

const quickEmojis = ['👍', '❤️', '😂', '🎉', '🙏', '🔥', '✅', '⚠️', '📊', '🚀']

// Team members
const teamMembers = computed(() => {
  const members = teamStore.members || []
  const colors = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#ec4899', '#06b6d4']
  return members.map((m, i) => ({ ...m, color: colors[i % colors.length] }))
})

function getAvatarColor(authorId) {
  const colors = { tm1: '#10b981', tm2: '#3b82f6', tm3: '#f59e0b', u1: '#7c3aed' }
  return colors[authorId] || '#6b7280'
}

// Active channel metadata
const activeChannelMeta = computed(() => {
  const ch = store.channels.find(c => c.id === store.activeChannel)
  if (ch) return ch
  if (store.activeChannel?.startsWith('dm_')) {
    const m = (teamStore.members || []).find(m => m.id === store.activeChannel.replace('dm_', ''))
    return m ? { name: m.name, icon: '💬', description: t('chat_direct') } : null
  }
  return null
})

// Messages groupés par date
const groupedMessages = computed(() => {
  const msgs = store.activeMessages
  return msgs.reduce((acc, msg) => {
    if (!acc[msg.date]) acc[msg.date] = []
    acc[msg.date].push(msg)
    return acc
  }, {})
})

function filterMessages(msgs) {
  if (!searchQuery.value) return msgs
  const q = searchQuery.value.toLowerCase()
  return msgs.filter(m => m.content.toLowerCase().includes(q))
}

function formatDate(dateStr) {
  const d = new Date(dateStr)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(today.getDate() - 1)
  if (dateStr === today.toISOString().slice(0, 10)) return t('today')
  if (dateStr === yesterday.toISOString().slice(0, 10)) return t('chat_yesterday')
  return new Intl.DateTimeFormat(
    locale.value === 'ko' ? 'ko-KR' : locale.value === 'en' ? 'en-US' : 'fr-FR',
    { weekday: 'long', day: 'numeric', month: 'long' }
  ).format(d)
}

// Render message (markdown simple) — sanitized to prevent XSS
function renderMessage(text) {
  const html = text
    .replace(/\n/g, '<br>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/_(.*?)_/g, '<em>$1</em>')
    .replace(/`(.*?)`/g, '<code>$1</code>')
  return sanitizeHtml(html)
}

// Send message
async function send() {
  const text = input.value.trim()
  if (!text) return
  input.value = ''
  shareMenuOpen.value = false
  emojiOpen.value = false
  resetTextarea()
  store.sendMessage(store.activeChannel, text)
  await nextTick()
  scrollBottom()
}


// File upload
function onFileSelect(e) {
  const file = e.target.files[0]
  if (!file) return
  const isImage = file.type.startsWith('image/')
  const reader = new FileReader()
  reader.onload = ev => {
    const att = {
      name: file.name,
      size: (file.size / 1024).toFixed(0) + ' KB',
      type: isImage ? 'image' : 'file',
      data: ev.target.result,
    }
    store.sendMessage(store.activeChannel, `📎 ${file.name}`, 'Lidia C.', 'u1', [att])
    nextTick(scrollBottom)
  }
  reader.readAsDataURL(file)
  e.target.value = ''
}

// Share Scalyo data
function shareItem(type) {
  shareMenuOpen.value = false
  if (type === 'email') {
    sharePickerItems.value = [
      { id: 'welcome', label: t('chat_tpl_welcome_label'), meta: t('chat_tpl_welcome_meta'), content: t('chat_tpl_welcome_content') },
      { id: 'qbr', label: t('chat_tpl_qbr_label'), meta: t('chat_tpl_qbr_meta'), content: t('chat_tpl_qbr_content') },
      { id: 'risk', label: t('chat_tpl_risk_label'), meta: t('chat_tpl_risk_meta'), content: t('chat_tpl_risk_content') },
      { id: 'renewal', label: t('chat_tpl_renewal_label'), meta: t('chat_tpl_renewal_meta'), content: t('chat_tpl_renewal_content') },
    ]
    shareType.value = 'email'
    showSharePicker.value = true
  } else if (type === 'client') {
    sharePickerItems.value = (clientsStore.clients||[]).map(c => ({
      id: c.id, label: c.name,
      meta: `Health: ${c.health}/10 | ARR: ${(c.arr/1000).toFixed(0)}K€`,
      content: `👤 **${c.name}** | Health: ${c.health}/10 | ARR: ${(c.arr/1000).toFixed(0)}K€ | CSM: ${c.csm}`
    }))
    shareType.value = 'client'
    showSharePicker.value = true
  } else if (type === 'task') {
    sharePickerItems.value = (tasksStore.tasks||[]).filter(t => t.status !== 'done').map(t => ({
      id: t.id, label: t.title,
      meta: `${t.priority} | ${t.status}`,
      content: `📋 **${t.title}** | Priorité: ${t.priority} | Statut: ${t.status}`
    }))
    shareType.value = 'task'
    showSharePicker.value = true
  }
}

function confirmSharePick(item) {
  store.sendMessage(store.activeChannel, item.content)
  showSharePicker.value = false
  sharePickerItems.value = []
  nextTick(scrollBottom)
}

// Handle alert actions
function handleAction(action) {
  if (action.route) {
    router.push(action.route)
  } else if (action.action === 'create_task' || action.type === 'create_task') {
    newTask.value = {
      title: action.taskData?.title || '',
      priority: action.taskData?.priority || 'medium',
      dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      description: '',
    }
    showCreateTask.value = true
  }
}

function confirmCreateTask() {
  if (!newTask.value.title.trim()) return
  tasksStore.addTask({ ...newTask.value, status: 'todo' })
  store.sendMessage(store.activeChannel, `✅ Tâche créée : **${newTask.value.title}** | Priorité: ${newTask.value.priority}`)
  showCreateTask.value = false
  newTask.value = { title: '', priority: 'medium', dueDate: '' }
  nextTick(scrollBottom)
}

// Channel management
function openChannelMenu(e, ch) {
  channelMenu.value = { visible: true, x: e.clientX, y: e.clientY, channel: ch }
}
function createChannel() {
  if (!newChannelName.value.trim()) return
  const id = store.createChannel(newChannelName.value, newChannelDesc.value)
  store.setActive(id)
  newChannelName.value = ''
  newChannelDesc.value = ''
  showCreateChannel.value = false
}
function renameChannel() {
  renamingChannel.value = { id: channelMenu.value.channel.id, name: channelMenu.value.channel.name }
  channelMenu.value.visible = false
}

function confirmRename() {
  if (renamingChannel.value?.name?.trim()) {
    store.updateChannel(renamingChannel.value.id, { name: renamingChannel.value.name.trim() })
  }
  renamingChannel.value = null
}
function deleteChannelAction() {
  store.deleteChannel(channelMenu.value.channel.id)
  channelMenu.value.visible = false
}

// Edit message
function startEdit(msg) {
  store.editingMessage = { channelId: store.activeChannel, msgId: msg.id }
  editContent.value = msg.content
}
function confirmEdit(msg) {
  store.editMessage(store.activeChannel, msg.id, editContent.value)
}

// Format insert
function insertFmt(marker) {
  const el = inputRef.value
  if (!el) return
  const start = el.selectionStart
  const end = el.selectionEnd
  const selected = input.value.slice(start, end)
  input.value = input.value.slice(0, start) + marker + selected + marker + input.value.slice(end)
  nextTick(() => { el.selectionStart = el.selectionEnd = start + marker.length + selected.length + marker.length; el.focus() })
}

// DM
function openDM(memberId) {
  const key = 'dm_' + memberId
  if (!store.messages[key]) store.messages[key] = []
  store.setActive(key)
}

// Textarea auto-resize
function autoResize() {
  const el = inputRef.value
  if (!el) return
  el.style.height = 'auto'
  el.style.height = Math.min(el.scrollHeight, 120) + 'px'
}
function resetTextarea() {
  const el = inputRef.value
  if (el) el.style.height = 'auto'
}

function scrollBottom() {
  if (msgRef.value) msgRef.value.scrollTop = msgRef.value.scrollHeight
}

// Close menus on outside click
function onDocClick(e) {
  if (!e.target.closest('.cp-share-wrap')) shareMenuOpen.value = false
  if (!e.target.closest('.cp-emoji-wrap')) emojiOpen.value = false
  if (!e.target.closest('.cp-ctx-menu')) channelMenu.value.visible = false
}
onMounted(() => document.addEventListener('click', onDocClick))
onUnmounted(() => document.removeEventListener('click', onDocClick))

watch(() => store.activeChannel, () => nextTick(scrollBottom))
</script>

<style scoped>
.cp { display: flex; height: 100%; background-color: var(--bg-card); font-size: 0.85rem; }

/* ── Sidebar ── */
.cp-sidebar { width: 220px; flex-shrink: 0; background: var(--text); color: var(--border); display: flex; flex-direction: column; overflow-y: auto; }
.cp-sidebar-top { display: flex; justify-content: space-between; align-items: center; padding: 16px; border-bottom: 1px solid rgba(255,255,255,0.08); }
.cp-workspace { font-size: 0.95rem; color: var(--bg-white); }
.cp-close { background: none; border: none; color: var(--border); cursor: pointer; font-size: 0.9rem; opacity: 0.6; }
.cp-close:hover { opacity: 1; }

.cp-section { padding: 8px 0; }
.cp-section-header { display: flex; justify-content: space-between; align-items: center; padding: 4px 12px 4px 16px; }
.cp-section-label { font-size: 0.65rem; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; opacity: 0.5; }
.cp-add-btn { background: none; border: none; color: var(--border); cursor: pointer; font-size: 1rem; opacity: 0.5; width: 20px; height: 20px; display: flex; align-items: center; justify-content: center; }
.cp-add-btn:hover { opacity: 1; }

.cp-ch, .cp-dm { display: flex; align-items: center; gap: 8px; padding: 5px 16px; width: 100%; background: none; border: none; color: var(--border); cursor: pointer; font-size: 0.82rem; text-align: left; transition: background 0.12s; }
.cp-ch:hover, .cp-dm:hover { background: rgba(255,255,255,0.06); }
.cp-ch.active, .cp-dm.active { background: rgba(124,58,237,0.3); color: var(--bg-white); }
.cp-ch-name { flex: 1; }
.cp-badge { background: var(--red); color: var(--bg-white); font-size: 0.6rem; font-weight: 700; padding: 1px 5px; border-radius: 8px; }
.cp-dm-avatar { width: 22px; height: 22px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.65rem; font-weight: 700; color: var(--bg-white); flex-shrink: 0; }
.cp-dm-name { flex: 1; }
.cp-status-dot { width: 7px; height: 7px; border-radius: 50%; background: var(--text-secondary); }
.cp-status-dot.healthy { background: var(--green); }
.cp-status-dot.overloaded { background: var(--red); }

.cp-user-bottom { margin-top: auto; display: flex; align-items: center; gap: 8px; padding: 12px 16px; border-top: 1px solid rgba(255,255,255,0.08); }
.cp-user-av { width: 28px; height: 28px; border-radius: 50%; background: var(--purple); color: var(--bg-white); display: flex; align-items: center; justify-content: center; font-size: 0.72rem; font-weight: 700; }
.cp-user-name { font-size: 0.78rem; font-weight: 600; color: var(--bg-white); display: block; }
.cp-user-status { font-size: 0.65rem; color: var(--green); }

/* ── Main ── */
.cp-main { flex: 1; display: flex; flex-direction: column; min-width: 0; }
.cp-header { display: flex; justify-content: space-between; align-items: center; padding: 12px 18px; border-bottom: 1px solid var(--border); background-color: var(--bg-card); }
.cp-header-left { display: flex; align-items: center; gap: 10px; }
.cp-header-icon { font-size: 1rem; color: var(--text-muted); }
.cp-header-name { font-size: 0.9rem; display: block; }
.cp-header-desc { font-size: 0.72rem; color: var(--text-muted); margin: 0; }
.cp-header-actions { display: flex; gap: 6px; }
.cp-header-btn { background: none; border: 1px solid var(--border); padding: 4px 10px; border-radius: 6px; font-size: 0.75rem; cursor: pointer; color: var(--text-muted); }
.cp-header-btn:hover { background: var(--bg); }

.cp-searchbar { display: flex; align-items: center; gap: 8px; padding: 8px 18px; border-bottom: 1px solid var(--border-light); background: var(--bg); }
.cp-searchbar input { flex: 1; border: 1px solid var(--border); border-radius: 6px; padding: 6px 10px; font-size: 0.82rem; outline: none; }
.cp-searchbar button { background: none; border: none; cursor: pointer; color: var(--text-muted); }

.cp-pinned-panel { background: var(--amber-bg); border-bottom: 1px solid var(--amber-border); padding: 10px 18px; }
.cp-pinned-header { display: flex; justify-content: space-between; font-size: 0.78rem; font-weight: 700; margin-bottom: 6px; }
.cp-pinned-header button { background: none; border: none; cursor: pointer; color: var(--text-muted); }
.cp-pinned-item { font-size: 0.75rem; color: var(--text-secondary); padding: 2px 0; border-bottom: 1px solid var(--amber-bg); }

/* ── Messages ── */
.cp-messages { flex: 1; overflow-y: auto; padding: 16px 18px; display: flex; flex-direction: column; gap: 2px; }
.cp-date-divider { display: flex; align-items: center; gap: 10px; margin: 12px 0; color: var(--text-muted); font-size: 0.7rem; font-weight: 600; }
.cp-date-divider::before, .cp-date-divider::after { content: ''; flex: 1; height: 1px; background: var(--border-light); }

.cp-msg:hover { background: var(--bg); }
.cp-msg.own { flex-direction: row-reverse; }
.cp-msg.pinned { background: rgba(251,191,36,0.08); }
.cp-msg-av { width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.78rem; color: var(--bg-white); flex-shrink: 0; align-self: flex-start; margin-top: 2px; }

.cp-reply-preview { font-size: 0.72rem; color: var(--text-muted); border-left: 3px solid var(--purple); padding: 2px 8px; margin-bottom: 4px; background: var(--bg); border-radius: 0 4px 4px 0; display: flex; flex-direction: column; gap: 1px; }
.cp-msg-meta { display: flex; align-items: center; gap: 6px; margin-bottom: 3px; }
.cp-msg-meta strong { font-size: 0.8rem; }
.cp-msg-time { font-size: 0.65rem; color: var(--text-muted); }
.cp-edited { font-size: 0.62rem; color: var(--text-muted); }
.cp-pin { font-size: 0.65rem; }

.cp-msg-text { font-size: 0.85rem; line-height: 1.55; padding: 8px 12px; word-break: break-word; background: var(--bg); border-radius: 12px; border-top-left-radius: 4px; }
.cp-msg.own .cp-msg-text { background: var(--purple); color: var(--bg-white); border-top-left-radius: 12px; border-top-right-radius: 4px; }
.cp-msg-text :deep(code) { background: rgba(0,0,0,0.08); padding: 1px 5px; border-radius: 3px; font-size: 0.82rem; }

.cp-attachments { margin-top: 6px; display: flex; flex-direction: column; gap: 6px; }
.cp-img-preview { max-width: 200px; border-radius: 8px; display: block; margin-top: 4px; }
.cp-file-card { display: inline-flex; align-items: center; gap: 6px; background: var(--bg); border: 1px solid var(--border); padding: 6px 12px; border-radius: 8px; font-size: 0.78rem; }

.cp-actions-row { display: flex; gap: 6px; margin-top: 8px; flex-wrap: wrap; }
.cp-action-btn { background-color: var(--bg-card); border: 1px solid var(--border); padding: 5px 12px; border-radius: 6px; font-size: 0.75rem; cursor: pointer; transition: all 0.15s; }
.cp-action-btn:hover { border-color: var(--purple); color: var(--purple); }

.cp-reactions { display: flex; gap: 4px; margin-top: 4px; flex-wrap: wrap; }
.cp-reaction { background: var(--bg); border: 1px solid var(--border-light); padding: 2px 8px; border-radius: 999px; font-size: 0.72rem; cursor: pointer; transition: all 0.15s; }
.cp-reaction.mine { background: var(--purple-bg); border-color: var(--purple-border); }
.cp-reaction:hover { border-color: var(--purple); }

/* Hover toolbar */
.cp-msg-toolbar { display: none; position: absolute; top: -8px; right: 8px; background-color: var(--bg-card); border: 1px solid var(--border); border-radius: 8px; box-shadow: var(--shadow-md); padding: 3px; gap: 1px; }
.cp-msg:hover .cp-msg-toolbar { display: flex; }
.cp-msg.own .cp-msg-toolbar { right: auto; left: 8px; }
.cp-msg-toolbar button { background: none; border: none; font-size: 0.8rem; padding: 5px 7px; cursor: pointer; border-radius: 5px; }
.cp-msg-toolbar button:hover { background: var(--bg-hover); }

/* Edit input */
.cp-edit-input { display: flex; gap: 6px; margin-top: 4px; }
.cp-edit-input input { flex: 1; padding: 6px 10px; border: 1px solid var(--purple); border-radius: 6px; font-size: 0.85rem; outline: none; }
.cp-edit-input button { background: none; border: none; cursor: pointer; padding: 4px 8px; border-radius: 4px; font-size: 0.85rem; }

/* Thinking */

/* Reply banner */
.cp-reply-banner { display: flex; align-items: center; gap: 8px; padding: 8px 18px; background: var(--purple-bg); border-top: 1px solid var(--purple-border); font-size: 0.78rem; color: var(--purple); }
.cp-reply-text { flex: 1; color: var(--text-secondary); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.cp-reply-banner button { background: none; border: none; cursor: pointer; color: var(--text-muted); font-size: 0.8rem; }

/* Input area */
.cp-input-wrap { border-top: 1px solid var(--border-light); padding: 10px 18px 14px; }
.cp-fmt-bar { display: flex; gap: 2px; margin-bottom: 6px; }
.cp-fmt-bar button { background: none; border: none; cursor: pointer; padding: 3px 8px; border-radius: 4px; font-size: 0.78rem; color: var(--text-muted); }
.cp-fmt-bar button:hover { background: var(--bg); color: var(--text); }
.cp-input-row { display: flex; align-items: flex-end; gap: 6px; }
.cp-tool-btn { background: none; border: none; cursor: pointer; font-size: 1.1rem; padding: 6px; opacity: 0.6; transition: opacity 0.15s; flex-shrink: 0; }
.cp-tool-btn:hover { opacity: 1; }
.cp-textarea { flex: 1; padding: 9px 14px; border: 1px solid var(--border); border-radius: 20px; font-size: 0.85rem; outline: none; resize: none; line-height: 1.4; max-height: 120px; overflow-y: auto; font-family: inherit; }
.cp-textarea:focus { border-color: var(--purple); }
.cp-send-btn { width: 36px; height: 36px; border-radius: 50%; background: var(--purple); color: var(--bg-white); border: none; cursor: pointer; font-size: 1rem; display: flex; align-items: center; justify-content: center; transition: all 0.15s; flex-shrink: 0; }
.cp-send-btn:disabled { opacity: 0.4; cursor: not-allowed; }
.cp-send-btn:hover:not(:disabled) { background: var(--purple-dark); transform: scale(1.05); }

/* Share menu */
.cp-share-wrap { position: relative; }
.cp-share-menu { position: absolute; bottom: 44px; left: 0; background-color: var(--bg-card); border: 1px solid var(--border); border-radius: 10px; box-shadow: var(--shadow-lg); padding: 6px; z-index: 100; min-width: 180px; }
.cp-share-title { font-size: 0.68rem; font-weight: 700; color: var(--text-muted); padding: 4px 10px 6px; text-transform: uppercase; letter-spacing: 0.05em; }
.cp-share-menu button { display: flex; align-items: center; gap: 10px; padding: 8px 12px; width: 100%; background: none; border: none; font-size: 0.82rem; cursor: pointer; border-radius: 6px; text-align: left; }
.cp-share-menu button:hover { background: var(--bg-hover); }

/* Emoji picker */
.cp-emoji-wrap { position: relative; }
.cp-emoji-picker { position: absolute; bottom: 44px; left: 0; background-color: var(--bg-card); border: 1px solid var(--border); border-radius: 10px; box-shadow: var(--shadow-lg); padding: 8px; z-index: 100; display: grid; grid-template-columns: repeat(5, 1fr); gap: 4px; }
.cp-emoji-picker button { background: none; border: none; cursor: pointer; font-size: 1.1rem; padding: 4px; border-radius: 4px; }
.cp-emoji-picker button:hover { background: var(--bg); }

/* Slide-overs */
.cp-overlay { position: fixed; inset: 0; z-index: 1000; background: rgba(0,0,0,0.3); display: flex; justify-content: flex-end; }
.cp-slideover { width: 380px; height: 100vh; background-color: var(--bg-card); box-shadow: -4px 0 24px rgba(0,0,0,0.15); display: flex; flex-direction: column; }
.cp-so-header { display: flex; justify-content: space-between; align-items: center; padding: 20px 24px; border-bottom: 1px solid var(--border); }
.cp-so-header strong { font-size: 1rem; }
.cp-so-header button { background: none; border: none; cursor: pointer; font-size: 1rem; color: var(--text-muted); }
.cp-so-body { padding: 24px; display: flex; flex-direction: column; gap: 16px; overflow-y: auto; }
.fg { display: flex; flex-direction: column; gap: 6px; }
.fg label { font-size: 0.78rem; font-weight: 600; color: var(--text-secondary); }
.fg input, .fg select, .fg textarea { padding: 9px 12px; border: 1px solid var(--border); border-radius: 6px; font-size: 0.85rem; outline: none; font-family: inherit; }
.fg input:focus, .fg select:focus, .fg textarea:focus { border-color: var(--purple); }
.btn-primary { background: var(--purple); color: var(--bg-white); border: none; padding: 10px 20px; border-radius: 8px; font-size: 0.88rem; font-weight: 600; cursor: pointer; transition: all 0.15s; }
.btn-primary:hover { background: var(--purple-dark); }

/* Context menu */
.cp-ctx-menu { position: fixed; z-index: 2000; background-color: var(--bg-card); border: 1px solid var(--border); border-radius: 8px; box-shadow: var(--shadow-lg); padding: 4px; min-width: 140px; }
.cp-ctx-menu button { display: block; width: 100%; padding: 8px 14px; background: none; border: none; text-align: left; font-size: 0.82rem; cursor: pointer; border-radius: 5px; }
.cp-ctx-menu button:hover { background: var(--bg-hover); }
.cp-ctx-menu button.danger { color: var(--red); }
.cp-ctx-menu button.danger:hover { background: var(--red-bg); }

/* Mobile */
.cp-picker { border-top: 1px solid var(--border-light); background-color: var(--bg-card); max-height: 200px; overflow-y: auto; }
.cp-picker-header { display: flex; justify-content: space-between; align-items: center; padding: 8px 14px; font-size: 0.75rem; font-weight: 700; color: var(--text-muted); border-bottom: 1px solid var(--border-light); position: sticky; top: 0; background-color: var(--bg-card); }
.cp-picker-header button { background: none; border: none; cursor: pointer; color: var(--text-muted); }
.cp-picker-item { display: flex; flex-direction: column; gap: 2px; padding: 8px 14px; width: 100%; background: none; border: none; border-bottom: 1px solid var(--border-light); text-align: left; cursor: pointer; transition: background 0.12s; }
.cp-picker-item:hover { background: var(--bg-hover); }
.cp-picker-label { font-size: 0.82rem; font-weight: 500; }
.cp-picker-meta { font-size: 0.72rem; color: var(--text-muted); }
.cp-picker-empty { padding: 12px 14px; font-size: 0.82rem; color: var(--text-muted); }

@media (max-width: 640px) {
  .cp-sidebar { width: 56px; }
  .cp-workspace, .cp-section-label, .cp-ch-name, .cp-dm-name, .cp-user-info, .cp-header-desc { display: none; }
  .cp-ch, .cp-dm { justify-content: center; padding: 10px; }
  .cp-share-menu, .cp-emoji-picker { left: -60px; }
}
</style>
