import { ToolRegistry, type ViaTool } from './tool_registry';

export async function loadTools(
  factories: Array<() => Promise<ViaTool> | ViaTool>,
  registry: ToolRegistry
): Promise<ViaTool[]> {
  const loaded: ViaTool[] = [];

  for (const factory of factories) {
    const tool = await factory();
    registry.register(tool);
    loaded.push(tool);
  }

  return loaded;
}
