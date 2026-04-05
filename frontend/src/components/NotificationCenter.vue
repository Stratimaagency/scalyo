<template>
  <div class="notif-center" ref="root" style="position: relative;">
    <!-- Bell button with badge -->
    <button @click="toggle" class="notif-bell">
      🔔
      <span v-if="unreadCount > 0" class="notif-badge">{{ unreadCount > 9 ? '9+' : unreadCount }}</span>
    </button>

    <!-- Dropdown panel (shown when open) -->
    <div v-if="open" class="notif-panel">
      <div class="notif-header">
        <span style="font-weight: 700; font-size: 14px;">Notifications</span>
        <button v-if="unreadCount > 0" @click="markAllRead" style="font-size: 11px; color: var(--teal); background: none; border: none; cursor: pointer; font-weight: 600;">
          Tout marquer comme lu
        </button>
      </div>

      <div v-if="loading" style="padding: 24px; text-align: center; color: var(--muted); font-size: 13px;">Chargement...</div>

      <div v-else-if="!notifications.length" style="padding: 24px; text-align: center; color: var(--muted); font-size: 13px;">
        Aucune notification
      </div>

      <div v-else class="notif-list">
        <div v-for="n in notifications" :key="n.id"
          class="notif-item" :class="{ unread: !n.read_at }"
          @click="handleClick(n)">
          <span class="notif-icon">{{ typeIcon(n.type) }}</span>
          <div style="flex: 1; min-width: 0;">
            <div class="notif-title">{{ n.title }}</div>
            <div v-if="n.message" class="notif-msg">{{ n.message }}</div>
            <div class="notif-time">{{ timeAgo(n.created_at) }}</div>
          </div>
          <button @click.stop="remove(n.id)" class="notif-dismiss">✕</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { notificationsApi } from '../api'
import { useRouter } from 'vue-router'

const router = useRouter()
const root = ref(null)

const open = ref(false)
const loading = ref(false)
const notifications = ref([])
const unreadCount = ref(0)

let pollInterval = null

async function fetchCount() {
  try {
    const { data } = await notificationsApi.count({ _silent: true })
    unreadCount.value = data?.unread || 0
  } catch (e) {
    // silently fail
  }
}

async function fetchNotifications() {
  loading.value = true
  try {
    const { data } = await notificationsApi.list({ limit: 20 })
    notifications.value = data.results || data || []
  } catch (e) {
    notifications.value = []
  } finally {
    loading.value = false
  }
}

function toggle() {
  open.value = !open.value
  if (open.value) {
    fetchNotifications()
  }
}

async function markAllRead() {
  try {
    await notificationsApi.readAll()
    notifications.value.forEach(n => {
      n.read_at = new Date().toISOString()
    })
    unreadCount.value = 0
  } catch (e) {
    // silently fail
  }
}

async function handleClick(n) {
  if (!n.read_at) {
    try {
      await notificationsApi.read(n.id)
      n.read_at = new Date().toISOString()
      unreadCount.value = Math.max(0, unreadCount.value - 1)
    } catch (e) {
      // silently fail
    }
  }
  if (n.link) {
    router.push(n.link)
  }
  open.value = false
}

async function remove(id) {
  try {
    await notificationsApi.remove(id)
    const idx = notifications.value.findIndex(n => n.id === id)
    if (idx !== -1) {
      const removed = notifications.value[idx]
      if (!removed.read_at) {
        unreadCount.value = Math.max(0, unreadCount.value - 1)
      }
      notifications.value.splice(idx, 1)
    }
  } catch (e) {
    // silently fail
  }
}

function typeIcon(type) {
  const icons = {
    health_alert: '🚨',
    burnout_alert: '💚',
    task_due: '⏰',
    system: 'ℹ️'
  }
  return icons[type] || '📌'
}

function timeAgo(dateStr) {
  const now = Date.now()
  const then = new Date(dateStr).getTime()
  const diff = Math.floor((now - then) / 1000)

  if (diff < 60) return "il y a quelques secondes"
  if (diff < 3600) {
    const min = Math.floor(diff / 60)
    return `il y a ${min} min`
  }
  if (diff < 86400) {
    const h = Math.floor(diff / 3600)
    return `il y a ${h} h`
  }
  const j = Math.floor(diff / 86400)
  return `il y a ${j} j`
}

function onClickOutside(e) {
  if (root.value && !root.value.contains(e.target)) {
    open.value = false
  }
}

onMounted(() => {
  fetchCount()
  pollInterval = setInterval(fetchCount, 30000)
  document.addEventListener('click', onClickOutside)
})

onUnmounted(() => {
  if (pollInterval) clearInterval(pollInterval)
  document.removeEventListener('click', onClickOutside)
})
</script>

<style scoped>
.notif-center { position: relative; }
.notif-bell {
  background: none; border: none; cursor: pointer; font-size: 20px; position: relative;
  padding: 6px; border-radius: 8px; transition: background .2s;
}
.notif-bell:hover { background: rgba(0,0,0,.05); }
.notif-badge {
  position: absolute; top: 0; right: 0; background: #dc2626; color: white;
  font-size: 9px; font-weight: 800; min-width: 16px; height: 16px;
  border-radius: 8px; display: flex; align-items: center; justify-content: center;
  padding: 0 4px;
}
.notif-panel {
  position: absolute; top: 100%; right: 0; width: 360px; max-height: 440px;
  background: var(--card, white); border: 1px solid var(--border); border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0,0,0,.12); z-index: 100; overflow: hidden;
  display: flex; flex-direction: column;
}
.notif-header {
  display: flex; justify-content: space-between; align-items: center;
  padding: 12px 16px; border-bottom: 1px solid var(--border);
}
.notif-list { overflow-y: auto; max-height: 380px; }
.notif-item {
  display: flex; gap: 10px; padding: 10px 16px; cursor: pointer;
  border-bottom: 1px solid var(--border); transition: background .15s; align-items: flex-start;
}
.notif-item:hover { background: rgba(0,0,0,.02); }
.notif-item.unread { background: rgba(77,182,160,.05); }
.notif-icon { font-size: 18px; flex-shrink: 0; margin-top: 2px; }
.notif-title { font-size: 13px; font-weight: 600; color: var(--text); }
.notif-msg { font-size: 11px; color: var(--muted); margin-top: 2px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.notif-time { font-size: 10px; color: var(--muted); margin-top: 3px; }
.notif-dismiss { background: none; border: none; cursor: pointer; color: var(--muted); font-size: 12px; padding: 2px; opacity: 0; transition: opacity .15s; }
.notif-item:hover .notif-dismiss { opacity: 1; }
</style>
