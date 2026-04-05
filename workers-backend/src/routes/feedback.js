import { Hono } from 'hono'
import { authMiddleware, companyRequired } from '../middleware/auth.js'

const feedback = new Hono()
feedback.use('*', authMiddleware(), companyRequired())

// POST /api/feedback/
feedback.post('/', async (c) => {
  const user = c.get('user')
  const { category, rating, description } = await c.req.json()

  if (!category || !['bug', 'feature', 'improvement', 'other'].includes(category)) {
    return c.json({ error: 'Invalid category' }, 400)
  }
  if (!rating || rating < 1 || rating > 5) {
    return c.json({ error: 'Rating must be between 1 and 5' }, 400)
  }
  if (!description) {
    return c.json({ error: 'Description is required' }, 400)
  }

  const result = await c.env.DB.prepare(
    'INSERT INTO feedbacks (user_id, category, rating, description) VALUES (?, ?, ?, ?) RETURNING *'
  ).bind(user.id, category, rating, description).first()

  return c.json(result, 201)
})

export default feedback
