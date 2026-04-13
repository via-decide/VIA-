export interface Criterion {
  id: string;
  weight: number;
}

export interface OptionScore {
  optionId: string;
  criteriaScores: Record<string, number>;
}

export function buildWeightedScores(criteria: Criterion[], options: OptionScore[]) {
  return options.map((option) => {
    const weightedScore = criteria.reduce((sum, criterion) => {
      const score = option.criteriaScores[criterion.id] ?? 0;
      return sum + score * criterion.weight;
    }, 0);

    return {
      optionId: option.optionId,
      weightedScore,
    };
  });
}
