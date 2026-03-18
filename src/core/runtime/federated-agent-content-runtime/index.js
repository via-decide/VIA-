import { FederatedRuntime } from './FederatedRuntime.js';
import { SurfaceAgentBridge } from './SurfaceAgentBridge.js';
import { SurfaceContentBridge } from './SurfaceContentBridge.js';
import { AgentContentOrchestrator } from './AgentContentOrchestrator.js';
import { SurfacePrefetchCoordinator } from './SurfacePrefetchCoordinator.js';
import { IntegratedTelemetryTracker } from './IntegratedTelemetryTracker.js';

let runtimeSingletonPromise = null;

export async function loadRuntimeConfig() {
  const response = await fetch(new URL('./runtime-config.json', import.meta.url), { cache: 'no-cache' });
  if (!response.ok) {
    throw new Error(`Unable to load federated runtime config: ${response.status}`);
  }
  return response.json();
}

export async function createFederatedAgentContentRuntime(options = {}) {
  if (options.singleton !== false && runtimeSingletonPromise) {
    return runtimeSingletonPromise;
  }

  const factory = (async () => {
    const config = options.config || await loadRuntimeConfig();
    const runtime = new FederatedRuntime(config, options.deps || {});
    if (options.bootstrap !== false) {
      await runtime.bootstrap();
    }

    if (typeof window !== 'undefined') {
      const facade = {
        bootstrap: () => runtime.bootstrap(),
        getSnapshot: () => runtime.getSnapshot(),
        emit: (eventName, payload) => runtime.emit(eventName, payload),
        mountSurface: (name, target, meta) => runtime.mountSurface(name, target, meta),
        handoffToAgent: (payload) => runtime.handoffToAgent(payload),
        handoffToContent: (payload) => runtime.handoffToContent(payload),
        runtime
      };
      window.VIAFederatedRuntime = facade;
    }

    return runtime;
  })();

  if (options.singleton !== false) {
    runtimeSingletonPromise = factory;
  }

  return factory;
}

if (typeof window !== 'undefined' && !window.VIAFederatedRuntime) {
  window.VIAFederatedRuntime = {
    bootstrap: async () => {
      const runtime = await createFederatedAgentContentRuntime();
      return runtime;
    },
    getSnapshot: () => null,
    emit: () => null,
    mountSurface: () => Promise.resolve(null),
    handoffToAgent: () => Promise.resolve(null),
    handoffToContent: () => null
  };
}

export {
  FederatedRuntime,
  SurfaceAgentBridge,
  SurfaceContentBridge,
  AgentContentOrchestrator,
  SurfacePrefetchCoordinator,
  IntegratedTelemetryTracker
};
