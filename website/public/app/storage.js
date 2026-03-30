(function attachStorage(global) {
  'use strict';

  const namespace = global.VIA || (global.VIA = { engine: {}, world: {}, ui: {}, storage: {}, router: {} });

  function safeParse(raw, defaultValue) {
    if (raw == null) {
      return defaultValue;
    }
    try {
      return JSON.parse(raw);
    } catch (_error) {
      return defaultValue;
    }
  }

  namespace.storage.get = function get(key, defaultValue) {
    try {
      return safeParse(global.localStorage.getItem(key), defaultValue);
    } catch (error) {
      console.warn(`[VIA][storage] get failed for ${key}`, error);
      return defaultValue;
    }
  };

  namespace.storage.set = function set(key, value) {
    try {
      global.localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.warn(`[VIA][storage] set failed for ${key}`, error);
      return false;
    }
  };
}(window));
