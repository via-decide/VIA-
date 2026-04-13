export interface ViaTool {
  id: string;
  version: string;
  activate: () => Promise<void> | void;
}

export class ToolRegistry {
  private tools = new Map<string, ViaTool>();

  register(tool: ViaTool): void {
    this.tools.set(tool.id, tool);
  }

  get(toolId: string): ViaTool | undefined {
    return this.tools.get(toolId);
  }

  list(): ViaTool[] {
    return [...this.tools.values()];
  }
}
