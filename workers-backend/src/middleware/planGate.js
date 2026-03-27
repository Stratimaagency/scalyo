/**
 * Middleware: blocks access if company plan is below required level.
 * Usage: planGate('Growth') — allows Growth and Elite only.
 */
const PLAN_RANK = { Starter: 0, Growth: 1, Elite: 2 }

export function planGate(minPlan = 'Growth') {
  return async (c, next) => {
    const user = c.get('user')
    if (!user?.company_id) {
      return c.json({ error: 'Company required' }, 403)
    }
    const company = await c.env.DB.prepare(
      'SELECT plan FROM companies WHERE id = ?'
    ).bind(user.company_id).first()

    const plan = company?.plan || 'Starter'
    const rank = PLAN_RANK[plan] ?? 0
    const required = PLAN_RANK[minPlan] ?? 1

    if (rank < required) {
      return c.json({
        error: `This feature requires the ${minPlan} plan or higher.`,
        upgrade_required: true,
        current_plan: plan,
        required_plan: minPlan,
      }, 403)
    }

    c.set('company_plan', plan)
    await next()
  }
}
