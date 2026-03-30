(function initVIARuntime(global) {
  'use strict';

  const VIA = global.VIA || {};

  VIA.core = VIA.core || {};
  VIA.router = VIA.router || {};
  VIA.state = VIA.state || {};
  VIA.storage = VIA.storage || {};
  VIA.modules = VIA.modules || {};
  VIA.ui = VIA.ui || {};
  VIA.gestures = VIA.gestures || {};

  const runtimeState = {
    frameId: 0,
    lastFrame: 0,
    tasks: new Set()
  };

  const store = {
    currentRoute: '/',
    activeModule: null,
    flags: {}
  };

  VIA.state.get = function get(key, defaultValue) {
    return Object.prototype.hasOwnProperty.call(store, key) ? store[key] : defaultValue;
  };

  VIA.state.set = function set(key, value) {
    store[key] = value;
    return value;
  };

  VIA.state.patch = function patch(nextValues) {
    if (!nextValues || typeof nextValues !== 'object') {
      return store;
    }
    Object.assign(store, nextValues);
    return store;
  };

  VIA.core.withBoundary = function withBoundary(label, fn, fallback) {
    try {
      return fn();
    } catch (error) {
      console.error(`[VIA][boundary:${label}]`, error);
      if (typeof fallback === 'function') {
        return fallback(error);
      }
      return null;
    }
  };

  VIA.core.addTask = function addTask(task) {
    if (typeof task === 'function') {
      runtimeState.tasks.add(task);
    }
    VIA.core.loop();
  };

  VIA.core.removeTask = function removeTask(task) {
    runtimeState.tasks.delete(task);
    if (!runtimeState.tasks.size && runtimeState.frameId) {
      global.cancelAnimationFrame(runtimeState.frameId);
      runtimeState.frameId = 0;
    }
  };

  VIA.core.loop = function loop() {
    if (runtimeState.frameId || !runtimeState.tasks.size) {
      return;
    }

    runtimeState.lastFrame = global.performance.now();

    function tick(now) {
      const delta = now - runtimeState.lastFrame;
      runtimeState.lastFrame = now;

      runtimeState.tasks.forEach(function runTask(task) {
        VIA.core.withBoundary('animation-task', function guardedTask() {
          task(now, delta);
        });
      });

      if (runtimeState.tasks.size) {
        runtimeState.frameId = global.requestAnimationFrame(tick);
      } else {
        runtimeState.frameId = 0;
      }
    }

    runtimeState.frameId = global.requestAnimationFrame(tick);
  };

  VIA.core.profile = function profile(label, fn) {
    const start = global.performance.now();
    const value = fn();
    const end = global.performance.now();
    console.info(`[VIA][profile] ${label}: ${(end - start).toFixed(2)}ms`);
    return value;
  };

  global.VIA = VIA;
}(window));
