import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '@/lib/supabase'

const TEMPLATES = [
  {
    id: 'tpl_onboard', key: 'onboarding', icon: '\u{1F680}', color: '#3b82f6',
    minPlan: 'growth', auto: false,
    steps: ['pb_step_onboarding_1','pb_step_onboarding_2','pb_step_onboarding_3','pb_step_onboarding_4','pb_step_onboarding_5','pb_step_onboarding_6'],
    avgDays: 90
  },
  {
    id: 'tpl_retention', key: 'retention', icon: '\u{1F6E1}\uFE0F', color: '#ef4444',
    minPlan: 'growth', auto: false,
    steps: ['pb_step_retention_1','pb_step_retention_2','pb_step_retention_3','pb_step_retention_4'],
    avgDays: 21
  },
  {
    id: 'tpl_expansion', key: 'expansion', icon: '\u{1F4C8}', color: '#10b981',
    minPlan: 'growth', auto: false,
    steps: ['pb_step_expansion_1','pb_step_expansion_2','pb_step_expansion_3','pb_step_expansion_4'],
    avgDays: 30
  },
  {
    id: 'tpl_qbr', key: 'qbr', icon: '\u{1F4CA}', color: '#7c3aed',
    minPlan: 'growth', auto: false,
    steps: ['pb_step_qbr_1','pb_step_qbr_2','pb_step_qbr_3','pb_step_qbr_4'],
    avgDays: 14
  },
  {
    id: 'tpl_renewal', key: 'renewal', icon: '\u{1F504}', color: '#f59e0b',
    minPlan: 'growth', auto: false,
    steps: ['pb_step_renewal_1','pb_step_renewal_2','pb_step_renewal_3','pb_step_renewal_4'],
    avgDays: 90
  },
  {
    id: 'tpl_nps', key: 'nps', icon: '\u2B50', color: '#ec4899',
    minPlan: 'growth', auto: false,
    steps: ['pb_step_nps_1','pb_step_nps_2','pb_step_nps_3','pb_step_nps_4'],
    avgDays: 14
  },
]

const PLAN_RANK = { starter: 0, growth: 1, elite: 2 }

export const usePlaybookStore = defineStore('playbooks', () => {
  const playbooks = ref([])
  const templates = TEMPLATES

  const activePlaybooks = computed(() => playbooks.value.filter(p => p.status === 'active'))
  const donePlaybooks = computed(() => playbooks.value.filter(p => p.status === 'done'))

  const doneThisMonth = computed(() => {
    const now = new Date()
    const start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10)
    return donePlaybooks.value.filter(p => p.completed_at >= start).length
  })

  const avgDuration = computed(() => {
    const done = donePlaybooks.value.filter(p => p.completed_at && p.started_at)
    if (!done.length) return 0
    const total = done.reduce((s, p) => {
      return s + (new Date(p.completed_at).getTime() - new Date(p.started_at).getTime())
    }, 0)
    return Math.round(total / done.length / 86400000)
  })

  const successRate = computed(() => {
    const total = playbooks.value.length
    if (!total) return 0
    return Math.round((donePlaybooks.value.length / total) * 100)
  })

  function templatesForPlan(currentPlan) {
    const rank = PLAN_RANK[currentPlan] ?? -1
    return templates.filter(t => rank >= (PLAN_RANK[t.minPlan] ?? 0))
  }

  function canActivate(currentPlan, templateId) {
    const tpl = templates.find(t => t.id === templateId)
    if (!tpl) return false
    const rank = PLAN_RANK[currentPlan] ?? -1
    return rank >= (PLAN_RANK[tpl.minPlan] ?? 0)
  }

  async function loadPlaybooks() {
    try {
      const { data, error } = await supabase
        .from('playbooks')
        .select('*')
        .order('created_at', { ascending: false })
      if (!error && data) playbooks.value = data
    } catch (e) {
      console.error('playbooks.loadPlaybooks failed:', e.message || e)
    }
  }

  async function activateTemplate(templateId, clientId, csmId, currentPlan) {
    try {
      const tpl = templates.find(t => t.id === templateId)
      if (!tpl) return { error: 'template_not_found' }
  
      if (!canActivate(currentPlan, templateId)) {
        return { error: 'plan_insufficient' }
      }
  
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return { error: 'not_authenticated' }
  
      const newPb = {
        user_id: user.id,
        template_id: tpl.id,
        template_key: tpl.key,
        icon: tpl.icon,
        color: tpl.color,
        client_id: clientId || null,
        csm_id: csmId || null,
        status: 'active',
        steps: tpl.steps.map((key, i) => ({ id: i, title: key, done: false })),
        started_at: new Date().toISOString().slice(0, 10),
        completed_at: null,
      }
  
      const { error } = await supabase.from('playbooks').insert([newPb])
      if (!error) await loadPlaybooks()
      return error ? { error: error.message } : { success: true }
    } catch (e) {
      console.error('playbooks.activateTemplate failed:', e.message || e)
    }
  }

  async function toggleStep(playbookId, stepId) {
    try {
      const pb = playbooks.value.find(p => p.id === playbookId)
      if (!pb) return
      const step = pb.steps.find(s => s.id === stepId)
      if (step) {
        step.done = !step.done
        await supabase.from('playbooks').update({ steps: pb.steps }).eq('id', playbookId)
      }
    } catch (e) {
      console.error('playbooks.toggleStep failed:', e.message || e)
    }
  }

  async function completePlaybook(playbookId) {
    try {
      const pb = playbooks.value.find(p => p.id === playbookId)
      if (pb) {
        pb.status = 'done'
        pb.completed_at = new Date().toISOString().slice(0, 10)
        pb.steps.forEach(s => s.done = true)
        await supabase.from('playbooks').update({
          status: 'done',
          completed_at: pb.completed_at,
          steps: pb.steps,
        }).eq('id', playbookId)
      }
    } catch (e) {
      console.error('playbooks.completePlaybook failed:', e.message || e)
    }
  }

  async function deletePlaybook(playbookId) {
    try {
      playbooks.value = playbooks.value.filter(p => p.id !== playbookId)
      await supabase.from('playbooks').delete().eq('id', playbookId)
    } catch (e) {
      console.error('playbooks.deletePlaybook failed:', e.message || e)
    }
  }

  return {
    playbooks, templates,
    activePlaybooks, donePlaybooks, doneThisMonth,
    avgDuration, successRate,
    templatesForPlan, canActivate,
    activateTemplate, toggleStep, completePlaybook, deletePlaybook, loadPlaybooks,
  }
}, { persist: false })
