export interface UsageEvent {
  moduleId: string;
  action: string;
  complexity?: number;
  success?: boolean;
  timestamp: string;
}

export class UsageTracker {
  private events: UsageEvent[] = [];

  track(event: Omit<UsageEvent, 'timestamp'>): UsageEvent {
    const next: UsageEvent = {
      ...event,
      timestamp: new Date().toISOString(),
    };
    this.events.push(next);
    return next;
  }

  list(): UsageEvent[] {
    return [...this.events];
  }
}
