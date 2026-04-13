import { ModuleRegistry } from './module_registry';
import { RouterEngine } from './router_engine';
import { SessionManager } from './session_manager';
import { StateContainer } from './state_container';

export interface BootstrapConfig<TState extends Record<string, unknown>> {
  initialState: TState;
  modules?: Array<{
    id: string;
    dependencies?: string[];
    factory: () => unknown | Promise<unknown>;
  }>;
}

export interface ViaSystem<TState extends Record<string, unknown>> {
  registry: ModuleRegistry;
  router: RouterEngine;
  sessions: SessionManager;
  state: StateContainer<TState>;
}

export async function bootstrapSystem<TState extends Record<string, unknown>>(
  config: BootstrapConfig<TState>
): Promise<ViaSystem<TState>> {
  const registry = new ModuleRegistry();
  const router = new RouterEngine();
  const sessions = new SessionManager();
  const state = new StateContainer<TState>(config.initialState);

  for (const moduleDef of config.modules ?? []) {
    registry.register(moduleDef);
  }

  for (const moduleDef of config.modules ?? []) {
    await registry.resolve(moduleDef.id);
  }

  return { registry, router, sessions, state };
}
