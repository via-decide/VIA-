(function (global) {
  'use strict';

  var canonicalRoute = '#/tool/';

  function Router() {
    this._listeners = new Set();
  }

  Router.prototype.parse = function parse(hash) {
    var value = String(hash || global.location.hash || '').trim();
    if (!value || value === '#') {
      return { toolId: null, path: '#/' };
    }

    if (value.indexOf(canonicalRoute) !== 0) {
      return { toolId: null, path: value };
    }

    return {
      toolId: value.slice(canonicalRoute.length),
      path: value
    };
  };

  Router.prototype.navigateToTool = function navigateToTool(toolId) {
    var nextHash = canonicalRoute + encodeURIComponent(toolId);
    if (global.location.hash !== nextHash) {
      global.location.hash = nextHash;
    }
    this._emit();
  };

  Router.prototype.onChange = function onChange(listener) {
    this._listeners.add(listener);
    return function () {
      this._listeners.delete(listener);
    }.bind(this);
  };

  Router.prototype.start = function start() {
    var self = this;
    global.addEventListener('hashchange', function () {
      self._emit();
    });
    this._emit();
  };

  Router.prototype._emit = function _emit() {
    var route = this.parse();
    this._listeners.forEach(function (listener) {
      listener(route);
    });
  };

  global.VIA = global.VIA || {};
  global.VIA.Router = Router;
})(window);
