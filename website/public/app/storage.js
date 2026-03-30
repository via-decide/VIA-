(function attachStorage(global) {
  'use strict';

  const VIA = global.VIA || (global.VIA = { core: {}, router: {}, state: {}, storage: {}, modules: {}, ui: {}, gestures: {} });

  function decode(raw, defaultValue) {
    if (raw == null) {
      return defaultValue;
    }

    try {
      return JSON.parse(raw);
    } catch (_error) {
      return defaultValue;
    }
  }

  VIA.storage.get = function get(key, defaultValue) {
    try {
      return decode(global.localStorage.getItem(key), defaultValue);
    } catch (error) {
      console.warn(`[VIA][storage.get] ${key}`, error);
      return defaultValue;
    }
  };

  VIA.storage.set = function set(key, value) {
    try {
      global.localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.warn(`[VIA][storage.set] ${key}`, error);
      return false;
    }
  };
}(window));
