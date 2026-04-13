export interface PhysicsAdapter {
  initialize: () => void;
  step: (deltaMs: number) => void;
  reset?: () => void;
}

export function createNoopPhysicsAdapter(): PhysicsAdapter {
  return {
    initialize: () => undefined,
    step: () => undefined,
    reset: () => undefined,
  };
}
