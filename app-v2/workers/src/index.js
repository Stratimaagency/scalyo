import { detectLanguage, t } from './middleware/i18n.js'
import { handleCountryLaws } from './routes/countryLaws.js'
import { handlePlanning } from './routes/planning.js'
import { handleGantt } from './routes/gantt.js'

export default {
  async fetch(request, env) {
    const url = new URL(request.url)
    const lang = detectLanguage(request)
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, Accept-Language',
    }

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders })
    }

    // Wrap responses with CORS
    const addCors = (response) => {
      const newHeaders = new Headers(response.headers)
      for (const [k, v] of Object.entries(corsHeaders)) newHeaders.set(k, v)
      return new Response(response.body, { status: response.status, headers: newHeaders })
    }

    try {
      // ── Country Laws routes ──
      if (url.pathname.startsWith('/api/country-laws')) {
        return addCors(handleCountryLaws(request))
      }

      // ── Planning routes ──
      if (url.pathname.startsWith('/api/planning')) {
        return addCors(handlePlanning(request))
      }

      // ── Gantt routes ──
      if (url.pathname.startsWith('/api/gantt')) {
        return addCors(handleGantt(request))
      }

      // ── Coach IA ──
      if (url.pathname === '/api/coach' && request.method === 'POST') {
        const { message, context, history, lang: reqLang } = await request.json()
        const coachLang = reqLang || lang
        const apiKey = env.ANTHROPIC_API_KEY
        if (!apiKey || apiKey === 'REMPLACER_PAR_CLE_ANTHROPIC') {
          return Response.json({ error: t(coachLang, 'errors.serverError') }, { headers: corsHeaders })
        }

        const systemPrompts = {
          fr: `Tu es un coach expert en Customer Success B2B SaaS. Tu donnes des conseils actionnables, concrets et personnalisés. Réponds en français. Contexte : ${context || 'Non disponible'}.`,
          en: `You are an expert B2B SaaS Customer Success coach. Give actionable, concrete, personalized advice. Reply in English. Context: ${context || 'Not available'}.`,
          ko: `당신은 B2B SaaS Customer Success 전문 코치입니다. 실행 가능하고 구체적이며 개인화된 조언을 제공하세요. 한국어로 답변하세요. 맥락: ${context || '정보 없음'}.`,
        }

        const msgs = [
          ...(history || []).map(m => ({ role: m.role, content: m.content })),
          { role: 'user', content: message },
        ]

        const res = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01',
          },
          body: JSON.stringify({
            model: 'claude-sonnet-4-20250514',
            max_tokens: 1024,
            system: systemPrompts[coachLang] || systemPrompts.fr,
            messages: msgs,
          }),
        })

        const data = await res.json()
        const response = data.content?.[0]?.text || t(coachLang, 'errors.serverError')
        return Response.json({ response }, { headers: corsHeaders })
      }

      // ── Stripe (structure ready) ──
      if (url.pathname === '/api/stripe/checkout' && request.method === 'POST') {
        return Response.json({ message: t(lang, 'errors.serverError') }, { headers: corsHeaders })
      }
      if (url.pathname === '/api/stripe/webhook' && request.method === 'POST') {
        return Response.json({ received: true }, { headers: corsHeaders })
      }
      if (url.pathname === '/api/stripe/portal' && request.method === 'POST') {
        return Response.json({ message: t(lang, 'errors.serverError') }, { headers: corsHeaders })
      }

      // ── Health check ──
      if (url.pathname === '/api/health') {
        return Response.json({ status: 'ok', lang, timestamp: new Date().toISOString() }, { headers: corsHeaders })
      }

      return Response.json({ error: t(lang, 'errors.notFound') }, { status: 404, headers: corsHeaders })

    } catch (e) {
      return Response.json({ error: t(lang, 'errors.serverError') }, { status: 500, headers: corsHeaders })
    }
  },
}
