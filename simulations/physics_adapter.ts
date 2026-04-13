export interface PhysicsAdapter {
  initialize: () => void;
  step: (deltaMs: number) => void;
}

export function createNoopPhysicsAdapter(): PhysicsAdapter {
  return {
    initialize: () => undefined,
    step: () => undefined,
  };
}
