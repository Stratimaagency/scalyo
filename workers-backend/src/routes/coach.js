import { Hono } from 'hono'
import { authMiddleware } from '../middleware/auth.js'

const coach = new Hono()
coach.use('/*', authMiddleware())

const SYSTEM_PROMPTS = {
  coach: "Tu es un expert Customer Success senior avec 15 ans d'expérience. Tu conseilles des CS Managers et CSMs sur : stratégie CS, rétention, expansion, health scoring, QBR, onboarding, gestion d'équipe, prévention du churn, NPS, playbooks. Réponds de manière structurée, actionnable et bienveillante. Utilise la langue de l'utilisateur.",
  nova: "Tu es Nova, assistante bien-être dédiée aux équipes Customer Success. Tu aides les CSMs à gérer le stress, la charge mentale, les conflits, l'épuisement professionnel. Tu es empathique, bienveillante et professionnelle. Tout est confidentiel. Réponds dans la langue de l'utilisateur.",
}

const MODEL = 'claude-sonnet-4-20250514'
const MAX_TOKENS = 1024

// POST /api/coach/chat/
coach.post('/chat/', async (c) => {
  const { messages, mode = 'coach' } = await c.req.json()
  const systemPrompt = SYSTEM_PROMPTS[mode] || SYSTEM_PROMPTS.coach

  if (!c.env.ANTHROPIC_API_KEY) {
    return c.json({ error: 'ANTHROPIC_API_KEY is not configured.' }, 500)
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': c.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: MAX_TOKENS,
        system: systemPrompt,
        messages: messages || [],
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      return c.json({ error: data.error?.message || 'AI request failed' }, response.status)
    }

    const text = data.content?.[0]?.text
    if (!text) {
      return c.json({ error: 'No response from AI' }, 502)
    }

    return c.json({
      content: text,
      role: 'assistant',
    })
  } catch (e) {
    return c.json({ error: e.message }, 500)
  }
})

// POST /api/coach/stream/
coach.post('/stream/', async (c) => {
  const { messages, mode = 'coach' } = await c.req.json()
  const systemPrompt = SYSTEM_PROMPTS[mode] || SYSTEM_PROMPTS.coach

  if (!c.env.ANTHROPIC_API_KEY) {
    return c.json({ error: 'ANTHROPIC_API_KEY is not configured.' }, 500)
  }

  let response
  try {
    response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': c.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: MAX_TOKENS,
        system: systemPrompt,
        messages: messages || [],
        stream: true,
      }),
    })
  } catch (e) {
    return c.json({ error: e.message }, 500)
  }

  if (!response.ok) {
    const err = await response.text()
    return c.json({ error: err }, response.status)
  }

  // Transform Anthropic SSE to our SSE format
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
            if (event.type === 'content_block_delta' && event.delta?.text) {
              await writer.write(encoder.encode(`data: ${JSON.stringify({ text: event.delta.text })}\n\n`))
            }
            if (event.type === 'message_stop') {
              await writer.write(encoder.encode('data: [DONE]\n\n'))
            }
          } catch {}
        }
      }
      await writer.write(encoder.encode('data: [DONE]\n\n'))
    } catch (e) {
      await writer.write(encoder.encode(`data: ${JSON.stringify({ error: e.message })}\n\n`))
    } finally {
      await writer.close()
    }
  })()

  // Build CORS headers manually since we bypass Hono's response pipeline
  const frontendUrl = c.env?.FRONTEND_URL || 'https://scalyo.app'
  const allowedOrigins = [frontendUrl, 'http://localhost:5173', 'http://localhost:4173']
  const origin = c.req.header('Origin')
  const isAllowed = allowedOrigins.includes(origin) || (origin && origin.endsWith('.scalyo.pages.dev'))
  const allowedOrigin = isAllowed ? origin : allowedOrigins[0]

  return new Response(readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': allowedOrigin,
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
})

export default coach
