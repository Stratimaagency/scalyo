<template>
  <ErrorBoundary>
  <div class="chat-layout">
    <!-- Sidebar: channel list -->
    <aside class="chat-sidebar">
      <div class="chat-sidebar-header">
        <h2>{{ t('chat_title') }}</h2>
        <button class="btn-icon" @click="showNewChannel = !showNewChannel" :title="t('chat_new_channel')">+</button>
      </div>

      <div v-if="showNewChannel" class="new-channel-form">
        <input v-model="newChannelName" :placeholder="t('chat_channel_name')" class="fi" @keyup.enter="handleCreateChannel" />
        <button class="btn-sm" @click="handleCreateChannel" :disabled="!newChannelName.trim()">{{ t('chat_create') }}</button>
      </div>

      <div v-if="chatStore.channelsLoading" class="channel-loading">{{ t('chat_loading') }}</div>
      <div class="channel-list">
        <div
          v-for="ch in chatStore.channels"
          :key="ch.id"
          class="channel-item"
          :class="{ active: chatStore.activeChannel === ch.id }"
          @click="handleSelectChannel(ch.id)"
        >
          <span class="channel-name"># {{ ch.name }}</span>
          <span v-if="chatStore.unreadCounts[ch.id]" class="badge">{{ chatStore.unreadCounts[ch.id] }}</span>
        </div>
      </div>
    </aside>

    <!-- Main: messages -->
    <div v-if="chatStore.lastError" class="chat-error-toast">
        <span>{{ chatStore.lastError }}</span>
        <button @click="chatStore.clearError()" class="btn-ghost">✕</button>
      </div>
      <main class="chat-main">
      <div v-if="!chatStore.activeChannel" class="chat-empty">
        <p>{{ t('chat_select_channel') }}</p>
      </div>

      <template v-else>
        <div class="chat-header">
          <h3># {{ activeChannelName }}</h3>
          <span class="chat-header-desc">{{ activeChannelDesc }}</span>
        </div>

        <div class="chat-messages" ref="messagesContainer">
          <div v-if="chatStore.messagesLoading" class="chat-messages-loading">{{ t('chat_loading') }}</div>
          <button v-if="chatStore.activeMessages.length >= 100" class="btn-load-more" @click="handleLoadMore">{{ t('chat_load_more') }}</button>
          <div v-if="chatStore.activeMessages.length === 0 && !chatStore.messagesLoading" class="chat-no-messages">
            <p>{{ t('chat_no_messages') }}</p>
          </div>
          <div
            v-for="msg in chatStore.activeMessages"
            :key="msg.id"
            class="message"
            :class="{ 'message-own': msg.authorId === currentUserId, 'message-pinned': msg.pinned }"
          >
            <div class="message-header">
              <strong class="message-author">{{ msg.author }}</strong>
              <time class="message-time">{{ formatTime(msg.timestamp) }}</time>
              <span v-if="msg.pinned" class="pin-badge">📌</span>
            </div>
            <div v-if="msg.replyTo" class="message-reply-indicator">
              ↩ {{ t('chat_reply') }}
            </div>
            <p class="message-content">{{ msg.content }}</p>
            <div v-if="msg.reactions && msg.reactions.length" class="message-reactions">
              <span v-for="(r, ri) in msg.reactions" :key="ri" class="reaction" @click="handleReaction(msg.id, r.emoji)">
                {{ r.emoji }} {{ r.count }}
              </span>
            </div>
            <div class="message-actions">
              <button v-if="msg.authorId === currentUserId" @click="handleDeleteMessage(msg.id)" class="btn-ghost">🗑️</button>
              <button @click="chatStore.setReplyTo(chatStore.activeChannel, msg.id)" class="btn-ghost">↩</button>
              <button @click="handlePin(msg.id)" class="btn-ghost">📌</button>
            </div>
          </div>
        </div>

        <div v-if="chatStore.replyingTo" class="reply-bar">
          <span>{{ t('chat_replying') }}</span>
          <button @click="chatStore.replyingTo = null" class="btn-ghost">✕</button>
        </div>

        <div class="chat-input-bar">
          <input
            v-model="newMessage"
            :placeholder="t('chat_placeholder')"
            class="fi chat-input"
            @keyup.enter="handleSend"
            :disabled="chatStore.sending"
          />
          <button class="btn-primary" @click="handleSend" :disabled="!newMessage.trim() || chatStore.sending">
            {{ t('chat_send') }}
          </button>
        </div>
      </template>
    </main>
  </div>
  </ErrorBoundary>
