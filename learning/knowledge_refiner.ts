export interface KnowledgeEntry {
  id: string;
  statement: string;
  confidence: number;
  tags?: string[];
  metadata?: Record<string, unknown>;
}

export interface KnowledgeRefinement {
  action: 'merge' | 'strengthen' | 'mark_weak';
  targetIds: string[];
  payload: Record<string, unknown>;
  createdAt: string;
}

export class KnowledgeRefiner {
  private enabled = true;
  private refinements: KnowledgeRefinement[] = [];

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  refine(entries: KnowledgeEntry[]): KnowledgeRefinement[] {
    if (!this.enabled) {
      return [];
    }

    const actions: KnowledgeRefinement[] = [];
    const seen = new Map<string, KnowledgeEntry[]>();

    for (const entry of entries) {
      const normalized = entry.statement.trim().toLowerCase();
      const bucket = seen.get(normalized) ?? [];
      bucket.push(entry);
      seen.set(normalized, bucket);
    }

    for (const group of seen.values()) {
      if (group.length > 1) {
        actions.push(this.addRefinement('merge', group.map((entry) => entry.id), { reason: 'redundant_entries' }));
      }

      const strong = group.filter((entry) => entry.confidence >= 0.8);
      if (strong.length) {
        actions.push(this.addRefinement('strengthen', strong.map((entry) => entry.id), { reason: 'high_signal_knowledge' }));
      }

      const weak = group.filter((entry) => entry.confidence < 0.4);
      if (weak.length) {
        actions.push(this.addRefinement('mark_weak', weak.map((entry) => entry.id), { reason: 'low_confidence_or_misleading' }));
      }
    }

    return actions;
  }

  listRefinements(): KnowledgeRefinement[] {
    return [...this.refinements];
  }

  private addRefinement(action: KnowledgeRefinement['action'], targetIds: string[], payload: Record<string, unknown>): KnowledgeRefinement {
    const record: KnowledgeRefinement = { action, targetIds, payload, createdAt: new Date().toISOString() };
    this.refinements.push(record);
    return record;
  }
}
