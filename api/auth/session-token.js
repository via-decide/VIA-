const {
  MODULE_ID,
  extractUserFromRequest,
  mintSessionToken,
  readJsonBody,
} = require('../mars/_bridge');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'method_not_allowed' });
  }

  try {
    const body = await readJsonBody(req);
    const target = String(body?.target || '').trim();
    if (target !== 'mars') {
      return res.status(400).json({ error: 'unsupported_target', detail: 'Only mars is enabled in Module #48.' });
    }

    const user = extractUserFromRequest(req);
    if (!user || !user.uid) {
      return res.status(401).json({ error: 'missing_via_session' });
    }

    const token = mintSessionToken({ target, user });
    return res.status(200).json({
      token,
      target,
      moduleId: MODULE_ID,
      user,
      expiresInSeconds: 300,
      launch: {
        navigationEndpoint: './api/mars/navigation',
        environmentEndpoint: './api/mars/environment',
      },
    });
  } catch (error) {
    return res.status(500).json({
      error: 'unable_to_issue_session_token',
      detail: error instanceof Error ? error.message : String(error),
    });
  }
};
