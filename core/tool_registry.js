(function (global) {
  'use strict';

  function isObject(value) {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
  }

  function normalizeSandboxFlags(flags) {
    if (!Array.isArray(flags) || !flags.length) {
      return ['allow-scripts', 'allow-forms', 'allow-popups'];
    }
    return flags.filter(function (flag) { return typeof flag === 'string' && flag.trim(); });
  }

  function ToolRegistry() {
    this._tools = new Map();
  }

  ToolRegistry.prototype.register = function register(toolDefinition) {
    if (!isObject(toolDefinition)) {
      throw new Error('Tool definition must be an object.');
    }

    var id = String(toolDefinition.id || '').trim();
    var url = String(toolDefinition.url || '').trim();
    if (!id || !url) {
      throw new Error('Tool definition requires id and url.');
    }

    var normalized = {
      id: id,
      name: String(toolDefinition.name || id),
      url: url,
      description: String(toolDefinition.description || ''),
      category: String(toolDefinition.category || 'general'),
      sandbox: normalizeSandboxFlags(toolDefinition.sandbox),
      enabled: toolDefinition.enabled !== false,
      meta: isObject(toolDefinition.meta) ? toolDefinition.meta : {}
    };

    this._tools.set(id, normalized);
    return normalized;
  };

  ToolRegistry.prototype.loadFromJSON = function loadFromJSON(input) {
    var payload = typeof input === 'string' ? JSON.parse(input) : input;
    var tools = Array.isArray(payload) ? payload : payload && payload.tools;

    if (!Array.isArray(tools)) {
      throw new Error('Tool registry JSON must be an array or an object with a tools array.');
    }

    var self = this;
    return tools.map(function (tool) {
      return self.register(tool);
    });
  };

  ToolRegistry.prototype.get = function get(id) {
    return this._tools.get(id) || null;
  };

  ToolRegistry.prototype.list = function list() {
    return Array.from(this._tools.values());
  };

  ToolRegistry.prototype.toJSON = function toJSON() {
    return { tools: this.list() };
  };

  global.VIA = global.VIA || {};
  global.VIA.ToolRegistry = ToolRegistry;
})(window);
