import type { Criterion, OptionScore } from './scoring_matrix';

export interface TradeoffReport {
  optionId: string;
  strengths: string[];
  weaknesses: string[];
}

export function analyzeTradeoffs(criteria: Criterion[], options: OptionScore[]): TradeoffReport[] {
  return options.map((option) => {
    const strengths: string[] = [];
    const weaknesses: string[] = [];

    for (const criterion of criteria) {
      const score = option.criteriaScores[criterion.id] ?? 0;
      if (score >= 7) strengths.push(criterion.id);
      if (score <= 4) weaknesses.push(criterion.id);
    }

    return {
      optionId: option.optionId,
      strengths,
      weaknesses,
    };
  });
}
