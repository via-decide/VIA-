(function (global) {
  'use strict';

  function Runtime(options) {
    var config = options || {};
    if (!global.VIA || !global.VIA.ToolRegistry || !global.VIA.ModuleLoader || !global.VIA.Router || !global.VIA.SessionStore) {
      throw new Error('VIA runtime dependencies are missing.');
    }

    this.registry = new global.VIA.ToolRegistry();
    this.sessions = new global.VIA.SessionStore({ namespace: config.sessionNamespace });
    this.router = new global.VIA.Router();
    this.loader = new global.VIA.ModuleLoader({
      mountPoint: config.mountPoint,
      loadTimeoutMs: config.loadTimeoutMs
    });

    this._activeSessionId = null;
    this._activeToolId = null;
  }

  Runtime.prototype.bootstrap = function bootstrap(registryJSON) {
    this.registry.loadFromJSON(registryJSON);
  };

  Runtime.prototype.mount = function mount() {
    this.router.onChange(function (route) {
      if (!route.toolId) return;
      this.openTool(decodeURIComponent(route.toolId));
    }.bind(this));
    this.router.start();
  };

  Runtime.prototype.openTool = function openTool(toolId) {
    var tool = this.registry.get(toolId);
    if (!tool || tool.enabled === false) {
      return Promise.reject(new Error('Tool not found or disabled: ' + toolId));
    }

    var previousSessionId = this._activeSessionId;
    if (previousSessionId) {
      this.sessions.endSession(previousSessionId, { reason: 'tool_switched', to: toolId });
    }

    var session = this.sessions.createSession(toolId, { openedFrom: global.location.hash || '#/' });
    this._activeSessionId = session.id;
    this._activeToolId = toolId;
    this.sessions.appendEvent(session.id, 'tool_selected', { toolId: toolId });

    return this.loader.load(tool).then(function () {
      this.sessions.appendEvent(session.id, 'tool_loaded', { toolId: toolId });
      return { tool: tool, session: session };
    }.bind(this)).catch(function (error) {
      this.sessions.appendEvent(session.id, 'tool_load_failed', { toolId: toolId, error: error.message });
      throw error;
    }.bind(this));
  };

  Runtime.prototype.navigateToTool = function navigateToTool(toolId) {
    this.router.navigateToTool(toolId);
  };

  Runtime.prototype.shutdown = function shutdown() {
    if (this._activeSessionId) {
      this.sessions.endSession(this._activeSessionId, { reason: 'runtime_shutdown' });
      this._activeSessionId = null;
    }
    this._activeToolId = null;
    this.loader.unload();
  };

  global.VIA = global.VIA || {};
  global.VIA.Runtime = Runtime;
})(window);
