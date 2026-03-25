import { getUpgradesStatus } from './telemetry-service.js';

export default async function handler(req, res) {
  if (req.method && req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'method_not_allowed' });
  }

  try {
    const force = req.query?.fresh === '1' || req.query?.fresh === 'true';
    const payload = await getUpgradesStatus({ force });
    res.setHeader('Cache-Control', 's-maxage=30, stale-while-revalidate=60');
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    return res.status(200).json(payload);
  } catch (error) {
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    return res.status(200).json({
      status: 'unavailable',
      totalCommits: 0,
      commits: [],
      integrity: 'UNKNOWN',
      error: 'unable_to_build_upgrades_status',
      detail: error.message
    });
  }
}
