import type { AnalyticsEvent } from './event_tracker';

export function analyzeDecisionPatterns(events: AnalyticsEvent[]) {
  return events.reduce<Record<string, number>>((acc, event) => {
    const key = `${event.module}:${event.type}`;
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {});
}
