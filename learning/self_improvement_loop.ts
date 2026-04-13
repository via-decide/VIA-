import type { CalibrationEngine, CalibrationSnapshot } from './calibration_engine';
import type { DecisionOutcomeTracker, DecisionOutcomeRecord } from './decision_outcome_tracker';
import type { FeedbackEngine, RecommendationFeedback } from './feedback_engine';
import type { PatternMiner, DiscoveredPattern } from './pattern_miner';
import type { PromptFeedbackStore, PromptFeedbackRecord } from './prompt_feedback_store';
import type { ReasoningEvaluation, ReasoningEvaluator } from './reasoning_evaluator';

export interface ImprovementLoopDependencies {
  feedbackEngine: FeedbackEngine;
  outcomeTracker: DecisionOutcomeTracker;
  reasoningEvaluator: ReasoningEvaluator;
  patternMiner: PatternMiner;
  calibrationEngine: CalibrationEngine;
  promptFeedbackStore: PromptFeedbackStore;
}

export interface ImprovementSnapshot {
  outcomes: DecisionOutcomeRecord[];
  feedback: RecommendationFeedback[];
  promptFeedback: PromptFeedbackRecord[];
  evaluations: ReasoningEvaluation[];
  patterns: DiscoveredPattern[];
  calibrations: CalibrationSnapshot[];
  createdAt: string;
}

export class SelfImprovementLoop {
  private enabled = true;

  constructor(private readonly deps: ImprovementLoopDependencies) {}

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  run(decisionId: string, evaluations: ReasoningEvaluation[]): ImprovementSnapshot | null {
    if (!this.enabled) {
      return null;
    }

    const feedback = this.deps.feedbackEngine.listFeedback(decisionId);
    const outcomes = this.deps.outcomeTracker.listOutcomes().filter((item) => item.decisionId === decisionId);
    const promptFeedback = this.deps.promptFeedbackStore.listByDecision(decisionId);

    const patterns = this.deps.patternMiner.mine(outcomes, feedback, evaluations);
    const calibrations = this.deps.calibrationEngine.calibrate(patterns);

    return {
      outcomes,
      feedback,
      promptFeedback,
      evaluations,
      patterns,
      calibrations,
      createdAt: new Date().toISOString(),
    };
  }
}
