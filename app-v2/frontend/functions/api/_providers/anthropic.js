export async function callAnthropic({ apiKey, model, version, maxTokens, systemPrompt, messages }) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': version,
    },
    body: JSON.stringify({
      model,
      max_tokens: maxTokens,
      system: systemPrompt,
      messages,
    }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error('Provider error ' + res.status + ': ' + JSON.stringify(err))
  }

  const data = await res.json()
  return data.content?.[0]?.text || ''
}
