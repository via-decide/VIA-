export type ModuleFactory<T = unknown> = () => Promise<T> | T;

export interface ModuleDefinition<T = unknown> {
  id: string;
  version?: string;
  dependencies?: string[];
  factory: ModuleFactory<T>;
}

export class ModuleRegistry {
  private definitions = new Map<string, ModuleDefinition>();
  private instances = new Map<string, unknown>();

  register(definition: ModuleDefinition): void {
    if (this.definitions.has(definition.id)) {
      throw new Error(`Module already registered: ${definition.id}`);
    }
    this.definitions.set(definition.id, definition);
  }

  has(moduleId: string): boolean {
    return this.definitions.has(moduleId);
  }

  async resolve<T = unknown>(moduleId: string): Promise<T> {
    if (this.instances.has(moduleId)) {
      return this.instances.get(moduleId) as T;
    }

    const definition = this.definitions.get(moduleId);
    if (!definition) {
      throw new Error(`Module not found: ${moduleId}`);
    }

    for (const dependency of definition.dependencies ?? []) {
      await this.resolve(dependency);
    }

    const instance = await definition.factory();
    this.instances.set(moduleId, instance);
    return instance as T;
  }

  list(): ModuleDefinition[] {
    return [...this.definitions.values()];
  }
}
