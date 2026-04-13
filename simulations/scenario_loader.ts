export interface SimulationScenario {
  id: string;
  initialize: () => void;
  update: (deltaMs: number) => void;
  teardown?: () => void;
}

export class ScenarioLoader {
  private scenarios = new Map<string, SimulationScenario>();

  register(scenario: SimulationScenario): void {
    this.scenarios.set(scenario.id, scenario);
  }

  get(id: string): SimulationScenario | undefined {
    return this.scenarios.get(id);
  }

  list(): SimulationScenario[] {
    return [...this.scenarios.values()];
  }
}
