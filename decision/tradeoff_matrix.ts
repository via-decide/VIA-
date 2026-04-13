export interface WeightedCriterion {
  id: string;
  label?: string;
  weight: number;
}

export interface OptionVector {
  optionId: string;
  scores: Record<string, number>;
}

export interface WeightedResult {
  optionId: string;
  weightedScore: number;
  contributionByCriterion: Record<string, number>;
}

export function buildTradeoffMatrix(criteria: WeightedCriterion[], options: OptionVector[]): WeightedResult[] {
  return options.map((option) => {
    const contributionByCriterion: Record<string, number> = {};
    let weightedScore = 0;

    for (const criterion of criteria) {
      const rawScore = option.scores[criterion.id] ?? 0;
      const contribution = rawScore * criterion.weight;
      contributionByCriterion[criterion.id] = contribution;
      weightedScore += contribution;
    }

    return {
      optionId: option.optionId,
      weightedScore,
      contributionByCriterion,
    };
  });
}
