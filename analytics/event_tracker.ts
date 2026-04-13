export interface AnalyticsEvent {
  type: string;
  module: string;
  payload?: Record<string, unknown>;
  timestamp: string;
}

export class EventTracker {
  private events: AnalyticsEvent[] = [];

  track(type: string, module: string, payload: Record<string, unknown> = {}): AnalyticsEvent {
    const event = {
      type,
      module,
      payload,
      timestamp: new Date().toISOString(),
    };
    this.events.push(event);
    return event;
  }

  list(): AnalyticsEvent[] {
    return [...this.events];
  }
}
