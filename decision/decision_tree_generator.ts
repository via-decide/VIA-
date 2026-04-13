export interface DecisionTreeNode {
  id: string;
  label: string;
  children?: DecisionTreeNode[];
}

export interface DecisionTree {
  root: DecisionTreeNode;
}

export function generateDecisionTree(problem: string, options: string[]): DecisionTree {
  return {
    root: {
      id: 'root',
      label: problem,
      children: options.map((option, index) => ({
        id: `option-${index + 1}`,
        label: option,
      })),
    },
  };
}
