const {
  buildEnvironmentPayload,
  extractBearerToken,
  verifySessionToken,
} = require('./_bridge');

module.exports = function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'method_not_allowed' });
  }

  try {
    const token = extractBearerToken(req);
    verifySessionToken(token, 'mars');

    const quadrant = String(req.query?.quadrant || 'A3-07');
    const detail = Number(req.query?.detail || 18);
    const seed = String(req.query?.seed || `via-core-${quadrant}`);
    const payload = buildEnvironmentPayload({ quadrant, detail, seed });

    res.setHeader('Cache-Control', 'private, max-age=30, must-revalidate');
    return res.status(200).json(payload);
  } catch (error) {
    return res.status(401).json({
      error: 'invalid_mars_environment_request',
      detail: error instanceof Error ? error.message : String(error),
    });
  }
};
