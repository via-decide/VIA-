const crypto = require('node:crypto');

const SPEED_OF_LIGHT_METERS_PER_SECOND = 299_792_458;
const MODULE_ID = '48';
const TOKEN_TTL_SECONDS = 300;
const DEFAULT_TARGET = 'mars';

function base64UrlEncode(input) {
  return Buffer.from(input)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
}

function base64UrlDecode(input) {
  const normalized = String(input || '')
    .replace(/-/g, '+')
    .replace(/_/g, '/');
  const padLength = (4 - (normalized.length % 4 || 4)) % 4;
  const padded = normalized + '='.repeat(padLength);
  return Buffer.from(padded, 'base64').toString('utf8');
}

function getSigningSecret() {
  return (
    process.env.VIA_MARS_SESSION_SECRET ||
    process.env.VIA_SSO_JWE_KEY_B64 ||
    'via-module-48-mars-bridge'
  );
}

function safeJsonParse(value, fallback = null) {
  try {
    return JSON.parse(value);
  } catch (_error) {
    return fallback;
  }
}

function decodeJwtWithoutVerification(token) {
  const parts = String(token || '').split('.');
  if (parts.length < 2) return null;
  return safeJsonParse(base64UrlDecode(parts[1]), null);
}

async function readJsonBody(req) {
  if (req.body && typeof req.body === 'object') {
    return req.body;
  }

  if (typeof req.body === 'string' && req.body.trim()) {
    return safeJsonParse(req.body, {});
  }

  if (!req || typeof req.on !== 'function') {
    return {};
  }

  const chunks = [];
  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(String(chunk)));
  }

  if (!chunks.length) return {};
  return safeJsonParse(Buffer.concat(chunks).toString('utf8'), {});
}

function pickHeader(req, name) {
  if (!req || !req.headers) return '';
  return req.headers[name] || req.headers[name.toLowerCase()] || '';
}

function extractBearerToken(req) {
  const authHeader = String(pickHeader(req, 'authorization') || '');
  if (authHeader.startsWith('Bearer ')) {
    return authHeader.slice(7).trim();
  }
  return String(pickHeader(req, 'x-via-sso') || '');
}

function extractUserFromRequest(req) {
  const headerUid = String(pickHeader(req, 'x-via-uid') || '').trim();
  const headerName = String(pickHeader(req, 'x-via-name') || '').trim();
  const headerEmail = String(pickHeader(req, 'x-via-email') || '').trim();
  const headerPhoto = String(pickHeader(req, 'x-via-photo') || '').trim();

  if (headerUid) {
    return {
      uid: headerUid,
      name: headerName || 'VIA Operator',
      email: headerEmail || null,
      picture: headerPhoto || null,
      provider: 'firebase-client',
    };
  }

  const decoded = decodeJwtWithoutVerification(extractBearerToken(req));
  if (!decoded) return null;

  return {
    uid: decoded.user_id || decoded.sub || '',
    name: decoded.name || decoded.email || 'VIA Operator',
    email: decoded.email || null,
    picture: decoded.picture || null,
    provider: decoded.firebase?.sign_in_provider || decoded.provider_id || 'google.com',
  };
}

function signPayload(payload) {
  return base64UrlEncode(
    crypto.createHmac('sha256', getSigningSecret()).update(payload).digest(),
  );
}

function mintSessionToken({ target = DEFAULT_TARGET, user }) {
  const nowSeconds = Math.floor(Date.now() / 1000);
  const payload = JSON.stringify({
    iss: 'via-core',
    aud: `via-${target}`,
    target,
    module: MODULE_ID,
    iat: nowSeconds,
    exp: nowSeconds + TOKEN_TTL_SECONDS,
    nonce: crypto.randomUUID(),
    user,
  });

  const encodedPayload = base64UrlEncode(payload);
  const signature = signPayload(encodedPayload);
  return `${encodedPayload}.${signature}`;
}

function verifySessionToken(token, expectedTarget = DEFAULT_TARGET) {
  const [encodedPayload, signature] = String(token || '').split('.');
  if (!encodedPayload || !signature) {
    throw new Error('missing_session_token');
  }

  const expectedSignature = signPayload(encodedPayload);
  if (signature.length !== expectedSignature.length) {
    throw new Error('invalid_session_signature');
  }

  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
    throw new Error('invalid_session_signature');
  }

  const payload = safeJsonParse(base64UrlDecode(encodedPayload), null);
  if (!payload) {
    throw new Error('invalid_session_payload');
  }

  const nowSeconds = Math.floor(Date.now() / 1000);
  if (payload.exp <= nowSeconds) {
    throw new Error('expired_session_token');
  }

  if (payload.target !== expectedTarget || payload.aud !== `via-${expectedTarget}`) {
    throw new Error('unexpected_target');
  }

  return payload;
}

