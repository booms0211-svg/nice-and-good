// Cloudflare Worker - CORS Proxy for Fear & Greed Index
// Deploy at: https://workers.cloudflare.com

const ALLOWED_ORIGINS = [
  'https://booms0211-svg.github.io',
  'http://localhost',
  'http://127.0.0.1',
];

const ALLOWED_TARGETS = [
  'https://production.dataviz.cnn.io/',
  'https://query2.finance.yahoo.com/',
  'https://query1.finance.yahoo.com/',
];

export default {
  async fetch(request) {
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: corsHeaders(request),
      });
    }

    const url = new URL(request.url);
    const targetUrl = url.searchParams.get('url');

    if (!targetUrl) {
      return new Response(JSON.stringify({ error: 'Missing ?url= parameter' }), {
        status: 400,
        headers: { ...corsHeaders(request), 'Content-Type': 'application/json' },
      });
    }

    // Security: only allow whitelisted targets
    const isAllowed = ALLOWED_TARGETS.some(t => targetUrl.startsWith(t));
    if (!isAllowed) {
      return new Response(JSON.stringify({ error: 'Target URL not allowed' }), {
        status: 403,
        headers: { ...corsHeaders(request), 'Content-Type': 'application/json' },
      });
    }

    try {
      const response = await fetch(targetUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; FearGreedProxy/1.0)',
        },
      });

      const body = await response.text();

      return new Response(body, {
        status: response.status,
        headers: {
          ...corsHeaders(request),
          'Content-Type': response.headers.get('Content-Type') || 'application/json',
          'Cache-Control': 'public, max-age=60',
        },
      });
    } catch (e) {
      return new Response(JSON.stringify({ error: 'Fetch failed', message: e.message }), {
        status: 502,
        headers: { ...corsHeaders(request), 'Content-Type': 'application/json' },
      });
    }
  },
};

function corsHeaders(request) {
  const origin = request.headers.get('Origin') || '';
  const allowedOrigin = ALLOWED_ORIGINS.some(o => origin.startsWith(o)) ? origin : ALLOWED_ORIGINS[0];
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
  };
}
