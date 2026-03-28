/* shared/url-resolver.js — Environment-aware URL resolver
 * Fixes GitHub Pages subpath deployment (via-decide.github.io/VIA/)
 * vs. production (viadecide.com) and localhost.
 *
 * API:
 *   URLResolver.getBase()          → "/VIA/" | "/"
 *   URLResolver.getRootHref()      → "https://via-decide.github.io/VIA/"
 *   URLResolver.resolvePath(path)  → absolute URL string safe for any deployment
 */
(function (global) {
  'use strict';

  var _base = null;

  /**
   * Detect and cache the site root base path.
   *   - GitHub Pages  → /REPO-NAME/  (extracted from pathname segment[0])
   *   - localhost     → /
   *   - viadecide.com → /
   */
  function getBase() {
    if (_base !== null) return _base;
    var hostname = global.location.hostname;
    var pathname = global.location.pathname;

    if (hostname.indexOf('.github.io') !== -1) {
      // pathname starts with /REPO-NAME/...
      var segments = pathname.replace(/^\//, '').split('/').filter(function (s) { return s.length > 0; });
      _base = segments.length > 0 ? '/' + segments[0] + '/' : '/';
    } else {
      _base = '/';
    }
    return _base;
  }

  /**
   * Return the absolute origin + base as a URL string.
   * Used as the base for `new URL(path, rootHref)` calls.
   * e.g. "https://via-decide.github.io/VIA/"
   */
  function getRootHref() {
    return global.location.origin + getBase();
  }

  /**
   * Resolve any path to a correct absolute URL for the current deployment.
   *   - External URLs (http/https)   → returned unchanged
   *   - Hash-only (#fragment)        → returned unchanged
   *   - Relative (./foo or foo)      → resolved from site root
   *   - Absolute (/foo)              → re-rooted under site base
   */
  function resolvePath(targetPath) {
    if (!targetPath) return getRootHref();
    var s = String(targetPath).trim();

    // External or protocol-relative: pass through
    if (/^https?:\/\//.test(s) || s.indexOf('//') === 0) return s;
    // Hash-only: pass through
    if (s.charAt(0) === '#') return s;
    // javascript: pseudo-protocol: pass through
    if (s.indexOf('javascript:') === 0) return s;

    var base = getBase();

    // Absolute path (/something) — re-root under base
    if (s.charAt(0) === '/') {
      return global.location.origin + base + s.replace(/^\//, '');
    }

    // Relative path (./something or something) — resolve from base
    var clean = s.replace(/^\.\//, '');
    return global.location.origin + base + clean;
  }

  global.URLResolver = {
    getBase: getBase,
    getRootHref: getRootHref,
    resolvePath: resolvePath
  };
})(window);
