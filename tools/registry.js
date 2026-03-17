(function (global) {
  'use strict';

  const ToolRegistry = {
    async list() {
      const response = await fetch('./tools-manifest.json');
      if (!response.ok) return [];
      return response.json();
    }
  };

  global.ToolRegistryLite = ToolRegistry;
})(window);
