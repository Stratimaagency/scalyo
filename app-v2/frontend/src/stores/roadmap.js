import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const TEMPLATES = [
  {
    id: 'tpl_project',
    key: 'project_launch',
    icon: '🚀',
    color: '#7c3aed',
    milestones: [
      { title: 'Cadrage & objectifs', duration: 7 },
      { title: 'Planification détaillée', duration: 14 },
      { title: 'Exécution phase 1', duration: 30 },
      { title: 'Revue intermédiaire', duration: 7 },
      { title: 'Exécution phase 2', duration: 30 },
      { title: 'Livraison & clôture', duration: 14 },
    ],
  },
  {
    id: 'tpl_sales',
    key: 'sales_cycle',
    icon: '🤝',
    color: '#10b981',
    milestones: [
      { title: 'Qualification prospect', duration: 7 },
      { title: 'Démo & découverte', duration: 7 },
      { title: 'Proposition commerciale', duration: 10 },
      { title: 'Négociation', duration: 14 },
      { title: 'Closing & signature', duration: 7 },
      { title: 'Handover & onboarding', duration: 14 },
    ],
  },
  {
    id: 'tpl_session',
    key: 'session_launch',
    icon: '🏫',
    color: '#3b82f6',
    milestones: [
      { title: 'Ouverture des inscriptions', duration: 30 },
      { title: 'Préparation pédagogique', duration: 21 },
      { title: 'Communication & relance', duration: 14 },
      { title: 'Démarrage de la session', duration: 1 },
      { title: 'Suivi & accompagnement', duration: 60 },
      { title: 'Évaluation & bilan', duration: 14 },
    ],
  },
  {
    id: 'tpl_deployment',
    key: 'deployment',
    icon: '📦',
    color: '#f59e0b',
    milestones: [
      { title: 'Audit & analyse besoins', duration: 7 },
      { title: 'Préparation & configuration', duration: 14 },
      { title: 'Installation sur site', duration: 7 },
      { title: 'Formation utilisateurs', duration: 7 },
      { title: 'Tests & validation', duration: 7 },
      { title: 'Go-live & suivi', duration: 30 },
    ],
  },
  {
    id: 'tpl_renewal',
    key: 'renewal',
    icon: '🔄',
    color: '#ec4899',
    milestones: [
      { title: 'Bilan de la période', duration: 7 },
      { title: 'Identification des enjeux', duration: 7 },
      { title: 'Proposition de renouvellement', duration: 10 },
      { title: 'Négociation conditions', duration: 14 },
      { title: 'Signature & confirmation', duration: 7 },
      { title: 'Plan pour la prochaine période', duration: 14 },
    ],
  },
  {
    id: 'tpl_quarterly',
    key: 'quarterly_goals',
    icon: '📈',
    color: '#06b6d4',
    milestones: [
      { title: 'Définir les objectifs du trimestre', duration: 7 },
      { title: 'Aligner l\'équipe', duration: 7 },
      { title: 'Exécution mois 1', duration: 30 },
      { title: 'Point mi-trimestre', duration: 3 },
      { title: 'Exécution mois 2-3', duration: 60 },
      { title: 'Bilan & retrospective', duration: 7 },
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

  function createFromTemplate(templateId, customName, startDate) {
    const tpl = TEMPLATES.find(t => t.id === templateId)
    if (!tpl) return
    let currentDate = new Date(startDate || new Date())
    const milestones = tpl.milestones.map((m, i) => {
      const start = currentDate.toISOString().slice(0, 10)
      currentDate = new Date(currentDate.getTime() + m.duration * 86400000)
      const end = currentDate.toISOString().slice(0, 10)
      return {
        id: 'm_' + Date.now() + '_' + i,
        title: m.title,
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
  }

  function addMilestone(roadmapId, milestone) {
    const rm = roadmaps.value.find(r => r.id === roadmapId)
    if (rm) rm.milestones.push({ id: 'm_' + Date.now(), done: false, status: 'todo', notes: '', ...milestone })
  }

  function updateMilestone(roadmapId, milestoneId, data) {
    const rm = roadmaps.value.find(r => r.id === roadmapId)
    if (!rm) return
    const mi = rm.milestones.findIndex(m => m.id === milestoneId)
    if (mi !== -1) Object.assign(rm.milestones[mi], data)
  }

  function deleteMilestone(roadmapId, milestoneId) {
    const rm = roadmaps.value.find(r => r.id === roadmapId)
    if (rm) rm.milestones = rm.milestones.filter(m => m.id !== milestoneId)
  }

  function updateRoadmap(id, data) {
    const i = roadmaps.value.findIndex(r => r.id === id)
    if (i !== -1) Object.assign(roadmaps.value[i], data)
  }

  function deleteRoadmap(id) {
    roadmaps.value = roadmaps.value.filter(r => r.id !== id)
  }

  function roadmapProgress(rm) {
    if (!rm.milestones.length) return 0
    return Math.round(rm.milestones.filter(m => m.done).length / rm.milestones.length * 100)
  }

  return {
    roadmaps, activeRoadmaps, doneRoadmaps, globalProgress,
    TEMPLATES,
    createFromTemplate, createBlank,
    addMilestone, updateMilestone, deleteMilestone,
    updateRoadmap, deleteRoadmap, roadmapProgress,
  }
}, { persist: true })
