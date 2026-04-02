import { defineStore } from 'pinia'
import api from '../api/client'
import { useClientsStore } from './clients'

export const useTasksStore = defineStore('tasks', {
  state: () => ({
    projects: [],
    playbooks: [],
    playbookProgress: {},
    okrs: [],
  }),

  getters: {
    urgentTasks() {
      const clientsStore = useClientsStore()
      const atRiskIds = new Set(clientsStore.atRiskClients.map(c => c.id))
      const tasks = []
      for (const project of this.projects) {
        for (const task of (project.tasks || [])) {
          if (atRiskIds.has(project.clientId) && !task.done) {
            tasks.push({ ...task, projectName: project.name, clientName: project.clientName })
          }
        }
      }
      return tasks
    },

    activeChurnPlaybooks: (state) => {
      return state.playbooks.filter(p => p.type === 'churn' || p.type === 'anti-churn')
    },

    globalOKRScore: (state) => {
      if (!state.okrs.length) return 0
      let totalProgress = 0
      let totalKRs = 0
      for (const okr of state.okrs) {
        for (const kr of (okr.keyResults || [])) {
          const target = kr.target || 1
          const current = kr.current || 0
          let progress = kr.inverse
            ? Math.min(1, target / Math.max(current, 0.01))
            : Math.min(1, current / target)
          totalProgress += progress
          totalKRs++
        }
      }
      return totalKRs ? Math.round((totalProgress / totalKRs) * 100) : 0
    },

    lateTasksByClient: (state) => {
      const result = {}
      const now = new Date()
      const currentWeek = Math.ceil((now - new Date(now.getFullYear(), 0, 1)) / (7 * 24 * 60 * 60 * 1000))
      for (const project of state.projects) {
        for (const task of (project.tasks || [])) {
          if (!task.done && task.startWeek + (task.durationWeeks || 1) < currentWeek) {
            const key = project.clientName || project.name
            if (!result[key]) result[key] = []
            result[key].push({ ...task, projectName: project.name })
          }
        }
      }
      return result
    },
  },

  actions: {
    async fetchAll() {
      const [projectsRes, playbooksRes, okrsRes] = await Promise.all([
        api.get('/cs-projects'),
        api.get('/playbooks'),
        api.get('/okrs'),
      ])
      this.projects = projectsRes.data
      this.playbooks = playbooksRes.data
      this.okrs = okrsRes.data
    },

    async togglePlaybookStep(playbookId, stepIndex) {
      const key = `${playbookId}_${stepIndex}`
      this.playbookProgress[key] = !this.playbookProgress[key]
      await api.post('/playbooks/progress', {
        playbookId,
        stepIndex,
        done: this.playbookProgress[key],
      })
    },
  },
})