</template>

<script setup>
import { ref, computed, nextTick, watch, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useChatStore } from '@/stores/chat'
import { useAuthStore } from '@/stores/auth'
import ErrorBoundary from '@/components/ErrorBoundary.vue'

const { t } = useI18n()
const chatStore = useChatStore()
const authStore = useAuthStore()

const newMessage = ref('')
const newChannelName = ref('')
const showNewChannel = ref(false)
// sending state from chatStore.sending
const messagesContainer = ref(null)

const currentUserId = computed(() => authStore.user?.id)
const activeChannelName = computed(() => {
  const ch = chatStore.channels.find(c => c.id === chatStore.activeChannel)
  return ch?.name || ''
})
const activeChannelDesc = computed(() => {
  const ch = chatStore.channels.find(c => c.id === chatStore.activeChannel)
  return ch?.description || ''
})

function formatTime(ts) {
  if (!ts) return ''
  const d = new Date(ts)
  const now = new Date()
  const isToday = d.toDateString() === now.toDateString()
  const time = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  return isToday ? time : d.toLocaleDateString([], { day: '2-digit', month: '2-digit' }) + ' ' + time
}

async function handleSend() {
  const content = newMessage.value.trim()
  if (!content) return
  sending.value = true
  try {
    await chatStore.sendMessage(chatStore.activeChannel, content)
    newMessage.value = ''
    await nextTick()
    scrollToBottom()
  } catch (e) {
    console.error('Chat send failed:', e.message || e)
  } finally {
  }
}

async function handleCreateChannel() {
  const name = newChannelName.value.trim()
  if (!name) return
  try {
    await chatStore.createChannel(name)
    newChannelName.value = ''
    showNewChannel.value = false
  } catch (e) {
    console.error('Channel creation failed:', e.message || e)
  }
}

async function handleSelectChannel(id) {
  try {
    await chatStore.setActive(id)
    await nextTick()
    scrollToBottom()
  } catch (e) {
    console.error('Channel select failed:', e.message || e)
  }
}

async function handleDeleteMessage(msgId) {
  try {
    await chatStore.deleteMessage(chatStore.activeChannel, msgId)
  } catch (e) {
    console.error('Message delete failed:', e.message || e)
  }
}

async function handlePin(msgId) {
  try {
    await chatStore.pinMessage(chatStore.activeChannel, msgId)
  } catch (e) {
    console.error('Pin failed:', e.message || e)
  }
}

async function handleReaction(msgId, emoji) {
  try {
    await chatStore.addReaction(chatStore.activeChannel, msgId, emoji, currentUserId.value)
  } catch (e) {
    console.error('Reaction failed:', e.message || e)
  }
}

async function handleLoadMore() {
  try { await chatStore.loadOlderMessages(chatStore.activeChannel) } catch (e) { console.error('Load more failed:', e.message || e) }
}

