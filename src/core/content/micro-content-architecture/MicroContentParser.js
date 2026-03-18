(function (global) {
  'use strict';

  const root = global.VIAMicroContentArchitecture = global.VIAMicroContentArchitecture || {};

  class MicroContentParser {
    constructor(config) {
      const safeConfig = config && typeof config === 'object' ? config : {};
      this.config = safeConfig;
      this.unitTypes = new Set(Array.isArray(safeConfig.contentUnitTypes) ? safeConfig.contentUnitTypes : []);
      this.origins = new Set(Array.isArray(safeConfig.origins) ? safeConfig.origins : []);
      this.renderSurfaces = new Set(Array.isArray(safeConfig.renderSurfaces) ? safeConfig.renderSurfaces : []);
    }

    parseLongform(input) {
      const meta = this._deriveMeta(input);
      const extracted = this.extractUnits(input);
      const units = extracted.map((unit, index) => {
        return this.normalizeUnit(unit, { ...meta, order: index + 1 });
      });

      return {
        meta,
        units,
        contentMap: this.buildContentMap(units)
      };
    }

    extractUnits(input) {
      if (typeof input === 'string') {
        return this._extractFromPlainText(input);
      }

      if (!input || typeof input !== 'object' || Array.isArray(input)) {
        return [];
      }

      if (this._looksLikeViaStory(input)) {
        return this._extractFromViaStory(input);
      }

      return this._extractFromStructuredArticle(input);
    }

    normalizeUnit(unit, meta) {
      const safeUnit = unit && typeof unit === 'object' && !Array.isArray(unit) ? unit : {};
      const safeMeta = meta && typeof meta === 'object' ? meta : {};
      const type = this.unitTypes.has(safeUnit.type) ? safeUnit.type : 'context';
      const title = this._coerceString(safeUnit.title || safeMeta.title || type.replace(/_/g, ' '));
      const body = this._coerceString(safeUnit.body || safeUnit.text || '');
      const origin = this.origins.has(safeUnit.origin) ? safeUnit.origin : this._normalizeOrigin(safeMeta.origin);
      const surface = this.renderSurfaces.has(safeUnit.surface) ? safeUnit.surface : this._normalizeSurface(safeMeta.surface);
      const order = Number.isFinite(Number(safeUnit.order)) ? Number(safeUnit.order) : Number(safeMeta.order || 0);
      const tags = this._normalizeTags([].concat(safeMeta.tags || [], safeUnit.tags || []));
      const createdAt = this._coerceDate(safeUnit.createdAt || safeMeta.createdAt);
      const id = this._buildId({
        type,
        title,
        body,
        order,
        hint: safeUnit.id || safeMeta.sourceKey || safeMeta.slug || safeMeta.title || 'unit'
      });

      return {
        id,
        type,
        title,
        body,
        origin,
        surface,
        order,
        tags,
        createdAt
      };
    }

    buildContentMap(units) {
      const safeUnits = Array.isArray(units) ? units.slice() : [];
      const ordered = safeUnits.slice().sort((left, right) => left.order - right.order);
      const map = {
        ordered,
        byType: {},
        byOrigin: {},
        bySurface: {}
      };

      ordered.forEach((unit) => {
        this._pushMapItem(map.byType, unit.type, unit);
        this._pushMapItem(map.byOrigin, unit.origin, unit);
        this._pushMapItem(map.bySurface, unit.surface, unit);
      });

      return map;
    }

    _extractFromPlainText(input) {
      const paragraphs = String(input)
        .split(/\n{2,}/)
        .map((item) => item.trim())
        .filter(Boolean);
      const headline = paragraphs[0] || 'Untitled';
      const bodyParagraphs = paragraphs.length > 1 ? paragraphs.slice(1) : paragraphs;
      const units = [];

      units.push({ type: 'hook', title: headline.slice(0, 96), body: headline });

      const fallbackTypes = ['context', 'insight', 'how_it_works', 'impact', 'takeaway', 'cta'];
      bodyParagraphs.forEach((paragraph, index) => {
        units.push({
          type: fallbackTypes[index] || 'context',
          title: this._buildParagraphTitle(paragraph, fallbackTypes[index] || 'context'),
          body: paragraph,
          order: index + 2
        });
      });

      if (!units.some((unit) => unit.type === 'cta')) {
        units.push({
          type: 'cta',
          title: 'Continue the story',
          body: 'Use this breakdown inside VIA to explore, publish, or remix the idea.'
        });
      }

      return units;
    }

    _extractFromStructuredArticle(input) {
      const payload = input && typeof input === 'object' ? input : {};
      const sections = Array.isArray(payload.sections) ? payload.sections : [];
      const title = this._coerceString(payload.title || payload.heading || 'Untitled Story');
      const body = this._coerceString(payload.body || payload.text || payload.summary || '');
      const units = [
        { type: 'hook', title, body: this._coerceString(payload.hook || title) }
      ];

      if (body) {
        units.push({ type: 'context', title: 'Context', body });
      }

      sections.forEach((section, index) => {
        const heading = this._coerceString(section && (section.heading || section.title || section.label) || 'Section');
        const text = this._coerceString(section && (section.text || section.body || section.content) || '');
        if (!text) {
          return;
        }

        units.push({
          type: this._detectSectionType(heading, index),
          title: heading,
          body: text,
          order: units.length + 1,
          tags: this._normalizeTags(section && section.tags)
        });
      });

      if (!units.some((unit) => unit.type === 'cta')) {
        units.push({
          type: 'cta',
          title: 'Share the next move',
          body: this._coerceString(payload.cta || 'Turn this article into a creator draft or a feed-safe takeaway.')
        });
      }

      return units;
    }

    _extractFromViaStory(input) {
      const story = input && typeof input === 'object' ? input : {};
      const units = [];
      const sharedTags = this._normalizeTags([story.catLabel, story.theme, story.storyKey, story.slug]);

      units.push({ type: 'hook', title: this._coerceString(story.hookTitle), body: this._coerceString(story.hookLead), tags: sharedTags });
      units.push({ type: 'context', title: this._coerceString(story.probTitle || 'Context'), body: this._coerceString(story.probBody), tags: sharedTags });

      (Array.isArray(story.problems) ? story.problems : []).forEach((problem, index) => {
        units.push({
          type: 'context',
          title: this._extractInlineTitle(problem && problem.text, `Context ${index + 1}`),
          body: this._stripHtml(this._coerceString(problem && problem.text)),
          tags: sharedTags
        });
      });

      units.push({ type: 'insight', title: this._coerceString(story.insightTitle || 'Insight'), body: this._coerceString(story.insightBody), tags: sharedTags });

      if (story.insightQuote) {
        units.push({ type: 'insight', title: 'Signal', body: this._stripHtml(this._coerceString(story.insightQuote)), tags: sharedTags });
      }

      (Array.isArray(story.fwSteps) ? story.fwSteps : []).forEach((step) => {
        units.push({
          type: 'how_it_works',
          title: this._coerceString(step && step.title || story.fwTitle || 'How It Works'),
          body: this._coerceString(step && step.desc),
          tags: sharedTags
        });
      });

      (Array.isArray(story.examples) ? story.examples : []).forEach((example) => {
        units.push({
          type: 'impact',
          title: this._coerceString(example && example.title || story.exTitle || 'Impact'),
          body: this._coerceString(example && example.desc),
          tags: sharedTags
        });
      });

      (Array.isArray(story.checklist) ? story.checklist : []).forEach((item, index) => {
        units.push({
          type: 'takeaway',
          title: `${this._coerceString(story.clTitle || 'Takeaway')} ${index + 1}`,
          body: this._coerceString(item),
          tags: sharedTags
        });
      });

      units.push({
        type: 'cta',
        title: 'Republish on VIA',
        body: 'Turn this story into a feed card, creator draft, or trend context block.',
        tags: sharedTags
      });

      units.push({
        type: 'thread',
        title: `${this._coerceString(story.hookTitle || 'Story')} Thread`,
        body: this._buildThreadBody(story),
        tags: sharedTags,
        surface: 'social_preview'
      });

      units.push({
        type: 'creator_draft',
        title: `${this._coerceString(story.hookTitle || 'Story')} Creator Draft`,
        body: this._buildCreatorDraftBody(story),
        tags: sharedTags,
        surface: 'creator_workspace'
      });

      return units.filter((unit) => unit.body || unit.title);
    }

    _looksLikeViaStory(input) {
      return Boolean(input && typeof input === 'object' && (
        input.hookTitle
        || input.insightTitle
        || input.fwSteps
        || input.problems
        || input.examples
        || input.checklist
      ));
    }

    _deriveMeta(input) {
      if (typeof input === 'string') {
        return {
          title: this._coerceString(input.split(/\n/)[0] || 'Untitled Story'),
          origin: 'human_seeded',
          surface: 'story_modal',
          tags: [] ,
          createdAt: new Date().toISOString()
        };
      }

      const payload = input && typeof input === 'object' && !Array.isArray(input) ? input : {};
      return {
        title: this._coerceString(payload.title || payload.hookTitle || payload.heading || payload.slug || 'Untitled Story'),
        origin: this._normalizeOrigin(payload.origin || payload.source || 'human_seeded'),
        surface: this._normalizeSurface(payload.surface || (this._looksLikeViaStory(payload) ? 'trend_stack' : 'story_modal')),
        tags: this._normalizeTags([].concat(payload.tags || [], payload.category || [], payload.storyKey || [], payload.catLabel || [])),
        createdAt: this._coerceDate(payload.createdAt || payload.updatedAt || payload.publishedAt),
        sourceKey: this._coerceString(payload.storyKey || payload.id || payload.slug || payload.title || 'story')
      };
    }

    _detectSectionType(heading, index) {
      const normalized = this._coerceString(heading).toLowerCase();
      if (normalized.indexOf('hook') !== -1) return 'hook';
      if (normalized.indexOf('context') !== -1 || normalized.indexOf('problem') !== -1) return 'context';
      if (normalized.indexOf('insight') !== -1) return 'insight';
      if (normalized.indexOf('how') !== -1 || normalized.indexOf('framework') !== -1 || normalized.indexOf('works') !== -1) return 'how_it_works';
      if (normalized.indexOf('impact') !== -1 || normalized.indexOf('example') !== -1) return 'impact';
      if (normalized.indexOf('takeaway') !== -1 || normalized.indexOf('checklist') !== -1) return 'takeaway';
      if (normalized.indexOf('cta') !== -1 || normalized.indexOf('next') !== -1) return 'cta';
      return index === 0 ? 'insight' : 'context';
    }

    _normalizeOrigin(origin) {
      return this.origins.has(origin) ? origin : 'human_seeded';
    }

    _normalizeSurface(surface) {
      return this.renderSurfaces.has(surface) ? surface : 'story_modal';
    }

    _normalizeTags(tags) {
      const list = Array.isArray(tags) ? tags : [tags];
      const seen = {};
      return list
        .map((tag) => this._stripHtml(this._coerceString(tag)).trim().toLowerCase())
        .map((tag) => tag.replace(/[^a-z0-9\s_-]+/gi, '').replace(/\s+/g, '-'))
        .filter((tag) => tag && !seen[tag] && (seen[tag] = true));
    }

    _coerceString(value) {
      if (typeof value === 'string') {
        return value.trim();
      }
      if (value === null || typeof value === 'undefined') {
        return '';
      }
      return String(value).trim();
    }

    _coerceDate(value) {
      const parsed = value ? new Date(value) : new Date();
      if (Number.isNaN(parsed.getTime())) {
        return new Date().toISOString();
      }
      return parsed.toISOString();
    }

    _pushMapItem(target, key, unit) {
      if (!target[key]) {
        target[key] = [];
      }
      target[key].push(unit);
    }

    _buildParagraphTitle(paragraph, fallback) {
      const clean = this._stripHtml(this._coerceString(paragraph));
      if (!clean) {
        return fallback;
      }
      const sentence = clean.split(/[.!?]/)[0] || clean;
      return sentence.slice(0, 72);
    }

    _extractInlineTitle(htmlText, fallback) {
      const raw = this._coerceString(htmlText);
      const match = raw.match(/<strong>(.*?)<\/strong>/i);
      return this._stripHtml(match ? match[1] : fallback);
    }

    _stripHtml(value) {
      return this._coerceString(value).replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    }

    _buildThreadBody(story) {
      const segments = [
        this._stripHtml(story.hookLead),
        this._stripHtml(story.insightBody),
        this._stripHtml((Array.isArray(story.checklist) ? story.checklist[0] : '') || '')
      ].filter(Boolean);
      return segments.join(' \n\n');
    }

    _buildCreatorDraftBody(story) {
      const steps = (Array.isArray(story.fwSteps) ? story.fwSteps : [])
        .map((step, index) => `${index + 1}. ${this._coerceString(step && step.title)} — ${this._coerceString(step && step.desc)}`)
        .join('\n');
      return [
        `Hook: ${this._stripHtml(story.hookLead)}`,
        `Insight: ${this._stripHtml(story.insightBody)}`,
        'How it works:',
        steps,
        'CTA: Ask the audience to apply or remix the framework inside VIA.'
      ].filter(Boolean).join('\n');
    }

    _buildId(input) {
      const base = `${input.hint}|${input.type}|${input.order}|${input.title}|${input.body}`;
      const slug = this._coerceString(input.hint || input.title || 'unit').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'unit';
      return `${slug}-${this._hash(base)}`;
    }

    _hash(input) {
      let hash = 0;
      const value = this._coerceString(input);
      for (let index = 0; index < value.length; index += 1) {
        hash = ((hash << 5) - hash) + value.charCodeAt(index);
        hash |= 0;
      }
      return Math.abs(hash).toString(36);
    }
  }

  root.MicroContentParser = MicroContentParser;
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = MicroContentParser;
  }
})(typeof window !== 'undefined' ? window : globalThis);
