export interface RecommendationFeedback {
  decisionId: string;
  recommendationId: string;
  acceptedOptionId?: string;
  rejectedOptionIds?: string[];
  confidenceSignal?: number;
  satisfactionSignal?: number;
  explicitComment?: string;
  implicitSignals?: Record<string, number | boolean | string>;
  createdAt: string;
  metadata?: Record<string, unknown>;
}

export interface FeedbackEngineConfig {
  enabled?: boolean;
}

export class FeedbackEngine {
  private enabled: boolean;
  private feedbackLog: RecommendationFeedback[] = [];

  constructor(config: FeedbackEngineConfig = {}) {
    this.enabled = config.enabled ?? true;
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  recordFeedback(input: Omit<RecommendationFeedback, 'createdAt'>): RecommendationFeedback | null {
    if (!this.enabled) {
      return null;
    }

    const feedback: RecommendationFeedback = {
      ...input,
      createdAt: new Date().toISOString(),
    };

    this.feedbackLog.push(feedback);
    return feedback;
  }

  listFeedback(decisionId?: string): RecommendationFeedback[] {
    if (!decisionId) {
      return [...this.feedbackLog];
    }
    return this.feedbackLog.filter((entry) => entry.decisionId === decisionId);
  }

  buildCalibrationSignals(decisionId: string): Record<string, number> {
    const scoped = this.feedbackLog.filter((entry) => entry.decisionId === decisionId);
    if (!scoped.length) {
      return { confidence: 0.5, satisfaction: 0.5, acceptanceRate: 0 };
    }

    const confidence = scoped.reduce((sum, item) => sum + (item.confidenceSignal ?? 0.5), 0) / scoped.length;
    const satisfaction = scoped.reduce((sum, item) => sum + (item.satisfactionSignal ?? 0.5), 0) / scoped.length;
    const accepted = scoped.filter((item) => Boolean(item.acceptedOptionId)).length;

    return {
      confidence,
      satisfaction,
      acceptanceRate: accepted / scoped.length,
    };
  }
}
