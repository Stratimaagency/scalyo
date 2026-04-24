export async function onRequestPost(context) {
  const { request, env } = context

  try {
    const { message, context: ctx, history, lang } = await request.json()
    const coachLang = lang || 'fr'
    const apiKey = env.ANTHROPIC_API_KEY

    if (!apiKey) {
      return Response.json(
        { error: 'AI coach is not configured' },
        { status: 503 }
      )
    }

    const systemPrompts = {
      fr: `Tu es un coach expert en Customer Success B2B SaaS. Tu donnes des conseils actionnables, concrets et personnalisés. Réponds en français. Contexte : ${ctx || 'Non disponible'}.`,
      en: `You are an expert B2B SaaS Customer Success coach. Give actionable, concrete, personalized advice. Reply in English. Context: ${ctx || 'Not available'}.`,
      ko: `당신은 B2B SaaS Customer Success 전문 코치입니다. 실행 가능하고 구체적이며 개인화된 조언을 제공하세요. 한국어로 답변하세요. 맥락: ${ctx || '정보 없음'}.`,
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

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}))
      console.error('Anthropic API error:', res.status, errData)
      return Response.json(
        { error: 'Coach temporarily unavailable' },
        { status: 502 }
      )
    }

    const data = await res.json()
    const response = data.content?.[0]?.text || 'No response generated'
    return Response.json({ response })
  } catch (e) {
    console.error('Coach function error:', e)
    return Response.json({ error: 'Server error' }, { status: 500 })
  }
}
