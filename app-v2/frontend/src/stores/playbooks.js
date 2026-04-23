import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '@/lib/supabase'

const TEMPLATES = [
  { id: 'tpl_onboard', key: 'onboarding', icon: '\u{1F680}', color: '#3b82f6', steps: ['Kick-off call avec le client', 'Configuration du compte', 'Formation utilisateurs', 'Check-in J+15', 'Revue adoption J+30', 'QBR J+90'], avgDays: 90 },
  { id: 'tpl_retention', key: 'retention', icon: '\u{1F6E1}\uFE0F', color: '#ef4444', steps: ['Email d\'ouverture de dialogue', 'Analyse utilisation produit', 'Call de 30 minutes', 'Pr\u00E9senter la roadmap produit'], avgDays: 21 },
  { id: 'tpl_expansion', key: 'expansion', icon: '\u{1F4C8}', color: '#10b981', steps: ['Identifier les signaux d\'expansion', 'Pr\u00E9parer la proposition', 'Pr\u00E9sentation au client', 'N\u00E9gociation & closing'], avgDays: 30 },
  { id: 'tpl_qbr', key: 'qbr', icon: '\u{1F4CA}', color: '#7c3aed', steps: ['Collecter les KPIs du trimestre', 'Pr\u00E9parer le deck', 'Animer la QBR', 'Envoyer le CR + plan d\'action'], avgDays: 14 },
  { id: 'tpl_renewal', key: 'renewal', icon: '\u{1F504}', color: '#f59e0b', steps: ['Alerte J-90 renouvellement', 'Bilan valeur d\u00E9livr\u00E9e', 'Proposition commerciale', 'Signature'], avgDays: 90 },
  { id: 'tpl_nps', key: 'nps', icon: '\u2B50', color: '#ec4899', steps: ['Envoyer l\'enqu\u00EAte NPS', 'Analyser les r\u00E9sultats', 'Traiter les d\u00E9tracteurs', 'Remercier les promoteurs'], avgDays: 14 },
]

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

  async function loadPlaybooks() {
    const { data, error } = await supabase
      .from('playbooks')
      .select('*')
      .order('created_at', { ascending: false })
    if (!error && data) playbooks.value = data
  }

  async function activateTemplate(templateId, clientId, csmId) {
    const tpl = templates.find(t => t.id === templateId)
    if (!tpl) return

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const newPb = {
      user_id: user.id,
      template_id: tpl.id,
      template_key: tpl.key,
      icon: tpl.icon,
      color: tpl.color,
      client_id: clientId || null,
      csm_id: csmId || null,
      status: 'active',
      steps: tpl.steps.map((s, i) => ({ id: i, title: s, done: false })),
      started_at: new Date().toISOString().slice(0, 10),
      completed_at: null,
    }

    const { error } = await supabase.from('playbooks').insert([newPb])
    if (!error) await loadPlaybooks()
  }

  async function toggleStep(playbookId, stepId) {
    const pb = playbooks.value.find(p => p.id === playbookId)
    if (!pb) return
    const step = pb.steps.find(s => s.id === stepId)
    if (step) {
      step.done = !step.done
      await supabase.from('playbooks').update({ steps: pb.steps }).eq('id', playbookId)
    }
  }

  async function completePlaybook(playbookId) {
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
  }

  async function deletePlaybook(playbookId) {
    playbooks.value = playbooks.value.filter(p => p.id !== playbookId)
    await supabase.from('playbooks').delete().eq('id', playbookId)
  }

  return {
    playbooks, templates, activePlaybooks, donePlaybooks,
    doneThisMonth, avgDuration, successRate,
    activateTemplate, toggleStep, completePlaybook, deletePlaybook, loadPlaybooks,
  }
}, { persist: false })
