/**
 * CORS middleware for Hono.
 */
export function corsMiddleware() {
  return async (c, next) => {
    // Handle preflight
    if (c.req.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: corsHeaders(c),
      })
    }

    await next()

    // Add CORS headers to response
    const headers = corsHeaders(c)
    for (const [key, value] of Object.entries(headers)) {
      c.res.headers.set(key, value)
    }
  }
}

function corsHeaders(c) {
  const origin = c.req.header('Origin') || '*'
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
  }
}