function scrollToBottom() {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

watch(() => chatStore.activeMessages.length, () => {
  nextTick(() => scrollToBottom())
})

onMounted(async () => {
  try {
    if (chatStore.channels.length === 0) {
      await chatStore.init()
    }
    await nextTick()
    scrollToBottom()
  } catch (e) {
    console.error('Chat init failed:', e.message || e)
  }
})
</script>

<style scoped>
.chat-layout { display: flex; height: calc(100vh - 64px); background: var(--bg-primary, #fff); }
.chat-sidebar { width: 260px; border-right: 1px solid var(--border, #e5e7eb); display: flex; flex-direction: column; background: var(--bg-secondary, #f9fafb); }
.chat-sidebar-header { display: flex; align-items: center; justify-content: space-between; padding: 16px; border-bottom: 1px solid var(--border, #e5e7eb); }
.chat-sidebar-header h2 { font-size: 16px; font-weight: 600; margin: 0; }
.btn-icon { width: 28px; height: 28px; border-radius: 6px; border: 1px solid var(--border, #e5e7eb); background: var(--bg-primary, #fff); cursor: pointer; font-size: 16px; display: flex; align-items: center; justify-content: center; }
.btn-icon:hover { background: var(--bg-hover, #f3f4f6); }
.new-channel-form { display: flex; gap: 8px; padding: 12px 16px; border-bottom: 1px solid var(--border, #e5e7eb); }
.new-channel-form .fi { flex: 1; font-size: 13px; }
.btn-sm { padding: 6px 12px; font-size: 12px; border-radius: 6px; border: none; background: var(--accent, #2563eb); color: #fff; cursor: pointer; }
.btn-sm:disabled { opacity: 0.5; cursor: not-allowed; }
.channel-list { flex: 1; overflow-y: auto; padding: 8px 0; }
.channel-item { display: flex; align-items: center; justify-content: space-between; padding: 8px 16px; cursor: pointer; transition: background 0.15s; }
.channel-item:hover { background: var(--bg-hover, #f3f4f6); }
.channel-item.active { background: var(--bg-active, #eff6ff); border-right: 2px solid var(--accent, #2563eb); }
.channel-name { font-size: 14px; color: var(--text-secondary, #374151); }
.channel-item.active .channel-name { color: var(--accent, #2563eb); font-weight: 500; }
.badge { background: var(--accent, #2563eb); color: #fff; font-size: 11px; padding: 1px 6px; border-radius: 10px; min-width: 18px; text-align: center; }
.chat-main { flex: 1; display: flex; flex-direction: column; min-width: 0; }
.chat-empty { flex: 1; display: flex; align-items: center; justify-content: center; color: var(--text-muted, #9ca3af); }
.chat-header { padding: 16px 20px; border-bottom: 1px solid var(--border, #e5e7eb); }
.chat-header h3 { margin: 0; font-size: 15px; font-weight: 600; }
.chat-header-desc { font-size: 12px; color: var(--text-muted, #9ca3af); }
.chat-messages { flex: 1; overflow-y: auto; padding: 16px 20px; display: flex; flex-direction: column; gap: 12px; }
.chat-no-messages { flex: 1; display: flex; align-items: center; justify-content: center; color: var(--text-muted, #9ca3af); }
.message { padding: 10px 14px; border-radius: 8px; background: var(--bg-secondary, #f9fafb); position: relative; }
.message-own { background: var(--bg-active, #eff6ff); }
.message-pinned { border-left: 3px solid #f59e0b; }
.message-header { display: flex; align-items: baseline; gap: 8px; margin-bottom: 4px; }
.message-author { font-size: 13px; color: var(--text-primary, #111827); }
.message-time { font-size: 11px; color: var(--text-muted, #9ca3af); }
.pin-badge { font-size: 11px; }
.message-reply-indicator { font-size: 11px; color: var(--accent, #2563eb); margin-bottom: 4px; }
.message-content { font-size: 14px; line-height: 1.5; margin: 0; color: var(--text-primary, #111827); word-break: break-word; }
.message-reactions { display: flex; gap: 4px; margin-top: 6px; }
.reaction { font-size: 12px; padding: 2px 6px; border-radius: 12px; background: var(--bg-primary, #fff); border: 1px solid var(--border, #e5e7eb); cursor: pointer; }
.reaction:hover { background: var(--bg-hover, #f3f4f6); }
.message-actions { display: none; position: absolute; top: 6px; right: 6px; gap: 2px; }
.message:hover .message-actions { display: flex; }
.btn-ghost { background: none; border: none; cursor: pointer; font-size: 13px; padding: 2px 4px; border-radius: 4px; opacity: 0.6; }
.btn-ghost:hover { opacity: 1; background: var(--bg-hover, #f3f4f6); }
.reply-bar { display: flex; align-items: center; justify-content: space-between; padding: 6px 20px; background: var(--bg-active, #eff6ff); font-size: 12px; color: var(--accent, #2563eb); border-top: 1px solid var(--border, #e5e7eb); }
.chat-input-bar { display: flex; gap: 8px; padding: 12px 20px; border-top: 1px solid var(--border, #e5e7eb); }
.chat-input { flex: 1; }
.channel-loading, .chat-messages-loading { padding: 16px; text-align: center; color: var(--text-muted, #9ca3af); font-size: 13px; }
.chat-error-toast { display: flex; align-items: center; justify-content: space-between; padding: 8px 16px; background: #fef2f2; border-bottom: 1px solid #fecaca; color: #dc2626; font-size: 13px; }
.btn-load-more { display: block; margin: 0 auto 12px; padding: 6px 16px; font-size: 12px; border-radius: 6px; border: 1px solid var(--border, #e5e7eb); background: var(--bg-primary, #fff); cursor: pointer; }
.btn-load-more:hover { background: var(--bg-hover, #f3f4f6); }
</style>