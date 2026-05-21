<template>
  <div class="team-view">
    <div class="team-header">
      <h2>{{ t('team_title') }}</h2>
      <div v-if="org" class="seat-badge">{{ seats.used }} / {{ seats.paid }} {{ t('team_seats') }}</div>
    </div>

    <div v-if="loading" class="team-loading"><span class="spinner" /></div>

    <template v-else>
      <!-- Invite form (owner/admin only) -->
      <div v-if="canInvite" class="invite-section">
        <h3>{{ t('team_invite_title') }}</h3>
        <div class="invite-form">
          <input v-model="inviteEmail" type="email" class="fi" :placeholder="t('team_invite_email_ph')" />
          <select v-model="inviteRole" class="fi fi-select">
            <option v-for="r in availableRoles" :key="r" :value="r">{{ t('role_' + r) }}</option>
          </select>
          <button class="btn-primary" :disabled="sending || !inviteEmail.trim()" @click="sendInvite">
            <span v-if="sending" class="spinner-sm" /><span v-else>{{ t('team_invite_send') }}</span>
          </button>
        </div>
        <div v-if="inviteMsg" class="invite-msg" :class="inviteMsgType">{{ inviteMsg }}</div>
      </div>

      <!-- Members list -->
      <div class="section">
        <h3>{{ t('team_members_title') }} ({{ members.length }})</h3>
        <div class="table-wrap">
          <table class="team-table">
            <thead><tr><th>{{ t('team_col_name') }}</th><th>{{ t('team_col_role') }}</th><th>{{ t('team_col_joined') }}</th><th></th></tr></thead>
            <tbody>
              <tr v-for="m in members" :key="m.id">
                <td>{{ m.user_id }}</td>
                <td><span class="role-tag" :class="'role-' + m.role">{{ t('role_' + m.role) }}</span></td>
                <td>{{ formatDate(m.joined_at) }}</td>
                <td><button v-if="canRemove(m)" class="btn-remove" @click="removeMember(m)">{{ t('team_remove') }}</button></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Pending invitations -->
      <div v-if="invitations.length > 0" class="section">
        <h3>{{ t('team_pending_title') }} ({{ invitations.length }})</h3>
        <div class="table-wrap">
          <table class="team-table">
            <thead><tr><th>{{ t('team_col_email') }}</th><th>{{ t('team_col_role') }}</th><th>{{ t('team_col_expires') }}</th></tr></thead>
            <tbody>
              <tr v-for="inv in invitations" :key="inv.id">
                <td>{{ inv.email }}</td>
                <td><span class="role-tag" :class="'role-' + inv.role">{{ t('role_' + inv.role) }}</span></td>
                <td>{{ formatDate(inv.expires_at) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth'
import { getAvailableRolesForInvite, canPerform, isRoleAbove } from '@/config/plans.config.js'

const { t } = useI18n({ useScope: 'global' })
const authStore = useAuthStore()

const loading = ref(true)
const org = ref(null)
const members = ref([])
const invitations = ref([])
const seats = ref({ used: 0, paid: 0 })
const myRole = ref('')
const inviteEmail = ref('')
const inviteRole = ref('member')
const sending = ref(false)
const inviteMsg = ref('')
const inviteMsgType = ref('')

const canInvite = computed(() => canPerform(myRole.value, 'canInvite'))
const availableRoles = computed(() => org.value ? getAvailableRolesForInvite(org.value.plan) : ['member'])

onMounted(() => loadTeam())

async function loadTeam() {
  loading.value = true
  try {
    const token = authStore.session?.access_token
    if (!token) return
    const resp = await fetch('/api/members', { headers: { 'Authorization': 'Bearer ' + token } })
    if (!resp.ok) return
    const data = await resp.json()
    org.value = data.organization
    members.value = data.members || []
    invitations.value = data.invitations || []
    seats.value = data.seats || { used: 0, paid: 0 }
    const me = members.value.find(m => m.user_id === authStore.user?.id)
    myRole.value = me?.role || ''
  } catch (e) { console.error('Team load error:', e) }
  finally { loading.value = false }
}

async function sendInvite() {
  if (sending.value || !inviteEmail.value.trim()) return
  sending.value = true; inviteMsg.value = ''
  try {
    const resp = await fetch('/api/invite', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + authStore.session?.access_token },
      body: JSON.stringify({ email: inviteEmail.value.trim(), role: inviteRole.value })
    })
    const data = await resp.json()
    if (resp.ok) {
      inviteMsg.value = t('team_invite_success'); inviteMsgType.value = 'success'
      inviteEmail.value = ''; await loadTeam()
    } else { inviteMsg.value = data.error || t('team_invite_error'); inviteMsgType.value = 'error' }
  } catch { inviteMsg.value = t('team_invite_error'); inviteMsgType.value = 'error' }
  finally { sending.value = false }
}

