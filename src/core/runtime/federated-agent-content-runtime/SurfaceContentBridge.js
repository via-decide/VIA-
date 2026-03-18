function toArray(value) {
  return Array.isArray(value) ? value : [];
}

function clone(value, fallback = null) {
  try {
    return JSON.parse(JSON.stringify(value));
  } catch (_error) {
    return fallback;
  }
}

export class SurfaceContentBridge {
  constructor(options = {}) {
    this.runtime = options.runtime || null;
    this.contentCore = options.contentCore || null;
  }

  ingestLongform(surfaceName, input) {
    const payload = input && typeof input === 'object' ? input : { body: String(input || '') };
    const parser = this.contentCore && this.contentCore.parser;
    const registry = this.contentCore && this.contentCore.registry;

    let parsed = null;
    if (this.contentCore && typeof this.contentCore.parseAndRegister === 'function') {
      parsed = this.contentCore.parseAndRegister(payload);
    } else if (parser && typeof parser.parseLongform === 'function') {
      parsed = parser.parseLongform(payload);
      if (registry && typeof registry.registerBatch === 'function' && parsed && Array.isArray(parsed.units)) {
        registry.registerBatch(parsed.units);
      }
    }

    if (!parsed) {
      const body = String(payload.body || payload.text || payload.idea || '').trim();
      parsed = {
        meta: {
          title: payload.title || `${surfaceName} input`,
          surface: surfaceName,
          origin: payload.origin || 'agent_generated'
        },
        units: [
          { id: `${surfaceName}-hook`, type: 'hook', title: payload.title || 'Untitled', body, order: 1, surface: surfaceName, origin: payload.origin || 'agent_generated', tags: toArray(payload.tags) },
          { id: `${surfaceName}-cta`, type: 'cta', title: 'Next move', body: 'Open VIA tools, refine the draft, or save this as a task.', order: 2, surface: surfaceName, origin: payload.origin || 'agent_generated', tags: toArray(payload.tags) }
        ],
        contentMap: {}
      };
    }

    if (this.runtime) {
      this.runtime.telemetry.track('content_decomposition', {
        surfaceName,
        units: parsed.units.length
      });
    }

    return parsed;
  }

  buildFeedUnits(input) {
    const parsed = input && input.units ? input : this.ingestLongform('feed_surface', input);
    const composer = this.contentCore && this.contentCore.composer;
    if (composer && typeof composer.composeFeedCard === 'function') {
      return {
        units: parsed.units,
        preview: composer.composeFeedCard(parsed.units)
      };
    }

    const hook = toArray(parsed.units).find((unit) => unit.type === 'hook') || parsed.units[0] || {};
    const insight = toArray(parsed.units).find((unit) => unit.type === 'insight') || {};
    return {
      units: parsed.units,
      preview: {
        surface: 'feed_card',
        title: hook.title || 'VIA Preview',
        body: insight.body || hook.body || '',
        ctaText: 'Open in VIA',
        unitIds: toArray(parsed.units).map((unit) => unit.id)
      }
    };
  }

  buildCreatorDraft(input) {
    const parsed = input && input.units ? input : this.ingestLongform('creator_surface', input);
    const composer = this.contentCore && this.contentCore.composer;
    if (composer && typeof composer.composeCreatorDraft === 'function') {
      return {
        units: parsed.units,
        draft: composer.composeCreatorDraft(parsed.units)
      };
    }

    const ordered = toArray(parsed.units).slice().sort((left, right) => (left.order || 0) - (right.order || 0));
    const hook = ordered.find((unit) => unit.type === 'hook') || ordered[0] || {};
    const sections = ordered
      .filter((unit) => ['context', 'insight', 'how_it_works', 'impact', 'takeaway'].includes(unit.type))
      .map((unit, index) => ({ heading: unit.title || `Section ${index + 1}`, body: unit.body || '', type: unit.type, order: index + 1 }));
    const cta = ordered.find((unit) => unit.type === 'cta') || {};

    return {
      units: parsed.units,
      draft: {
        surface: 'creator_workspace',
        title: hook.title || 'Creator Draft',
        summary: sections[0] ? sections[0].body : hook.body || '',
        hook: hook.body || hook.title || '',
        sections,
        takeaways: ordered.filter((unit) => unit.type === 'takeaway').map((unit) => unit.body),
        cta: cta.body || 'Ask your audience to respond, remix, or apply it inside VIA.',
        unitIds: ordered.map((unit) => unit.id)
      }
    };
  }

  buildTrendStack(input) {
    const parsed = input && input.units ? input : this.ingestLongform('discover_surface', input);
    const composer = this.contentCore && this.contentCore.composer;
    if (composer && typeof composer.composeTrendStack === 'function') {
      return {
        units: parsed.units,
        trendStack: composer.composeTrendStack(parsed.units)
      };
    }

    const grouped = { context: [], insight: [], how_it_works: [], impact: [], takeaway: [] };
    toArray(parsed.units).forEach((unit) => {
      if (grouped[unit.type]) grouped[unit.type].push(unit);
    });

    return {
      units: parsed.units,
      trendStack: {
        surface: 'trend_stack',
        context: grouped.context,
        insight: grouped.insight,
        howItWorks: grouped.how_it_works,
        impact: grouped.impact,
        takeaways: grouped.takeaway
      }
    };
  }

  publishUnits(surfaceName, units) {
    const safeUnits = clone(units, []) || [];
    if (this.runtime && this.runtime.sharedRuntime && typeof this.runtime.sharedRuntime.setStorage === 'function') {
      this.runtime.sharedRuntime.setStorage(`federated_content.${surfaceName}`, safeUnits);
    }
    if (this.runtime) {
      this.runtime.emit('content_published', { surfaceName, units: safeUnits });
    }
    return safeUnits;
  }
}
