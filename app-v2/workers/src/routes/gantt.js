import { detectLanguage, t } from '../middleware/i18n.js'

// Mock gantt data
const ganttProjects = [
  {
    id: 'p1', name: 'Onboarding Q2', color: '#7c3aed',
    tasks: [
      { id: 'gt1', title: 'Kick-off clients', start: '2026-04-01', end: '2026-04-07', progress: 100, assignee: 'tm1', isMilestone: false, dependencies: [] },
      { id: 'gt2', title: 'Configuration comptes', start: '2026-04-08', end: '2026-04-14', progress: 75, assignee: 'tm1', isMilestone: false, dependencies: ['gt1'] },
      { id: 'gt3', title: 'Formation utilisateurs', start: '2026-04-15', end: '2026-04-25', progress: 30, assignee: 'tm3', isMilestone: false, dependencies: ['gt2'] },
      { id: 'gt4', title: 'Go-live', start: '2026-04-28', end: '2026-04-28', progress: 0, assignee: 'tm1', isMilestone: true, dependencies: ['gt3'] },
    ],
  },
  {
    id: 'p2', name: 'Expansion Comptes', color: '#10b981',
    tasks: [
      { id: 'gt5', title: 'Analyse opportunités', start: '2026-04-01', end: '2026-04-10', progress: 100, assignee: 'tm3', isMilestone: false, dependencies: [] },
      { id: 'gt6', title: 'Propositions upsell', start: '2026-04-11', end: '2026-04-20', progress: 50, assignee: 'tm3', isMilestone: false, dependencies: ['gt5'] },
      { id: 'gt7', title: 'Closing', start: '2026-04-21', end: '2026-04-30', progress: 0, assignee: 'tm3', isMilestone: false, dependencies: ['gt6'] },
    ],
  },
  {
    id: 'p3', name: 'Rétention H1', color: '#ef4444',
    tasks: [
      { id: 'gt8', title: 'Audit comptes à risque', start: '2026-04-01', end: '2026-04-05', progress: 100, assignee: 'tm2', isMilestone: false, dependencies: [] },
      { id: 'gt9', title: 'Playbooks rétention', start: '2026-04-06', end: '2026-04-18', progress: 60, assignee: 'tm2', isMilestone: false, dependencies: ['gt8'] },
      { id: 'gt10', title: 'Revue résultats', start: '2026-04-30', end: '2026-04-30', progress: 0, assignee: 'tm1', isMilestone: true, dependencies: ['gt9'] },
    ],
  },
]

const allDependencies = [
  { id: 'd1', from: 'gt1', to: 'gt2', type: 'finish-to-start' },
  { id: 'd2', from: 'gt2', to: 'gt3', type: 'finish-to-start' },
  { id: 'd3', from: 'gt3', to: 'gt4', type: 'finish-to-start' },
  { id: 'd4', from: 'gt5', to: 'gt6', type: 'finish-to-start' },
  { id: 'd5', from: 'gt6', to: 'gt7', type: 'finish-to-start' },
  { id: 'd6', from: 'gt8', to: 'gt9', type: 'finish-to-start' },
  { id: 'd7', from: 'gt9', to: 'gt10', type: 'finish-to-start' },
]

export function handleGantt(request) {
  const lang = detectLanguage(request)
  const url = new URL(request.url)
  const headers = { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
  const path = url.pathname

  // GET /api/gantt/projects
  if (path === '/api/gantt/projects' && request.method === 'GET') {
    return new Response(JSON.stringify({
      projects: ganttProjects,
      labels: {
        today: lang === 'fr' ? "Aujourd'hui" : lang === 'ko' ? '오늘' : 'Today',
        milestone: lang === 'fr' ? 'Jalon' : lang === 'ko' ? '마일스톤' : 'Milestone',
        dependency: lang === 'fr' ? 'Dépendance' : lang === 'ko' ? '종속성' : 'Dependency',
        progress: lang === 'fr' ? 'Progression' : lang === 'ko' ? '진행률' : 'Progress',
        zoomLevels: {
          day: lang === 'fr' ? 'Jours' : lang === 'ko' ? '일' : 'Days',
          week: lang === 'fr' ? 'Semaines' : lang === 'ko' ? '주' : 'Weeks',
          month: lang === 'fr' ? 'Mois' : lang === 'ko' ? '월' : 'Months',
          quarter: lang === 'fr' ? 'Trimestres' : lang === 'ko' ? '분기' : 'Quarters',
        },
      },
    }), { headers })
  }

  // GET /api/gantt/dependencies
  if (path === '/api/gantt/dependencies' && request.method === 'GET') {
    return new Response(JSON.stringify({ dependencies: allDependencies }), { headers })
  }

  // PUT /api/gantt/tasks/:id/dates
  if (path.match(/^\/api\/gantt\/tasks\/\w+\/dates$/) && request.method === 'PUT') {
    const resource = lang === 'fr' ? 'Tâche' : lang === 'ko' ? '작업' : 'Task'
    return new Response(JSON.stringify({ message: t(lang, 'success.updated', { resource }) }), { headers })
  }

  // PUT /api/gantt/tasks/:id/progress
  if (path.match(/^\/api\/gantt\/tasks\/\w+\/progress$/) && request.method === 'PUT') {
    const resource = lang === 'fr' ? 'Progression' : lang === 'ko' ? '진행률' : 'Progress'
    return new Response(JSON.stringify({ message: t(lang, 'success.updated', { resource }) }), { headers })
  }

  // POST /api/gantt/dependencies
  if (path === '/api/gantt/dependencies' && request.method === 'POST') {
    const resource = lang === 'fr' ? 'Dépendance' : lang === 'ko' ? '종속성' : 'Dependency'
    return new Response(JSON.stringify({
      message: t(lang, 'success.created', { resource }),
      id: 'd_' + Date.now(),
    }), { status: 201, headers })
  }

  // DELETE /api/gantt/dependencies/:id
  if (path.match(/^\/api\/gantt\/dependencies\/\w+$/) && request.method === 'DELETE') {
    const resource = lang === 'fr' ? 'Dépendance' : lang === 'ko' ? '종속성' : 'Dependency'
    return new Response(JSON.stringify({ message: t(lang, 'success.deleted', { resource }) }), { headers })
  }

  return new Response(JSON.stringify({ error: t(lang, 'errors.notFound') }), { status: 404, headers })
}
