export class SurfacePrefetchCoordinator {
  constructor(options = {}) {
    this.loader = options.loader || null;
    this.runtime = options.runtime || null;
  }

  async prefetchSurface(name) {
    if (!name || !this.loader || typeof this.loader.prefetchSurface !== 'function') {
      if (this.runtime) {
        this.runtime.telemetry.track('surface_prefetch_skipped', { surfaceName: name || '', reason: 'missing_loader' });
      }
      return null;
    }

    try {
      const result = await this.loader.prefetchSurface(name);
      if (this.runtime) {
        this.runtime.telemetry.track('surface_prefetch', { surfaceName: name, ok: true });
      }
      return result;
    } catch (error) {
      if (this.runtime) {
        this.runtime.telemetry.track('surface_prefetch_failed', { surfaceName: name, message: error.message });
      }
      return null;
    }
  }

  async prefetchRelatedSurfaces(surfaceName, context = {}) {
    const related = [];
    const audience = String(context.audience || '').toLowerCase();
    const mode = String(context.mode || '').toLowerCase();

    if (surfaceName === 'feed_surface') related.push('discover_surface', 'agent_surface');
    if (surfaceName === 'story_surface') related.push('creator_surface', 'agent_surface');
    if (surfaceName === 'creator_surface') related.push('feed_surface', 'story_surface');
    if (surfaceName === 'agent_surface') related.push('feed_surface', 'discover_surface');
    if (audience.includes('creator') || mode.includes('draft')) related.push('creator_surface');
    if (mode.includes('route')) related.push('discover_surface');

    const unique = related.filter((name, index) => name && related.indexOf(name) === index && name !== surfaceName);
    const results = [];
    for (let index = 0; index < unique.length; index += 1) {
      const name = unique[index];
      results.push(await this.prefetchSurface(name));
    }
    return results;
  }

  shouldPrefetch(routeSuggestion) {
    const confidence = Number(routeSuggestion && routeSuggestion.confidence);
    return Number.isFinite(confidence) && confidence >= 0.74;
  }
}
