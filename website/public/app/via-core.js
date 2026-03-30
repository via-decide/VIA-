(function initVIACore(global) {
  'use strict';

  const root = global.VIA || {};

  root.engine = root.engine || {};
  root.world = root.world || {};
  root.ui = root.ui || {};
  root.storage = root.storage || {};
  root.router = root.router || {};

  const boundaries = new Map();

  root.engine.profile = function profile(label, fn) {
    const start = global.performance.now();
    const value = fn();
    const end = global.performance.now();
    console.info(`[VIA][profile] ${label}: ${(end - start).toFixed(2)}ms`);
    return value;
  };

  root.ui.withErrorBoundary = function withErrorBoundary(boundaryId, render) {
    const host = document.querySelector(boundaryId);
    if (!host) {
      return;
    }

    try {
      render(host);
      boundaries.set(boundaryId, null);
    } catch (error) {
      boundaries.set(boundaryId, error);
      console.error(`[VIA][boundary] ${boundaryId}`, error);
      host.innerHTML = '<div class="via-boundary-error">Tool failed to render. Reload or open another module.</div>';
    }
  };

  root.engine.loop = (function createLoop() {
    const tasks = new Set();
    let frameId = 0;
    let previous = 0;

    function tick(now) {
      const delta = now - previous;
      previous = now;
      tasks.forEach((task) => {
        try {
          task(now, delta);
        } catch (error) {
          console.error('[VIA][loop] task error', error);
        }
      });
      if (tasks.size > 0) {
        frameId = global.requestAnimationFrame(tick);
      } else {
        frameId = 0;
      }
    }

    return {
      add(task) {
        tasks.add(task);
        if (!frameId) {
          previous = global.performance.now();
          frameId = global.requestAnimationFrame(tick);
        }
      },
      remove(task) {
        tasks.delete(task);
        if (!tasks.size && frameId) {
          global.cancelAnimationFrame(frameId);
          frameId = 0;
        }
      },
      size() {
        return tasks.size;
      }
    };
  }());

  global.VIA = root;
}(window));
