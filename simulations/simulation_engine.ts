import type { PhysicsAdapter } from './physics_adapter';
import { ScenarioLoader } from './scenario_loader';

export class SimulationEngine {
  constructor(
    private scenarios: ScenarioLoader,
    private physics: PhysicsAdapter
  ) {}

  run(id: string, deltaMs: number): void {
    const scenario = this.scenarios.get(id);
    if (!scenario) {
      throw new Error(`Scenario not found: ${id}`);
    }

    scenario.initialize();
    this.physics.initialize();
    this.physics.step(deltaMs);
    scenario.update(deltaMs);
  }

  stop(id: string): void {
    const scenario = this.scenarios.get(id);
    scenario?.teardown?.();
    this.physics.reset?.();
  }
}
