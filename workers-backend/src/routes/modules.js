import { Hono } from 'hono'
import { authMiddleware, companyRequired, trialGuard } from '../middleware/auth.js'

const modulesRouter = new Hono()

modulesRouter.use('/*', authMiddleware(), companyRequired(), trialGuard())

// ─── Mock Data ──────────────────────────────────────────────

const mockClients = [
  { id: 'c1', name: 'Leroy Finance', healthScore: 82, status: 'healthy', arrValue: 48000, csmId: 'csm1', csmName: 'Sophie Martin', industry: 'Finance', lastContact: '2026-03-28' },
  { id: 'c2', name: 'TechVision SAS', healthScore: 45, status: 'at_risk', arrValue: 72000, csmId: 'csm1', csmName: 'Sophie Martin', industry: 'Tech', lastContact: '2026-03-15' },
  { id: 'c3', name: 'MédiSanté Pro', healthScore: 91, status: 'healthy', arrValue: 36000, csmId: 'csm2', csmName: 'Lucas Dupont', industry: 'Santé', lastContact: '2026-03-30' },
  { id: 'c4', name: 'GreenLogistics', healthScore: 55, status: 'at_risk', arrValue: 60000, csmId: 'csm2', csmName: 'Lucas Dupont', industry: 'Logistique', lastContact: '2026-03-10' },
  { id: 'c5', name: 'EduPlus Academy', healthScore: 68, status: 'neutral', arrValue: 24000, csmId: 'csm3', csmName: 'Marie Lefèvre', industry: 'Éducation', lastContact: '2026-03-25' },
  { id: 'c6', name: 'RetailMax France', healthScore: 78, status: 'healthy', arrValue: 96000, csmId: 'csm3', csmName: 'Marie Lefèvre', industry: 'Retail', lastContact: '2026-03-29' },
  { id: 'c7', name: 'CloudSecure IO', healthScore: 38, status: 'at_risk', arrValue: 120000, csmId: 'csm1', csmName: 'Sophie Martin', industry: 'Cybersécurité', lastContact: '2026-02-20' },
  { id: 'c8', name: 'DataWave Analytics', healthScore: 75, status: 'healthy', arrValue: 54000, csmId: 'csm2', csmName: 'Lucas Dupont', industry: 'Data', lastContact: '2026-03-27' },
]

const mockCSMs = [
  { id: 'csm1', name: 'Sophie Martin', email: 'sophie.martin@scalyo.io', role: 'csm', clientCount: 3, workloadPct: 88, avgHealthScore: 55 },
  { id: 'csm2', name: 'Lucas Dupont', email: 'lucas.dupont@scalyo.io', role: 'csm', clientCount: 3, workloadPct: 72, avgHealthScore: 74 },
  { id: 'csm3', name: 'Marie Lefèvre', email: 'marie.lefevre@scalyo.io', role: 'csm', clientCount: 2, workloadPct: 60, avgHealthScore: 73 },
]

const mockProjects = [
  {
    id: 'p1', name: 'Onboarding TechVision', clientId: 'c2', clientName: 'TechVision SAS', color: '#e74c3c', startWeek: 10,
    tasks: [
      { title: 'Kickoff meeting', done: true, startWeek: 10, durationWeeks: 1 },
      { title: 'Configuration initiale', done: true, startWeek: 11, durationWeeks: 2 },
      { title: 'Formation équipe', done: false, startWeek: 13, durationWeeks: 2 },
      { title: 'Go-live', done: false, startWeek: 15, durationWeeks: 1 },
    ],
  },
  {
    id: 'p2', name: 'Expansion RetailMax', clientId: 'c6', clientName: 'RetailMax France', color: '#3498db', startWeek: 8,
    tasks: [
      { title: 'Audit des besoins', done: true, startWeek: 8, durationWeeks: 2 },
      { title: 'Déploiement module analytics', done: false, startWeek: 10, durationWeeks: 3 },
      { title: 'Formation managers', done: false, startWeek: 13, durationWeeks: 1 },
    ],
  },
  {
    id: 'p3', name: 'Plan de sauvetage CloudSecure', clientId: 'c7', clientName: 'CloudSecure IO', color: '#e67e22', startWeek: 12,
    tasks: [
      { title: 'Diagnostic complet', done: true, startWeek: 12, durationWeeks: 1 },
      { title: 'Plan d\'action corrective', done: false, startWeek: 13, durationWeeks: 2 },
      { title: 'Suivi hebdomadaire', done: false, startWeek: 15, durationWeeks: 4 },
    ],
  },
]

