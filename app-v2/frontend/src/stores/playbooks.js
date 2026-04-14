import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

const TEMPLATES = [
  { id: 'tpl_onboard', key: 'onboarding', icon: '🚀', color: '#3b82f6', steps: ['Kick-off call avec le client', 'Configuration du compte', 'Formation utilisateurs', 'Check-in J+15', 'Revue adoption J+30', 'QBR J+90'], avgDays: 90 },
  { id: 'tpl_retention', key: 'retention', icon: '🛡️', color: '#ef4444', steps: ['Email d\'ouverture de dialogue', 'Analyse utilisation produit', 'Call de 30 minutes', 'Présenter la roadmap produit'], avgDays: 21 },
  { id: 'tpl_expansion', key: 'expansion', icon: '📈', color: '#10b981', steps: ['Identifier les signaux d\'expansion', 'Préparer la proposition', 'Présentation au client', 'Négociation & closing'], avgDays: 45 },
  { id: 'tpl_qbr', key: 'qbr', icon: '📊', color: '#7c3aed', steps: ['Collecter les KPIs du trimestre', 'Préparer les slides', 'Valider en interne', 'Présenter au client', 'Documenter les action items'], avgDays: 14 },
  { id: 'tpl_renewal', key: 'renewal', icon: '🔄', color: '#f59e0b', steps: ['Alerte J-90 : préparer le dossier', 'Check-in satisfaction J-60', 'Envoyer la proposition J-30', 'Négociation', 'Closing & signature'], avgDays: 90 },
  { id: 'tpl_nps', key: 'nps', icon: '⭐', color: '#ec4899', steps: ['Envoyer l\'enquête NPS', 'Analyser les résultats', 'Contacter les détracteurs', 'Remercier les promoteurs', 'Plan d\'action par segment'], avgDays: 30 },
]

export const usePlaybookStore = defineStore('playbooks', () => {
  const playbooks = ref([])

  const templates = TEMPLATES

  const activePlaybooks = computed(() => playbooks.value.filter(p => p.status === 'active'))
  const donePlaybooks = computed(() => playbooks.value.filter(p => p.status === 'done'))
  const doneThisMonth = computed(() => {
    const now = new Date()
    const start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10)
    return donePlaybooks.value.filter(p => p.completedAt >= start).length
  })
  const avgDuration = computed(() => {
    const done = donePlaybooks.value.filter(p => p.completedAt && p.startedAt)
    if (!done.length) return 0
    const total = done.reduce((s, p) => {
      return s + (new Date(p.completedAt).getTime() - new Date(p.startedAt).getTime()) / 86400000
    }, 0)
    return Math.round(total / done.length)
  })
  const successRate = computed(() => {
    const total = playbooks.value.length
    if (!total) return 0
    return Math.round((donePlaybooks.value.length / total) * 100)
  })

  function activateTemplate(templateId, clientId, csmId) {
    const tpl = templates.find(t => t.id === templateId)
    if (!tpl) return
    playbooks.value.push({
      id: 'pb_' + Date.now(),
      templateId,
      templateKey: tpl.key,
      icon: tpl.icon,
      color: tpl.color,
      clientId,
      csmId,
      status: 'active',
      steps: tpl.steps.map((s, i) => ({ id: i, title: s, done: false })),
      startedAt: new Date().toISOString().slice(0, 10),
      completedAt: null,
    })
  }

  function toggleStep(playbookId, stepId) {
    const pb = playbooks.value.find(p => p.id === playbookId)
    if (!pb) return
    const step = pb.steps.find(s => s.id === stepId)
    if (step) step.done = !step.done
  }

  function completePlaybook(playbookId) {
    const pb = playbooks.value.find(p => p.id === playbookId)
    if (pb) {
      pb.status = 'done'
      pb.completedAt = new Date().toISOString().slice(0, 10)
      pb.steps.forEach(s => s.done = true)
    }
  }

  function deletePlaybook(playbookId) {
    playbooks.value = playbooks.value.filter(p => p.id !== playbookId)
  }

  return {
    playbooks, templates, activePlaybooks, donePlaybooks,
    doneThisMonth, avgDuration, successRate,
    activateTemplate, toggleStep, completePlaybook, deletePlaybook,
  }
}, { persist: true })