function buildNavigationEnvelope(user) {
  const velocityFractionC = 0.1;
  const gamma = Number((1 / Math.sqrt(1 - velocityFractionC ** 2)).toFixed(6));
  const recommendedLatencyMs = 900;

  return {
    moduleId: MODULE_ID,
    target: DEFAULT_TARGET,
    version: '2026-03-22',
    operator: user,
    coordinateSystem: {
      frame: 'VIA_GLOBAL_COORDINATE_SYSTEM',
      referenceEpoch: 'J2000',
      axes: {
        x: 'east_meters',
        y: 'elevation_meters',
        z: 'north_meters',
      },
      originMeters: {
        x: 3_396_200,
        y: 0,
        z: -1_422_400,
      },
      localOffsetMeters: {
        x: 480,
        y: 12,
        z: 960,
      },
      commandStepMeters: 120,
    },
    physics: {
      velocityFractionC,
      velocityMetersPerSecond: Math.round(SPEED_OF_LIGHT_METERS_PER_SECOND * velocityFractionC),
      lorentzGamma: gamma,
      properTimeScale: Number((1 / gamma).toFixed(6)),
      speedOfLightMetersPerSecond: SPEED_OF_LIGHT_METERS_PER_SECOND,
      recommendedLatencyMs,
      bridgeMode: 'module-48-relativistic-navigation',
    },
  };
}

function createSeededRandom(seedInput) {
  let seed = 0;
  const input = String(seedInput || 'via-mars-seed');
  for (let index = 0; index < input.length; index += 1) {
    seed = (seed * 31 + input.charCodeAt(index)) >>> 0;
  }

  return function next() {
    seed = (1664525 * seed + 1013904223) >>> 0;
    return seed / 0x100000000;
  };
}

function buildEnvironmentPayload(options = {}) {
  const quadrant = String(options.quadrant || 'A3-07').toUpperCase();
  const seed = String(options.seed || `via-mars-${quadrant}`);
  const detail = Math.max(12, Math.min(Number(options.detail || 18), 36));
  const rand = createSeededRandom(seed);
  const size = detail;
  const vertices = [];
  const indices = [];
  const heights = [];

  for (let row = 0; row <= size; row += 1) {
    for (let col = 0; col <= size; col += 1) {
      const x = (col - size / 2) * 14;
      const z = (row - size / 2) * 14;
      const ridge = Math.sin((row + 1) * 0.48) * 3.4 + Math.cos((col + 1) * 0.41) * 2.7;
      const basin = Math.cos((row + col + 2) * 0.22) * 4.8;
      const noise = (rand() - 0.5) * 5.6;
      const y = Number((ridge + basin + noise).toFixed(3));
      vertices.push([x, y, z]);
      heights.push(y);
    }
  }

  for (let row = 0; row < size; row += 1) {
    for (let col = 0; col < size; col += 1) {
      const topLeft = row * (size + 1) + col;
      const topRight = topLeft + 1;
      const bottomLeft = topLeft + (size + 1);
      const bottomRight = bottomLeft + 1;
      indices.push([topLeft, bottomLeft, topRight]);
      indices.push([topRight, bottomLeft, bottomRight]);
    }
  }

  const terrainCatalog = Array.from({ length: 6 }, (_entry, index) => {
    const complexity = Number((4.1 + rand() * 5.4).toFixed(1));
    const success = Math.max(28, Math.min(84, Math.round(86 - complexity * 6 + rand() * 8)));
    const sectorCode = `${String.fromCharCode(65 + (index % 3))}${1 + Math.floor(rand() * 3)}-${String(3 + index).padStart(2, '0')}`;
    const terrainNames = [
      'Aeolis Ridge',
      'Regolith Shelf',
      'Ferric Dune',
      'Basaltic Fold',
      'Cryo Pocket',
      'Sulfate Step',
    ];

    return {
      id: index + 1,
      name: terrainNames[index],
      complex: complexity,
      success,
      quadrant: sectorCode,
    };
  });

  return {
    moduleId: MODULE_ID,
    generator: 'mars-environment-generator',
    target: DEFAULT_TARGET,
    quadrant,
    seed,
    detail,
    mesh: {
      quadrant,
      seed,
      resolution: {
        columns: size + 1,
        rows: size + 1,
      },
      vertexCount: vertices.length,
      triangleCount: indices.length,
      vertices,
      indices,
      heights,
    },
    terrainCatalog,
  };
}

module.exports = {
  MODULE_ID,
  TOKEN_TTL_SECONDS,
  buildEnvironmentPayload,
  buildNavigationEnvelope,
  extractBearerToken,
  extractUserFromRequest,
  mintSessionToken,
  readJsonBody,
  verifySessionToken,
};
