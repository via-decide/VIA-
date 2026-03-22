const {
  buildNavigationEnvelope,
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
    const session = verifySessionToken(token, 'mars');
    const payload = buildNavigationEnvelope(session.user);

    res.setHeader('Cache-Control', 'private, max-age=30, must-revalidate');
    return res.status(200).json(payload);
  } catch (error) {
    return res.status(401).json({
      error: 'invalid_mars_session',
      detail: error instanceof Error ? error.message : String(error),
    });
  }
};
