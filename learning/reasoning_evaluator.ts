export interface ReasoningArtifact {
  decisionId: string;
  reasoningSteps: string[];
  evidenceReferences?: string[];
  tradeoffs?: string[];
  recommendationConfidence?: number;
}

export interface ReasoningEvaluation {
  decisionId: string;
  logicalConsistency: number;
  evidenceGrounding: number;
  tradeoffCompleteness: number;
  confidenceQuality: number;
  contradictionRate: number;
  overallScore: number;
  createdAt: string;
  metadata?: Record<string, unknown>;
}

export class ReasoningEvaluator {
  private enabled = true;

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  evaluate(artifact: ReasoningArtifact): ReasoningEvaluation | null {
    if (!this.enabled) {
      return null;
    }

    const steps = artifact.reasoningSteps.length;
    const contradictions = artifact.reasoningSteps.filter((step) => /however|but|contradict/i.test(step)).length;

    const logicalConsistency = Math.max(0, 1 - contradictions / Math.max(steps, 1));
    const evidenceGrounding = Math.min(1, (artifact.evidenceReferences?.length ?? 0) / Math.max(steps, 1));
    const tradeoffCompleteness = Math.min(1, (artifact.tradeoffs?.length ?? 0) / 3);
    const confidence = artifact.recommendationConfidence ?? 0.5;
    const confidenceQuality = 1 - Math.abs(confidence - ((logicalConsistency + evidenceGrounding) / 2));
    const contradictionRate = contradictions / Math.max(steps, 1);

    const overallScore = (
      logicalConsistency * 0.25
      + evidenceGrounding * 0.25
      + tradeoffCompleteness * 0.2
      + confidenceQuality * 0.2
      + (1 - contradictionRate) * 0.1
    );

    return {
      decisionId: artifact.decisionId,
      logicalConsistency,
      evidenceGrounding,
      tradeoffCompleteness,
      confidenceQuality,
      contradictionRate,
      overallScore,
      createdAt: new Date().toISOString(),
      metadata: { stepCount: steps },
    };
  }
}
