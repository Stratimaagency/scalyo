<template>
  <div class="app-layout" :class="{ collapsed: app.sidebarCollapsed }">

    <div v-if="app.sidebarMobileOpen" class="sidebar-overlay" @click="app.closeMobileSidebar()" />

    <!-- SIDEBAR -->
    <aside class="sidebar" :class="{ open: app.sidebarMobileOpen }">
      <div class="sidebar-logo">
        <ScalyoLogo :size="app.sidebarCollapsed ? 28 : 32" />
        <span v-if="!app.sidebarCollapsed" class="logo-text">Scalyo</span>
      </div>
      <nav class="sidebar-nav">
        <template v-for="section in sidebarSections" :key="section.label">
          <div v-if="!app.sidebarCollapsed && section.label" class="nav-section-label">{{ t(section.label) }}</div>
          <template v-for="item in section.items" :key="item.name">
            <div v-if="item.children" class="nav-group">
              <router-link :to="item.to" class="nav-item" :class="{ active: isActiveGroup(item) }" @click="app.closeMobileSidebar()">
                <span class="nav-icon">{{ item.icon }}</span>
                <span v-if="!app.sidebarCollapsed" class="nav-label">{{ t(item.label) }}</span>
              </router-link>
              <div v-if="isActiveGroup(item) && !app.sidebarCollapsed" class="nav-subitems">
                <router-link v-for="sub in item.children" :key="sub.name" :to="sub.to" class="nav-subitem" :class="{ active: route.name === sub.name }" @click="app.closeMobileSidebar()">
                  {{ t(sub.label) }}
                </router-link>
              </div>
            </div>
            <router-link v-else :to="item.to" class="nav-item" :class="{ active: route.name === item.name }" @click="app.closeMobileSidebar()">
              <span class="nav-icon">{{ item.icon }}</span>
              <span v-if="!app.sidebarCollapsed" class="nav-label">{{ t(item.label) }}</span>
            </router-link>
          </template>
        </template>
      </nav>
      <button class="sidebar-toggle hide-mobile" @click="app.toggleSidebar()">
        {{ app.sidebarCollapsed ? '→' : '←' }}
      </button>
    </aside>

    <!-- MAIN -->
    <div class="main-wrapper">
      <!-- TOPBAR -->
      <header class="topbar">
        <button class="topbar-burger hide-desktop" @click="app.toggleMobileSidebar()">
          <span /><span /><span />
        </button>
        <div class="topbar-left">
          <ScalyoLogo :size="24" class="hide-desktop topbar-logo-mobile" />
        </div>
        <div class="topbar-right">
          <!-- Lang switch -->
          <div class="lang-switch">
            <button v-for="l in langs" :key="l.code" :class="{ active: currentLocale === l.code }" @click="switchLocale(l.code)">{{ l.label }}</button>
          </div>

          <!-- Notifications -->
          <div class="topbar-notif" ref="notifRef">
            <button class="notif-btn" @click="notifOpen = !notifOpen">
              🔔
              <span v-if="notifications.unreadCount" class="notif-badge">{{ notifications.unreadCount }}</span>
            </button>
            <transition name="fade">
              <div v-if="notifOpen" class="notif-dropdown">
                <div class="notif-header">
                  <strong>{{ t('topbar_notifications') }}</strong>
                  <div class="notif-header-actions">
                    <button v-if="notifications.unreadCount" class="notif-mark-read" @click="notifications.markAllRead()">{{ t('topbar_mark_all_read') }}</button>
                    <button v-if="notifications.notifications.length" class="notif-clear" @click="notifications.clearAll()" title="Vider">🗑</button>
                  </div>
                </div>
                <div class="notif-list">
                  <div
                    v-for="n in notifications.notifications"
                    :key="n.id"
                    class="notif-item"
                    :class="{ unread: !n.read }"
                    @click="onNotifClick(n)"
                  >
                    <span class="notif-icon">{{ n.icon }}</span>
                    <div class="notif-content">
                      <strong>{{ n.title }}</strong>
                      <p>{{ n.body }}</p>
                      <span class="notif-time">{{ fmtNotifDate(n.createdAt) }}</span>
                    </div>
                    <span v-if="!n.read" class="notif-unread-dot" />
                  </div>
                  <div v-if="!notifications.notifications.length" class="notif-empty">{{ t('topbar_no_notifications') }}</div>
                </div>
              </div>
            </transition>
          </div>

          <!-- User -->
          <div class="topbar-user">
            <div class="user-avatar">{{ auth.user?.firstName?.[0] || 'U' }}</div>
            <div class="user-info hide-mobile">
              <span class="user-company">{{ auth.company?.name }}</span>
              <span class="user-badges">
                <span class="badge plan">{{ auth.company?.planLabel }}</span>
                <span class="badge role">{{ auth.user?.roleLabel }}</span>
              </span>
            </div>
          </div>
        </div>
      </header>

      <!-- CONTENT -->
      <main class="main-content">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </main>
    </div>

    <!-- CHAT FAB -->
    <button class="chat-fab" @click="app.toggleChat()" :class="{ active: app.chatOpen }">
      💬
      <span v-if="chatStore.totalUnread" class="chat-fab-badge">{{ chatStore.totalUnread }}</span>
    </button>
    <transition name="slide-right">
      <div v-if="app.chatOpen" class="chat-panel-wrapper">
        <ChatPanel @close="app.toggleChat()" />
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { onClickOutside } from '@vueuse/core'
import ScalyoLogo from '@/components/ScalyoLogo.vue'
import ChatPanel from '@/components/chat/ChatPanel.vue'
import { useAppStore } from '@/stores/app'
import { useAuthStore } from '@/stores/auth'
import { useNotificationStore } from '@/stores/notifications'
import { useChatStore } from '@/stores/chat'
import { useClientStore } from '@/stores/clients'
import { useTaskStore } from '@/stores/tasks'
import { useTeamStore } from '@/stores/team'

