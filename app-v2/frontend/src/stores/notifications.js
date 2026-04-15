import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

const STORAGE_KEY = 'scalyo_notifications'

function loadFromStorage() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') }
  catch { return [] }
}

function saveToStorage(notifs) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(notifs)) }
  catch {}
}

export const useNotificationStore = defineStore('notifications', () => {
  const notifications = ref(loadFromStorage())

  const unreadCount = computed(() => notifications.value.filter(n => !n.read).length)

  function markRead(id) {
    const n = notifications.value.find(n => n.id === id)
    if (!n) return
    n.read = true
    saveToStorage(notifications.value)
  }

  function markAllRead() {
    notifications.value.forEach(n => n.read = true)
    saveToStorage(notifications.value)
  }

  function clearAll() {
    notifications.value = []
    saveToStorage([])
  }

  function generateFromData(clients, tasks, teamMembers) {
    // Charger l'état actuel depuis localStorage
    const current = loadFromStorage()

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayStr = today.toISOString().slice(0, 10)

    function addIfNew(notif) {
      const exists = current.find(n =>
        n.type === notif.type && n.targetId === notif.targetId
      )
      if (exists) return
      current.unshift({
        id: 'n' + Date.now() + Math.random().toString(36).slice(2, 5),
        read: false,
        createdAt: new Date().toISOString(),
        ...notif,
      })
    }

    for (const client of (clients || [])) {
      if (typeof client.health === 'number' && client.health < 4) {
        addIfNew({
          type: 'churn_risk',
          icon: '🔴',
          title: `Risque churn — ${client.name}`,
          body: `Health score ${client.health}/10. Intervention urgente recommandée.`,
          targetId: client.id,
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
              icon: '📅',
              title: `Renouvellement dans ${daysLeft}j — ${client.name}`,
              body: `Date de renouvellement : ${client.renewalDate}`,
              targetId: client.id,
              route: '/app/portfolio',
            })
          }
        }
      }
      if (typeof client.nps === 'number' && client.nps < 20) {
        addIfNew({
          type: 'nps_drop',
          icon: '📉',
          title: `NPS bas — ${client.name}`,
          body: `Score NPS : ${client.nps}. En dessous du seuil critique.`,
          targetId: client.id,
          route: '/app/satisfaction',
        })
      }
    }

    for (const task of (tasks || [])) {
      if (task.status !== 'done' && task.dueDate && task.dueDate < todayStr) {
        const daysLate = Math.round((today.getTime() - new Date(task.dueDate).getTime()) / 86400000)
        addIfNew({
          type: 'task_overdue',
          icon: '⏰',
          title: `Tâche en retard — ${task.title}`,
          body: `En retard de ${daysLate} jour${daysLate > 1 ? 's' : ''}. Statut : ${task.status}.`,
          targetId: task.id,
          route: '/app/tasks/kanban',
        })
      }
    }

    for (const member of (teamMembers || [])) {
      if (member.wellbeingScore < 55 || member.workload > 85) {
        const reasons = []
        if (member.wellbeingScore < 55) reasons.push(`bien-être ${member.wellbeingScore}/100`)
        if (member.workload > 85) reasons.push(`charge ${member.workload}%`)
        addIfNew({
          type: 'burnout',
          icon: '⚠️',
          title: `Alerte burnout — ${member.name}`,
          body: `${reasons.join(', ')}. Vérification recommandée.`,
          targetId: member.id,
          route: '/app/workload',
        })
      }
    }

    // Sauvegarder et mettre à jour le state réactif
    saveToStorage(current)
    notifications.value = current
  }

  return {
    notifications, unreadCount,
    markRead, markAllRead, clearAll, generateFromData,
  }
}, { persist: false })
