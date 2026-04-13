import type { NormalizedSource } from './data_normalizer';

const reliabilityByType: Record<NormalizedSource['sourceType'], number> = {
  internal: 0.95,
  api: 0.8,
  web: 0.65,
};

export function rankSources(sources: NormalizedSource[]) {
  return sources
    .map((source) => ({
      ...source,
      reliability: reliabilityByType[source.sourceType],
    }))
    .sort((a, b) => b.reliability - a.reliability);
}
