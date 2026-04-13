export interface SourceDocument {
  id: string;
  title: string;
  body: string;
  sourceType: 'web' | 'api' | 'internal';
}

export async function fetchSources(fetchers: Array<() => Promise<SourceDocument[]>>): Promise<SourceDocument[]> {
  const results = await Promise.all(fetchers.map((fetcher) => fetcher()));
  return results.flat();
}
