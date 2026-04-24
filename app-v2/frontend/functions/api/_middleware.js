const ALLOWED_ORIGINS = [
  'https://scalyo.app',
  'https://www.scalyo.app',
]

export async function onRequest(context) {
  const origin = context.request.headers.get('Origin') || ''
  const corsOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0]

  // Handle preflight
  if (context.request.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': corsOrigin,
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, Accept-Language',
        'Access-Control-Max-Age': '86400',
        'Vary': 'Origin',
      },
    })
  }

  // Process request
  const response = await context.next()

  // Add CORS headers to response
  const newHeaders = new Headers(response.headers)
  newHeaders.set('Access-Control-Allow-Origin', corsOrigin)
  newHeaders.set('Vary', 'Origin')

  return new Response(response.body, {
    status: response.status,
    headers: newHeaders,
  })
}
