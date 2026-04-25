export const PLANS = {
  starter: {
    name: 'Starter',
    price: 79,
    modules: ['coach', 'nova'],
    quotas: { coach: 35, nova: 35 },
  },
  growth: {
    name: 'Growth',
    price: 119,
    modules: ['coach', 'nova', 'import', 'matrice', 'email'],
    quotas: { coach: 100, nova: 100, import: 100, matrice: 100, email: 100 },
  },
  elite: {
    name: 'Elite',
    price: 159,
    modules: ['coach', 'nova', 'import', 'matrice', 'email', 'copil', 'playbook', 'dashboard', 'notif'],
    quotas: { coach: 200, nova: 200, import: 200, matrice: 200, email: 200, copil: 200, playbook: 200, dashboard: 200, notif: 200 },
  },
}

export function getPlan(planId) {
  return PLANS[planId] || PLANS.starter
}

export function isModuleAllowed(planId, moduleName) {
  return getPlan(planId).modules.includes(moduleName)
}

export function getQuota(planId, moduleName) {
  const plan = getPlan(planId)
  return plan.quotas?.[moduleName] || 0
}
