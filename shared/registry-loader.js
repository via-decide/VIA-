/**
 * VIA Registry Loader v1.0.0
 * ===========================
 * Phase 1: Dynamic tool registry with search, filter, and lookup.
 * Loads nav-registry.json once, caches in memory, provides API.
 *
 * Usage:
 *   await VIARegistry.init();
 *   const tool = VIARegistry.findTool('code-generator');
 *   const results = VIARegistry.search('prompt');
 *   const coderTools = VIARegistry.byCategory('coders');
 */

const VIARegistry = (function () {
  'use strict';

  let _registry = null;
  let _index = null; // search index
  let _loading = null;

  const REGISTRY_PATH = '/nav-registry.json';

  // ── Load & Cache ──────────────────────────────────────────
  async function init(path) {
    if (_registry) return _registry;
    if (_loading) return _loading;

    _loading = (async () => {
      try {
        const res = await fetch(path || REGISTRY_PATH);
        if (!res.ok) throw new Error(`Registry ${res.status}`);
        _registry = await res.json();
        _buildIndex();
        console.log(`[VIARegistry] Loaded: ${_registry.totalTools} tools, ${Object.keys(_registry.categories).length} categories`);
        return _registry;
      } catch (err) {
        console.error('[VIARegistry] Load failed:', err);
        _registry = { tools: [], categories: {}, totalTools: 0 };
        return _registry;
      } finally {
        _loading = null;
      }
    })();

    return _loading;
  }

  // ── Search Index ──────────────────────────────────────────
  function _buildIndex() {
    if (!_registry) return;
    _index = new Map();
    for (const tool of _registry.tools) {
      const tokens = _tokenize([
        tool.id,
        tool.title,
        tool.description,
        tool.category,
        ...(tool.tags || []),
        ...(tool.audience || []),
        ...(tool.inputs || []),
        ...(tool.outputs || []),
      ].join(' '));

      _index.set(tool.id, tokens);
    }
  }

  function _tokenize(text) {
    return (text || '')
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, ' ')
      .split(/\s+/)
      .filter(Boolean);
  }

  // ── Lookup ────────────────────────────────────────────────
  function findTool(id) {
    if (!_registry) return null;
    return _registry.tools.find(t => t.id === id) || null;
  }

  function findToolByPath(path) {
    if (!_registry) return null;
    const clean = path.replace(/\/+$/, '').replace(/^\/+/, '');
    return _registry.tools.find(t => {
      const tPath = (t.path || '').replace(/\/+$/, '').replace(/^\/+/, '');
      return tPath === clean;
    }) || null;
  }

  // ── Filter ────────────────────────────────────────────────
  function byCategory(category) {
    if (!_registry) return [];
    return _registry.tools.filter(t => t.category === category);
  }

  function byTag(tag) {
    if (!_registry) return [];
    const q = tag.toLowerCase();
    return _registry.tools.filter(t =>
      (t.tags || []).some(tg => tg.toLowerCase() === q)
    );
  }

  function byAudience(audience) {
    if (!_registry) return [];
    const q = audience.toLowerCase();
    return _registry.tools.filter(t =>
      (t.audience || []).some(a => a.toLowerCase() === q)
    );
  }

  function allTools() {
    return _registry ? _registry.tools : [];
  }

  function allCategories() {
    return _registry ? _registry.categories : {};
  }

  // ── Search ────────────────────────────────────────────────
  function search(query) {
    if (!_registry || !_index) return [];
    const queryTokens = _tokenize(query);
    if (!queryTokens.length) return _registry.tools;

    const scored = [];
    for (const tool of _registry.tools) {
      const toolTokens = _index.get(tool.id) || [];
      let score = 0;

      for (const qt of queryTokens) {
        // Exact match in ID or title = highest score
        if (tool.id.toLowerCase().includes(qt)) score += 10;
        if ((tool.title || '').toLowerCase().includes(qt)) score += 8;
        // Token-level matching
        for (const tt of toolTokens) {
          if (tt === qt) score += 3;
          else if (tt.startsWith(qt)) score += 2;
          else if (tt.includes(qt)) score += 1;
        }
      }

      if (score > 0) {
        scored.push({ tool, score });
      }
    }

    return scored
      .sort((a, b) => b.score - a.score)
      .map(s => s.tool);
  }

  // ── Related Tools ─────────────────────────────────────────
  function getRelated(toolId, max) {
    const tool = findTool(toolId);
    if (!tool) return [];
    const related = (tool.relatedTools || [])
      .map(id => findTool(id))
      .filter(Boolean);
    return max ? related.slice(0, max) : related;
  }

  // ── Stats ─────────────────────────────────────────────────
  function stats() {
    if (!_registry) return {};
    const cats = {};
    for (const t of _registry.tools) {
      cats[t.category] = (cats[t.category] || 0) + 1;
    }
    return {
      totalTools: _registry.totalTools,
      categories: cats,
      generatedAt: _registry.generatedAt,
    };
  }

  // ── Build SUBPAGES map (for router.js compat) ─────────────
  function buildSubpagesMap() {
    if (!_registry) return {};
    const map = {};
    for (const tool of _registry.tools) {
      map[tool.id] = tool.path || `/tools/${tool.id}/`;
    }
    return map;
  }

  // ── Public API ────────────────────────────────────────────
  return {
    init,
    findTool,
    findToolByPath,
    byCategory,
    byTag,
    byAudience,
    allTools,
    allCategories,
    search,
    getRelated,
    stats,
    buildSubpagesMap,
    getRegistry: () => _registry,
    isLoaded: () => !!_registry,
  };
})();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = VIARegistry;
}