const mockPlaybooks = [
  {
    id: 'pb1', name: 'Anti-Churn Standard', type: 'anti-churn',
    clients: ['c2', 'c4', 'c7'],
    steps: [
      { title: 'Identifier les signaux de churn', description: 'Analyser NPS, usage, tickets support', automated: false },
      { title: 'Appel de diagnostic', description: 'Planifier un call avec le sponsor', automated: false },
      { title: 'Plan d\'action personnalisé', description: 'Créer un plan avec jalons clairs', automated: false },
      { title: 'Alerte Slack automatique', description: 'Notification si health score < 50', automated: true },
      { title: 'Revue à 30 jours', description: 'Évaluer les progrès et ajuster', automated: false },
    ],
  },
  {
    id: 'pb2', name: 'Onboarding Premium', type: 'onboarding',
    clients: ['c2'],
    steps: [
      { title: 'Welcome email', description: 'Envoi automatique J+0', automated: true },
      { title: 'Kickoff call', description: 'Appel de lancement avec le sponsor', automated: false },
      { title: 'Configuration guidée', description: 'Setup en 5 étapes', automated: false },
      { title: 'Check-in J+14', description: 'Premier bilan d\'adoption', automated: false },
      { title: 'QBR à 90 jours', description: 'Quarterly Business Review', automated: false },
    ],
  },
]

const mockOKRs = [
  {
    id: 'okr1', title: 'Réduire le churn à 3%', owner: 'Sophie Martin',
    keyResults: [
      { id: 'kr1', title: 'Taux de churn mensuel', current: 4.2, target: 3, unit: '%', inverse: true },
      { id: 'kr2', title: 'Clients at-risk sauvés', current: 5, target: 8, unit: 'clients', inverse: false },
      { id: 'kr3', title: 'NPS moyen', current: 42, target: 55, unit: 'pts', inverse: false },
    ],
  },
  {
    id: 'okr2', title: 'Augmenter l\'ARR de 20%', owner: 'Lucas Dupont',
    keyResults: [
      { id: 'kr4', title: 'Upsells réalisés', current: 12, target: 20, unit: 'deals', inverse: false },
      { id: 'kr5', title: 'ARR net ajouté', current: 85000, target: 150000, unit: '€', inverse: false },
    ],
  },
  {
    id: 'okr3', title: 'Améliorer l\'adoption produit', owner: 'Marie Lefèvre',
    keyResults: [
      { id: 'kr6', title: 'Taux d\'activation features clés', current: 62, target: 80, unit: '%', inverse: false },
      { id: 'kr7', title: 'Tickets support / client / mois', current: 3.5, target: 2, unit: 'tickets', inverse: true },
    ],
  },
]

let playbookProgressStore = {}

// ─── Routes ─────────────────────────────────────────────────

// Clients Health
modulesRouter.get('/clients/health', (c) => {
  return c.json(mockClients)
})

modulesRouter.post('/clients/:id/health', async (c) => {
  const { id } = c.req.param()
  const { score } = await c.req.json()
  const client = mockClients.find(cl => cl.id === id)
  if (!client) return c.json({ error: 'Client not found' }, 404)
  client.healthScore = score
  client.status = score < 60 ? 'at_risk' : score < 75 ? 'neutral' : 'healthy'
  return c.json(client)
})

// CSM Workload
modulesRouter.get('/csms/workload', (c) => {
  return c.json(mockCSMs)
})

// CS Projects
modulesRouter.get('/cs-projects', (c) => {
  return c.json(mockProjects)
})

// Playbooks
modulesRouter.get('/playbooks', (c) => {
  return c.json(mockPlaybooks)
})

modulesRouter.get('/playbooks/progress', (c) => {
  return c.json(playbookProgressStore)
})

modulesRouter.post('/playbooks/progress', async (c) => {
  const { playbookId, stepIndex, done } = await c.req.json()
  const key = `${playbookId}_${stepIndex}`
  playbookProgressStore[key] = done
  return c.json({ success: true, key, done })
})

// OKRs
modulesRouter.get('/okrs', (c) => {
  return c.json(mockOKRs)
})

modulesRouter.put('/okrs/:id/kr/:krId', async (c) => {
  const { id, krId } = c.req.param()
  const data = await c.req.json()
  const okr = mockOKRs.find(o => o.id === id)
  if (!okr) return c.json({ error: 'OKR not found' }, 404)
  const kr = okr.keyResults.find(k => k.id === krId)
  if (!kr) return c.json({ error: 'Key Result not found' }, 404)
  if (data.current !== undefined) kr.current = data.current
  return c.json(kr)
})

export default modulesRouter
