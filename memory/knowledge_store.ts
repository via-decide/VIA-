export interface KnowledgeEntry {
  key: string;
  value: string;
  source?: string;
  updatedAt: string;
}

export class KnowledgeStore {
  private entries = new Map<string, KnowledgeEntry>();

  put(key: string, value: string, source?: string): KnowledgeEntry {
    const entry: KnowledgeEntry = {
      key,
      value,
      source,
      updatedAt: new Date().toISOString(),
    };
    this.entries.set(key, entry);
    return entry;
  }

  get(key: string): KnowledgeEntry | undefined {
    return this.entries.get(key);
  }

  all(): KnowledgeEntry[] {
    return [...this.entries.values()];
  }
}
