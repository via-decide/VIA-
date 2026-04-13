import type { AnalyticsEvent } from './event_tracker';

export function summarizeUsage(events: AnalyticsEvent[]) {
  const moduleCounts = events.reduce<Record<string, number>>((acc, event) => {
    acc[event.module] = (acc[event.module] ?? 0) + 1;
    return acc;
  }, {});

  return {
    totalEvents: events.length,
    moduleCounts,
  };
}
