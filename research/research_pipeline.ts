import { normalizeSources } from './data_normalizer';
import { fetchSources, type SourceDocument } from './source_fetcher';
import { rankSources } from './source_ranker';

export async function runResearchPipeline(
  fetchers: Array<() => Promise<SourceDocument[]>>
) {
  const rawSources = await fetchSources(fetchers);
  const normalized = normalizeSources(rawSources);
  const ranked = rankSources(normalized);

  return {
    rawSources,
    normalized,
    ranked,
  };
}
