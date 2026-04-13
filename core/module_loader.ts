export interface RuntimeModule<TModule = unknown> {
  id: string;
  version?: string;
  dependencies?: string[];
  factory: (loader: ModuleLoader) => Promise<TModule> | TModule;
}

export class ModuleLoader {
  private modules = new Map<string, RuntimeModule>();
  private instances = new Map<string, unknown>();

  register(module: RuntimeModule): void {
    if (this.modules.has(module.id)) {
      throw new Error(`Module already exists: ${module.id}`);
    }
    this.modules.set(module.id, module);
  }

  has(moduleId: string): boolean {
    return this.modules.has(moduleId);
  }

  async load<TModule = unknown>(moduleId: string): Promise<TModule> {
    if (this.instances.has(moduleId)) {
      return this.instances.get(moduleId) as TModule;
    }

    const module = this.modules.get(moduleId);
    if (!module) {
      throw new Error(`Runtime module not found: ${moduleId}`);
    }

    for (const dependency of module.dependencies ?? []) {
      await this.load(dependency);
    }

    const instance = await module.factory(this);
    this.instances.set(moduleId, instance);
    return instance as TModule;
  }

  list(): RuntimeModule[] {
    return [...this.modules.values()];
  }
}
