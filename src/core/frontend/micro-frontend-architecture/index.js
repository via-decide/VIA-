import { MicroFrontendRegistry } from './MicroFrontendRegistry.js';
import { SurfaceLoader } from './SurfaceLoader.js';
import { SharedRuntime } from './SharedRuntime.js';
import { NavigationBridge } from './NavigationBridge.js';

function resolveEntryPath(entryPath) {
  return new URL(entryPath, import.meta.url).href;
}

export async function loadMicroFrontendConfig() {
  const configUrl = new URL('./micro-frontend-config.json', import.meta.url);
  const response = await fetch(configUrl.href, { cache: 'no-cache' });
  if (!response.ok) {
    throw new Error(`Unable to load micro frontend config: ${response.status}`);
  }
  return response.json();
}

export async function createMicroFrontendArchitecture(options = {}) {
  const config = options.config || await loadMicroFrontendConfig();
  const registry = options.registry || new MicroFrontendRegistry();
  const runtime = options.runtime || new SharedRuntime(options.runtimeOptions);
  const navigation = options.navigation || new NavigationBridge({
    routeMap: options.routeMap,
    openHandler: options.openHandler,
    baseUrl: options.baseUrl
  });
  const loader = options.loader || new SurfaceLoader(registry, runtime);

  runtime.navigation = navigation;

  (config.frontendSurfaceModules || []).forEach((surface) => {
    registry.register(surface.name, {
      ...surface,
      entryPath: resolveEntryPath(surface.entryPath)
    });
  });

  return {
    config,
    registry,
    loader,
    runtime,
    navigation
  };
}

export {
  MicroFrontendRegistry,
  SurfaceLoader,
  SharedRuntime,
  NavigationBridge
};
