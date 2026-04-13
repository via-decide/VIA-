import { buildResearchContext } from './context_builder';
import { rankData } from './data_ranker';
import { fetchSources, type SourceDocument } from './source_fetcher';

export interface ResearchResult {
  sources: SourceDocument[];
  ranked: ReturnType<typeof rankData>;
  context: ReturnType<typeof buildResearchContext>;
}

export async function runResearchEngine(fetchers: Array<() => Promise<SourceDocument[]>>): Promise<ResearchResult> {
  const sources = await fetchSources(fetchers);
  const ranked = rankData(sources);
  const context = buildResearchContext(ranked);

  return {
    sources,
    ranked,
    context,
  };
}
