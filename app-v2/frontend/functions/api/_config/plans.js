export const PLANS = {
  starter: {
    name: 'Starter',
    price: 79,
    dailyAiMessages: 35,
    modules: ['coach'],
  },
  growth: {
    name: 'Growth',
    price: 119,
    dailyAiMessages: 100,
    modules: ['coach', 'import', 'matrice', 'email'],
  },
  elite: {
    name: 'Elite',
    price: 159,
    dailyAiMessages: 200,
    modules: ['coach', 'import', 'matrice', 'email', 'copil', 'playbook', 'dashboard', 'notif'],
  },
}

export function getPlan(planId) {
  return PLANS[planId] || PLANS.starter
}

export function isModuleAllowed(planId, moduleName) {
  const plan = getPlan(planId)
  return plan.modules.includes(moduleName)
}
