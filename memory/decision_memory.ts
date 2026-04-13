import type { HistoryEntry } from './history_store';

export function getRelevantDecisions(entries: HistoryEntry[], query: string): HistoryEntry[] {
  const normalized = query.toLowerCase();
  return entries.filter((entry) => {
    return entry.query.toLowerCase().includes(normalized)
      || entry.decision.toLowerCase().includes(normalized)
      || (entry.tags ?? []).some((tag) => tag.toLowerCase().includes(normalized));
  });
}
