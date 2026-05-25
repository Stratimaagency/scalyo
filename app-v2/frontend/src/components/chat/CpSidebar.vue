<template>
  <aside class="cp-sidebar">
    <div class="cp-sidebar-header">
      <span class="cp-sidebar-title">{{ t('chat_channels') }}</span>
      <button v-if="canCreateChannel" class="cp-sidebar-add" :title="t('chat_add_channel')" @click="$emit('create-channel')">+</button>
      <button class="cp-sidebar-close" @click="$emit('close')">â</button>
    </div>

    <div class="cp-sidebar-list">
      <div
        v-for="ch in channelList"
        :key="ch.id"
        class="cp-sidebar-item"
        :class="{ active: store.activeChannel === ch.id }"
        @click="$emit('select', ch.id)"
      >
        <span class="cp-ch-icon">#</span>
        <span class="cp-ch-name">{{ ch.name }}</span>
        <span v-if="store.unreadCounts[ch.id]" class="cp-badge">{{ store.unreadCounts[ch.id] }}</span>
      </div>
    </div>

    <div class="cp-sidebar-section">{{ t('chat_direct') }}</div>
    <div class="cp-sidebar-list">
      <div
        v-for="(member, idx) in dmMembers"
        :key="member.id"
        class="cp-sidebar-item"
        @click="$emit('select', 'dm_' + member.id)"
      >
        <span class="cp-avatar" :style="{ background: avatarColors[idx % avatarColors.length] }">
          {{ member.name?.charAt(0) || '?' }}
        </span>
        <span class="cp-ch-name">{{ member.name }}</span>
      </div>
    </div>

    <div class="cp-sidebar-footer">
      <span class="cp-user-dot"></span>
      <span class="cp-user-name">{{ userName }}</span>
      <span class="cp-user-status">{{ t('chat_online') }}</span>
    </div>
  </aside>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useChatStore } from '@/stores/chat'
import { useAuthStore } from '@/stores/auth'
import { useTeamStore } from '@/stores/team'

defineEmits(['select', 'create-channel', 'close'])

const { t } = useI18n()
const store = useChatStore()
const authStore = useAuthStore()
const teamStore = useTeamStore()

const avatarColors = ['var(--purple)', 'var(--green)', 'var(--blue)', 'var(--amber)', 'var(--red)']

const channelList = computed(() => store.channels.filter(c => c.type === 'channel'))
const dmMembers = computed(() => (teamStore.members || []).filter(m => m.id !== authStore.user?.id))
const userName = computed(() => authStore.profile?.first_name || '')
const canCreateChannel = computed(() => {
  const role = authStore.profile?.org_role
  return role === 'owner' || role === 'admin'
})
</script>

<style scoped>
.cp-sidebar { width: 220px; border-right: 1px solid var(--border); display: flex; flex-direction: column; background: var(--bg); }
.cp-sidebar-header { display: flex; align-items: center; gap: 6px; padding: 12px 14px; border-bottom: 1px solid var(--border-light); }
.cp-sidebar-title { font-size: 13px; font-weight: 600; color: var(--text); flex: 1; }
.cp-sidebar-add { width: 24px; height: 24px; border-radius: 6px; border: 1px solid var(--border); background: var(--bg-white); cursor: pointer; font-size: 14px; display: flex; align-items: center; justify-content: center; color: var(--text-secondary); }
.cp-sidebar-add:hover { background: var(--bg-hover); }
.cp-sidebar-close { background: none; border: none; cursor: pointer; font-size: 13px; color: var(--text-muted); padding: 2px; }
.cp-sidebar-section { font-size: 11px; font-weight: 600; text-transform: uppercase; color: var(--text-muted); padding: 12px 14px 4px; letter-spacing: 0.5px; }
.cp-sidebar-list { display: flex; flex-direction: column; }
.cp-sidebar-item { display: flex; align-items: center; gap: 8px; padding: 6px 14px; cursor: pointer; transition: background 0.12s; }
.cp-sidebar-item:hover { background: var(--bg-hover); }
.cp-sidebar-item.active { background: var(--purple-bg); }
.cp-ch-icon { font-size: 14px; color: var(--text-muted); width: 18px; text-align: center; }
.cp-ch-name { font-size: 13px; color: var(--text-secondary); flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.cp-sidebar-item.active .cp-ch-name { color: var(--purple); font-weight: 500; }
.cp-badge { background: var(--purple); color: #fff; font-size: 10px; padding: 1px 5px; border-radius: 8px; min-width: 16px; text-align: center; }
.cp-avatar { width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #fff; font-size: 11px; font-weight: 600; flex-shrink: 0; }
.cp-sidebar-footer { margin-top: auto; padding: 10px 14px; border-top: 1px solid var(--border-light); display: flex; align-items: center; gap: 6px; }
.cp-user-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--green); flex-shrink: 0; }
.cp-user-name { font-size: 12px; font-weight: 500; color: var(--text); }
.cp-user-status { font-size: 11px; color: var(--text-muted); }
</style>
