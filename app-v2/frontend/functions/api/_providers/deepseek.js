export async function callDeepSeek({ apiKey, model, maxTokens, systemPrompt, messages }) {
  const res = await fetch('https://api.deepseek.com/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + apiKey,
    },
    body: JSON.stringify({
      model: model || 'deepseek-chat',
      max_tokens: maxTokens,
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages,
      ],
    }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error('DeepSeek error ' + res.status + ': ' + JSON.stringify(err))
  }

  const data = await res.json()
  return data.choices?.[0]?.message?.content || ''
}
