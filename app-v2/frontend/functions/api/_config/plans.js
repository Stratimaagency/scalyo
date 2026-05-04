export const PLANS = {
  starter: {
    name: 'Starter',
    price: 79,
    maxUsers: 3,
    maxClients: 50,
    modules: ['coach', 'nova', 'wellbeing', 'dashboard', 'copil', 'matrice'],
    quotas: { coach: 35, nova: 35, wellbeing: 35, dashboard: 35, copil: 35, matrice: 35 },
  },
  growth: {
    name: 'Growth',
    price: 119,
    maxUsers: 7,
    maxClients: -1,
    modules: ['coach', 'nova', 'wellbeing', 'dashboard', 'copil', 'matrice', 'import', 'playbook'],
    quotas: { coach: 100, nova: 100, wellbeing: 100, dashboard: 100, copil: 100, matrice: 100, import: 100, playbook: 100 },
  },
  elite: {
    name: 'Elite',
    price: 159,
    maxUsers: 24,
    maxClients: -1,
    modules: ['coach', 'nova', 'wellbeing', 'dashboard', 'copil', 'matrice', 'import', 'playbook', 'email', 'notif'],
    quotas: { coach: 200, nova: 200, wellbeing: 200, dashboard: 200, copil: 200, matrice: 200, import: 200, playbook: 200, email: 200, notif: 200 },
  },
}

export function getPlan(planId) { return PLANS[planId] || PLANS.starter }

export function isModuleAllowed(planId, moduleName) {
  return getPlan(planId).modules.includes(moduleName)
}

export function getQuota(planId, moduleName) {
  const plan = getPlan(planId)
  return plan.quotas?.[moduleName] || 0
}

export function getMaxUsers(planId) { return getPlan(planId).maxUsers || 3 }

export function getMaxClients(planId) {
  const max = getPlan(planId).maxClients
  return max === -1 ? Infinity : max
}
