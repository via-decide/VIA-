/**
 * api/claude.js — Vercel Edge Proxy for Anthropic API
 * ANTHROPIC_API_KEY lives in Vercel env vars — never in browser.
 */

export const config = { runtime: 'edge' };

const ALLOWED_ORIGINS = ['https://viadecide.com', 'https://www.viadecide.com'];
const ALLOWED_MODELS  = ['claude-haiku-4-5-20251001', 'claude-sonnet-4-6', 'claude-opus-4-6'];

export default async function handler(req) {
  const origin = req.headers.get('origin') || '';
  const cors = {
    'Access-Control-Allow-Origin':  ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0],
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };

  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });
  if (req.method !== 'POST')   return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: cors });

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return new Response(JSON.stringify({ error: 'Service not configured' }), { status: 503, headers: cors });

  let body;
  try { body = await req.json(); }
  catch { return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400, headers: cors }); }

  if (!ALLOWED_MODELS.includes(body.model)) {
    return new Response(JSON.stringify({ error: `Model not allowed: ${body.model}` }), { status: 400, headers: cors });
  }

  body.max_tokens = Math.min(body.max_tokens || 1024, 4000);

  try {
    const upstream = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'x-api-key': apiKey, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await upstream.json();
    return new Response(JSON.stringify(data), { status: upstream.status, headers: cors });
  } catch (err) {
    console.error('[claude-proxy] upstream error:', err);
    return new Response(JSON.stringify({ error: 'Upstream error' }), { status: 502, headers: cors });
  }
}
