(function (global) {
  'use strict';

  const root = global.VIAMicroContentArchitecture = global.VIAMicroContentArchitecture || {};

  class MicroContentComposer {
    composeFeedCard(units) {
      const safeUnits = this._ordered(units);
      const hook = this._pickFirst(safeUnits, 'hook');
      const insight = this._pickFirst(safeUnits, 'insight');
      const cta = this._pickFirst(safeUnits, 'cta');

      return {
        surface: 'feed_card',
        title: hook ? hook.title : 'VIA Story',
        body: insight ? insight.body : (hook ? hook.body : ''),
        ctaText: cta ? cta.body : 'Open in VIA',
        unitIds: [hook, insight, cta].filter(Boolean).map((unit) => unit.id)
      };
    }

    composeTrendStack(units) {
      const safeUnits = this._ordered(units);
      return {
        surface: 'trend_stack',
        context: this._composeSection(safeUnits, 'context', 'Context'),
        insight: this._composeSection(safeUnits, 'insight', 'Insight'),
        howItWorks: this._composeCollection(safeUnits, 'how_it_works', 'How It Works'),
        impact: this._composeCollection(safeUnits, 'impact', 'Impact'),
        takeaways: this._composeCollection(safeUnits, 'takeaway', 'Takeaways')
      };
    }

    composeCreatorDraft(units) {
      const safeUnits = this._ordered(units);
      const hook = this._pickFirst(safeUnits, 'hook');
      const insight = this._pickFirst(safeUnits, 'insight');
      const steps = this._pickMany(safeUnits, 'how_it_works');
      const takeaways = this._pickMany(safeUnits, 'takeaway');
      const cta = this._pickFirst(safeUnits, 'cta');

      return {
        surface: 'creator_workspace',
        title: hook ? hook.title : 'Creator Draft',
        summary: insight ? insight.body : '',
        hook: hook ? hook.body : '',
        sections: steps.map((unit, index) => ({
          heading: unit.title || `Section ${index + 1}`,
          body: unit.body,
          type: unit.type,
          order: index + 1
        })),
        takeaways: takeaways.map((unit) => unit.body),
        cta: cta ? cta.body : 'Ask the audience what they would do next.',
        unitIds: safeUnits.map((unit) => unit.id)
      };
    }

    composeSocialPreview(units) {
      const safeUnits = this._ordered(units);
      const hook = this._pickFirst(safeUnits, 'hook');
      const insight = this._pickFirst(safeUnits, 'insight');
      const takeaway = this._pickFirst(safeUnits, 'takeaway');
      const tags = this._collectTags(safeUnits).slice(0, 3).map((tag) => `#${tag.replace(/[^a-z0-9_-]/gi, '')}`);
      const segments = [
        hook ? hook.title : '',
        insight ? insight.body : '',
        takeaway ? takeaway.body : ''
      ].filter(Boolean);
      const text = segments.join(' • ').slice(0, 220).trim();

      return {
        surface: 'social_preview',
        headline: hook ? hook.title : 'VIA Preview',
        text,
        hashtags: tags,
        unitIds: [hook, insight, takeaway].filter(Boolean).map((unit) => unit.id)
      };
    }

    _composeSection(units, type, fallbackTitle) {
      const item = this._pickFirst(units, type);
      return {
        title: item ? item.title : fallbackTitle,
        body: item ? item.body : '',
        unitId: item ? item.id : null
      };
    }

    _composeCollection(units, type, fallbackTitle) {
      const items = this._pickMany(units, type);
      return {
        title: fallbackTitle,
        items: items.map((unit) => ({
          title: unit.title,
          body: unit.body,
          unitId: unit.id
        }))
      };
    }

    _ordered(units) {
      return Array.isArray(units)
        ? units.slice().sort((left, right) => left.order - right.order)
        : [];
    }

    _pickFirst(units, type) {
      return this._ordered(units).find((unit) => unit && unit.type === type) || null;
    }

    _pickMany(units, type) {
      return this._ordered(units).filter((unit) => unit && unit.type === type);
    }

    _collectTags(units) {
      const tags = [];
      this._ordered(units).forEach((unit) => {
        (Array.isArray(unit.tags) ? unit.tags : []).forEach((tag) => {
          if (tags.indexOf(tag) === -1) {
            tags.push(tag);
          }
        });
      });
      return tags;
    }
  }

  root.MicroContentComposer = MicroContentComposer;
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = MicroContentComposer;
  }
})(typeof window !== 'undefined' ? window : globalThis);
