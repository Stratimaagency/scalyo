import { Hono } from 'hono'
import { authMiddleware, companyRequired, trialGuard } from '../middleware/auth.js'

const tasks = new Hono()
tasks.use('/*', authMiddleware(), companyRequired(), trialGuard())

// GET /api/tasks/
tasks.get('/', async (c) => {
  const { company_id } = c.get('user')
  let board = await c.env.DB.prepare(
    'SELECT * FROM task_boards WHERE company_id = ?'
  ).bind(company_id).first()

  if (!board) {
    board = await c.env.DB.prepare(
      'INSERT INTO task_boards (company_id) VALUES (?) RETURNING *'
    ).bind(company_id).first()
  }

  return c.json({ id: board.id, tasks: JSON.parse(board.tasks || '[]'), updated_at: board.updated_at })
})

// POST /api/tasks/save/
tasks.post('/save/', async (c) => {
  const { company_id } = c.get('user')
  const { tasks: tasksData } = await c.req.json()

  const board = await c.env.DB.prepare(
    `INSERT INTO task_boards (company_id, tasks, updated_at)
     VALUES (?, ?, datetime('now'))
     ON CONFLICT(company_id) DO UPDATE SET
       tasks = excluded.tasks, updated_at = datetime('now')
     RETURNING *`
  ).bind(company_id, JSON.stringify(tasksData || [])).first()

  return c.json({ id: board.id, tasks: JSON.parse(board.tasks || '[]'), updated_at: board.updated_at })
})

export default tasks
