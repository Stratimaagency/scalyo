import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

function load(key, fallback) {
  try {
    const v = localStorage.getItem(key)
    return v ? JSON.parse(v) : fallback
  } catch { return fallback }
}

function save(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)) } catch {}
}

export const TEMPLATES = [
  {
    id: 'tpl_project', key: 'project_launch', icon: '🚀', color: '#7c3aed',
    milestones: [
      { titleKey: 'rm_ms_project_1', duration: 7 },
      { titleKey: 'rm_ms_project_2', duration: 14 },
      { titleKey: 'rm_ms_project_3', duration: 30 },
      { titleKey: 'rm_ms_project_4', duration: 7 },
      { titleKey: 'rm_ms_project_5', duration: 30 },
      { titleKey: 'rm_ms_project_6', duration: 14 },
    ],
  },
  {
    id: 'tpl_sales', key: 'sales_cycle', icon: '🤝', color: '#10b981',
    milestones: [
      { titleKey: 'rm_ms_sales_1', duration: 7 },
      { titleKey: 'rm_ms_sales_2', duration: 7 },
      { titleKey: 'rm_ms_sales_3', duration: 10 },
      { titleKey: 'rm_ms_sales_4', duration: 14 },
      { titleKey: 'rm_ms_sales_5', duration: 7 },
      { titleKey: 'rm_ms_sales_6', duration: 14 },
    ],
  },
  {
    id: 'tpl_session', key: 'session_launch', icon: '🏫', color: '#3b82f6',
    milestones: [
      { titleKey: 'rm_ms_session_1', duration: 30 },
      { titleKey: 'rm_ms_session_2', duration: 21 },
      { titleKey: 'rm_ms_session_3', duration: 14 },
      { titleKey: 'rm_ms_session_4', duration: 1 },
      { titleKey: 'rm_ms_session_5', duration: 60 },
      { titleKey: 'rm_ms_session_6', duration: 14 },
    ],
  },
  {
    id: 'tpl_deployment', key: 'deployment', icon: '📦', color: '#f59e0b',
    milestones: [
      { titleKey: 'rm_ms_deploy_1', duration: 7 },
      { titleKey: 'rm_ms_deploy_2', duration: 14 },
      { titleKey: 'rm_ms_deploy_3', duration: 7 },
      { titleKey: 'rm_ms_deploy_4', duration: 7 },
      { titleKey: 'rm_ms_deploy_5', duration: 7 },
      { titleKey: 'rm_ms_deploy_6', duration: 30 },
    ],
  },
  {
    id: 'tpl_renewal', key: 'renewal', icon: '🔄', color: '#ec4899',
    milestones: [
      { titleKey: 'rm_ms_renewal_1', duration: 7 },
      { titleKey: 'rm_ms_renewal_2', duration: 7 },
      { titleKey: 'rm_ms_renewal_3', duration: 10 },
      { titleKey: 'rm_ms_renewal_4', duration: 14 },
      { titleKey: 'rm_ms_renewal_5', duration: 7 },
      { titleKey: 'rm_ms_renewal_6', duration: 14 },
    ],
  },
  {
    id: 'tpl_quarterly', key: 'quarterly_goals', icon: '📈', color: '#06b6d4',
    milestones: [
      { titleKey: 'rm_ms_quarterly_1', duration: 7 },
      { titleKey: 'rm_ms_quarterly_2', duration: 7 },
      { titleKey: 'rm_ms_quarterly_3', duration: 30 },
      { titleKey: 'rm_ms_quarterly_4', duration: 3 },
      { titleKey: 'rm_ms_quarterly_5', duration: 60 },
      { titleKey: 'rm_ms_quarterly_6', duration: 7 },
    ],
  },
]

export const useRoadmapStore = defineStore('roadmap', () => {
  const roadmaps = ref(load('scalyo_roadmaps', []))

  const activeRoadmaps = computed(() => roadmaps.value.filter(r => r.status === 'active'))
  const doneRoadmaps = computed(() => roadmaps.value.filter(r => r.status === 'done'))

  const globalProgress = computed(() => {
    const all = roadmaps.value.flatMap(r => r.milestones)
    if (!all.length) return 0
    return Math.round(all.filter(m => m.done).length / all.length * 100)
  })

  function createFromTemplate(templateId, customName, startDate) {
    const tpl = TEMPLATES.find(tpl => tpl.id === templateId)
    if (!tpl) return
    let currentDate = new Date(startDate || new Date())
    const milestones = tpl.milestones.map((m, i) => {
      const start = currentDate.toISOString().slice(0, 10)
      currentDate = new Date(currentDate.getTime() + m.duration * 86400000)
      const end = currentDate.toISOString().slice(0, 10)
      return {
        id: 'm_' + Date.now() + '_' + i,
        titleKey: m.titleKey,
        startDate: start,
        endDate: end,
        done: false,
        status: 'todo',
        notes: '',
      }
    })
    roadmaps.value.push({
      id: 'rm_' + Date.now(),
      name: customName || tpl.key,
      templateId,
      icon: tpl.icon,
      color: tpl.color,
      status: 'active',
      milestones,
      createdAt: new Date().toISOString().slice(0, 10),
    })
    save('scalyo_roadmaps', roadmaps.value)
  }

  function createBlank(name, icon, color) {
    roadmaps.value.push({
      id: 'rm_' + Date.now(),
      name,
      templateId: null,
      icon: icon || '📌',
      color: color || '#7c3aed',
      status: 'active',
      milestones: [],
      createdAt: new Date().toISOString().slice(0, 10),
    })
    save('scalyo_roadmaps', roadmaps.value)
  }

  function addMilestone(roadmapId, milestone) {
    const rm = roadmaps.value.find(r => r.id === roadmapId)
    if (rm) {
      rm.milestones.push({ id: 'm_' + Date.now(), done: false, status: 'todo', notes: '', ...milestone })
      save('scalyo_roadmaps', roadmaps.value)
    }
  }

  function updateMilestone(roadmapId, milestoneId, data) {
    const rm = roadmaps.value.find(r => r.id === roadmapId)
    if (!rm) return
    const mi = rm.milestones.findIndex(m => m.id === milestoneId)
    if (mi !== -1) {
      Object.assign(rm.milestones[mi], data)
      save('scalyo_roadmaps', roadmaps.value)
    }
  }

  function deleteMilestone(roadmapId, milestoneId) {
    const rm = roadmaps.value.find(r => r.id === roadmapId)
    if (rm) {
      rm.milestones = rm.milestones.filter(m => m.id !== milestoneId)
      save('scalyo_roadmaps', roadmaps.value)
    }
  }

  function updateRoadmap(id, data) {
    const i = roadmaps.value.findIndex(r => r.id === id)
    if (i !== -1) {
      Object.assign(roadmaps.value[i], data)
      save('scalyo_roadmaps', roadmaps.value)
    }
  }

  function deleteRoadmap(id) {
    roadmaps.value = roadmaps.value.filter(r => r.id !== id)
    save('scalyo_roadmaps', roadmaps.value)
  }

  function roadmapProgress(rm) {
    if (!rm.milestones.length) return 0
    return Math.round(rm.milestones.filter(m => m.done).length / rm.milestones.length * 100)
  }

  return {
    roadmaps, activeRoadmaps, doneRoadmaps, globalProgress,
    createFromTemplate, createBlank,
    addMilestone, updateMilestone, deleteMilestone,
    updateRoadmap, deleteRoadmap, roadmapProgress,
  }
})
