export interface HistoryEntry {
  id: string;
  query: string;
  decision: string;
  createdAt: string;
  tags?: string[];
}

export class HistoryStore {
  private entries: HistoryEntry[] = [];

  add(entry: Omit<HistoryEntry, 'createdAt'>): HistoryEntry {
    const next = {
      ...entry,
      createdAt: new Date().toISOString(),
    };
    this.entries.push(next);
    return next;
  }

  list(): HistoryEntry[] {
    return [...this.entries];
  }
}
