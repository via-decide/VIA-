'use strict';

const crypto = require('crypto');

class FeedComposer {
  constructor() {
    this.allowedTypes = new Set(['Decision', 'StudyPlan', 'ToolOutput', 'Insight']);
    this.allowedOrigins = new Set(['HUMAN_SEEDED', 'USER_GENERATED', 'AGENT_GENERATED']);
  }

  compose(input) {
    const post = {
      id: this._generateId(),
      type: this._detectType(input),
      content: this._normalizeContent(input),
      origin: 'HUMAN_SEEDED',
      createdAt: Date.now()
    };

    return post;
  }

  validate(post) {
    if (!post || typeof post !== 'object' || Array.isArray(post)) {
      return false;
    }

    if (typeof post.id !== 'string' || post.id.length === 0) {
      return false;
    }

    if (!this.allowedTypes.has(post.type)) {
      return false;
    }

    if (!this.allowedOrigins.has(post.origin)) {
      return false;
    }

    if (!Number.isInteger(post.createdAt) || post.createdAt < 0) {
      return false;
    }

    const content = post.content;

    if (!content || typeof content !== 'object' || Array.isArray(content)) {
      return false;
    }

    if (typeof content.title !== 'string' || typeof content.body !== 'string') {
      return false;
    }

    if (!Array.isArray(content.sections)) {
      return false;
    }

    const hasValidSections = content.sections.every((section) => {
      return section
        && typeof section === 'object'
        && !Array.isArray(section)
        && typeof section.heading === 'string'
        && typeof section.text === 'string';
    });

    if (!hasValidSections) {
      return false;
    }

    const metadata = content.metadata;

    if (!metadata || typeof metadata !== 'object' || Array.isArray(metadata)) {
      return false;
    }

    if (!Array.isArray(metadata.tags) || !metadata.tags.every((tag) => typeof tag === 'string')) {
      return false;
    }

    if (typeof metadata.source !== 'string') {
      return false;
    }

    return true;
  }

  _normalizeContent(input) {
    if (typeof input === 'string') {
      const lines = input.split(/\r?\n/);
      const firstLine = (lines[0] || '').trim();

      return {
        title: firstLine.slice(0, 80),
        body: input,
        sections: [],
        metadata: {
          tags: [],
          source: 'manual'
        }
      };
    }

    const payload = input && typeof input === 'object' && !Array.isArray(input) ? input : {};
    const content = payload.content && typeof payload.content === 'object' && !Array.isArray(payload.content)
      ? payload.content
      : payload;

    const titleCandidate = this._coerceString(
      content.title || payload.title || content.heading || payload.heading || ''
    );
    const bodyCandidate = this._coerceString(
      content.body || payload.body || content.text || payload.text || ''
    );
    const sectionsSource = Array.isArray(content.sections)
      ? content.sections
      : Array.isArray(payload.sections)
        ? payload.sections
        : [];
    const metadataSource = content.metadata && typeof content.metadata === 'object' && !Array.isArray(content.metadata)
      ? content.metadata
      : payload.metadata && typeof payload.metadata === 'object' && !Array.isArray(payload.metadata)
        ? payload.metadata
        : {};

    const normalizedSections = sectionsSource
      .filter((section) => section && typeof section === 'object' && !Array.isArray(section))
      .map((section) => ({
        heading: this._coerceString(section.heading || section.title || ''),
        text: this._coerceString(section.text || section.body || section.content || '')
      }));

    return {
      title: titleCandidate.slice(0, 80),
      body: bodyCandidate,
      sections: normalizedSections,
      metadata: {
        tags: this._normalizeTags(metadataSource.tags || payload.tags),
        source: this._coerceString(metadataSource.source || payload.source || 'manual')
      }
    };
  }

  _detectType(input) {
    if (typeof input === 'string') {
      return input.toLowerCase().includes('plan') ? 'StudyPlan' : 'Insight';
    }

    const payload = input && typeof input === 'object' && !Array.isArray(input) ? input : {};

    if (this.allowedTypes.has(payload.type)) {
      return payload.type;
    }

    if (Array.isArray(payload.sections) || (payload.content && Array.isArray(payload.content.sections))) {
      return 'Decision';
    }

    return 'ToolOutput';
  }

  _generateId() {
    return crypto.randomBytes(8).toString('hex');
  }

  _normalizeTags(tags) {
    if (!Array.isArray(tags)) {
      return [];
    }

    return tags
      .map((tag) => this._coerceString(tag))
      .filter((tag) => tag.length > 0);
  }

  _coerceString(value) {
    if (typeof value === 'string') {
      return value;
    }

    if (value === null || typeof value === 'undefined') {
      return '';
    }

    return String(value);
  }
}

module.exports = FeedComposer;
