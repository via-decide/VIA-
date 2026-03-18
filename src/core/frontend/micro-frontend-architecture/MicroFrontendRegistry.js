const VALID_LOAD_STATUSES = new Set([
  'registered',
  'loading',
  'loaded',
  'unloaded',
  'error'
]);

function normalizeModuleDefinition(name, moduleDef = {}) {
  return {
    name,
    entryPath: moduleDef.entryPath || '',
    mountSelector: moduleDef.mountSelector || 'body',
    loadingStrategy: moduleDef.loadingStrategy || 'lazy',
    dependencies: Array.isArray(moduleDef.dependencies) ? moduleDef.dependencies.slice() : [],
    loadStatus: VALID_LOAD_STATUSES.has(moduleDef.loadStatus) ? moduleDef.loadStatus : 'registered',
    loader: typeof moduleDef.loader === 'function' ? moduleDef.loader : null,
    format: moduleDef.format || 'module',
    globalName: moduleDef.globalName || '',
    meta: moduleDef.meta && typeof moduleDef.meta === 'object' ? { ...moduleDef.meta } : {},
    module: moduleDef.module || null,
    error: null
  };
}

function getEntrypointModule(loadedModule) {
  if (!loadedModule) return null;
  if (typeof loadedModule.mount === 'function' || typeof loadedModule.unmount === 'function') {
    return loadedModule;
  }
  if (loadedModule.default && (typeof loadedModule.default.mount === 'function' || typeof loadedModule.default.unmount === 'function')) {
    return loadedModule.default;
  }
  return loadedModule.default || loadedModule;
}

export class MicroFrontendRegistry {
  constructor() {
    this.modules = new Map();
  }

  register(name, moduleDef = {}) {
    if (!name || typeof name !== 'string') {
      throw new Error('MicroFrontendRegistry.register(name, moduleDef) requires a module name.');
    }

    const existing = this.modules.get(name);
    const normalized = normalizeModuleDefinition(name, {
      ...(existing || {}),
      ...moduleDef,
      module: existing?.module || moduleDef.module || null
    });

    this.modules.set(name, normalized);
    return normalized;
  }

  get(name) {
    return this.modules.get(name) || null;
  }

  getAll() {
    return Array.from(this.modules.values()).map((moduleDef) => ({ ...moduleDef }));
  }

  async load(name) {
    const moduleDef = this.get(name);
    if (!moduleDef) {
      throw new Error(`Unknown micro frontend surface: ${name}`);
    }

    if (moduleDef.module && moduleDef.loadStatus === 'loaded') {
      return moduleDef.module;
    }

    moduleDef.loadStatus = 'loading';
    moduleDef.error = null;

    try {
      for (const dependencyName of moduleDef.dependencies) {
        if (this.modules.has(dependencyName)) {
          await this.load(dependencyName);
        }
      }

      const loadedModule = moduleDef.loader
        ? await moduleDef.loader(moduleDef, this)
        : await import(moduleDef.entryPath);

      moduleDef.module = getEntrypointModule(loadedModule);
      moduleDef.loadStatus = 'loaded';
      return moduleDef.module;
    } catch (error) {
      moduleDef.loadStatus = 'error';
      moduleDef.error = error;
      throw error;
    }
  }

  unload(name) {
    const moduleDef = this.get(name);
    if (!moduleDef) {
      return false;
    }

    moduleDef.module = null;
    moduleDef.error = null;
    moduleDef.loadStatus = 'unloaded';
    return true;
  }

  isLoaded(name) {
    const moduleDef = this.get(name);
    return Boolean(moduleDef && moduleDef.loadStatus === 'loaded' && moduleDef.module);
  }
}
