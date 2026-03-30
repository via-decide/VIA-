(function attachRouter(global) {
  'use strict';

  const namespace = global.VIA || (global.VIA = { engine: {}, world: {}, ui: {}, storage: {}, router: {} });
  const routes = new Map();
  const basePath = '/decide.engine-tools';

  function normalize(pathname) {
    if (!pathname) {
      return '/';
    }

    const noBase = pathname.startsWith(basePath)
      ? pathname.slice(basePath.length) || '/'
      : pathname;

    return noBase.endsWith('/') && noBase !== '/' ? noBase.slice(0, -1) : noBase;
  }

  function recoverDeepLink() {
    const fromSearch = new URLSearchParams(global.location.search).get('via_route');
    const fromStorage = namespace.storage.get('via:pendingRoute', null);
    const pending = fromSearch || fromStorage;

    if (!pending) {
      return;
    }

    namespace.storage.set('via:pendingRoute', null);
    global.history.replaceState({}, '', `${basePath}${pending}`);
  }

  function render(pathname) {
    const canonical = normalize(pathname);
    const handler = routes.get(canonical) || routes.get('/404');
    if (!handler) {
      return;
    }

    namespace.engine.profile(`route:${canonical}`, function profileRoute() {
      handler({ path: canonical, fullPath: pathname });
    });
  }

  function onLinkClick(event) {
    const link = event.target.closest('a[data-route]');
    if (!link) {
      return;
    }

    event.preventDefault();
    namespace.router.navigate(link.getAttribute('href'));
  }

  namespace.router.register = function register(path, handler) {
    routes.set(path, handler);
  };

  namespace.router.navigate = function navigate(path) {
    const canonical = normalize(path);
    global.history.pushState({}, '', `${basePath}${canonical}`);
    render(global.location.pathname);
  };

  namespace.router.start = function start() {
    recoverDeepLink();
    document.addEventListener('click', onLinkClick);
    global.addEventListener('popstate', function onPopState() {
      render(global.location.pathname);
    });
    render(global.location.pathname);
  };
}(window));
