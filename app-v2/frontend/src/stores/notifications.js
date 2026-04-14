import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useNotificationStore = defineStore('notifications', () => {
  const notifications = ref([
    { id: 'n1', type: 'churn_risk', title: 'Risque churn — Leroy Finance', body: 'Health score tombé à 3.2. Usage -40% ce mois.', read: false, createdAt: '2026-04-11T10:30:00', clientId: 'cl4', icon: '🔴' },
    { id: 'n2', type: 'renewal', title: 'Renouvellement dans 28j — Leroy Finance', body: 'Date de renouvellement : 10 mai 2026', read: false, createdAt: '2026-04-11T09:00:00', clientId: 'cl4', icon: '📅' },
    { id: 'n3', type: 'burnout', title: 'Alerte burnout — Thomas R.', body: 'Charge 92%, wellbeing 52/100 depuis 3 semaines.', read: false, createdAt: '2026-04-10T16:00:00', memberId: 'tm2', icon: '⚠️' },
    { id: 'n4', type: 'task_overdue', title: 'Tâche en retard — QBR Acme Corp', body: 'Devait être terminé le 15 avril.', read: true, createdAt: '2026-04-10T08:00:00', taskId: 't1', icon: '⏰' },
    { id: 'n5', type: 'nps_drop', title: 'NPS en baisse — DataVault', body: 'NPS passé de 45 à 22 ce trimestre.', read: true, createdAt: '2026-04-09T14:00:00', clientId: 'cl8', icon: '📉' },
  ])

  const unreadCount = computed(() => notifications.value.filter(n => !n.read).length)

  function markRead(id) {
    const n = notifications.value.find(n => n.id === id)
    if (n) n.read = true
  }
  function markAllRead() { notifications.value.forEach(n => n.read = true) }
  function addNotification(notif) {
    notifications.value.unshift({ id: 'n' + Date.now(), read: false, createdAt: new Date().toISOString(), ...notif })
  }

  return { notifications, unreadCount, markRead, markAllRead, addNotification }
}, { persist: true })
