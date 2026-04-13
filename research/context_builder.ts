import type { RankedSource } from './data_ranker';

export interface ResearchContext {
  summary: string;
  highlights: string[];
}

export function buildResearchContext(sources: RankedSource[], limit = 5): ResearchContext {
  const top = sources.slice(0, limit);
  return {
    summary: `Built from ${top.length} ranked sources`,
    highlights: top.map((source) => `${source.title} (${Math.round(source.credibility * 100)}%)`),
  };
}
