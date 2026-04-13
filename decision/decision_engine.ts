import { buildWeightedScores, type Criterion, type OptionScore } from './scoring_matrix';
import { analyzeTradeoffs } from './tradeoff_analyzer';
import { generateDecisionTree } from './decision_tree_generator';

export interface DecisionInput {
  problem: string;
  options: string[];
  criteria: Criterion[];
  scoring: OptionScore[];
}

export function runDecisionEngine(input: DecisionInput) {
  const scorecard = buildWeightedScores(input.criteria, input.scoring)
    .sort((a, b) => b.weightedScore - a.weightedScore);

  const tradeoffs = analyzeTradeoffs(input.criteria, input.scoring);
  const tree = generateDecisionTree(input.problem, input.options);

  return {
    framework: {
      problem: input.problem,
      options: input.options,
      criteria: input.criteria,
    },
    scorecard,
    tradeoffs,
    tree,
    recommendation: scorecard[0]?.optionId,
  };
}
