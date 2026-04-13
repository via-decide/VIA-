import { buildDecisionGraph } from './decision_graph';
import { buildDecisionTree } from './decision_tree';
import { buildTradeoffMatrix, type OptionVector, type WeightedCriterion } from './tradeoff_matrix';

export interface DecisionInput {
  problem: string;
  options: string[];
  criteria: WeightedCriterion[];
  scoring: Array<{ optionId: string; criteriaScores: Record<string, number> }>;
}

export function runDecisionEngine(input: DecisionInput) {
  const vectors: OptionVector[] = input.scoring.map((entry) => ({
    optionId: entry.optionId,
    scores: entry.criteriaScores,
  }));

  const matrix = buildTradeoffMatrix(input.criteria, vectors)
    .sort((a, b) => b.weightedScore - a.weightedScore);

  const strengths = matrix.map((row) => {
    const sorted = Object.entries(row.contributionByCriterion)
      .sort((a, b) => b[1] - a[1]);
    return {
      optionId: row.optionId,
      strengths: sorted.slice(0, 2).map(([criterionId]) => criterionId),
      weaknesses: sorted.slice(-2).map(([criterionId]) => criterionId),
    };
  });

  const tree = buildDecisionTree(input.problem, input.options);
  const graph = buildDecisionGraph(
    input.problem,
    input.options,
    input.criteria.map((criterion) => criterion.id)
  );

  return {
    framework: {
      problem: input.problem,
      options: input.options,
      criteria: input.criteria,
    },
    scorecard: matrix,
    tradeoffs: strengths,
    tree,
    graph,
    recommendation: matrix[0]?.optionId,
  };
}
