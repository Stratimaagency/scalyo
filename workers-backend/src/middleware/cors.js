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

    // Prevent browser from caching API responses
    c.res.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate')
    c.res.headers.set('Pragma', 'no-cache')

    // Add CORS headers to response
    const headers = corsHeaders(c)
    for (const [key, value] of Object.entries(headers)) {
      c.res.headers.set(key, value)
    }
  }
}

// Export for use in error handler
export { corsHeaders }

function corsHeaders(c) {
  const frontendUrl = c.env?.FRONTEND_URL || 'https://scalyo.app'
  const allowedOrigins = [frontendUrl, 'http://localhost:5173', 'http://localhost:4173']
  const origin = c.req.header('Origin')
  // Allow *.scalyo.pages.dev (Cloudflare Pages preview URLs)
  const isAllowed = allowedOrigins.includes(origin) || (origin && origin.endsWith('.scalyo.pages.dev'))
  const allowedOrigin = isAllowed ? origin : allowedOrigins[0]
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
  }
}