function canRemove(m) {
  if (m.user_id === authStore.user?.id) return false
  if (m.role === 'owner') return false
  return canPerform(myRole.value, 'canRevoke')
}

async function removeMember(m) {
  if (!confirm(t('team_remove_confirm'))) return
  try {
    await fetch('/api/members/' + m.id, {
      method: 'DELETE',
      headers: { 'Authorization': 'Bearer ' + authStore.session?.access_token }
    })
    await loadTeam()
  } catch (e) { console.error('Remove error:', e) }
}

function formatDate(d) { return d ? new Date(d).toLocaleDateString() : '' }
</script>

<style scoped>
.team-view { max-width: 800px; margin: 0 auto; padding: 32px 20px; }
.team-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 28px; }
.team-header h2 { font-size: 1.3rem; font-weight: 800; }
.seat-badge { background: #f3f4f6; padding: 6px 14px; border-radius: 20px; font-size: 0.82rem; font-weight: 600; color: var(--text-primary); }
.team-loading { text-align: center; padding: 60px 0; }
.section { margin-bottom: 32px; }
.section h3 { font-size: 0.95rem; font-weight: 700; margin-bottom: 12px; color: var(--text-primary); }
.invite-section { background: #faf5ff; border: 1px solid #e9d5ff; border-radius: 12px; padding: 20px; margin-bottom: 28px; }
.invite-section h3 { margin-bottom: 12px; }
.invite-form { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
.invite-form .fi { flex: 1; min-width: 180px; }
.fi { padding: 10px 14px; border: 1px solid var(--border-color); border-radius: 8px; font-size: 0.88rem; outline: none; }
.fi:focus { border-color: #7c3aed; }
.fi-select { max-width: 140px; }
.invite-msg { font-size: 0.82rem; margin-top: 8px; padding: 8px 12px; border-radius: 6px; }
.invite-msg.success { background: #f0fdf4; color: #166534; }
.invite-msg.error { background: #fef2f2; color: #dc2626; }
.table-wrap { overflow-x: auto; }
.team-table { width: 100%; border-collapse: collapse; font-size: 0.88rem; }
.team-table th { text-align: left; padding: 10px 12px; border-bottom: 2px solid var(--border-color); color: #6b7280; font-weight: 600; font-size: 0.78rem; text-transform: uppercase; letter-spacing: 0.04em; }
.team-table td { padding: 12px; border-bottom: 1px solid #f3f4f6; }
.role-tag { padding: 3px 10px; border-radius: 12px; font-size: 0.75rem; font-weight: 600; }
.role-owner { background: #7c3aed; color: #fff; }
.role-admin { background: #dbeafe; color: #1d4ed8; }
.role-member { background: #f3f4f6; color: var(--text-primary); }
.role-viewer { background: #fef3c7; color: #92400e; }
.btn-primary { background: #7c3aed; color: #fff; border: none; padding: 10px 18px; border-radius: 8px; font-size: 0.85rem; font-weight: 600; cursor: pointer; white-space: nowrap; }
.btn-primary:hover:not(:disabled) { background: #6d28d9; }
.btn-primary:disabled { opacity: 0.4; cursor: not-allowed; }
.btn-remove { background: none; border: 1px solid #fecaca; color: #dc2626; padding: 4px 12px; border-radius: 6px; font-size: 0.78rem; cursor: pointer; }
.btn-remove:hover { background: #fef2f2; }
.spinner { width: 18px; height: 18px; border: 2px solid rgba(124,58,237,0.2); border-top-color: #7c3aed; border-radius: 50%; animation: spin 0.7s linear infinite; display: inline-block; }
.spinner-sm { width: 14px; height: 14px; border: 2px solid rgba(255,255,255,0.3); border-top-color: #fff; border-radius: 50%; animation: spin 0.7s linear infinite; display: inline-block; }
@keyframes spin { to { transform: rotate(360deg); } }
@media (max-width: 640px) { .invite-form { flex-direction: column; } .invite-form .fi { min-width: 100%; } }
</style>