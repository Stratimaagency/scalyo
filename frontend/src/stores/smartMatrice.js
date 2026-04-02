import { defineStore } from 'pinia'
import { smartMatriceApi } from '../api'

export const useSmartMatriceStore = defineStore('smartMatrice', {
  state: () => ({
    projects: [],
    tasks: {},        // { projectId: [tasks] }
    team: [],
    config: null,
    stats: null,
    profile: 'moi',  // 'moi' | 'manager' | 'direction'
    userName: '',
    selectedProject: null,
    currentView: 'projects',  // shared SM view state
    loading: false,
    error: null,
  }),

  getters: {
    tasksByStatus: (state) => (projectId, status) =>
      (state.tasks[projectId] || []).filter(t => t.status === status),

    tasksByGroup: (state) => (projectId) => {
      const list = state.tasks[projectId] || []
      const groups = {}
      for (const t of list) {
        const g = t.group_name || 'Sans groupe'
        if (!groups[g]) groups[g] = []
        groups[g].push(t)
      }
      return groups
    },

    groupProgress: (state) => (projectId, groupName) => {
      const list = (state.tasks[projectId] || []).filter(t => (t.group_name || 'Sans groupe') === groupName)
      const subs = list.flatMap(t => t.subtasks || [])
      if (!subs.length) return 0
      return Math.round(subs.filter(s => s.done).length / subs.length * 100)
    },

    taskProgress: () => (task) => {
      const subs = task.subtasks || []
      if (!subs.length) return 0
      return Math.round(subs.filter(s => s.done).length / subs.length * 100)
    },

    projectProgress: (state) => (projectId) => {
      const p = state.projects.find(p => p.id === projectId)
      return p?.progress || 0
    },
  },

  actions: {
    async fetchProjects() {
      this.loading = true
      try {
        const { data } = await smartMatriceApi.getProjects()
        this.projects = data
      } catch (e) {
        this.error = e.message
      } finally {
        this.loading = false
      }
    },

    async createProject(payload) {
      const { data } = await smartMatriceApi.createProject(payload)
      this.projects.unshift({ ...data, progress: 0, task_count: 0 })
      return data
    },

    async updateProject(id, payload) {
      const { data } = await smartMatriceApi.updateProject(id, payload)
      const idx = this.projects.findIndex(p => p.id === id)
      if (idx !== -1) Object.assign(this.projects[idx], data)
      return data
    },

    async deleteProject(id) {
      await smartMatriceApi.deleteProject(id)
      this.projects = this.projects.filter(p => p.id !== id)
      delete this.tasks[id]
    },

    async fetchTasks(projectId) {
      const { data } = await smartMatriceApi.getTasks(projectId)
      this.tasks[projectId] = data
    },

    async createTask(payload) {
      const { data } = await smartMatriceApi.createTask(payload)
      const pid = payload.project_id
      if (!this.tasks[pid]) this.tasks[pid] = []
      this.tasks[pid].push(data)
      return data
    },

    async updateTask(id, payload) {
      const { data } = await smartMatriceApi.updateTask(id, payload)
      for (const pid in this.tasks) {
        const idx = this.tasks[pid].findIndex(t => t.id === id)
        if (idx !== -1) {
          Object.assign(this.tasks[pid][idx], data)
          break
        }
      }
      return data
    },

    async deleteTask(id, projectId) {
      await smartMatriceApi.deleteTask(id)
      if (this.tasks[projectId]) {
        this.tasks[projectId] = this.tasks[projectId].filter(t => t.id !== id)
      }
    },

    async addSubtask(taskId, name) {
      const { data } = await smartMatriceApi.createSubtask(taskId, { name })
      for (const pid in this.tasks) {
        const task = this.tasks[pid].find(t => t.id === taskId)
        if (task) {
          if (!task.subtasks) task.subtasks = []
          task.subtasks.push(data)
          task.progress = Math.round(task.subtasks.filter(s => s.done).length / task.subtasks.length * 100)
          break
        }
      }
      return data
    },

    async toggleSubtask(taskId, subId) {
      let sub = null
      for (const pid in this.tasks) {
        const task = this.tasks[pid].find(t => t.id === taskId)
        if (task) {
          sub = (task.subtasks || []).find(s => s.id === subId)
          break
        }
      }
      if (!sub) return
      const { data } = await smartMatriceApi.updateSubtask(subId, { done: !sub.done })
      for (const pid in this.tasks) {
        const task = this.tasks[pid].find(t => t.id === taskId)
        if (task) {
          const idx = task.subtasks.findIndex(s => s.id === subId)
          if (idx !== -1) task.subtasks[idx] = data
          task.progress = task.subtasks.length > 0
            ? Math.round(task.subtasks.filter(s => s.done).length / task.subtasks.length * 100)
            : 0
          break
        }
      }
    },

    async deleteSubtask(taskId, subId) {
      await smartMatriceApi.deleteSubtask(subId)
      for (const pid in this.tasks) {
        const task = this.tasks[pid].find(t => t.id === taskId)
        if (task) {
          task.subtasks = (task.subtasks || []).filter(s => s.id !== subId)
          task.progress = task.subtasks.length > 0
            ? Math.round(task.subtasks.filter(s => s.done).length / task.subtasks.length * 100)
            : 0
          break
        }
      }
    },

    async transferTask(taskId, memberId) {
      return this.updateTask(taskId, { assigned_to: memberId })
    },

    async fetchTeam() {
      const { data } = await smartMatriceApi.getTeamWorkload()
      this.team = data
    },

    async fetchStats(projectId) {
      const { data } = await smartMatriceApi.getStats(projectId)
      this.stats = data
      return data
    },

    async fetchConfig() {
      const { data } = await smartMatriceApi.getConfig()
      this.config = data
    },

    async updateConfig(payload) {
      const { data } = await smartMatriceApi.updateConfig(payload)
      this.config = data
    },

    async importTasks(projectId, tasks) {
      const { data } = await smartMatriceApi.importTasks({ project_id: projectId, tasks })
      await this.fetchTasks(projectId)
      return data
    },

    setProfile(profile) {
      this.profile = profile
    },

    async selectProject(project) {
      this.selectedProject = project
      if (project?.id) {
        await this.fetchTasks(project.id)
        try { await this.fetchStats(project.id) } catch {}
      }
    },
  },
})
