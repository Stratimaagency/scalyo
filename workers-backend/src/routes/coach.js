import { Hono } from 'hono'
import { authMiddleware, companyRequired, trialGuard } from '../middleware/auth.js'

const coach = new Hono()
coach.use('*', authMiddleware(), companyRequired(), trialGuard())

// Daily message limits per plan
const DAILY_MSG_LIMITS = { Starter: 5, Growth: -1, Elite: -1 }

async function checkCoachLimit(c) {
  const user = c.get('user')
  if (!user?.company_id) return null

  const company = await c.env.DB.prepare(
    'SELECT plan FROM companies WHERE id = ?'
  ).bind(user.company_id).first()

  const plan = company?.plan || 'Starter'
  const limit = DAILY_MSG_LIMITS[plan] ?? 5
  if (limit < 0) return null // unlimited

  const today = new Date().toISOString().slice(0, 10)
  const row = await c.env.DB.prepare(
    "SELECT COUNT(*) as cnt FROM analytics WHERE event = 'coach_message' AND user_id = ? AND created_at >= ?"
  ).bind(user.id, today).first()

  if ((row?.cnt || 0) >= limit) {
    return { error: `Daily limit reached (${limit} messages/day on ${plan} plan). Upgrade for unlimited access.`, upgrade_required: true, current_plan: plan }
  }
  return null
}

async function trackCoachMessage(c) {
  const user = c.get('user')
  try {
    await c.env.DB.prepare(
      "INSERT INTO analytics (event, user_id, company_id) VALUES ('coach_message', ?, ?)"
    ).bind(user.id, user.company_id).run()
  } catch {}
}

const SYSTEM_PROMPTS = {
  coach: "Tu es un expert Customer Success senior avec 15 ans d'expérience. Tu conseilles des CS Managers et CSMs sur : stratégie CS, rétention, expansion, health scoring, QBR, onboarding, gestion d'équipe, prévention du churn, NPS, playbooks. Réponds de manière structurée, actionnable et bienveillante. Utilise la langue de l'utilisateur.",
  nova: "Tu es Nova, assistante bien-être dédiée aux équipes Customer Success. Tu aides les CSMs à gérer le stress, la charge mentale, les conflits, l'épuisement professionnel. Tu es empathique, bienveillante et professionnelle. Tout est confidentiel. Réponds dans la langue de l'utilisateur.",
}

const DEEPSEEK_URL = 'https://api.deepseek.com/v1/chat/completions'
const MODEL = 'deepseek-chat'
const MAX_TOKENS = 1024

// POST /api/coach/chat/
coach.post('/chat/', async (c) => {
  // Check daily message limit by plan
  const limitErr = await checkCoachLimit(c)
  if (limitErr) return c.json(limitErr, 403)

  const { messages, mode = 'coach' } = await c.req.json()
  const systemPrompt = SYSTEM_PROMPTS[mode] || SYSTEM_PROMPTS.coach

  if (!c.env.DEEPSEEK_API_KEY) {
    return c.json({ error: 'DEEPSEEK_API_KEY is not configured.' }, 500)
  }

  try {
    const response = await fetch(DEEPSEEK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${c.env.DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: MAX_TOKENS,
        messages: [
          { role: 'system', content: systemPrompt },
          ...(messages || []),
        ],
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      return c.json({ error: data.error?.message || 'AI request failed' }, response.status)
    }

    const text = data.choices?.[0]?.message?.content
    if (!text) {
      return c.json({ error: 'No response from AI' }, 502)
    }

    await trackCoachMessage(c)

    return c.json({
      content: text,
      role: 'assistant',
    })
  } catch (e) {
    return c.json({ error: 'Coach AI temporarily unavailable. Please try again.' }, 500)
  }
})

// POST /api/coach/stream/
coach.post('/stream/', async (c) => {
  // Check daily message limit by plan
  const limitErr = await checkCoachLimit(c)
  if (limitErr) return c.json(limitErr, 403)

  const { messages, mode = 'coach' } = await c.req.json()
  const systemPrompt = SYSTEM_PROMPTS[mode] || SYSTEM_PROMPTS.coach

  if (!c.env.DEEPSEEK_API_KEY) {
    return c.json({ error: 'DEEPSEEK_API_KEY is not configured.' }, 500)
  }

  let response
  try {
    response = await fetch(DEEPSEEK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${c.env.DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: MAX_TOKENS,
        messages: [
          { role: 'system', content: systemPrompt },
          ...(messages || []),
        ],
        stream: true,
      }),
    })
  } catch (e) {
    return c.json({ error: 'Coach AI temporarily unavailable. Please try again.' }, 500)
  }

  if (!response.ok) {
    const err = await response.text()
    return c.json({ error: err }, response.status)
  }

  await trackCoachMessage(c)

  const { readable, writable } = new TransformStream()
  const writer = writable.getWriter()
  const encoder = new TextEncoder()

  ;(async () => {
    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''

    try {
      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          const payload = line.slice(6).trim()
          if (payload === '[DONE]') continue

          try {
            const event = JSON.parse(payload)
            const delta = event.choices?.[0]?.delta?.content
            if (delta) {
              await writer.write(encoder.encode(`data: ${JSON.stringify({ text: delta })}\n\n`))
            }
            if (event.choices?.[0]?.finish_reason === 'stop') {
              await writer.write(encoder.encode('data: [DONE]\n\n'))
            }
          } catch {}
        }
      }
      await writer.write(encoder.encode('data: [DONE]\n\n'))
    } catch (e) {
      console.error('Coach stream error:', e.message)
      await writer.write(encoder.encode(`data: ${JSON.stringify({ error: 'Coach AI temporarily unavailable.' })}\n\n`))
    } finally {
      await writer.close()
    }
  })()

  const frontendUrl = c.env?.FRONTEND_URL || 'https://scalyo.pages.dev'
  const allowedOrigins = [frontendUrl, 'https://scalyo.app', 'https://www.scalyo.app', 'http://localhost:5173', 'http://localhost:4173']
  const origin = c.req.header('Origin')
  const isAllowed = allowedOrigins.includes(origin) || (origin && /^https:\/\/[a-z0-9-]+\.scalyo\.pages\.dev$/.test(origin))
  const allowedOrigin = isAllowed ? origin : allowedOrigins[0]

  return new Response(readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': allowedOrigin,
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'X-Content-Type-Options': 'nosniff',
    },
  })
})

export default coach
