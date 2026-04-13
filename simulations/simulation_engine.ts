import type { PhysicsAdapter } from './physics_adapter';
import { SimulationRegistry } from './simulation_registry';

export class SimulationEngine {
  constructor(
    private registry: SimulationRegistry,
    private physics: PhysicsAdapter
  ) {}

  run(id: string, deltaMs: number): void {
    const scenario = this.registry.get(id);
    if (!scenario) {
      throw new Error(`Scenario not found: ${id}`);
    }

    scenario.initialize();
    this.physics.initialize();

    this.physics.step(deltaMs);
    scenario.update(deltaMs);
  }
}
