/**
 * /api/anthropic
 *
 * Secure server-side proxy for the Anthropic Messages API.
 * The API key never leaves the server — only the prompt and a
 * sanitised completion reach the browser.
 *
 * Expected request body (POST, JSON):
 *   { prompt: string }
 *
 * Response (JSON):
 *   { text: string }          on success
 *   { error: string }         on failure
 */

export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { prompt } = req.body ?? {};

  if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
    return res.status(400).json({ error: 'Missing or invalid prompt' });
  }

  // Hard cap to prevent runaway costs
  const PROMPT_MAX = 2000;
  if (prompt.length > PROMPT_MAX) {
    return res.status(400).json({ error: 'Prompt exceeds maximum length' });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.error('[/api/anthropic] ANTHROPIC_API_KEY is not set');
    return res.status(500).json({ error: 'Server configuration error' });
  }

  try {
    const upstream = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 300,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!upstream.ok) {
      const errBody = await upstream.text();
      console.error('[/api/anthropic] Upstream error', upstream.status, errBody);
      return res.status(502).json({ error: 'Upstream API error', status: upstream.status });
    }

    const data = await upstream.json();
    const text = data?.content?.[0]?.text ?? '';

    return res.status(200).json({ text });
  } catch (err) {
    console.error('[/api/anthropic] Fetch failed:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
