import express from 'express';
import crypto from 'node:crypto';
import { createSecretKey } from 'node:crypto';
import { initializeApp, cert } from 'firebase-admin/app';
import { getAuth as getAdminAuth } from 'firebase-admin/auth';
import { EncryptJWT, jwtDecrypt } from 'jose';

const app = express();
app.use(express.json({ limit: '256kb' }));

initializeApp({
  credential: cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON || '{}')),
});

const adminAuth = getAdminAuth();
const sovereignKey = createSecretKey(Buffer.from(process.env.VIA_SSO_JWE_KEY_B64 || '', 'base64'));
const issuer = 'via-core';
const audienceByTarget = {
  mars: 'via-mars',
  orchade: 'via-orchade',
};

function requireEnv(name) {
  if (!process.env[name]) {
    throw new Error('Missing required environment variable: ' + name);
  }
}

requireEnv('VIA_SSO_JWE_KEY_B64');
requireEnv('FIREBASE_SERVICE_ACCOUNT_JSON');

async function requireViaSession(req, res, next) {
  try {
    const authHeader = req.headers.authorization || '';
    const bearer = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
    const firebaseSessionCookie = req.cookies?.__session;
    const firebaseIdToken = bearer || firebaseSessionCookie;

    if (!firebaseIdToken) {
      return res.status(401).json({ error: 'missing_google_backed_via_session' });
    }

    const decoded = await adminAuth.verifyIdToken(firebaseIdToken, true);
    req.viaUser = {
      uid: decoded.uid,
      email: decoded.email || null,
      name: decoded.name || decoded.email || 'VIA User',
      picture: decoded.picture || null,
      provider: decoded.firebase?.sign_in_provider || 'google.com',
    };
    return next();
  } catch (error) {
    return res.status(401).json({ error: 'invalid_via_session', detail: error.message });
  }
}

async function mintSovereignEnvelope(user, target) {
  const audience = audienceByTarget[target];
  if (!audience) {
    throw new Error('unsupported_target');
  }

  const nonce = crypto.randomUUID();
  const now = Math.floor(Date.now() / 1000);

  return new EncryptJWT({
    sub: user.uid,
    email: user.email,
    name: user.name,
    picture: user.picture,
    provider: user.provider,
    target,
    scope: ['launch:' + target],
    nonce,
  })
    .setProtectedHeader({ alg: 'dir', enc: 'A256GCM', typ: 'JWT' })
    .setIssuedAt(now)
    .setIssuer(issuer)
    .setAudience(audience)
    .setExpirationTime('5m')
    .encrypt(sovereignKey);
}

app.post('/api/auth/session-token', requireViaSession, async (req, res) => {
  try {
    const target = String(req.body?.target || '');
    const token = await mintSovereignEnvelope(req.viaUser, target);
    return res.json({
      token,
      target,
      user: req.viaUser,
      expiresInSeconds: 300,
    });
  } catch (error) {
    return res.status(400).json({ error: 'unable_to_issue_token', detail: error.message });
  }
});

export async function verifySovereignSession(token, expectedTarget) {
  const { payload, protectedHeader } = await jwtDecrypt(token, sovereignKey, {
    issuer,
    audience: audienceByTarget[expectedTarget],
  });

  if (payload.target !== expectedTarget) {
    throw new Error('unexpected_target');
  }

  return {
    protectedHeader,
    user: {
      uid: payload.sub,
      email: payload.email || null,
      name: payload.name || 'VIA User',
      picture: payload.picture || null,
      provider: payload.provider || 'google.com',
    },
    nonce: payload.nonce,
    scope: payload.scope || [],
  };
}

export function createModuleAuthMiddleware(expectedTarget) {
  return async function moduleAuthMiddleware(req, res, next) {
    try {
      const inboundToken = req.query.sso || req.headers['x-via-sso'];
      if (!inboundToken) {
        return res.status(401).json({ error: 'missing_via_sso' });
      }

      const session = await verifySovereignSession(String(inboundToken), expectedTarget);
      req.viaSession = session;
      return next();
    } catch (error) {
      return res.status(401).json({ error: 'invalid_via_sso', detail: error.message });
    }
  };
}

const marsApp = express();
const orchadeApp = express();

marsApp.get('/health', createModuleAuthMiddleware('mars'), (req, res) => {
  res.json({ ok: true, module: 'mars', uid: req.viaSession.user.uid });
});

orchadeApp.post('/telemetry/push', createModuleAuthMiddleware('orchade'), async (req, res) => {
  res.json({ ok: true, accepted: true, uid: req.viaSession.user.uid });
});

app.post('/api/telemetry/sync', requireViaSession, async (req, res) => {
  const payload = req.body || {};
  const telemetry = {
    uid: req.viaUser.uid,
    source: 'orchade',
    recordedAt: payload.recordedAt || new Date().toISOString(),
    mbb: {
      mind: Number(payload.mind || 0),
      body: Number(payload.body || 0),
      breath: Number(payload.breath || 0),
      stressIndex: Number(payload.stressIndex || 0),
      recoveryIndex: Number(payload.recoveryIndex || 0),
      deviceId: payload.deviceId || null,
      sessionId: payload.sessionId || crypto.randomUUID(),
    },
  };

  // Replace this block with a Firestore or SQL upsert against the VIA Cohort persistence layer.
  return res.status(202).json({ ok: true, telemetry });
});

app.listen(4100, () => {
  console.log('VIA Core auth bridge listening on :4100');
});
