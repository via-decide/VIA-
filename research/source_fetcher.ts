export interface SourceDocument {
  id: string;
  title: string;
  body: string;
  sourceType: 'web' | 'api' | 'internal';
  url?: string;
  retrievedAt?: string;
}

export async function fetchSources(fetchers: Array<() => Promise<SourceDocument[]>>): Promise<SourceDocument[]> {
  const collections = await Promise.all(fetchers.map((fetcher) => fetcher()));
  return collections.flat().map((document) => ({
    ...document,
    retrievedAt: document.retrievedAt ?? new Date().toISOString(),
  }));
}
