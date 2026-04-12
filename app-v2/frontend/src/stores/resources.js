import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useResourceStore = defineStore('resources', () => {
  const resources = ref([
    { id: 'r1', title: 'Réduire le churn en 30 jours', category: 'guide', level: 'intermediate', lang: 'fr', duration: '15 min', icon: '📘', desc: 'Plan d\'action complet pour réduire le churn rate de votre portefeuille en un mois.' },
    { id: 'r2', title: 'Construire un QBR parfait', category: 'guide', level: 'expert', lang: 'fr', duration: '20 min', icon: '📘', desc: 'Structure complète pour des Quarterly Business Reviews impactants.' },
    { id: 'r3', title: 'Améliorer son NPS de +20 points', category: 'guide', level: 'intermediate', lang: 'fr', duration: '12 min', icon: '📘', desc: 'Méthodologie pour transformer vos détracteurs en promoteurs.' },
    { id: 'r4', title: 'Checklist onboarding client (D0→D90)', category: 'checklist', level: 'beginner', lang: 'fr', duration: '5 min', icon: '📋', desc: '90 jours structurés pour un onboarding réussi.' },
    { id: 'r5', title: 'Checklist préparation renouvellement', category: 'checklist', level: 'intermediate', lang: 'fr', duration: '5 min', icon: '📋', desc: 'Ne manquez plus aucun renouvellement.' },
    { id: 'r6', title: 'Détection précoce churn', category: 'checklist', level: 'expert', lang: 'fr', duration: '8 min', icon: '📋', desc: 'Les 12 signaux faibles à surveiller.' },
    { id: 'r7', title: 'Framework JTBD pour CS', category: 'framework', level: 'expert', lang: 'fr', duration: '18 min', icon: '🎯', desc: 'Jobs To Be Done appliqué au Customer Success.' },
    { id: 'r8', title: 'Matrice de santé client', category: 'framework', level: 'intermediate', lang: 'fr', duration: '10 min', icon: '🎯', desc: 'Système de scoring pour évaluer la santé de chaque compte.' },
    { id: 'r9', title: 'Script appel rétention', category: 'script', level: 'beginner', lang: 'fr', duration: '7 min', icon: '⚙️', desc: 'Script prêt à l\'emploi pour un appel de rétention client à risque.' },
    { id: 'r10', title: 'Script discovery call expansion', category: 'script', level: 'intermediate', lang: 'fr', duration: '8 min', icon: '⚙️', desc: 'Questions et structure pour identifier les opportunités d\'upsell.' },
    { id: 'r11', title: 'Closing the loop NPS', category: 'script', level: 'intermediate', lang: 'fr', duration: '6 min', icon: '⚙️', desc: 'Comment répondre aux détracteurs NPS et les transformer.' },
    { id: 'r12', title: 'Template QBR PowerPoint', category: 'template', level: 'beginner', lang: 'fr', duration: '3 min', icon: '📊', desc: '20 slides prêtes à personnaliser pour votre prochain QBR.' },
  ])

  const masterclasses = ref([
    {
      id: 'mc1', title: 'Maîtriser la rétention client en SaaS B2B', quarter: 'Q2 2026', isNew: true,
      modules: [
        { id: 'mod1', title: 'Comprendre les vraies raisons du churn', lessons: 3, exercises: 2, completed: false },
        { id: 'mod2', title: 'Construire un système d\'alertes précoces', lessons: 4, exercises: 3, completed: false },
        { id: 'mod3', title: 'Les conversations difficiles avec les clients à risque', lessons: 3, exercises: 2, completed: false },
        { id: 'mod4', title: 'Transformer les détracteurs NPS en promoteurs', lessons: 3, exercises: 2, completed: false },
        { id: 'mod5', title: 'Mesurer et prouver la valeur de votre CS', lessons: 3, exercises: 1, completed: false },
      ],
    },
    { id: 'mc2', title: 'L\'expansion revenue : upsell et cross-sell éthiques', quarter: 'Q1 2026', isNew: false, modules: [] },
    { id: 'mc3', title: 'Construire une équipe CS haute performance', quarter: 'Q4 2025', isNew: false, modules: [] },
  ])

  const guides = ref([
    { id: 'g1', title: 'Client en risque de churn', icon: '🔴', category: 'client', steps: 5, desc: 'Protocole complet de rétention en 5 étapes.' },
    { id: 'g2', title: 'Client silencieux', icon: '🟡', category: 'client', steps: 4, desc: 'Stratégie de réengagement pour clients qui ne répondent plus.' },
    { id: 'g3', title: 'Client prêt pour expansion', icon: '🟢', category: 'client', steps: 3, desc: 'Qualification et approche pour upsell.' },
    { id: 'g4', title: 'Escalade client mécontent', icon: '🔵', category: 'client', steps: 5, desc: 'Gestion de crise et désescalade.' },
    { id: 'g5', title: 'La semaine type du CSM efficace', icon: '📅', category: 'organization', steps: 7, desc: 'Planning type pour maximiser votre impact.' },
    { id: 'g6', title: 'Gérer 30+ comptes sans s\'épuiser', icon: '💚', category: 'organization', steps: 6, desc: 'Système de prioritisation et automatisation.' },
    { id: 'g7', title: 'COPIL parfait : préparation → exécution → suivi', icon: '📊', category: 'copil', steps: 8, desc: 'Guide complet du comité de pilotage.' },
    { id: 'g8', title: 'Collaboration Sales → CS handoff', icon: '🤝', category: 'management', steps: 4, desc: 'Process de transition client fluide.' },
  ])

  const categories = ['guide', 'checklist', 'framework', 'script', 'template']
  const levels = ['beginner', 'intermediate', 'expert']

  const filteredResources = (cat, level, search) => {
    let list = resources.value
    if (cat && cat !== 'all') list = list.filter(r => r.category === cat)
    if (level && level !== 'all') list = list.filter(r => r.level === level)
    if (search) {
      const q = search.toLowerCase()
      list = list.filter(r => r.title.toLowerCase().includes(q) || r.desc.toLowerCase().includes(q))
    }
    return list
  }

  return { resources, masterclasses, guides, categories, levels, filteredResources }
})
