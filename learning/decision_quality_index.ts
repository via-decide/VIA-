export interface DecisionQualityComponents {
  reasoningQuality: number;
  userSatisfaction: number;
  outcomeCorrectness: number;
  evidenceQuality: number;
  tradeoffCoverage: number;
}

export interface DecisionQualityScore {
  decisionId: string;
  score: number;
  components: DecisionQualityComponents;
  createdAt: string;
  metadata?: Record<string, unknown>;
}

export class DecisionQualityIndex {
  private enabled = true;
  private index: DecisionQualityScore[] = [];

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  compute(decisionId: string, components: DecisionQualityComponents): DecisionQualityScore | null {
    if (!this.enabled) {
      return null;
    }

    const score = (
      components.reasoningQuality * 0.25
      + components.userSatisfaction * 0.2
      + components.outcomeCorrectness * 0.25
      + components.evidenceQuality * 0.15
      + components.tradeoffCoverage * 0.15
    );

    const result: DecisionQualityScore = {
      decisionId,
      score,
      components,
      createdAt: new Date().toISOString(),
    };

    this.index.push(result);
    return result;
  }

  list(): DecisionQualityScore[] {
    return [...this.index];
  }
}
