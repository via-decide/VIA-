(function (global) {
  'use strict';

  const root = global.VIAMicroContentArchitecture = global.VIAMicroContentArchitecture || {};

  class MicroContentRegistry {
    constructor(adapter) {
      this.adapter = adapter || null;
      this.units = [];
      this.indexes = {
        type: {},
        origin: {},
        surface: {}
      };
    }

    register(unit) {
      if (!unit || typeof unit !== 'object' || !unit.id) {
        return null;
      }

      const existingIndex = this.units.findIndex((item) => item.id === unit.id);
      if (existingIndex >= 0) {
        this.units[existingIndex] = unit;
      } else {
        this.units.push(unit);
      }

      this._rebuildIndexes();
      return unit;
    }

    registerBatch(units) {
      const safeUnits = Array.isArray(units) ? units : [];
      return safeUnits.map((unit) => this.register(unit)).filter(Boolean);
    }

    getByType(type) {
      return (this.indexes.type[type] || []).slice();
    }

    getByOrigin(origin) {
      return (this.indexes.origin[origin] || []).slice();
    }

    getBySurface(surface) {
      return (this.indexes.surface[surface] || []).slice();
    }

    getOrdered() {
      return this.units.slice().sort((left, right) => left.order - right.order);
    }

    _rebuildIndexes() {
      this.indexes = {
        type: {},
        origin: {},
        surface: {}
      };

      this.units.forEach((unit) => {
        this._push(this.indexes.type, unit.type, unit);
        this._push(this.indexes.origin, unit.origin, unit);
        this._push(this.indexes.surface, unit.surface, unit);
      });
    }

    _push(target, key, unit) {
      if (!target[key]) {
        target[key] = [];
      }
      target[key].push(unit);
    }
  }

  root.MicroContentRegistry = MicroContentRegistry;
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = MicroContentRegistry;
  }
})(typeof window !== 'undefined' ? window : globalThis);