const route = useRoute()
const router = useRouter()
const { t, locale } = useI18n({ useScope: 'global' })
const app = useAppStore()
const auth = useAuthStore()
const notifications = useNotificationStore()
const chatStore = useChatStore()
const clientStore = useClientStore()
const taskStore = useTaskStore()
const teamStore = useTeamStore()

// ─── Notifications ─────────────────────────────────────────────────────────────
const notifOpen = ref(false)
const notifRef = ref(null)
onClickOutside(notifRef, () => { notifOpen.value = false })

// Génère les notifications depuis les vraies données au démarrage
// Les doublons sont ignorés — les notifs déjà lues restent lues
notifications.generateFromData(
  clientStore.clients,
  taskStore.tasks,
  teamStore.members,
)

function onNotifClick(n) {
  notifications.markRead(n.id)
  notifOpen.value = false
  if (n.route) router.push(n.route)
}

function fmtNotifDate(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  const now = new Date()
  const diffMin = Math.round((now - d) / 60000)
  if (diffMin < 2) return "à l'instant"
  if (diffMin < 60) return `il y a ${diffMin} min`
  const diffH = Math.round(diffMin / 60)
  if (diffH < 24) return `il y a ${diffH}h`
  const diffD = Math.round(diffH / 24)
  if (diffD < 7) return `il y a ${diffD}j`
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
}

// ─── Langue ────────────────────────────────────────────────────────────────────
const currentLocale = computed(() => locale.value)
const langs = [
  { code: 'fr', label: 'FR' },
  { code: 'en', label: 'EN' },
  { code: 'ko', label: '한국어' },
]
function switchLocale(code) {
  locale.value = code
  app.setLocale(code)
}

// ─── Sidebar ───────────────────────────────────────────────────────────────────
function isActiveGroup(item) {
  return item.children?.some(c => route.name === c.name) || route.name === item.name
}

