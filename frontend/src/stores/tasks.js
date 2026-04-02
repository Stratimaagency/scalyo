import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useClientsStore } from './clients'
import api from '../api/client'
import { seedProjects, seedPlaybooks, seedOKRs, seedPlaybookProgress } from '../tests/seed'

export const useTasksStore = defineStore('tasks', () => {
  const projects = ref([])
  const playbooks = ref([])
  const playbookProgress = ref({})
  const okrs = ref([])

  const currentWeek = computed(() => {
    const now = new Date()
    const start = new Date(now.getFullYear(), 0, 1)
    return Math.ceil(((now - start) / 86400000 + start.getDay() + 1) / 7)
  })

  const urgentTasks = computed(() => {
    const clientsStore = useClientsStore()
    const riskNames = clientsStore.atRiskClients.map(c => c.name)
    return projects.value
      .flatMap(p => (p.tasks || []).map(t => ({ ...t, projectName: p.name, clientName: p.clientName, projectColor: p.color })))
      .filter(t => !t.done && riskNames.includes(t.clientName))
  })

  const lateTasksByClient = computed(() => {
    return projects.value.flatMap(p =>
      (p.tasks || []).filter(t => !t.done && (t.startWeek || 0) + (t.durationWeeks || 1) < currentWeek.value)
        .map(t => ({ ...t, clientName: p.clientName }))
    ).reduce((acc, t) => {
      if (!acc[t.clientName]) acc[t.clientName] = 0
      acc[t.clientName]++
      return acc
    }, {})
  })

  const activeChurnPlaybooks = computed(() => {
    const clientsStore = useClientsStore()
    const riskNames = clientsStore.atRiskClients.map(c => c.name)
    return playbooks.value.filter(pb =>
      (pb.clients || []).some(c => riskNames.includes(c))
    )
  })

  const globalOKRScore = computed(() => {
    if (!okrs.value.length) return 0
    const allScores = okrs.value.flatMap(o => (o.keyResults || []).map(kr => {
      if (!kr.target) return 0
      return Math.min((kr.current / kr.target) * 100, 100)
    }))
    if (!allScores.length) return 0
    return Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length)
  })

  async function fetchAll() {
    try {
      const [projRes, pbRes, okrRes] = await Promise.all([
        api.get('/projects').catch(() => ({ data: { data: [] } })),
        api.get('/playbooks').catch(() => ({ data: { data: [] } })),
        api.get('/okrs').catch(() => ({ data: { data: [] } })),
      ])
      const p = projRes.data.data || []
      const b = pbRes.data.data || []
      const o = okrRes.data.data || []

      projects.value = p.length ? p : JSON.parse(JSON.stringify(seedProjects))
      playbooks.value = b.length ? b : JSON.parse(JSON.stringify(seedPlaybooks))
      okrs.value = o.length ? o : JSON.parse(JSON.stringify(seedOKRs))

      if (!Object.keys(playbookProgress.value).length) {
        playbookProgress.value = JSON.parse(JSON.stringify(seedPlaybookProgress))
      }
    } catch {
      // Seed fallback
      projects.value = JSON.parse(JSON.stringify(seedProjects))
      playbooks.value = JSON.parse(JSON.stringify(seedPlaybooks))
      okrs.value = JSON.parse(JSON.stringify(seedOKRs))
      playbookProgress.value = JSON.parse(JSON.stringify(seedPlaybookProgress))
    }
  }

  async function togglePlaybookStep(playbookId, stepIndex) {
    const key = `${playbookId}`
    const curr = playbookProgress.value[key] || []
    const next = curr.includes(stepIndex) ? curr.filter(i => i !== stepIndex) : [...curr, stepIndex]
    playbookProgress.value = { ...playbookProgress.value, [key]: next }
    try {
      await api.post('/playbooks/progress', { playbookId, stepIndex, done: next.includes(stepIndex) })
    } catch {
      // API not ready
    }
  }

  return { projects, playbooks, playbookProgress, okrs, currentWeek, urgentTasks, lateTasksByClient, activeChurnPlaybooks, globalOKRScore, fetchAll, togglePlaybookStep }
})
