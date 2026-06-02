import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '@/lib/supabase'

export const useNotificationStore = defineStore('notifications', () => {
  const notifications = ref([])
  const enrichments = ref({})
  const enriched = ref(false)

  const unreadCount = computed(() => notifications.value.filter(n => !n.read).length)

  async function loadNotifications() {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false })
      if (!error && data) {
        notifications.value = data
      }
    } catch (e) { console.error('loadNotifications:', e) }
  }
  async function markRead(id) {
    try {
      const n = notifications.value.find(n => n.id === id)
      if (!n) return
      n.read = true
      const { data, error } = await supabase.from('notifications').update({ read: true }).eq('id', id)
      if (error) console.error('markRead:', error)
    } catch (e) { console.error('markRead:', e) }
  }
  async function markAllRead() {
    try {
      notifications.value.forEach(n => n.read = true)
      const ids = notifications.value.map(n => n.id)
      if (ids.length) {
        const { data, error } = await supabase.from('notifications').update({ read: true }).in('id', ids)
        if (error) console.error('markAllRead:', error)
      }
    } catch (e) { console.error('markAllRead:', e) }
  }
  async function clearAll() {
    try {
      const ids = notifications.value.map(n => n.id)
      notifications.value = []
      if (ids.length) {
        const { data, error } = await supabase.from('notifications').delete().in('id', ids)
        if (error) console.error('clearAll:', error)
      }
    } catch (e) { console.error('clearAll:', e) }
  }
  async function generateFromData(clients, tasks, teamMembers) {
    // Load current notifications from Supabase
    const { data: current } = await supabase
      .from('notifications')
      .select('type, target_id')
    const existing = current || []

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const toInsert = []
    const today = new Date()

    function addIfNew(notif) {
      const exists = existing.find(n =>
        n.type === notif.type && n.target_id === notif.target_id
      )
      if (exists) return
      // Also check toInsert to avoid duplicates within the same batch
      const inBatch = toInsert.find(n =>
        n.type === notif.type && n.target_id === notif.target_id
      )
      if (inBatch) return
      toInsert.push({
        user_id: user.id,
        type: notif.type,
        icon: notif.icon || '',
        title: notif.title || '',
        body: notif.body || '',
        target_id: notif.target_id || null,
        route: notif.route || null,
        read: false,
      })
    }

    for (const client of (clients || [])) {
      if (typeof client.health === 'number' && client.health < 4) {
        addIfNew({
          type: 'churn_risk',
          icon: '\u{1F534}',
          title: `Risque churn \u2014 ${client.name}`,
          body: `Health score ${client.health}/10. Intervention urgente recommand\u00E9e.`,
          target_id: client.id,
          route: '/app/portfolio',
        })
      }
      if (client.renewalDate) {
        const renewal = new Date(client.renewalDate)
        if (!isNaN(renewal.getTime())) {
          const daysLeft = Math.round((renewal.getTime() - today.getTime()) / 86400000)
          if (daysLeft >= 0 && daysLeft <= 30) {
            addIfNew({
              type: 'renewal',
              icon: '\u{1F4C5}',
              title: `Renouvellement dans ${daysLeft}j \u2014 ${client.name}`,
              body: `Date de renouvellement : ${client.renewalDate}`,
              target_id: client.id,
              route: '/app/portfolio',
            })
          }
        }
      }
      if (typeof client.nps === 'number' && client.nps < 20) {
        addIfNew({
          type: 'nps_drop',
          icon: '\u{1F4C9}',
          title: `NPS bas \u2014 ${client.name}`,
          body: `Score NPS : ${client.nps}. En dessous du seuil critique.`,
          target_id: client.id,
          route: '/app/satisfaction',
        })
      }
    }

    for (const task of (tasks || [])) {
      if (task.dueDate && task.status !== 'done') {
        const daysLate = Math.round((today.getTime() - new Date(task.dueDate).getTime()) / 86400000)
        if (daysLate > 0) {
          addIfNew({
            type: 'task_overdue',
            icon: '\u23F0',
            title: `T\u00E2che en retard \u2014 ${task.title}`,
            body: `En retard de ${daysLate} jour${daysLate > 1 ? 's' : ''}. Statut : ${task.status}`,
            target_id: task.id,
            route: '/app/tasks/kanban',
          })
        }
      }
    }

    for (const member of (teamMembers || [])) {
      if (member.wellbeingScore < 55 || member.workload > 85) {
        const reasons = []
        if (member.wellbeingScore < 55) reasons.push(`bien-\u00EAtre ${member.wellbeingScore}/100`)
        if (member.workload > 85) reasons.push(`charge ${member.workload}%`)
        addIfNew({
          type: 'burnout',
          icon: '\u26A0\uFE0F',
          title: `Alerte burnout \u2014 ${member.name}`,
          body: `${reasons.join(', ')}. V\u00E9rification recommand\u00E9e.`,
          target_id: member.id,
          route: '/app/workload',
        })
      }
    }

    // Batch insert new notifications
    if (toInsert.length > 0) {
      const { error } = await supabase.from('notifications').insert(toInsert)
      if (!error) {
        await loadNotifications()
      } else {
        console.error('Failed to insert notifications:', error)
      }
    }
  }


  return {
    notifications, unreadCount,
    markRead, markAllRead, clearAll, generateFromData, loadNotifications,
  }
}, { persist: false })