const sidebarSections = [
  {
    label: 'sidebar_dashboard_section',
    items: [
      { name: 'dashboard', icon: '📊', label: 'sidebar_dashboard', to: '/app/dashboard' },
      { name: 'manager', icon: '👥', label: 'sidebar_manager', to: '/app/manager' },
    ],
  },
  {
    label: 'sidebar_clients_section',
    items: [
      { name: 'portfolio', icon: '💼', label: 'sidebar_portfolio', to: '/app/portfolio' },
      { name: 'satisfaction', icon: '⭐', label: 'sidebar_satisfaction', to: '/app/satisfaction' },
      { name: 'playbooks', icon: '📋', label: 'sidebar_playbooks', to: '/app/playbooks' },
    ],
  },
  {
    label: 'sidebar_performance_section',
    items: [
      { name: 'kpis', icon: '📈', label: 'sidebar_kpis', to: '/app/kpis' },
      { name: 'okr', icon: '🎯', label: 'sidebar_okr', to: '/app/okr' },
      { name: 'roadmap', icon: '🗺️', label: 'sidebar_roadmap', to: '/app/roadmap' },
    ],
  },
  {
    label: 'sidebar_projects_section',
    items: [
      {
        name: 'tasks', icon: '⚡', label: 'sidebar_smart_matrice', to: '/app/tasks/stats',
        children: [
          { name: 'tasks-stats', label: 'sidebar_stats', to: '/app/tasks/stats' },
          { name: 'tasks-planning', label: 'sidebar_planning', to: '/app/tasks/planning' },
          { name: 'tasks-projects', label: 'sidebar_projects', to: '/app/tasks/projects' },
          { name: 'tasks-kanban', label: 'sidebar_kanban', to: '/app/tasks/kanban' },
          { name: 'tasks-priorities', label: 'sidebar_priorities', to: '/app/tasks/priorities' },
          { name: 'tasks-team', label: 'sidebar_team_tasks', to: '/app/tasks/team' },
          { name: 'tasks-settings', label: 'sidebar_task_settings', to: '/app/tasks/settings' },
        ],
      },
    ],
  },
  {
    label: 'sidebar_team_section',
    items: [
      { name: 'workload', icon: '💚', label: 'sidebar_health_tracker', to: '/app/workload' },
      { name: 'wellbeing', icon: '🧘', label: 'sidebar_wellbeing', to: '/app/wellbeing' },
      { name: 'coach', icon: '🤖', label: 'sidebar_coach', to: '/app/coach' },
    ],
  },
  {
    label: 'sidebar_tools_section',
    items: [
      { name: 'email-studio', icon: '📧', label: 'sidebar_email_studio', to: '/app/email-studio' },
      { name: 'quotes', icon: '📄', label: 'sidebar_quotes', to: '/app/quotes' },
      { name: 'import', icon: '📥', label: 'sidebar_import', to: '/app/import' },
      { name: 'integrations', icon: '🔌', label: 'sidebar_integrations', to: '/app/integrations' },
    ],
  },
  {
    label: 'sidebar_resources_section',
    items: [
      {
        name: 'resources', icon: '📚', label: 'sidebar_resources', to: '/app/resources/library',
        children: [
          { name: 'resources-library', label: 'sidebar_res_library', to: '/app/resources/library' },
          { name: 'resources-masterclass', label: 'sidebar_res_masterclass', to: '/app/resources/masterclass' },
          { name: 'resources-guides', label: 'sidebar_res_guides', to: '/app/resources/guides' },
          { name: 'resources-tools', label: 'sidebar_res_tools', to: '/app/resources/tools' },
          { name: 'resources-wellbeing', label: 'sidebar_res_wellbeing', to: '/app/resources/wellbeing' },
        ],
      },
    ],
  },
  {
    label: '',
    items: [
      { name: 'settings', icon: '⚙️', label: 'sidebar_settings', to: '/app/settings' },
    ],
  },
]
</script>

<style scoped>
/* ═══ LAYOUT ═══ */
.app-layout { display: flex; min-height: 100vh; }
.main-wrapper { flex: 1; display: flex; flex-direction: column; min-width: 0; margin-left: var(--sidebar-width); transition: margin-left var(--transition-slow); }
.app-layout.collapsed .main-wrapper { margin-left: var(--sidebar-collapsed); }

