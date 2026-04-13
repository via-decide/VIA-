import { ModuleLoader, type RuntimeModule } from './module_loader';
import { Router, type RuntimeRequest } from './router';
import { StateEngine, type StateSnapshot, type StateUpdater } from './state_engine';

export interface RuntimeConfig<TState extends StateSnapshot> {
  appId: string;
  initialState: TState;
  modules?: RuntimeModule[];
}

export class ViaRuntime<TState extends StateSnapshot> {
  readonly appId: string;
  readonly startedAt: string;
  readonly loader: ModuleLoader;
  readonly router: Router;
  readonly state: StateEngine<TState>;
  private lifecycle: 'created' | 'bootstrapped' | 'running' | 'stopped' = 'created';

  constructor(config: RuntimeConfig<TState>) {
    this.appId = config.appId;
    this.startedAt = new Date().toISOString();
    this.loader = new ModuleLoader();
    this.router = new Router();
    this.state = new StateEngine<TState>(config.initialState);

    for (const module of config.modules ?? []) {
      this.loader.register(module);
    }
  }

  get status(): string {
    return this.lifecycle;
  }

  async bootstrap(): Promise<void> {
    if (this.lifecycle !== 'created') return;
    for (const module of this.loader.list()) {
      await this.loader.load(module.id);
    }
    this.lifecycle = 'bootstrapped';
  }

  async start(): Promise<void> {
    if (this.lifecycle === 'created') {
      await this.bootstrap();
    }
    this.lifecycle = 'running';
  }

  stop(): void {
    this.lifecycle = 'stopped';
  }

  updateState(update: StateUpdater<TState>): TState {
    return this.state.update(update);
  }

  dispatch<TPayload = unknown, TResult = unknown>(request: RuntimeRequest<TPayload>): Promise<TResult> {
    return this.router.route<TPayload, TResult>(request);
  }
}
