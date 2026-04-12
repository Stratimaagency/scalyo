import { detectLanguage, t } from '../middleware/i18n.js'

const systemPrompts = {
  fr: `Tu es Nova, assistante intelligente intégrée à Scalyo, plateforme Customer Success.
Tu as accès aux données en temps réel de l'utilisateur.
Tu peux : analyser les clients, suggérer des actions, générer des rapports, donner des conseils CS.
Réponds en français, de façon concise et actionnable.
Si tu effectues une action, confirme-la avec ✅.
Utilise du markdown pour structurer tes réponses (gras, listes, tableaux).`,

  en: `You are Nova, Scalyo's integrated intelligent assistant for Customer Success.
You have access to the user's real-time data.
You can: analyze clients, suggest actions, generate reports, give CS advice.
Reply in English, concisely and actionably.
If you perform an action, confirm with ✅.
Use markdown to structure your responses (bold, lists, tables).`,

  ko: `당신은 Nova, Scalyo의 Customer Success 통합 지능형 어시스턴트입니다.
사용자의 실시간 데이터에 접근할 수 있습니다.
고객 분석, 액션 제안, 보고서 생성, CS 조언을 제공할 수 있습니다.
한국어로 간결하고 실행 가능하게 답변하세요.
액션을 수행한 경우 ✅로 확인하세요.
마크다운으로 답변을 구조화하세요 (굵게, 목록, 표).`,
}

export async function handleChat(request, env) {
  const lang = detectLanguage(request)
  const url = new URL(request.url)
  const headers = { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }

  // POST /api/chat/nova — Nova AI assistant
  if (url.pathname === '/api/chat/nova' && request.method === 'POST') {
    try {
      const { message, history, context } = await request.json()
      const reqLang = url.searchParams.get('lang') || lang
      const apiKey = env.ANTHROPIC_API_KEY

      if (!apiKey || apiKey === 'REMPLACER_PAR_CLE_ANTHROPIC') {
        return new Response(JSON.stringify({
          response: reqLang === 'ko'
            ? 'API 키가 설정되지 않았습니다. 모의 응답을 사용합니다.'
            : reqLang === 'en'
              ? 'API key not configured. Using mock response.'
              : 'Clé API non configurée. Réponse simulée.',
          actions: [],
        }), { headers })
      }

      const contextStr = context ? JSON.stringify(context) : 'No context'
      const sysPrompt = (systemPrompts[reqLang] || systemPrompts.fr) + `\n\nDonnées utilisateur : ${contextStr}`

      const msgs = [
        ...(history || []).slice(-10).map(m => ({ role: m.role, content: m.content })),
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
          system: sysPrompt,
          messages: msgs,
        }),
      })

      const data = await res.json()
      const response = data.content?.[0]?.text || t(reqLang, 'errors.serverError')
      return new Response(JSON.stringify({ response, actions: [] }), { headers })
    } catch (e) {
      return new Response(JSON.stringify({ error: t(lang, 'errors.serverError') }), { status: 500, headers })
    }
  }

  // POST /api/chat/correct — Spell correction
  if (url.pathname === '/api/chat/correct' && request.method === 'POST') {
    const { text } = await request.json()
    // Mock correction — in production would use AI
    return new Response(JSON.stringify({
      corrected: text,
      original: text,
      changes: [],
    }), { headers })
  }

  // GET/POST /api/chat/messages/:channel
  if (url.pathname.startsWith('/api/chat/messages')) {
    if (request.method === 'GET') {
      return new Response(JSON.stringify({ messages: [] }), { headers })
    }
    if (request.method === 'POST') {
      return new Response(JSON.stringify({
        message: t(lang, 'success.created', {
          resource: lang === 'ko' ? '메시지' : lang === 'en' ? 'Message' : 'Message',
        }),
      }), { status: 201, headers })
    }
  }

  return new Response(JSON.stringify({ error: t(lang, 'errors.notFound') }), { status: 404, headers })
}
