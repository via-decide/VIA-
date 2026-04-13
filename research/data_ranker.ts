import type { SourceDocument } from './source_fetcher';

export interface RankedSource extends SourceDocument {
  credibility: number;
}

const typeScore: Record<SourceDocument['sourceType'], number> = {
  internal: 0.95,
  api: 0.8,
  web: 0.65,
};

export function rankData(sources: SourceDocument[]): RankedSource[] {
  return sources
    .map((source) => ({
      ...source,
      credibility: typeScore[source.sourceType],
    }))
    .sort((a, b) => b.credibility - a.credibility);
}
