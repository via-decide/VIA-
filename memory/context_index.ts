import type { HistoryEntry } from './history_store';

export class ContextIndex {
  private byTag = new Map<string, Set<string>>();

  index(entry: HistoryEntry): void {
    for (const tag of entry.tags ?? []) {
      if (!this.byTag.has(tag)) {
        this.byTag.set(tag, new Set());
      }
      this.byTag.get(tag)?.add(entry.id);
    }
  }

  findByTag(tag: string): string[] {
    return [...(this.byTag.get(tag) ?? new Set())];
  }
}