/* ═══ SIDEBAR ═══ */
.sidebar { position: fixed; top: 0; left: 0; bottom: 0; width: var(--sidebar-width); background: #fff; border-right: 1px solid var(--border); display: flex; flex-direction: column; z-index: 100; transition: width var(--transition-slow); overflow-y: auto; overflow-x: hidden; }
.app-layout.collapsed .sidebar { width: var(--sidebar-collapsed); }
.sidebar-logo { display: flex; align-items: center; gap: 10px; padding: 16px 20px; border-bottom: 1px solid var(--border-light); flex-shrink: 0; }
.logo-text { font-weight: 800; font-size: 1.15rem; background: linear-gradient(135deg, var(--purple), #a78bfa); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
.sidebar-nav { flex: 1; padding: 8px; }
.nav-section-label { font-size: 0.65rem; font-weight: 700; color: var(--text-muted); letter-spacing: 0.08em; padding: 16px 12px 6px; }
.nav-item { display: flex; align-items: center; gap: 10px; padding: 9px 12px; border-radius: var(--radius-sm); color: var(--text-secondary); font-size: 0.875rem; font-weight: 500; transition: all 0.15s; }
.nav-item:hover { background: var(--bg-hover); color: var(--text); }
.nav-item.active { background: var(--purple-bg); color: var(--purple); font-weight: 600; }
.nav-icon { font-size: 1.1rem; width: 24px; text-align: center; flex-shrink: 0; }
.nav-label { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.nav-subitems { margin-left: 34px; border-left: 2px solid var(--border-light); padding-left: 10px; margin-bottom: 4px; }
.nav-subitem { display: block; padding: 5px 8px; font-size: 0.8rem; color: var(--text-muted); border-radius: 6px; transition: all 0.15s; }
.nav-subitem:hover { color: var(--text); background: var(--bg-hover); }
.nav-subitem.active { color: var(--purple); font-weight: 600; }
.sidebar-toggle { width: 100%; padding: 12px; border: none; background: none; color: var(--text-muted); font-size: 0.85rem; border-top: 1px solid var(--border-light); transition: background 0.15s; }
.sidebar-toggle:hover { background: var(--bg-hover); }
.sidebar-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.3); z-index: 99; }

/* ═══ TOPBAR ═══ */
.topbar { height: var(--topbar-height); background: #fff; border-bottom: 1px solid var(--border); display: flex; align-items: center; padding: 0 20px; gap: 12px; position: sticky; top: 0; z-index: 50; }
.topbar-burger { display: none; flex-direction: column; gap: 4px; background: none; border: none; padding: 6px; }
.topbar-burger span { display: block; width: 20px; height: 2px; background: var(--text); border-radius: 1px; }
.topbar-left { flex: 1; }
.topbar-right { display: flex; align-items: center; gap: 12px; }
.lang-switch { display: flex; gap: 2px; background: var(--bg); border-radius: 8px; padding: 2px; }
.lang-switch button { background: none; border: none; color: var(--text-muted); font-size: 0.72rem; padding: 4px 8px; border-radius: 6px; transition: all 0.15s; font-weight: 500; }
.lang-switch button.active { background: var(--purple); color: #fff; font-weight: 600; }

/* ─── Notifications ────────────────────────────────────────────────────────── */
.topbar-notif { position: relative; }
.notif-btn { background: none; border: none; font-size: 1.2rem; padding: 4px; position: relative; cursor: pointer; }
.notif-badge { position: absolute; top: -2px; right: -4px; background: var(--red); color: #fff; font-size: 0.6rem; font-weight: 700; width: 18px; height: 18px; border-radius: 50%; display: flex; align-items: center; justify-content: center; }
.notif-dropdown { position: absolute; top: 100%; right: 0; margin-top: 8px; width: 360px; background: #fff; border-radius: var(--radius-md); box-shadow: var(--shadow-lg); border: 1px solid var(--border); z-index: 200; }
.notif-header { display: flex; justify-content: space-between; align-items: center; padding: 14px 16px; border-bottom: 1px solid var(--border-light); }
.notif-header strong { font-size: 0.9rem; }
.notif-header-actions { display: flex; align-items: center; gap: 8px; }
.notif-mark-read { background: none; border: none; color: var(--purple); font-size: 0.75rem; font-weight: 500; cursor: pointer; }
.notif-clear { background: none; border: none; font-size: 0.85rem; cursor: pointer; opacity: 0.5; transition: opacity 0.15s; padding: 0; }
.notif-clear:hover { opacity: 1; }
.notif-list { max-height: 320px; overflow-y: auto; }
.notif-item { display: flex; gap: 10px; padding: 12px 16px; border-bottom: 1px solid var(--border-light); cursor: pointer; transition: background 0.15s; align-items: flex-start; }
.notif-item:hover { background: var(--bg-hover); }
.notif-item.unread { background: var(--purple-bg); }
.notif-icon { font-size: 1.2rem; flex-shrink: 0; margin-top: 2px; }
.notif-content { flex: 1; min-width: 0; }
.notif-content strong { font-size: 0.82rem; display: block; margin-bottom: 2px; }
.notif-content p { font-size: 0.75rem; color: var(--text-secondary); line-height: 1.4; margin: 0; }
.notif-time { font-size: 0.68rem; color: var(--text-muted); margin-top: 3px; display: block; }
.notif-unread-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--purple); flex-shrink: 0; margin-top: 6px; }
.notif-empty { padding: 24px; text-align: center; color: var(--text-muted); font-size: 0.85rem; }

/* ─── User ─────────────────────────────────────────────────────────────────── */
.topbar-user { display: flex; align-items: center; gap: 8px; }
.user-avatar { width: 32px; height: 32px; border-radius: 50%; background: linear-gradient(135deg, var(--purple), var(--purple-dark)); color: #fff; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.8rem; flex-shrink: 0; }
.user-info { display: flex; flex-direction: column; }
.user-company { font-size: 0.8rem; font-weight: 600; color: var(--text); line-height: 1.2; }
.user-badges { display: flex; gap: 4px; margin-top: 2px; }
.badge { font-size: 0.6rem; font-weight: 600; padding: 1px 6px; border-radius: 4px; }
.badge.plan { background: var(--purple-bg); color: var(--purple); }
.badge.role { background: var(--green-bg); color: var(--green); }

/* ═══ MAIN CONTENT ═══ */
.main-content { flex: 1; padding: 24px; max-width: 100%; }

/* ═══ CHAT FAB ═══ */
.chat-fab { position: fixed; bottom: 24px; right: 24px; width: 52px; height: 52px; border-radius: 50%; background: var(--purple); color: #fff; border: none; font-size: 1.4rem; box-shadow: var(--shadow-lg); z-index: 400; transition: all 0.2s; display: flex; align-items: center; justify-content: center; }
.chat-fab:hover { transform: scale(1.08); box-shadow: 0 8px 30px rgba(124,58,237,0.3); }
.chat-fab.active { background: var(--text); }
.chat-fab-badge { position: absolute; top: -4px; right: -4px; background: var(--red); color: #fff; font-size: 0.6rem; font-weight: 700; width: 18px; height: 18px; border-radius: 50%; display: flex; align-items: center; justify-content: center; }
.chat-panel-wrapper { position: fixed; bottom: 88px; right: 24px; width: 680px; height: 520px; background: #fff; border-radius: var(--radius-lg); box-shadow: var(--shadow-xl); z-index: 399; border: 1px solid var(--border); overflow: hidden; }

/* ═══ RESPONSIVE ═══ */
@media (max-width: 1024px) {
  .sidebar { width: var(--sidebar-collapsed); }
  .sidebar .nav-label, .sidebar .nav-section-label, .sidebar .logo-text, .sidebar .nav-subitems { display: none; }
  .main-wrapper { margin-left: var(--sidebar-collapsed); }
  .app-layout.collapsed .main-wrapper { margin-left: var(--sidebar-collapsed); }
}
@media (max-width: 768px) {
  .sidebar { transform: translateX(-100%); width: var(--sidebar-width); z-index: 100; }
  .sidebar.open { transform: translateX(0); }
  .sidebar .nav-label, .sidebar .nav-section-label, .sidebar .logo-text, .sidebar .nav-subitems { display: unset; }
  .main-wrapper { margin-left: 0 !important; }
  .topbar-burger { display: flex; }
  .hide-mobile { display: none !important; }
  .main-content { padding: 16px; }
  .notif-dropdown { width: calc(100vw - 32px); right: -60px; }
  .chat-panel-wrapper { right: 0; left: 0; bottom: 0; top: 0; width: 100%; height: 100%; border-radius: 0; }
}
@media (min-width: 769px) { .hide-desktop { display: none !important; } }
@media (min-width: 769px) { .topbar-logo-mobile { display: none; } }
</style>
