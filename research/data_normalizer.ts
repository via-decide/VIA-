import type { SourceDocument } from './source_fetcher';

export interface NormalizedSource {
  id: string;
  title: string;
  excerpt: string;
  sourceType: SourceDocument['sourceType'];
}

export function normalizeSources(documents: SourceDocument[]): NormalizedSource[] {
  return documents.map((document) => ({
    id: document.id,
    title: document.title.trim(),
    excerpt: document.body.trim().slice(0, 280),
    sourceType: document.sourceType,
  }));
}
