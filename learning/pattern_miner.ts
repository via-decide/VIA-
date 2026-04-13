import type { DecisionOutcomeRecord } from './decision_outcome_tracker';
import type { RecommendationFeedback } from './feedback_engine';
import type { ReasoningEvaluation } from './reasoning_evaluator';

export interface DiscoveredPattern {
  key: string;
  frequency: number;
  successRate: number;
  signal: 'preference_trend' | 'reasoning_failure' | 'high_performing_strategy' | 'recurring_structure';
  metadata?: Record<string, unknown>;
}

export class PatternMiner {
  private enabled = true;

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  mine(outcomes: DecisionOutcomeRecord[], feedback: RecommendationFeedback[], evaluations: ReasoningEvaluation[]): DiscoveredPattern[] {
    if (!this.enabled) {
      return [];
    }

    const patterns: DiscoveredPattern[] = [];

    const acceptedOptions = feedback
      .map((item) => item.acceptedOptionId)
      .filter((value): value is string => Boolean(value));

    const optionCounts = new Map<string, number>();
    for (const option of acceptedOptions) {
      optionCounts.set(option, (optionCounts.get(option) ?? 0) + 1);
    }

    for (const [option, frequency] of optionCounts.entries()) {
      patterns.push({
        key: `accepted_option:${option}`,
        frequency,
        successRate: Math.min(1, frequency / Math.max(feedback.length, 1)),
        signal: 'preference_trend',
      });
    }

    const failures = outcomes.filter((entry) => entry.outcomeClass === 'failure').length;
    if (failures > 0) {
      patterns.push({
        key: 'reasoning_failure:global',
        frequency: failures,
        successRate: 1 - failures / Math.max(outcomes.length, 1),
        signal: 'reasoning_failure',
      });
    }

    const highPerforming = evaluations.filter((entry) => entry.overallScore >= 0.8).length;
    if (highPerforming > 0) {
      patterns.push({
        key: 'strategy:high_performing_reasoning',
        frequency: highPerforming,
        successRate: highPerforming / Math.max(evaluations.length, 1),
        signal: 'high_performing_strategy',
      });
    }

    patterns.push({
      key: 'structure:decision_cycle',
      frequency: Math.min(outcomes.length, feedback.length, evaluations.length),
      successRate: outcomes.filter((entry) => entry.outcomeClass === 'success').length / Math.max(outcomes.length, 1),
      signal: 'recurring_structure',
    });

    return patterns;
  }
}
