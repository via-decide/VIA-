(function (global) {
  const prefix = 'viadecide.tools.';
  const BACKEND_ACTIVITY_KEY = 'viadecide.backend.activity';
  const BACKEND_PENDING_KEY = 'viadecide.backend.activity.pending';
  const LOCAL_USER_KEY = 'via_user';
  const DEFAULT_SUPABASE_URL = 'https://bfocxgtlemhxfwfuhlxn.supabase.co';
  const DEFAULT_ACTIVITY_TABLE = 'via_activity_log';
  const DEFAULT_PROFILE_TABLE = 'via_users';
  const MAX_ACTIVITY_ITEMS = 200;

  let supabaseClient = null;
  let remoteDisabled = false;
  let flushPromise = null;

  function readJson(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (_error) {
      return fallback;
    }
  }

  function writeJson(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (_error) {
      return false;
    }
  }

  function trimActivity(items) {
    return Array.isArray(items) ? items.slice(-MAX_ACTIVITY_ITEMS) : [];
  }

  function getPagePath() {
    if (typeof global.location === 'undefined') return '/';
    return `${global.location.pathname || '/'}${global.location.search || ''}`;
  }

  function getToolId() {
    if (typeof document === 'undefined') return '';
    const explicitId = document.body?.dataset?.toolId || document.documentElement?.dataset?.toolId;
    if (explicitId) return explicitId;
    const path = getPagePath().split('?')[0].replace(/\/$/, '');
    const parts = path.split('/').filter(Boolean);
    return parts.length ? parts[parts.length - 1] : 'home';
  }

  function getConfig() {
    const runtimeConfig = global.ECO_SUPABASE_CONFIG && typeof global.ECO_SUPABASE_CONFIG === 'object'
      ? global.ECO_SUPABASE_CONFIG
      : null;

    const anonKey = String(
      runtimeConfig?.anonKey
      || global.ECO_SUPABASE_ANON_KEY
      || localStorage.getItem('eco_supabase_anon_key')
      || ''
    ).trim();

    const url = String(
      runtimeConfig?.url
      || global.ECO_SUPABASE_URL
      || localStorage.getItem('eco_supabase_url')
      || DEFAULT_SUPABASE_URL
    ).trim();

    const isConfigured = Boolean(
      url
      && anonKey
      && !url.includes('YOUR_PROJECT')
      && !anonKey.includes('YOUR_ANON_KEY')
    );

    return {
      url,
      anonKey,
      isConfigured,
      activityTable: DEFAULT_ACTIVITY_TABLE,
      profileTable: DEFAULT_PROFILE_TABLE
    };
  }

  function getClient() {
    if (supabaseClient) return supabaseClient;

    const config = getConfig();
    if (!config.isConfigured || !global.supabase?.createClient) return null;

    supabaseClient = global.supabase.createClient(config.url, config.anonKey);
    return supabaseClient;
  }

  function buildIdentityMd(profile) {
    if (!profile || typeof profile !== 'object') return '';
    const lines = [];
    const name = profile.display_name || profile.name || profile.username || 'VIA User';
    lines.push(`# ${name}`);
    if (profile.username) lines.push(`- Username: @${profile.username}`);
    if (profile.city) lines.push(`- City: ${profile.city}`);
    if (profile.level !== undefined) lines.push(`- Level: ${profile.level}`);
    if (profile.xp !== undefined) lines.push(`- XP: ${profile.xp}`);
    if (profile.followers !== undefined) lines.push(`- Followers: ${profile.followers}`);
    if (profile.following !== undefined) lines.push(`- Following: ${profile.following}`);
    if (profile.posts !== undefined) lines.push(`- Posts: ${profile.posts}`);
    return lines.join('\n');
  }

  function normalizeProfile(profile) {
    if (!profile || typeof profile !== 'object') return null;
    const normalized = { ...profile };
    normalized.display_name = normalized.display_name || normalized.name || 'VIA User';
    normalized.identityMd = typeof normalized.identityMd === 'string' && normalized.identityMd.trim()
      ? normalized.identityMd.trim()
      : (typeof normalized.identity_md === 'string' && normalized.identity_md.trim()
        ? normalized.identity_md.trim()
        : buildIdentityMd(normalized));
    return normalized;
  }

  function getLocalUserProfile() {
    return normalizeProfile(readJson(LOCAL_USER_KEY, null));
  }

  async function getUserProfile(userId) {
    const localProfile = getLocalUserProfile();
    if (!userId && localProfile) return localProfile;
    if (localProfile && localProfile.id === userId) return localProfile;

    if (global.viaFirebase && global.viaFirebase.db && userId) {
      try {
        const doc = await global.viaFirebase.db.collection('users').doc(userId).get();
        if (doc.exists) {
          const normalized = normalizeProfile(doc.data());
          if (normalized && normalized.id === userId) saveLocalUser(normalized);
          return normalized;
        }
      } catch (_error) {
        // Fallback below
      }
    }
    return localProfile;
  }


  function saveLocalUser(profile) {
    const normalized = normalizeProfile(profile);
    if (!normalized) return null;
    writeJson(LOCAL_USER_KEY, normalized);
    return normalized;
  }

  function listActivity() {
    return readJson(BACKEND_ACTIVITY_KEY, []);
  }

  function listPendingActivity() {
    return readJson(BACKEND_PENDING_KEY, []);
  }

  function createActivityRecord(type, payload, options = {}) {
    return {
      id: options.id || `activity-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
      type: String(type || 'event'),
      source: options.source || getToolId(),
      path: options.path || getPagePath(),
      payload: payload && typeof payload === 'object' ? payload : { value: payload },
      created_at: options.createdAt || new Date().toISOString()
    };
  }

  function appendActivity(record, options = {}) {
    const nextActivity = trimActivity([...listActivity(), record]);
    writeJson(BACKEND_ACTIVITY_KEY, nextActivity);

    if (options.queueRemote === false) return record;

    const nextPending = trimActivity([...listPendingActivity(), record]);
    writeJson(BACKEND_PENDING_KEY, nextPending);
    return record;
  }

  async function flushPendingActivity() {
    if (remoteDisabled) return { ok: false, reason: 'remote-disabled' };
    if (flushPromise) return flushPromise;

    const pending = listPendingActivity();
    if (!pending.length) return { ok: true, inserted: 0 };
    if (!global.viaFirebase || !global.viaFirebase.db) return { ok: false, reason: 'not-configured' };

    flushPromise = (async () => {
      try {
        const batch = global.viaFirebase.db.batch();
        const activityRef = global.viaFirebase.db.collection('activity_logs');
        
        pending.forEach(record => {
          const docRef = activityRef.doc(record.id);
          batch.set(docRef, {
            id: record.id,
            event_type: record.type,
            source: record.source,
            page_path: record.path,
            payload: record.payload,
            created_at: record.created_at || new Date().toISOString()
          });
        });

        await batch.commit();
        writeJson(BACKEND_PENDING_KEY, []);
        return { ok: true, inserted: pending.length };
      } catch (error) {
        console.warn('Firebase activity log failed:', error);
        return { ok: false, error: error.message || 'flush failed' };
      } finally {
        flushPromise = null;
      }
    })();
    return flushPromise;
  }


  function queueActivity(type, payload, options = {}) {
    const record = appendActivity(createActivityRecord(type, payload, options), options);
    Promise.resolve().then(() => flushPendingActivity()).catch(() => null);
    return record;
  }

  function logToolState(key, value, options = {}) {
    return queueActivity('tool_state', {
      key,
      value,
      storage_key: `${prefix}${key}`,
      tool_id: options.toolId || getToolId()
    }, {
      source: options.source || getToolId(),
      path: options.path || getPagePath(),
      queueRemote: options.queueRemote
    });
  }

  function logAgentRun(agent, payload, context = {}) {
    const safeAgent = agent && typeof agent === 'object' ? agent : {};
    return queueActivity('agent_run', {
      agent_id: safeAgent.id || context.agentId || 'agent',
      agent_name: safeAgent.name || 'Agent',
      step_count: Array.isArray(safeAgent.steps) ? safeAgent.steps.length : Number(payload?.logs?.length || 0),
      ok: Boolean(payload?.ok),
      message: payload?.message || '',
      logs: Array.isArray(payload?.logs) ? payload.logs : [],
      context,
      result: payload
    }, {
      source: context.source || safeAgent.id || getToolId(),
      path: context.path || getPagePath(),
      queueRemote: context.queueRemote
    });
  }

  function read(key, fallback) {
    try {
      const raw = localStorage.getItem(prefix + key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (error) {
      console.warn('Storage read failed', key, error);
      return fallback;
    }
  }

  function write(key, value) {
    try {
      localStorage.setItem(prefix + key, JSON.stringify(value));
      if (!String(key).startsWith('bus:') && global.DatabaseService && typeof global.DatabaseService.logToolState === 'function') {
        global.DatabaseService.logToolState(key, value, { source: getToolId() });
      }
      return true;
    } catch (error) {
      console.warn('Storage write failed', key, error);
      return false;
    }
  }

  function remove(key) {
    localStorage.removeItem(prefix + key);
  }

  global.DatabaseService = {
    getConfig,
    getClient,
    getUserProfile,
    getLocalUserProfile,
    saveLocalUser,
    listActivity,
    listPendingActivity,
    flushPendingActivity,
    recordActivity: queueActivity,
    logToolState,
    logAgentRun
  };

  global.ToolStorage = { read, write, remove };
})(window);
