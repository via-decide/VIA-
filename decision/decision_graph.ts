export interface DecisionNode {
  id: string;
  label: string;
  nodeType: 'problem' | 'option' | 'criterion' | 'insight';
}

export interface DecisionEdge {
  from: string;
  to: string;
  relationship: 'supports' | 'blocks' | 'depends_on' | 'evaluates';
}

export interface DecisionGraph {
  nodes: DecisionNode[];
  edges: DecisionEdge[];
}

export function buildDecisionGraph(problem: string, options: string[], criteria: string[]): DecisionGraph {
  const nodes: DecisionNode[] = [{ id: 'problem', label: problem, nodeType: 'problem' }];
  const edges: DecisionEdge[] = [];

  for (const option of options) {
    const optionId = `option:${option}`;
    nodes.push({ id: optionId, label: option, nodeType: 'option' });
    edges.push({ from: optionId, to: 'problem', relationship: 'supports' });
  }

  for (const criterion of criteria) {
    const criterionId = `criterion:${criterion}`;
    nodes.push({ id: criterionId, label: criterion, nodeType: 'criterion' });
    for (const option of options) {
      edges.push({ from: criterionId, to: `option:${option}`, relationship: 'evaluates' });
    }
  }

  return { nodes, edges };
}
