import { ViaRuntime, type RuntimeConfig } from './runtime';
import type { StateSnapshot } from './state_engine';

export async function bootstrapVIA<TState extends StateSnapshot>(
  config: RuntimeConfig<TState>
): Promise<ViaRuntime<TState>> {
  const runtime = new ViaRuntime(config);
  await runtime.bootstrap();
  await runtime.start();
  return runtime;
}
