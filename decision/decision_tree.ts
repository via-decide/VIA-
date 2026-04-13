export interface DecisionBranch {
  id: string;
  label: string;
  rationale?: string;
  children?: DecisionBranch[];
}

export interface DecisionTree {
  root: DecisionBranch;
}

export function buildDecisionTree(problem: string, options: string[], rationale?: Record<string, string>): DecisionTree {
  return {
    root: {
      id: 'decision-root',
      label: problem,
      children: options.map((option, index) => ({
        id: `branch-${index + 1}`,
        label: option,
        rationale: rationale?.[option],
      })),
    },
  };
}
