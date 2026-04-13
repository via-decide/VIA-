export type DecisionOutcomeClass = 'success' | 'partial_success' | 'failure';

export interface DecisionOutcomeRecord {
  decisionId: string;
  recommendationId: string;
  selectedOptionId: string;
  predictedQuality: number;
  actualQuality: number;
  outcomeClass: DecisionOutcomeClass;
  createdAt: string;
  metadata?: Record<string, unknown>;
}

export interface OutcomeTrackerConfig {
  enabled?: boolean;
  successThreshold?: number;
  partialThreshold?: number;
}

export class DecisionOutcomeTracker {
  private enabled: boolean;
  private successThreshold: number;
  private partialThreshold: number;
  private outcomes: DecisionOutcomeRecord[] = [];

  constructor(config: OutcomeTrackerConfig = {}) {
    this.enabled = config.enabled ?? true;
    this.successThreshold = config.successThreshold ?? 0.75;
    this.partialThreshold = config.partialThreshold ?? 0.45;
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  classifyOutcome(actualQuality: number): DecisionOutcomeClass {
    if (actualQuality >= this.successThreshold) return 'success';
    if (actualQuality >= this.partialThreshold) return 'partial_success';
    return 'failure';
  }

  logOutcome(input: Omit<DecisionOutcomeRecord, 'createdAt' | 'outcomeClass'>): DecisionOutcomeRecord | null {
    if (!this.enabled) {
      return null;
    }

    const outcome: DecisionOutcomeRecord = {
      ...input,
      outcomeClass: this.classifyOutcome(input.actualQuality),
      createdAt: new Date().toISOString(),
    };

    this.outcomes.push(outcome);
    return outcome;
  }

  comparePredictionVsReality(decisionId: string): { drift: number; records: DecisionOutcomeRecord[] } {
    const records = this.outcomes.filter((entry) => entry.decisionId === decisionId);
    const drift = records.reduce((sum, item) => sum + Math.abs(item.predictedQuality - item.actualQuality), 0);
    return { drift: records.length ? drift / records.length : 0, records };
  }

  listOutcomes(): DecisionOutcomeRecord[] {
    return [...this.outcomes];
  }
}
