function getEntrypointModule(moduleInstance) {
  if (!moduleInstance) return null;
  if (typeof moduleInstance.mount === 'function' || typeof moduleInstance.unmount === 'function') {
    return moduleInstance;
  }
  if (moduleInstance.default && (typeof moduleInstance.default.mount === 'function' || typeof moduleInstance.default.unmount === 'function')) {
    return moduleInstance.default;
  }
  return moduleInstance.default || moduleInstance;
}

async function loadStandaloneScript(moduleDef) {
  if (!moduleDef.entryPath) {
    throw new Error(`Surface ${moduleDef.name} is missing an entryPath for script loading.`);
  }

  const existingScript = document.querySelector(`script[data-micro-frontend="${moduleDef.name}"]`);
  if (existingScript) {
    return moduleDef.globalName ? window[moduleDef.globalName] : true;
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = moduleDef.entryPath;
    script.async = true;
    script.dataset.microFrontend = moduleDef.name;
    script.onload = () => resolve(moduleDef.globalName ? window[moduleDef.globalName] : true);
    script.onerror = () => reject(new Error(`Unable to load standalone surface: ${moduleDef.name}`));
    document.head.appendChild(script);
  });
}

export class SurfaceLoader {
  constructor(registry, sharedRuntime) {
    this.registry = registry;
    this.sharedRuntime = sharedRuntime;
    this.mountedSurfaces = new Map();
  }

  async mountSurface(name, target) {
    const moduleDef = this.registry.get(name);
    if (!moduleDef) {
      throw new Error(`Unknown micro frontend surface: ${name}`);
    }

    const mountTarget = typeof target === 'string'
      ? document.querySelector(target)
      : target || document.querySelector(moduleDef.mountSelector);

    if (!mountTarget) {
      return this.renderFallback(name, null, new Error(`Mount target not found for ${name}`));
    }

    if (this.mountedSurfaces.has(name)) {
      const existing = this.mountedSurfaces.get(name);
      if (existing.target === mountTarget) {
        return existing.instance;
      }
    }

    try {
      const loadedModule = moduleDef.format === 'script'
        ? await loadStandaloneScript(moduleDef)
        : await this.registry.load(name);

      const surfaceModule = getEntrypointModule(loadedModule);
      if (!surfaceModule) {
        throw new Error(`Surface ${name} did not provide a mountable module.`);
      }

      if (typeof surfaceModule.mount === 'function') {
        await surfaceModule.mount({
          name,
          target: mountTarget,
          moduleDef,
          registry: this.registry,
          runtime: this.sharedRuntime,
          loader: this
        });
      }

      this.mountedSurfaces.set(name, {
        target: mountTarget,
        instance: surfaceModule
      });
      this.sharedRuntime.emit('navigation', { surface: name, state: 'mounted' });
      return surfaceModule;
    } catch (error) {
      return this.renderFallback(name, mountTarget, error);
    }
  }

  async unmountSurface(name) {
    const mounted = this.mountedSurfaces.get(name);
    if (!mounted) {
      return false;
    }

    if (mounted.instance && typeof mounted.instance.unmount === 'function') {
      await mounted.instance.unmount({
        name,
        target: mounted.target,
        runtime: this.sharedRuntime,
        loader: this
      });
    }

    this.mountedSurfaces.delete(name);
    this.sharedRuntime.emit('navigation', { surface: name, state: 'unmounted' });
    return true;
  }

  async prefetchSurface(name) {
    const moduleDef = this.registry.get(name);
    if (!moduleDef) {
      return null;
    }

    try {
      const loadedModule = moduleDef.format === 'script'
        ? await loadStandaloneScript(moduleDef)
        : await this.registry.load(name);
      const surfaceModule = getEntrypointModule(loadedModule);
      if (surfaceModule && typeof surfaceModule.prefetch === 'function') {
        await surfaceModule.prefetch({
          name,
          moduleDef,
          registry: this.registry,
          runtime: this.sharedRuntime,
          loader: this
        });
      }
      return surfaceModule;
    } catch (error) {
      return this.renderFallback(name, document.querySelector(moduleDef.mountSelector), error, true);
    }
  }

  async swapSurface(currentName, nextName, target) {
    const current = this.mountedSurfaces.get(currentName);
    try {
      await this.unmountSurface(currentName);
      return await this.mountSurface(nextName, target || current?.target);
    } catch (error) {
      if (current && current.target) {
        await this.mountSurface(currentName, current.target);
      }
      throw error;
    }
  }

  renderFallback(name, target, error, silent = false) {
    this.sharedRuntime.emit('telemetry', {
      surface: name,
      level: 'error',
      message: error && error.message ? error.message : 'Unknown surface load error'
    });

    if (target && !silent) {
      target.dataset.surfaceError = name;
    }

    return {
      error,
      mount() {},
      unmount() {}
    };
  }
}
