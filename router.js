// router.js — VIA Client Router
// viadecide.com | via-decide/VIA
// Handles: SPA layer switching, URL sync, subpage navigation, deep links, back button
// Pattern: IIFE, no dependencies, safe to load before or after DOM ready

(() => {
  'use strict';

  // ─────────────────────────────────────────────────────────────
  // REACT HANDLER REGISTRY
  //
  // App.tsx calls VIARouter.registerReact(handlers) on mount so
  // the router can delegate to React (primary system).
  //
  // When a React sub-view component crashes, its SubViewErrorBoundary:
  //   1. Calls VIARouter.deregisterReact('openProfile') → removes handler
  //   2. Calls VIARouter.navigate('#/user/<uid>') → router has no React
  //      handler → uses hard fallback (profile.html redirect)
  //
  // Supported React handlers:
  //   setTab(tab)        → switch main tab (feed/discover/games/dives/profile)
  //   openProfile(uid)   → open UserProfileSheet overlay
  //   openDive(id)       → open DiveDetailSheet overlay
  // ─────────────────────────────────────────────────────────────
  let _reactHandlers = {};

  // Hard fallbacks used when React handler is absent or threw
  const _reactFallback = {
    openProfile(uid) {
      // Redirect to standalone profile page.
      // Create /profile.html for a full non-React fallback view.
      window.location.href = './profile.html?uid=' + encodeURIComponent(uid);
    },
    openDive(id) {
      // Scroll to the dive card if it's on the page, else just close the hash.
      const el = document.getElementById('dive-' + id);
      if (el) { el.scrollIntoView({ behavior: 'smooth' }); }
      else { history.replaceState(null, '', window.location.pathname); }
    },
  };

  // ─────────────────────────────────────────────────────────────
  // ROUTE MAP — SPA layers (handled inside index.html)
  // ─────────────────────────────────────────────────────────────
  const SPA_LAYERS = {
    feed:      'feed',
    discover:  'discover',
    about:     'about',
    profile:   'profile',
    deepdives: 'deepdives',
    dive:      'deepdives',   // alias
    explore:   'discover',    // alias
  };

  // Deep dive story keys
  const STORY_KEYS = ['food', 'drone', 'ai', 'ipl', 'upi', 'ev', 'creator', 'edtech'];

  // ─────────────────────────────────────────────────────────────
  // SUBPAGE MAP — navigates away from SPA to real HTML files
  // ─────────────────────────────────────────────────────────────
  const SUBPAGES = {
    // Core subpages
    'auth':                          '/auth.html',
    'sign-in':                       '/auth.html',
    'login':                         '/auth.html',
    'creator-onboarding':            '/creator-onboarding.html',
    'creator':                       '/creator-onboarding.html',
    'create':                        '/creator-onboarding.html',
    'creator-story':                 '/creator-story.html',

    // Feature subpages
    'founder':                       '/founder/',
    'founder-dashboard':             '/founder/',
    'interview-prep':                '/interview-prep/',
    'interview':                     '/interview-prep/',
    'student-research':              '/student-research/',
    'research':                      '/student-research/',
    'studyos':                       '/StudyOS/',
    'study':                         '/StudyOS/',
    'prompt-alchemy':                '/prompt-alchemy/',
    'agent':                         '/agent/',
    'app-generator':                 '/app-generator/',
    'sales-dashboard':               '/sales-dashboard/',
    'decision-brief-guide':          '/decision-brief-guide/',
    'decision-brief':                '/decision-brief-guide/',
    'wings-of-fire-quiz':            '/wings-of-fire-quiz/',
    'wof':                           '/wings-of-fire-quiz/',
    'multi-source-research':         '/multi-source-research-explained/',

    // Tools
    'context-packager':              '/tools/context-packager/',
    'spec-builder':                  '/tools/spec-builder/',
    'task-splitter':                 '/tools/task-splitter/',
    'code-generator':                '/tools/code-generator/',
    'code-reviewer':                 '/tools/code-reviewer/',
    'output-evaluator':              '/tools/output-evaluator/',
    'idea-remixer':                  '/tools/idea-remixer/',
    'template-vault':                '/tools/template-vault/',
    'export-studio':                 '/tools/export-studio/',
    'tool-router':                   '/tools/tool-router/',
    'script-generator':              '/tools/script-generator/',
    'json-formatter':                '/tools/json-formatter/',
    'regex-tester':                  '/tools/regex-tester/',
    'pomodoro':                      '/tools/pomodoro/',
    'color-palette':                 '/tools/color-palette/',
    'revenue-forecaster':            '/tools/revenue-forecaster/',
    'prompt-compare':                '/tools/prompt-compare/',
    'repo-improvement-brief':        '/tools/repo-improvement-brief/',
    'workflow-template-gallery':     '/tools/workflow-template-gallery/',
    'tool-search-discovery':         '/tools/tool-search-discovery/',

    // Games
    'hex-wars':                      '/tools/games/hex-wars/',
    'snake-game':                    '/tools/games/snake-game/',
    'snake':                         '/tools/games/snake-game/',
    'skillhex':                      '/tools/games/skillhex-mission-control/',
    'skillhex-mission-control':      '/tools/games/skillhex-mission-control/',
    'orchard':                       'https://orchard.viadecide.com',
    'orchard-game':                  'https://orchard.viadecide.com',

    // Engine tools
    'meeting-cost-calculator':       '/tools/engine/meeting-cost-calculator/',
    'player-signup':                 '/tools/engine/player-signup/',
    'orchard-profile-builder':       '/tools/engine/orchard-profile-builder/',
    'balance-dashboard':             '/tools/engine/balance-dashboard/',
    'simulation-runner':             '/tools/engine/simulation-runner/',
    'hire-readiness-scorer':         '/tools/engine/hire-readiness-scorer/',
    'ai-coach-console':              '/tools/engine/ai-coach-console/',
    'growth-path-recommender':       '/tools/engine/growth-path-recommender/',
    'trust-score-engine':            '/tools/engine/trust-score-engine/',
    'recruiter-dashboard':           '/tools/engine/recruiter-dashboard/',
    'seed-exchange':                 '/tools/engine/seed-exchange/',
    'fruit-sharing':                 '/tools/engine/fruit-sharing/',
    'circle-builder':                '/tools/engine/circle-builder/',
    'peer-validation-engine':        '/tools/engine/peer-validation-engine/',
    'fair-ranking-engine':           '/tools/engine/fair-ranking-engine/',
    'weekly-harvest-engine':         '/tools/engine/weekly-harvest-engine/',
    'daily-quest-generator':         '/tools/engine/daily-quest-generator/',
    'root-strength-calculator':      '/tools/engine/root-strength-calculator/',
    'trunk-growth-calculator':       '/tools/engine/trunk-growth-calculator/',
    'fruit-yield-engine':            '/tools/engine/fruit-yield-engine/',
    'starter-farm-generator':        '/tools/engine/starter-farm-generator/',
    'orchard-discovery-search':      '/tools/engine/orchard-discovery-search/',
    'synthetic-player-generator':    '/tools/engine/synthetic-player-generator/',
    'wave1-simulation-runner':       '/tools/engine/wave1-simulation-runner/',
  };

  // ─────────────────────────────────────────────────────────────
  // CORE ROUTING LOGIC
  // ─────────────────────────────────────────────────────────────

  const canonicalRoute = normalizePath;
  const navLinks = '[data-nav]';
  const sections = Object.keys(SPA_LAYERS);

  function normalizePath(raw) {
    return String(raw || '')
      .toLowerCase()
      .replace(/^[/#?]+|[/#?]+$/g, '')
      .trim();
  }

  function getRepoBasePath() {
    const parts = window.location.pathname.split('/').filter(Boolean);
    return parts[0] === 'decide.engine-tools' ? `/${parts[0]}/` : '/';
  }

  function resolveInternalHref(target) {
    if (!target || /^https?:\/\//.test(target) || !target.startsWith('/')) return target;

    const repoBase = getRepoBasePath();
    const currentPath = window.location.pathname;
    const currentDir = currentPath.endsWith('/')
      ? currentPath
      : currentPath.replace(/[^/]+$/, '');

    const from = currentDir.startsWith(repoBase)
      ? currentDir.slice(repoBase.length)
      : currentDir.replace(/^\//, '');
    const to = target.startsWith(repoBase)
      ? target.slice(repoBase.length)
      : target.replace(/^\//, '');

    const fromParts = from.split('/').filter(Boolean);
    const toParts = to.split('/').filter(Boolean);

    let shared = 0;
    while (shared < fromParts.length && shared < toParts.length && fromParts[shared] === toParts[shared]) {
      shared += 1;
    }

    const relativeParts = [
      ...fromParts.slice(shared).map(() => '..'),
      ...toParts.slice(shared),
    ];
    const relative = relativeParts.join('/');

    if (!relative) return './';
    if (/^\.\.(?:\/\.\.)*$/.test(relative)) return `${relative}/`;
    return relative.startsWith('..') ? relative : `./${relative}`;
  }

  // Navigate to a named route — resolves SPA layer or subpage
  function navigate(route, opts = {}) {
    const key = normalizePath(route);
    if (!key) return switchToLayer('feed');

    // 0. React sub-view: user profile (#/user/:uid)
    //    Distinct from SPA layers — opens an overlay in the React app.
    const _userMatch = key.match(/^user\/(.+)$/);
    if (_userMatch) {
      const uid = decodeURIComponent(_userMatch[1]);
      if (typeof _reactHandlers.openProfile === 'function') {
        try   { _reactHandlers.openProfile(uid); return; }
        catch (e) { console.warn('[VIARouter] React openProfile threw, using hard fallback:', e); }
      }
      // React unavailable or threw → hard fallback
      _reactFallback.openProfile(uid);
      return;
    }

    // 0b. React sub-view: deep dive article (#/rdive/:id)
    //     Uses 'rdive' prefix to avoid collision with legacy #dive/story-key routes.
    const _rdiveMatch = key.match(/^rdive\/(.+)$/);
    if (_rdiveMatch) {
      const id = decodeURIComponent(_rdiveMatch[1]);
      if (typeof _reactHandlers.openDive === 'function') {
        try   { _reactHandlers.openDive(id); return; }
        catch (e) { console.warn('[VIARouter] React openDive threw, using hard fallback:', e); }
      }
      _reactFallback.openDive(id);
      return;
    }

    // 1. SPA layer?
    if (SPA_LAYERS[key]) {
      const storyKey = opts.storyKey || null;
      switchToLayer(SPA_LAYERS[key], storyKey);
      if (opts.updateHash !== false) {
        const hash = storyKey ? `${key}/${storyKey}` : key;
        history.replaceState({ layer: SPA_LAYERS[key], storyKey }, '', `#${hash}`);
      }
      return;
    }

    // 2. Deep dive story key?
    if (STORY_KEYS.includes(key)) {
      switchToLayer('deepdives', key);
      if (opts.updateHash !== false) {
        history.replaceState({ layer: 'deepdives', storyKey: key }, '', `#dive/${key}`);
      }
      return;
    }

    // 3. Subpage?
    const subpage = SUBPAGES[key];
    if (subpage) {
      const isExternal = /^https?:\/\//.test(subpage);
      if (isExternal) {
        window.open(subpage, '_blank', 'noopener');
      } else {
        window.location.href = resolveInternalHref(subpage);
      }
      return;
    }

    // 4. Unknown — fallback to feed
    console.warn(`[VIARouter] Unknown route: "${key}" — falling back to feed`);
    switchToLayer('feed');
  }

  // Thin wrapper around index.html's switchLayer.
  // Prefers React (primary) → falls back to legacy switchLayer.
  function switchToLayer(layer, storyKey) {
    // PRIMARY: React is mounted and registered — delegate to it
    if (typeof _reactHandlers.setTab === 'function') {
      try {
        _reactHandlers.setTab(layer);
        return;
      } catch (e) {
        console.warn('[VIARouter] React setTab threw, falling back to switchLayer:', e);
      }
    }
    // FALLBACK: legacy index.html switchLayer
    if (typeof window.switchLayer === 'function') {
      window.switchLayer(layer, storyKey || undefined);
    } else {
      // switchLayer not ready yet — queue it
      window.__viaRouterPendingLayer = { layer, storyKey };
    }
  }

  // ─────────────────────────────────────────────────────────────
  // URL → ROUTE parsing (reads hash or path)
  // ─────────────────────────────────────────────────────────────

  function parseCurrentURL() {
    const hash = normalizePath(window.location.hash);
    const search = new URLSearchParams(window.location.search);
    const surfaceParam = normalizePath(search.get('surface') || '');
    const toolParam = normalizePath(search.get('tool') || '');

    // ?surface=feed or ?surface=profile
    if (surfaceParam) return { route: surfaceParam, storyKey: null };

    // ?tool=interview-prep
    if (toolParam) return { route: toolParam, storyKey: null };

    if (!hash) return { route: 'feed', storyKey: null };

    // #dive/food or #deepdives/food
    const diveMatch = hash.match(/^(?:dive|deepdives)\/(.+)$/);
    if (diveMatch) return { route: 'deepdives', storyKey: diveMatch[1] };

    // #food (bare story key)
    if (STORY_KEYS.includes(hash)) return { route: 'deepdives', storyKey: hash };

    // #feed, #discover, #about, #profile
    return { route: hash, storyKey: null };
  }

  function syncFromURL(smooth = false) {
    const { route, storyKey } = parseCurrentURL();
    navigate(route, { storyKey, updateHash: false, smooth });
  }

  // ─────────────────────────────────────────────────────────────
  // ANDROID / BROWSER BACK BUTTON
  // ─────────────────────────────────────────────────────────────

  window.addEventListener('popstate', (event) => {
    const state = event.state;
    if (state && state.layer) {
      switchToLayer(state.layer, state.storyKey || undefined);
    } else {
      syncFromURL(false);
    }
  });

  // Android hardware back — navigate back to feed instead of exiting
  document.addEventListener('backbutton', () => {
    const active = window.__viaActiveLayer || 'feed';
    if (active !== 'feed') {
      navigate('feed');
    } else {
      // On feed — let the app handle (or minimize)
      if (typeof window.navigator.app !== 'undefined') {
        window.navigator.app.exitApp();
      }
    }
  });

  // ─────────────────────────────────────────────────────────────
  // SUBPAGE BACK BUTTON — called from subpages to return to VIA
  // ─────────────────────────────────────────────────────────────

  function goBack(fallback) {
    const ref = document.referrer;
    if (ref && ref.includes('viadecide.com')) {
      history.back();
    } else {
      window.location.href = resolveInternalHref(fallback || getRepoBasePath());
    }
  }

  // ─────────────────────────────────────────────────────────────
  // DEFERRED INIT — waits for switchLayer to be ready
  // ─────────────────────────────────────────────────────────────

  function flushPendingRoute() {
    const pending = window.__viaRouterPendingLayer;
    if (pending) {
      window.__viaRouterPendingLayer = null;
      switchToLayer(pending.layer, pending.storyKey);
    }
  }

  function init() {
    // If switchLayer already available, sync now
    if (typeof window.switchLayer === 'function') {
      flushPendingRoute();
      syncFromURL(false);
    } else {
      // Wait for switchLayer to be defined (max 5s)
      let attempts = 0;
      const interval = setInterval(() => {
        attempts++;
        if (typeof window.switchLayer === 'function') {
          clearInterval(interval);
          flushPendingRoute();
          syncFromURL(false);
        } else if (attempts > 50) {
          clearInterval(interval);
          console.warn('[VIARouter] switchLayer never became available');
        }
      }, 100);
    }
  }

  // ─────────────────────────────────────────────────────────────
  // TRACK ACTIVE LAYER (for back button awareness)
  // ─────────────────────────────────────────────────────────────

  const _origSwitchLayer = window.switchLayer;
  Object.defineProperty(window, 'switchLayer', {
    set(fn) {
      window.__viaOrigSwitchLayer = fn;
      window.__definedSwitchLayer = function(layer, storyKey) {
        window.__viaActiveLayer = layer;
        fn(layer, storyKey);
      };
    },
    get() {
      return window.__definedSwitchLayer || window.__viaOrigSwitchLayer || undefined;
    },
    configurable: true,
  });

  // ─────────────────────────────────────────────────────────────
  // PUBLIC API
  // ─────────────────────────────────────────────────────────────

  window.VIARouter = {
    navigate,
    syncFromURL,
    goBack,
    parseCurrentURL,
    SPA_LAYERS,
    SUBPAGES,
    STORY_KEYS,

    // ── React integration ────────────────────────────────────────
    /**
     * Register React navigation handlers (called from App.tsx on mount).
     *
     * Once registered, React becomes the PRIMARY system:
     *   - setTab(tab)      → handleTabChange in React
     *   - openProfile(uid) → openUserProfile in React
     *   - openDive(id)     → openDive in React (by dive.id)
     *
     * @param {{ setTab?, openProfile?, openDive? }} handlers
     */
    registerReact(handlers) {
      Object.assign(_reactHandlers, handlers);
    },

    /**
     * Remove a single React handler key.
     * Called by SubViewErrorBoundary BEFORE navigate(), so the router
     * skips the broken React path and goes straight to hard fallback.
     *
     * @param {'setTab'|'openProfile'|'openDive'} key
     */
    deregisterReact(key) {
      delete _reactHandlers[key];
    },

    /**
     * Clear all React handlers (called from App.tsx useEffect cleanup).
     * After this, all navigation uses legacy switchLayer / hard fallbacks.
     */
    unregisterReact() {
      _reactHandlers = {};
    },

    // Shorthand helpers
    toFeed:     () => navigate('feed'),
    toDiscover: () => navigate('discover'),
    toAbout:    () => navigate('about'),
    toProfile:  () => navigate('profile'),
    toDive:     (key) => navigate('deepdives', { storyKey: key }),
    toTool:     (slug) => navigate(slug),
    // React-specific shorthands (preferred over hash manipulation)
    toUser:     (uid) => navigate('user/' + uid),
    toReactDive:(id)  => navigate('rdive/' + id),
  };

  // Also expose legacy toolPathStaticMap for backwards compat with old callers
  window.Router = {
    canonicalRoute,
    navLinks,
    sections,
    toolPathStaticMap: Object.fromEntries(
      Object.entries(SUBPAGES).map(([k, v]) => [k, v.replace(/^\//, '')])
    ),
    goToRoute: navigate,
    syncFromHash: syncFromURL,
  };

  // ─────────────────────────────────────────────────────────────
  // BOOT
  // ─────────────────────────────────────────────────────────────

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
