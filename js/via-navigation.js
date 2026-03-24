(function (global) {
  'use strict';

  var ROUTES = {
    feed: './index.html',
    creator_onboarding: './creator-onboarding.html',
    creator_story: './creator-story.html',
    profile: './profile.html',
    agent: './agent.html',
    discover: './discover.html',
    about: './about.html',
    decision_brief: './decision-brief.html',
    studyos: './StudyOS.html',
    app_generator: './app-generator.html',
    finance_dashboard_msme: './finance-dashboard-msme.html',
    alchemist: './alchemist.html',
    directory: './pages/directory/index.html'
  };
  var LEGACY_PATHS = {
    '/creator-onboarding': ROUTES.creator_onboarding,
    '/creator-onboarding/': ROUTES.creator_onboarding,
    '/creator-story': ROUTES.creator_story,
    '/creator-story/': ROUTES.creator_story,
    '/profile': ROUTES.profile,
    '/profile/': ROUTES.profile,
    '/agent': ROUTES.agent,
    '/agent/': ROUTES.agent,
    '/discover': ROUTES.discover,
    '/discover/': ROUTES.discover,
    '/about': ROUTES.about,
    '/about/': ROUTES.about,
    '/decision-brief': ROUTES.decision_brief,
    '/decision-brief/': ROUTES.decision_brief,
    '/StudyOS': ROUTES.studyos,
    '/StudyOS/': ROUTES.studyos,
    '/app-generator': ROUTES.app_generator,
    '/app-generator/': ROUTES.app_generator,
    '/finance-dashboard-msme': ROUTES.finance_dashboard_msme,
    '/finance-dashboard-msme/': ROUTES.finance_dashboard_msme,
    '/alchemist': ROUTES.alchemist,
    '/alchemist/': ROUTES.alchemist,
    '/directory': ROUTES.directory,
    '/directory/': ROUTES.directory
  };

  function normalizePath(path) {
    var value = String(path || '').trim();
    if (!value) return './index.html';
    if (value === '.' || value === './' || value === '/') return './index.html';
    if (!/\.html(?:$|[?#])/.test(value) && ROUTES[value]) return ROUTES[value];
    return value;
  }

  function resolvePage(name) {
    return normalizePath(ROUTES[name] || name);
  }

  function buildUrl(path, params) {
    var target = new URL(resolvePage(path), global.location.href);
    if (params && typeof params === 'object') {
      Object.keys(params).forEach(function (key) {
        var value = params[key];
        if (value === undefined || value === null || value === '') return;
        target.searchParams.set(key, String(value));
      });
    }
    return target.toString();
  }

  function navigate(url) {
    if (typeof global.VIATransition !== 'undefined' && global.VIATransition && typeof global.VIATransition.navigate === 'function') {
      global.VIATransition.navigate(url);
      return;
    }
    global.location.href = url;
  }

  function openPage(name, params) {
    var path = resolvePage(name);
    if (!path) {
      console.error('Route not found:', name);
      return;
    }
    navigate(buildUrl(path, params));
  }

  function openSurface(name, params) {
    openPage(name, params);
  }

  function goBack(fallbackName) {
    if (global.history.length > 1) {
      global.history.back();
      return;
    }
    openSurface(fallbackName || 'feed');
  }

  function getCurrentPageFile() {
    var pathname = global.location.pathname || '';
    var file = pathname.split('/').pop() || 'index.html';
    return file || 'index.html';
  }

  function applyActiveNav(root) {
    var scope = root || document;
    var current = getCurrentPageFile();
    scope.querySelectorAll('[data-page]').forEach(function (node) {
      var page = resolvePage(node.getAttribute('data-page') || '').split('/').pop();
      var active = page === current;
      node.classList.toggle('active', active);
      if (active) {
        node.setAttribute('aria-current', 'page');
      } else {
        node.removeAttribute('aria-current');
      }
    });
  }

  function bindNavigation(root) {
    var scope = root || document;
    scope.querySelectorAll('.via-nav').forEach(function (nav) {
      if (nav.querySelector('[data-page=\"directory\"]')) return;
      var link = document.createElement('a');
      link.href = resolvePage('directory');
      link.setAttribute('data-page', 'directory');
      link.textContent = 'Directory';
      nav.appendChild(link);
    });
    scope.querySelectorAll('[data-open-page]').forEach(function (node) {
      node.addEventListener('click', function (event) {
        event.preventDefault();
        openPage(node.getAttribute('data-open-page') || 'index.html');
      });
    });
    scope.querySelectorAll('[data-open-surface]').forEach(function (node) {
      node.addEventListener('click', function (event) {
        event.preventDefault();
        openSurface(node.getAttribute('data-open-surface') || 'feed');
      });
    });
    scope.querySelectorAll('[data-go-back]').forEach(function (node) {
      node.addEventListener('click', function (event) {
        event.preventDefault();
        goBack(node.getAttribute('data-go-back') || 'feed');
      });
    });
    applyActiveNav(scope);
  }

  function handleLegacyPathRedirect() {
    var pathname = global.location.pathname || '';
    var redirectPath = LEGACY_PATHS[pathname];
    if (!redirectPath) return;
    var target = new URL(resolvePage(redirectPath), global.location.href);
    target.search = global.location.search || '';
    target.hash = global.location.hash || '';
    global.location.replace(target.toString());
  }

  function handleLegacyRoutes() {
    var params = new URLSearchParams(global.location.search || '');
    var surface = params.get('surface') || params.get('route');
    if (!surface) return;
    if (!ROUTES[surface] || surface === 'feed') return;
    params.delete('surface');
    params.delete('route');
    openSurface(surface, Object.fromEntries(params.entries()));
  }

  global.VIANav = {
    openPage: openPage
  };

  global.VIANavigation = {
    pages: ROUTES,
    resolvePage: resolvePage,
    openPage: openPage,
    openSurface: openSurface,
    goBack: goBack,
    applyActiveNav: applyActiveNav,
    bindNavigation: bindNavigation,
    handleLegacyRoutes: handleLegacyRoutes,
    getCurrentPageFile: getCurrentPageFile,
    buildUrl: buildUrl
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      handleLegacyPathRedirect();
      bindNavigation(document);
      handleLegacyRoutes();
    }, { once: true });
  } else {
    handleLegacyPathRedirect();
    bindNavigation(document);
    handleLegacyRoutes();
  }
})(window);
