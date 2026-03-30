(function attachModuleLoader(global) {
  'use strict';

  const namespace = global.VIA || (global.VIA = { engine: {}, world: {}, ui: {}, storage: {}, router: {} });

  const moduleMap = {
    feed: './app/modules/feed.js',
    world: './app/modules/world-map.js',
    academy: './app/modules/academy.js'
  };

  const cache = new Map();

  async function loadByName(name) {
    if (cache.has(name)) {
      return cache.get(name);
    }

    const entry = moduleMap[name];
    if (!entry) {
      throw new Error(`Unknown module: ${name}`);
    }

    const modulePromise = import(entry);
    cache.set(name, modulePromise);
    return modulePromise;
  }

  namespace.engine.loadModule = async function loadModule(name, containerSelector) {
    const host = document.querySelector(containerSelector);
    if (!host) {
      return;
    }

    namespace.ui.withErrorBoundary(containerSelector, function mountWithinBoundary() {
      host.innerHTML = '<div class="via-loading">Loading module...</div>';
    });

    const startedAt = global.performance.now();

    try {
      const mod = await loadByName(name);
      namespace.ui.withErrorBoundary(containerSelector, function mountModule() {
        host.innerHTML = '';
        mod.mount(host, namespace);
      });
      console.info(`[VIA][lazy] module:${name} ${(global.performance.now() - startedAt).toFixed(2)}ms`);
    } catch (error) {
      namespace.ui.withErrorBoundary(containerSelector, function renderError() {
        throw error;
      });
    }
  };

  namespace.engine.launchTool = async function launchTool(toolId, containerSelector) {
    const path = `./tools/${toolId}/index.js`;
    const host = document.querySelector(containerSelector);
    if (!host) {
      return;
    }

    const start = global.performance.now();

    try {
      const tool = await import(path);
      namespace.ui.withErrorBoundary(containerSelector, function mountTool() {
        host.innerHTML = '';
        if (typeof tool.mount === 'function') {
          tool.mount(host, namespace);
          return;
        }
        throw new Error(`Tool ${toolId} does not export mount()`);
      });
      console.info(`[VIA][tool] ${toolId} ${(global.performance.now() - start).toFixed(2)}ms`);
    } catch (error) {
      namespace.ui.withErrorBoundary(containerSelector, function toolError() {
        throw error;
      });
    }
  };
}(window));
