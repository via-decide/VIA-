export type StateListener<TState> = (state: TState) => void;

export class StateContainer<TState extends Record<string, unknown>> {
  private state: TState;
  private listeners = new Set<StateListener<TState>>();

  constructor(initialState: TState) {
    this.state = Object.freeze({ ...initialState }) as TState;
  }

  getState(): TState {
    return this.state;
  }

  setState(updater: Partial<TState> | ((current: TState) => TState)): TState {
    const nextState = typeof updater === 'function'
      ? (updater as (current: TState) => TState)(this.state)
      : ({ ...this.state, ...updater } as TState);

    this.state = Object.freeze({ ...nextState }) as TState;
    for (const listener of this.listeners) {
      listener(this.state);
    }
    return this.state;
  }

  subscribe(listener: StateListener<TState>): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
}
