const DEFAULT_ROUTE_MAP = {
  feed_surface: { path: './index.html', query: { surface: 'feed' } },
  discover_surface: { path: './index.html', query: { surface: 'discover' } },
  creator_surface: { path: './creator-onboarding.html' },
  story_surface: { path: './creator-story.html' },
  profile_surface: { path: './index.html', query: { surface: 'profile' } },
  about_surface: { path: './index.html', query: { surface: 'about' } },
  engine_tools_surface: { path: './tools/tool-router/index.html' }
};

function appendParams(url, params = {}) {
  Object.entries(params).forEach(([key, value]) => {
    if (typeof value === 'undefined' || value === null || value === '') return;
    url.searchParams.set(key, String(value));
  });
  return url;
}

export class NavigationBridge {
  constructor(options = {}) {
    this.routeMap = {
      ...DEFAULT_ROUTE_MAP,
      ...(options.routeMap || {})
    };
    this.openHandler = typeof options.openHandler === 'function' ? options.openHandler : null;
    this.baseUrl = options.baseUrl || window.location.href;
  }

  openSurface(name, params = {}) {
    const url = this.resolveSurfaceUrl(name, params);
    if (!url) return null;

    if (this.openHandler) {
      const handled = this.openHandler(name, params, url);
      if (handled !== false) {
        return url;
      }
    }

    window.location.href = url;
    return url;
  }

  resolveSurfaceUrl(name, params = {}) {
    const route = this.routeMap[name];
    if (!route) return '';

    const url = new URL(route.path, this.baseUrl);
    appendParams(url, route.query || {});
    appendParams(url, params);
    return `${url.pathname}${url.search}${url.hash}`;
  }

  openSubpage(path) {
    if (!path) return '';
    const url = new URL(path, this.baseUrl);
    const relativeUrl = `${url.pathname}${url.search}${url.hash}`;
    window.location.href = relativeUrl;
    return relativeUrl;
  }

  goBack() {
    if (window.history.length > 1) {
      window.history.back();
      return 'history';
    }
    return this.openSurface('feed_surface');
  }
}
