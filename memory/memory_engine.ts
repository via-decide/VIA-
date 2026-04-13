import { ContextIndex } from './context_index';
import { DecisionHistory, type DecisionRecord } from './decision_history';
import { KnowledgeStore } from './knowledge_store';

export class MemoryEngine {
  private historyStore = new DecisionHistory();
  private contextIndex = new ContextIndex();
  private knowledgeStore = new KnowledgeStore();

  remember(entry: Omit<DecisionRecord, 'createdAt'>): DecisionRecord {
    const stored = this.historyStore.add(entry);
    this.contextIndex.index(stored.id, stored.tags ?? []);
    return stored;
  }

  recall(query: string, tag?: string): DecisionRecord[] {
    const matches = this.historyStore.search(query);
    if (!tag) return matches;

    const ids = new Set(this.contextIndex.find(tag));
    return matches.filter((record) => ids.has(record.id));
  }

  history(): DecisionRecord[] {
    return this.historyStore.list();
  }

  rememberKnowledge(key: string, value: string, source?: string) {
    return this.knowledgeStore.put(key, value, source);
  }

  readKnowledge(key: string) {
    return this.knowledgeStore.get(key);
  }
}
