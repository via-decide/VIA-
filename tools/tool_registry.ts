export interface ToolPermission {
  id: string;
  description?: string;
}

export interface ViaTool {
  id: string;
  name: string;
  version: string;
  permissions?: ToolPermission[];
  activate: () => Promise<void> | void;
  execute?: (input?: unknown) => Promise<unknown> | unknown;
}

export class ToolRegistry {
  private tools = new Map<string, ViaTool>();

  register(tool: ViaTool): void {
    this.tools.set(tool.id, tool);
  }

  discover(ids?: string[]): ViaTool[] {
    const all = [...this.tools.values()];
    if (!ids?.length) return all;
    const wanted = new Set(ids);
    return all.filter((tool) => wanted.has(tool.id));
  }

  get(toolId: string): ViaTool | undefined {
    return this.tools.get(toolId);
  }

  list(): ViaTool[] {
    return [...this.tools.values()];
  }
}
