(function attachRouter(global) {
  'use strict';

  const VIA = global.VIA || (global.VIA = { core: {}, router: {}, state: {}, storage: {}, modules: {}, ui: {}, gestures: {} });
  const basePath = '/decide.engine-tools';

  const routeTable = {
    '/': { module: 'feed' },
    '/feed': { module: 'feed' },
    '/tools': { module: 'tools' },
    '/world': { module: 'world' },
    '/academy': { module: 'academy' },
    '/articles': { module: 'feed' }
  };

  function normalize(path) {
    if (!path) {
      return '/';
    }

    const noOrigin = path.replace(/^https?:\/\/[^/]+/i, '');
    const noBase = noOrigin.startsWith(basePath) ? noOrigin.slice(basePath.length) || '/' : noOrigin;
    const noQuery = noBase.split('?')[0].split('#')[0] || '/';
    const collapsed = noQuery.replace(/\/{2,}/g, '/');
    return collapsed.length > 1 && collapsed.endsWith('/') ? collapsed.slice(0, -1) : collapsed;
  }

  function resolveCurrentPath() {
    const search = new URLSearchParams(global.location.search);
    const redirectedRoute = search.get('via_route');

    if (redirectedRoute) {
      const recovered = normalize(redirectedRoute);
      global.history.replaceState({}, '', `${basePath}${recovered}`);
      return recovered;
    }

    if (global.location.hash && global.location.hash.startsWith('#/')) {
      return normalize(global.location.hash.slice(1));
    }

    return normalize(global.location.pathname);
  }

  function render(path) {
    const canonical = normalize(path);
    const match = routeTable[canonical] || routeTable['/'];

    VIA.state.patch({ currentRoute: canonical });

    VIA.core.withBoundary(`route:${canonical}`, function runRoute() {
      return VIA.modules.load(match.module, '#via-app');
    }, function routeFallback() {
      const host = document.querySelector('#via-app');
      if (host) {
        host.innerHTML = '<section><h2>Route error</h2><p>Route failed to render safely.</p></section>';
      }
      return null;
    });
  }

  function onLinkClick(event) {
    const link = event.target.closest('a[data-route]');
    if (!link) {
      return;
    }

    event.preventDefault();
    VIA.router.go(link.getAttribute('href'));
  }

  VIA.router.routes = routeTable;

  VIA.router.go = function go(path) {
    const canonical = normalize(path);
    global.history.pushState({}, '', `${basePath}${canonical}`);
    render(canonical);
  };

  VIA.router.start = function start() {
    document.addEventListener('click', onLinkClick);
    global.addEventListener('popstate', function onPopState() {
      render(resolveCurrentPath());
    });

    render(resolveCurrentPath());
  };
}(window));
