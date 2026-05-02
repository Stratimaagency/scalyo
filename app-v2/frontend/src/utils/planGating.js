// === SCALYO — Plan Gating (frontend) ===
// Mirrors backend _config/plans.js module lists.

const PLAN_MODULES = {
  starter: ['coach', 'nova', 'dashboard', 'copil', 'matrice'],
  growth: ['coach', 'nova', 'dashboard', 'copil', 'matrice', 'import', 'playbook'],
  elite: ['coach', 'nova', 'dashboard', 'copil', 'matrice', 'import', 'playbook', 'email', 'notif'],
}

export function isModuleAllowed(planId, moduleName) {
  const modules = PLAN_MODULES[planId] || PLAN_MODULES.starter
  return modules.includes(moduleName)
}

export function getAllowedModules(planId) {
  return PLAN_MODULES[planId] || PLAN_MODULES.starter
}
