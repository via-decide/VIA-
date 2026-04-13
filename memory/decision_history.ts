export interface DecisionRecord {
  id: string;
  query: string;
  recommendation: string;
  reasoningSteps: string[];
  tags?: string[];
  createdAt: string;
}

export class DecisionHistory {
  private records: DecisionRecord[] = [];

  add(record: Omit<DecisionRecord, 'createdAt'>): DecisionRecord {
    const next: DecisionRecord = { ...record, createdAt: new Date().toISOString() };
    this.records.push(next);
    return next;
  }

  list(): DecisionRecord[] {
    return [...this.records];
  }

  search(query: string): DecisionRecord[] {
    const normalized = query.toLowerCase();
    return this.records.filter((record) =>
      record.query.toLowerCase().includes(normalized)
      || record.recommendation.toLowerCase().includes(normalized)
      || record.reasoningSteps.some((step) => step.toLowerCase().includes(normalized))
      || (record.tags ?? []).some((tag) => tag.toLowerCase().includes(normalized))
    );
  }
}
