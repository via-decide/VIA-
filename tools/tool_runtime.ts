import { ToolRegistry } from './tool_registry';

export class ToolRuntime {
  constructor(private registry: ToolRegistry) {}

  async activate(toolId: string): Promise<void> {
    const tool = this.registry.get(toolId);
    if (!tool) {
      throw new Error(`Tool not registered: ${toolId}`);
    }
    await tool.activate();
  }

  async activateAll(): Promise<void> {
    for (const tool of this.registry.list()) {
      await tool.activate();
    }
  }

  async run(toolId: string, input?: unknown): Promise<unknown> {
    const tool = this.registry.get(toolId);
    if (!tool) {
      throw new Error(`Tool not registered: ${toolId}`);
    }
    if (!tool.execute) {
      throw new Error(`Tool has no runtime executor: ${toolId}`);
    }
    return await tool.execute(input);
  }
}
