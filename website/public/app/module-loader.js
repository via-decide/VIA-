(function attachModuleLoader(global) {
  'use strict';

  const VIA = global.VIA || (global.VIA = { core: {}, router: {}, state: {}, storage: {}, modules: {}, ui: {}, gestures: {} });

  const moduleManifest = {
    feed: './app/modules/feed.js',
    tools: './app/modules/tools.js',
    world: './app/modules/world.js',
    academy: './app/modules/academy.js'
  };

  const loaded = new Map();

  async function importModule(moduleName) {
    if (loaded.has(moduleName)) {
      return loaded.get(moduleName);
    }

    const source = moduleManifest[moduleName];
    if (!source) {
      throw new Error(`Unknown module: ${moduleName}`);
    }

    const pending = import(source);
    loaded.set(moduleName, pending);
    return pending;
  }

  async function mountModule(nextName, containerSelector) {
    const host = document.querySelector(containerSelector);
    if (!host) {
      return;
    }

    const previousModule = VIA.state.get('activeModule', null);
    if (previousModule && previousModule.name !== nextName && typeof previousModule.api.destroy === 'function') {
      VIA.core.withBoundary(`${previousModule.name}:destroy`, function destroyModule() {
        previousModule.api.destroy();
      });
    }

    host.innerHTML = '<section class="via-loading">Loading module…</section>';

    const imported = await importModule(nextName);
    const api = imported.default || imported;

    if (typeof api.init === 'function' && !api.__initialized) {
      VIA.core.withBoundary(`${nextName}:init`, function initModule() {
        api.init(VIA);
        api.__initialized = true;
      });
    }

    VIA.core.withBoundary(`${nextName}:mount`, function mountWithBoundary() {
      host.innerHTML = '';
      api.mount(host, VIA);
    }, function moduleFallback() {
      host.innerHTML = `<section><h2>${nextName}</h2><p>Module crashed safely and was isolated.</p></section>`;
    });

    VIA.state.set('activeModule', { name: nextName, api: api });
  }

  VIA.modules.manifest = moduleManifest;
  VIA.modules.load = mountModule;
}(window));
