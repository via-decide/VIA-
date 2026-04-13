import { ContextIndex } from './context_index';
import { getRelevantDecisions } from './decision_memory';
import { HistoryStore, type HistoryEntry } from './history_store';

export class MemoryEngine {
  private store = new HistoryStore();
  private index = new ContextIndex();

  remember(entry: Omit<HistoryEntry, 'createdAt'>): HistoryEntry {
    const stored = this.store.add(entry);
    this.index.index(stored);
    return stored;
  }

  recall(query: string, tag?: string): HistoryEntry[] {
    const entries = this.store.list();
    const relevant = getRelevantDecisions(entries, query);

    if (!tag) return relevant;

    const taggedIds = new Set(this.index.findByTag(tag));
    return relevant.filter((entry) => taggedIds.has(entry.id));
  }

  history(): HistoryEntry[] {
    return this.store.list();
  }
}
