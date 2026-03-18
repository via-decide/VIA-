(function (global) {
  'use strict';

  const root = global.VIAMicroContentArchitecture = global.VIAMicroContentArchitecture || {};

  const DEFAULT_CONFIG = {
    contentUnitTypes: [
      'hook',
      'context',
      'insight',
      'how_it_works',
      'impact',
      'takeaway',
      'cta',
      'thread',
      'creator_draft'
    ],
    origins: [
      'human_seeded',
      'user_generated',
      'agent_generated',
      'imported_story'
    ],
    renderSurfaces: [
      'feed_card',
      'story_modal',
      'creator_workspace',
      'social_preview',
      'trend_stack'
    ]
  };

  function cloneConfig(config) {
    return JSON.parse(JSON.stringify(config || DEFAULT_CONFIG));
  }

  function loadMicroContentConfig(config) {
    const source = config && typeof config === 'object'
      ? config
      : root.config && typeof root.config === 'object'
        ? root.config
        : DEFAULT_CONFIG;
    return cloneConfig(source);
  }

  const NodeParser = typeof module !== 'undefined' && module.exports ? require('./MicroContentParser.js') : null;
  const NodeComposer = typeof module !== 'undefined' && module.exports ? require('./MicroContentComposer.js') : null;
  const NodeRegistry = typeof module !== 'undefined' && module.exports ? require('./MicroContentRegistry.js') : null;

  function createMicroContentArchitecture(config) {
    const safeConfig = loadMicroContentConfig(config);
    const Parser = root.MicroContentParser || NodeParser;
    const Composer = root.MicroContentComposer || NodeComposer;
    const Registry = root.MicroContentRegistry || NodeRegistry;

    if (typeof Parser !== 'function' || typeof Composer !== 'function' || typeof Registry !== 'function') {
      throw new Error('Micro-content architecture dependencies are not loaded.');
    }

    const parser = new Parser(safeConfig);
    const composer = new Composer(safeConfig);
    const registry = new Registry();

    return {
      config: safeConfig,
      parser,
      composer,
      registry,
      parseAndRegister(input) {
        const parsed = parser.parseLongform(input);
        registry.registerBatch(parsed.units);
        return parsed;
      }
    };
  }

  root.MicroContentParser = root.MicroContentParser || NodeParser;
  root.MicroContentComposer = root.MicroContentComposer || NodeComposer;
  root.MicroContentRegistry = root.MicroContentRegistry || NodeRegistry;
  root.config = cloneConfig(DEFAULT_CONFIG);
  root.loadMicroContentConfig = loadMicroContentConfig;
  root.createMicroContentArchitecture = createMicroContentArchitecture;
  root.DEFAULT_CONFIG = cloneConfig(DEFAULT_CONFIG);

  global.loadMicroContentConfig = loadMicroContentConfig;
  global.createMicroContentArchitecture = createMicroContentArchitecture;
  global.MicroContentParser = root.MicroContentParser;
  global.MicroContentComposer = root.MicroContentComposer;
  global.MicroContentRegistry = root.MicroContentRegistry;

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
      createMicroContentArchitecture,
      loadMicroContentConfig,
      MicroContentParser: root.MicroContentParser,
      MicroContentComposer: root.MicroContentComposer,
      MicroContentRegistry: root.MicroContentRegistry
    };
  }
})(typeof window !== 'undefined' ? window : globalThis);
