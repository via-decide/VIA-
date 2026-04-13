import type { UsageEvent } from './usage_tracker';

export interface DecisionPatternReport {
  byModule: Record<string, number>;
  averageComplexity: number;
  successRate: number;
}

export function analyzeDecisionPatterns(events: UsageEvent[]): DecisionPatternReport {
  const byModule = events.reduce<Record<string, number>>((acc, event) => {
    acc[event.moduleId] = (acc[event.moduleId] ?? 0) + 1;
    return acc;
  }, {});

  const complexities = events
    .map((event) => event.complexity)
    .filter((value): value is number => typeof value === 'number');

  const successes = events.filter((event) => event.success === true).length;

  return {
    byModule,
    averageComplexity: complexities.length
      ? complexities.reduce((sum, value) => sum + value, 0) / complexities.length
      : 0,
    successRate: events.length ? successes / events.length : 0,
  };
}
