import { buildReasoningSummary } from './reasoning_summary';
import { buildTradeoffVisualization, type TradeoffBar } from './tradeoff_visualizer';

export interface DecisionReportInput {
  title: string;
  recommendation: string;
  reasoningSteps: string[];
  tradeoffs: TradeoffBar[];
}

export function generateDecisionReport(input: DecisionReportInput) {
  return {
    title: input.title,
    recommendation: input.recommendation,
    reasoningSummary: buildReasoningSummary(input.reasoningSteps),
    tradeoffVisualization: buildTradeoffVisualization(input.tradeoffs),
    generatedAt: new Date().toISOString(),
  };
}
