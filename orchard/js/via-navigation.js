(function (global) {
  'use strict';

  var PAGE_MAP = {
    feed: './index.html',
    discover: './discover.html',
    about: './about.html',
    profile: './profile.html',
    creator_story: './creator-story.html',
    creator_onboarding: './creator-onboarding.html',
    agent: './agent.html'
  };

  function normalizePath(path) {
    var value = String(path || '').trim();
    if (!value) return './index.html';
    if (value === '.' || value === './' || value === '/') return './index.html';
    if (!/\.html(?:$|[?#])/.test(value) && PAGE_MAP[value]) return PAGE_MAP[value];
    return value;
  }

  function resolvePage(name) {
    return normalizePath(PAGE_MAP[name] || name);
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

  function openPage(path, params) {
    navigate(buildUrl(path, params));
  }

  function openSurface(name, params) {
    openPage(resolvePage(name), params);
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

  function handleLegacyRoutes() {
    var params = new URLSearchParams(global.location.search || '');
    var surface = params.get('surface') || params.get('route');
    if (!surface) return;
    if (!PAGE_MAP[surface] || surface === 'feed') return;
    params.delete('surface');
    params.delete('route');
    openSurface(surface, Object.fromEntries(params.entries()));
  }

  global.VIANavigation = {
    pages: PAGE_MAP,
    resolvePage: resolvePage,
    openPage: openPage,
    openSurface: openSurface,
    goBack: goBack,
    applyActiveNav: applyActiveNav,
    bindNavigation: bindNavigation,
    handleLegacyRoutes: handleLegacyRoutes,
    getCurrentPageFile: getCurrentPageFile
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      bindNavigation(document);
      handleLegacyRoutes();
    }, { once: true });
  } else {
    bindNavigation(document);
    handleLegacyRoutes();
  }
})(window);
