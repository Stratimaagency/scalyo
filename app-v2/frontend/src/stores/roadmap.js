import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '@/lib/supabase'

export const TEMPLATES = [
  {
    id: 'tpl_project', key: 'project_launch', icon: '\u{1F680}', color: '#7c3aed',
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
    id: 'tpl_sales', key: 'sales_cycle', icon: '\u{1F91D}', color: '#10b981',
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
    id: 'tpl_session', key: 'session_launch', icon: '\u{1F3EB}', color: '#3b82f6',
    milestones: [
      { titleKey: 'rm_ms_session_1', duration: 30 },
      { titleKey: 'rm_ms_session_2', duration: 21 },
      { titleKey: 'rm_ms_session_3', duration: 14 },
      { titleKey: 'rm_ms_session_4', duration: 1 },
      { titleKey: 'rm_ms_session_5', duration: 7 },
      { titleKey: 'rm_ms_session_6', duration: 30 },
    ],
  },
  {
    id: 'tpl_deployment', key: 'deployment', icon: '\u{1F4E6}', color: '#f59e0b',
    milestones: [
      { titleKey: 'rm_ms_deploy_1', duration: 7 },
      { titleKey: 'rm_ms_deploy_2', duration: 14 },
      { titleKey: 'rm_ms_deploy_3', duration: 7 },
      { titleKey: 'rm_ms_deploy_4', duration: 3 },
      { titleKey: 'rm_ms_deploy_5', duration: 7 },
      { titleKey: 'rm_ms_deploy_6', duration: 14 },
    ],
  },
  {
    id: 'tpl_renewal', key: 'renewal', icon: '\u{1F504}', color: '#ec4899',
    milestones: [
      { titleKey: 'rm_ms_renew_1', duration: 14 },
      { titleKey: 'rm_ms_renew_2', duration: 14 },
      { titleKey: 'rm_ms_renew_3', duration: 21 },
      { titleKey: 'rm_ms_renew_4', duration: 14 },
      { titleKey: 'rm_ms_renew_5', duration: 7 },
      { titleKey: 'rm_ms_renew_6', duration: 14 },
    ],
  },
  {
    id: 'tpl_quarterly', key: 'quarterly_goals', icon: '\u{1F4C8}', color: '#06b6d4',
    milestones: [
      { titleKey: 'rm_ms_quarter_1', duration: 7 },
      { titleKey: 'rm_ms_quarter_2', duration: 7 },
      { titleKey: 'rm_ms_quarter_3', duration: 60 },
      { titleKey: 'rm_ms_quarter_4', duration: 7 },
      { titleKey: 'rm_ms_quarter_5', duration: 7 },
      { titleKey: 'rm_ms_quarter_6', duration: 7 },
    ],
  },
]

export const useRoadmapStore = defineStore('roadmap', () => {
  const roadmaps = ref([])

  const activeRoadmaps = computed(() => roadmaps.value.filter(r => r.status === 'active'))
  const doneRoadmaps = computed(() => roadmaps.value.filter(r => r.status === 'done'))

  const globalProgress = computed(() => {
    const all = roadmaps.value.flatMap(r => r.milestones)
    if (!all.length) return 0
    return Math.round(all.filter(m => m.done).length / all.length * 100)
  })

  async function loadRoadmaps() {
    const { data, error } = await supabase
      .from('roadmaps')
      .select('*')
      .order('created_at', { ascending: false })
    if (!error && data) roadmaps.value = data
  }

  async function createFromTemplate(templateId, customName, startDate) {
    const tpl = TEMPLATES.find(tpl => tpl.id === templateId)
    if (!tpl) return

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

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

    const newRm = {
      user_id: user.id,
      name: customName || tpl.key,
      template_id: tpl.id,
      icon: tpl.icon,
      color: tpl.color,
      status: 'active',
      milestones,
    }

    const { error } = await supabase.from('roadmaps').insert([newRm])
    if (!error) await loadRoadmaps()
  }

  async function createBlank(name, icon, color) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const newRm = {
      user_id: user.id,
      name,
      template_id: null,
      icon: icon || '\u{1F4CC}',
      color: color || '#7c3aed',
      status: 'active',
      milestones: [],
    }

    const { error } = await supabase.from('roadmaps').insert([newRm])
    if (!error) await loadRoadmaps()
  }

  async function addMilestone(roadmapId, milestone) {
    const rm = roadmaps.value.find(r => r.id === roadmapId)
    if (rm) {
      rm.milestones.push({ id: 'm_' + Date.now(), done: false, status: 'todo', notes: '', ...milestone })
      await supabase.from('roadmaps').update({ milestones: rm.milestones }).eq('id', roadmapId)
    }
  }

  async function updateMilestone(roadmapId, milestoneId, data) {
    const rm = roadmaps.value.find(r => r.id === roadmapId)
    if (!rm) return
    const mi = rm.milestones.findIndex(m => m.id === milestoneId)
    if (mi !== -1) {
      Object.assign(rm.milestones[mi], data)
      await supabase.from('roadmaps').update({ milestones: rm.milestones }).eq('id', roadmapId)
    }
  }

  async function deleteMilestone(roadmapId, milestoneId) {
    const rm = roadmaps.value.find(r => r.id === roadmapId)
    if (rm) {
      rm.milestones = rm.milestones.filter(m => m.id !== milestoneId)
      await supabase.from('roadmaps').update({ milestones: rm.milestones }).eq('id', roadmapId)
    }
  }

  async function updateRoadmap(id, data) {
    const i = roadmaps.value.findIndex(r => r.id === id)
    if (i !== -1) {
      Object.assign(roadmaps.value[i], data)
      await supabase.from('roadmaps').update(data).eq('id', id)
    }
  }

  async function deleteRoadmap(id) {
    roadmaps.value = roadmaps.value.filter(r => r.id !== id)
    await supabase.from('roadmaps').delete().eq('id', id)
  }

  function roadmapProgress(rm) {
    if (!rm.milestones.length) return 0
    return Math.round(rm.milestones.filter(m => m.done).length / rm.milestones.length * 100)
  }

  return {
    roadmaps, activeRoadmaps, doneRoadmaps, globalProgress,
    createFromTemplate, createBlank,
    addMilestone, updateMilestone, deleteMilestone,
    updateRoadmap, deleteRoadmap, roadmapProgress, loadRoadmaps,
  }
})
