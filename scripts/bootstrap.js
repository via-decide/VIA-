(function () {
  'use strict';

  function safeRun(name, fn) {
    if (typeof fn !== 'function') {
      console.warn(name + ' is not available.');
      return;
    }

    try {
      fn();
    } catch (error) {
      console.error(name + ' failed to initialize.', error);
    }
  }

  function initializeModules() {
    safeRun('initViaLogic', window.initViaLogic);
    safeRun('initSpatialEngine', window.initSpatialEngine);
    safeRun('initFeed', window.initFeed);

    try {
      if (typeof window.loadSpatialEngine === 'function') {
        window.loadSpatialEngine();
      }
    } catch (e) {
      console.warn('Spatial engine failed', e);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeModules, { once: true });
  } else {
    initializeModules();
  }
})();
