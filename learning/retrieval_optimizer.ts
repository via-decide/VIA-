export interface RetrievalMemoryEntry {
  id: string;
  content: string;
  tags?: string[];
  utilityScore?: number;
  relevanceScore?: number;
  metadata?: Record<string, unknown>;
}

export interface RankedRetrievalEntry extends RetrievalMemoryEntry {
  rankingScore: number;
}

export class RetrievalOptimizer {
  private enabled = true;

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  rank(entries: RetrievalMemoryEntry[], contextQuery: string): RankedRetrievalEntry[] {
    if (!this.enabled) {
      return entries.map((entry) => ({ ...entry, rankingScore: entry.relevanceScore ?? 0 }));
    }

    const query = contextQuery.toLowerCase();
    return entries
      .map((entry) => {
        const lexicalMatch = entry.content.toLowerCase().includes(query) ? 1 : 0;
        const tagMatch = (entry.tags ?? []).some((tag) => query.includes(tag.toLowerCase())) ? 1 : 0;
        const relevance = entry.relevanceScore ?? 0.5;
        const utility = entry.utilityScore ?? 0.5;
        const rankingScore = lexicalMatch * 0.35 + tagMatch * 0.15 + relevance * 0.25 + utility * 0.25;
        return { ...entry, rankingScore };
      })
      .sort((a, b) => b.rankingScore - a.rankingScore);
  }

  demoteLowValue(entries: RankedRetrievalEntry[], threshold = 0.35): RankedRetrievalEntry[] {
    return entries.filter((entry) => entry.rankingScore >= threshold);
  }
}
