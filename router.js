// router.js — VIA static navigation compatibility shim
// viadecide.com | via-decide/VIA
// Handles: direct multi-page navigation, URL sync, subpage navigation, back button
// Pattern: IIFE, no dependencies, safe to load before or after DOM ready

(() => {
  'use strict';

  const SUBPAGES = {
    feed: './viadecide.html',
    viadecide: './viadecide.html',
    discover: './discover.html',
    about: './about.html',
    profile: './profile.html',
    auth: './auth.html',
    'sign-in': './auth.html',
    login: './auth.html',
    'creator-story': './creator-story.html',
    creator_story: './creator-story.html',
    creator: './creator-story.html',
    'creator-onboarding': './creator-onboarding.html',
    creator_onboarding: './creator-onboarding.html',
    create: './creator-onboarding.html',
    agent: './agent.html',
    games: './games.html',
    arcade: './games.html',
    'games-hub': './games.html',
    'decision-brief': './decision-brief.html',
    decision_brief: './decision-brief.html',
    studyos: './StudyOS.html',
    StudyOS: './StudyOS.html',
    'app-generator': './app-generator.html',
    app_generator: './app-generator.html',
    'finance-dashboard-msme': './finance-dashboard-msme.html',
    finance_dashboard_msme: './finance-dashboard-msme.html',
    alchemist: './alchemist.html',
    founder: './founder/index.html',
    'interview-prep': './interview-prep/index.html',
    'student-research': './student-research/index.html',
    directory: './pages/directory/index.html',
    'prompt-alchemy': './prompt-alchemy/index.html',
    skillhex: './skillhex/index.html',
    mars: './mars/index.html',
    'context-packager': './tools/context-packager/index.html',
    'spec-builder': './tools/spec-builder/index.html',
    'task-splitter': './tools/task-splitter/index.html',
    'code-generator': './tools/code-generator/index.html',
    'code-reviewer': './tools/code-reviewer/index.html',
    'output-evaluator': './tools/output-evaluator/index.html',
    'idea-remixer': './tools/idea-remixer/index.html',
    'template-vault': './tools/template-vault/index.html',
    'export-studio': './tools/export-studio/index.html',
    'tool-router': './tools/tool-router/index.html',
    'script-generator': './tools/script-generator/index.html',
    'json-formatter': './tools/json-formatter/index.html',
    'regex-tester': './tools/regex-tester/index.html',
    pomodoro: './tools/pomodoro/index.html',
    'color-palette': './tools/color-palette/index.html',
    'revenue-forecaster': './tools/revenue-forecaster/index.html',
    'prompt-compare': './tools/prompt-compare/index.html',
    'repo-improvement-brief': './tools/repo-improvement-brief/index.html',
    'workflow-template-gallery': './tools/workflow-template-gallery/index.html',
    'tool-search-discovery': './tools/tool-search-discovery/index.html'
  ,
    'msme-finance-dashboard': './ finance-dashboard-msme.html',
    'inventory-management-tool': './ inventory-dashboard.html',
    'ondc-hub': './articles/ondc-for-bharat.html',
    'ai-tool-generator': './tools/ai-tool-generator/index.html',
    'code-generator': './tools/code-generator/index.html',
    'code-reviewer': './tools/code-reviewer/index.html',
    'context-packager': './tools/context-packager/index.html',
    'output-evaluator': './tools/output-evaluator/index.html',
    'repo-improvement-brief': './tools/repo-improvement-brief/index.html',
    'spec-builder': './tools/spec-builder/index.html',
    'task-splitter': './tools/task-splitter/index.html',
    'idea-remixer': './tools/idea-remixer/index.html',
    'promptalchemy': './tools/promptalchemy/index.html',
    'script-generator': './tools/script-generator/index.html',
    'typography-scale-calculator': './tools/engine/typography-scale-calculator/index.html',
    'export-studio': './tools/export-studio/index.html',
    'template-vault': './tools/template-vault/index.html',
    'prompt-compare': './tools/prompt-compare/index.html',
    'tool-router': './tools/tool-router/index.html',
    'tool-search-discovery': './tools/tool-search-discovery/index.html',
    'workflow-template-gallery': './tools/workflow-template-gallery/index.html',
    'meeting-cost-calculator': './tools/engine/meeting-cost-calculator/index.html',
    'thirty-day-promotion-engine': './tools/engine/thirty-day-promotion-engine/index.html',
    'ai-coach-console': './tools/engine/ai-coach-console/index.html',
    'balance-dashboard': './tools/engine/balance-dashboard/index.html',
    'circle-builder': './tools/engine/circle-builder/index.html',
    'daily-quest-generator': './tools/engine/daily-quest-generator/index.html',
    'eco-engine-test': './tools/eco-engine-test/index.html',
    'fair-ranking-engine': './tools/engine/fair-ranking-engine/index.html',
    'four-direction-pipeline': './tools/engine/four-direction-pipeline/index.html',
    'fruit-sharing': './tools/engine/fruit-sharing/index.html',
    'fruit-yield-engine': './tools/engine/fruit-yield-engine/index.html',
    'grid-evolution': './tools/engine/grid-evolution/index.html',
    'growth-milestone-engine': './tools/engine/growth-milestone-engine/index.html',
    'growth-path-recommender': './tools/engine/growth-path-recommender/index.html',
    'hire-readiness-scorer': './tools/engine/hire-readiness-scorer/index.html',
    'layer1-swipe-crucible': './tools/engine/layer1-swipe-crucible/index.html',
    'market-dynamics': './tools/engine/market-dynamics/index.html',
    'meta-health-dashboard': './tools/engine/meta-health-dashboard/index.html',
    'orchard-discovery-search': './tools/engine/orchard-discovery-search/index.html',
    'orchard-profile-builder': './tools/engine/orchard-profile-builder/index.html',
    'peer-validation-engine': './tools/engine/peer-validation-engine/index.html',
    'player-signup': './tools/engine/player-signup/index.html',
    'recruiter-dashboard': './tools/engine/recruiter-dashboard/index.html',
    'root-strength-calculator': './tools/engine/root-strength-calculator/index.html',
    'script-generator-files': './tools/engine/script-generator-files/index.html',
    'seed-exchange': './tools/engine/seed-exchange/index.html',
    'seed-quality-scorer': './tools/engine/seed-quality-scorer/index.html',
    'simulation-runner': './tools/engine/simulation-runner/index.html',
    'starter-farm-generator': './tools/engine/starter-farm-generator/index.html',
    'synthetic-player-generator': './tools/engine/synthetic-player-generator/index.html',
    'traffic-router': './tools/engine/traffic-router/index.html',
    'trunk-growth-calculator': './tools/engine/trunk-growth-calculator/index.html',
    'trust-score-engine': './tools/engine/trust-score-engine/index.html',
    'wave1-simulation-runner': './tools/engine/wave1-simulation-runner/index.html',
    'weekly-harvest-engine': './tools/engine/weekly-harvest-engine/index.html',
    'color-palette': './tools/color-palette/index.html',
    'json-formatter': './tools/json-formatter/index.html',
    'pomodoro': './tools/pomodoro/index.html',
    'regex-tester': './tools/regex-tester/index.html',
    'revenue-forecaster': './tools/revenue-forecaster/index.html',
    'hex-wars': './tools/games/hex-wars/index.html',
    'snake-game': './tools/games/snake-game/index.html',
    'freecell-classic': './tools/games/freecell-classic/index.html',
    'skillhex-mission-control': './skillhex/index.html',
    'wings-of-fire-quiz': './tools/games/wings-of-fire-quiz/index.html',
    'data-orchard': './game/index.html',
    'mars-rover-sim': './mars/index.html',
    'orchard-engine': './tools/games/orchard/index.html',
    'engine-tools': 'https://decide-engine-tools.vercel.app',
};
  const canonicalRoute = normalizePath;
  const navLinks = '[data-nav]';
  const sections = Object.keys(SUBPAGES);

  function normalizePath(raw) {
    return String(raw || '')
      .trim()
      .replace(/^[/#?]+|[/#?]+$/g, '')
      .replace(/\.html$/i, '')
      .replace(/\/$/, '')
      .toLowerCase();
  }

  function resolveRoute(route) {
    const key = normalizePath(route);
    if (!key) return SUBPAGES.feed;
    return SUBPAGES[key] || route;
  }

  function buildTarget(route, params) {
    const raw = resolveRoute(route);

    // External absolute URL — handle params directly, skip root-relative logic
    if (/^https?:\/\//.test(raw)) {
      if (!params || !Object.keys(params).length) return raw;
      const t = new URL(raw);
      Object.keys(params).forEach((k) => {
        const v = params[k];
        if (v === undefined || v === null || v === '') return;
        t.searchParams.set(k, String(v));
      });
      return t.toString();
    }

    // Root-relative resolution: always resolve SUBPAGES paths from the site
    // root, not from window.location.href. This fixes GitHub Pages subpath
    // deployments where the current page may be several directories deep
    // (e.g. /VIA/tools/code-generator/) but the target is at /VIA/viadecide.html.
    const rootHref = window.URLResolver ? window.URLResolver.getRootHref()
                                        : window.location.origin + '/';
    const target = new URL(raw.replace(/^\.\//, ''), rootHref);

    if (params && typeof params === 'object') {
      Object.keys(params).forEach((key) => {
        const value = params[key];
        if (value === undefined || value === null || value === '') return;
        target.searchParams.set(key, String(value));
      });
    }
    return target.toString();
  }

  function navigate(route, opts = {}) {
    const target = buildTarget(route, opts.params);
    if (/^https?:\/\//.test(target) && !target.startsWith(window.location.origin)) {
      window.location.assign(target);
      return;
    }
    window.location.assign(target);
  }

  function parseCurrentURL() {
    const search = new URLSearchParams(window.location.search);
    const surfaceParam = normalizePath(search.get('surface') || search.get('route') || '');
    const toolParam = normalizePath(search.get('tool') || '');
    const hash = normalizePath(window.location.hash || '');
    if (surfaceParam) return { route: surfaceParam, params: Object.fromEntries(search.entries()) };
    if (toolParam) return { route: toolParam, params: Object.fromEntries(search.entries()) };
    if (hash && SUBPAGES[hash]) return { route: hash, params: null };
    return { route: normalizePath(window.location.pathname.split('/').pop() || 'index') || 'feed', params: null };
  }

  function syncFromURL() {
    const parsed = parseCurrentURL();
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    const target = resolveRoute(parsed.route).split('/').pop();
    if (target && target !== currentPath) {
      navigate(parsed.route, { params: parsed.params });
    }
  }

  function goBack(fallback = 'feed') {
    if (window.history.length > 1) {
      window.history.back();
      return;
    }
    navigate(fallback);
  }

  function registerReact() {}
  function deregisterReact() {}
  function unregisterReact() {}

  /**
   * matchWildcard(pattern, path)
   * Supports * (single segment) and ** (multi-segment) wildcards.
   * e.g. matchWildcard('tools/*', 'tools/code-generator') → true
   *      matchWildcard('tools/**', 'tools/engine/foo/bar')  → true
   */
  function matchWildcard(pattern, path) {
    var p = String(pattern || '').replace(/^\/|\/$/g, '');
    var s = String(path || '').replace(/^\/|\/$/g, '');
    // Escape regex special chars except * which we handle manually
    var regexStr = p
      .replace(/[.+^${}()|[\]\\]/g, '\\$&')
      .replace(/\*\*/g, '###GLOBSTAR###')
      .replace(/\*/g, '[^/]+')
      .replace(/###GLOBSTAR###/g, '.+');
    try {
      return new RegExp('^' + regexStr + '$').test(s);
    } catch (e) {
      return false;
    }
  }

  window.VIARouter = {
    navigate,
    syncFromURL,
    goBack,
    parseCurrentURL,
    SUBPAGES,
    registerReact,
    deregisterReact,
    unregisterReact,
    toFeed: () => navigate('feed'),
    toDiscover: () => navigate('discover'),
    toAbout: () => navigate('about'),
    toProfile: () => navigate('profile'),
    toTool: (slug) => navigate(slug),
    toUser: (uid) => navigate('profile', { params: { uid } }),
    toReactDive: (id) => navigate('about', { params: { dive: id } }),
    toMap: (mapId) => navigate(mapId ? 'directory' : 'directory', { params: mapId ? { map: mapId } : {} }),
    matchWildcard: matchWildcard
  };

  window.Router = {
    canonicalRoute,
    navLinks,
    sections,
    toolPathStaticMap: Object.fromEntries(
      Object.entries(SUBPAGES).map(([key, value]) => [key, value.replace(/^\.\//, '')])
    ),
    goToRoute: navigate,
    syncFromHash: syncFromURL,
    matchWildcard: matchWildcard
  };

  // ── Global click interceptor ──────────────────────────────────────────────
  // Catches <a> clicks for .subpage-card, [data-route], and any same-origin
  // relative link, then resolves the URL through URLResolver so GitHub Pages
  // subpath deployments never lose the /VIA/ prefix.
  document.addEventListener('click', function (event) {
    // Walk up the DOM to find the closest anchor
    var target = event.target;
    while (target && target !== document) {
      if (target.tagName === 'A') break;
      target = target.parentElement;
    }
    if (!target || target.tagName !== 'A') return;

    var href = target.getAttribute('href');
    if (!href) return;

    // Skip: external, hash-only, javascript:, mailto:, tel:, download, new-tab
    if (/^https?:\/\//.test(href)) return;
    if (href.charAt(0) === '#') return;
    if (/^(javascript|mailto|tel):/.test(href)) return;
    if (target.hasAttribute('download')) return;
    if (target.getAttribute('target') === '_blank') return;
    // Skip if already an absolute URL produced by URLResolver
    if (href.indexOf(window.location.origin) === 0) return;

    // data-route attribute: treat value as a named route
    var dataRoute = target.getAttribute('data-route');
    if (dataRoute) {
      event.preventDefault();
      navigate(dataRoute);
      return;
    }

    // Relative or root-relative path — resolve through URLResolver
    if (window.URLResolver) {
      var resolved = window.URLResolver.resolvePath(href);
      if (resolved !== href) {
        event.preventDefault();
        if (window.VIATransition && typeof window.VIATransition.navigate === 'function') {
          window.VIATransition.navigate(resolved);
        } else {
          window.location.assign(resolved);
        }
      }
    }
  }, true); // capture phase so it fires before other listeners
})();
