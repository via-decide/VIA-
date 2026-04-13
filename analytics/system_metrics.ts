import type { UsageEvent } from './usage_tracker';

export interface SystemMetrics {
  totalEvents: number;
  uniqueModules: number;
  decisionComplexity: {
    min: number;
    max: number;
    avg: number;
  };
}

export function buildSystemMetrics(events: UsageEvent[]): SystemMetrics {
  const complexity = events
    .map((event) => event.complexity)
    .filter((value): value is number => typeof value === 'number');

  const totalComplexity = complexity.reduce((sum, value) => sum + value, 0);

  return {
    totalEvents: events.length,
    uniqueModules: new Set(events.map((event) => event.moduleId)).size,
    decisionComplexity: {
      min: complexity.length ? Math.min(...complexity) : 0,
      max: complexity.length ? Math.max(...complexity) : 0,
      avg: complexity.length ? totalComplexity / complexity.length : 0,
    },
  };
}
