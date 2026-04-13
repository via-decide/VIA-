export type StateSnapshot = Record<string, unknown>;
export type StateUpdater<TState extends StateSnapshot> = Partial<TState> | ((current: TState) => TState);
export type StateSubscription<TState extends StateSnapshot> = (state: TState, previous: TState) => void;

export class StateEngine<TState extends StateSnapshot> {
  private state: TState;
  private subscribers = new Set<StateSubscription<TState>>();

  constructor(initialState: TState) {
    this.state = Object.freeze({ ...initialState }) as TState;
  }

  getState(): TState {
    return this.state;
  }

  update(update: StateUpdater<TState>): TState {
    const previous = this.state;
    const nextState = typeof update === 'function'
      ? (update as (current: TState) => TState)(this.state)
      : ({ ...this.state, ...update } as TState);

    this.state = Object.freeze({ ...nextState }) as TState;
    for (const subscriber of this.subscribers) {
      subscriber(this.state, previous);
    }
    return this.state;
  }

  subscribe(subscriber: StateSubscription<TState>): () => void {
    this.subscribers.add(subscriber);
    return () => this.subscribers.delete(subscriber);
  }
}
