(function (global) {
  'use strict';

  const DEFAULT_STORAGE_KEY = 'viadecide.agent.telemetry';

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  class AgentTelemetryTracker {
    constructor(options) {
      const resolved = options && typeof options === 'object' ? options : {};
      this.storage = resolved.storage || global.localStorage;
      this.storageKey = resolved.storageKey || DEFAULT_STORAGE_KEY;
      this.mirrorToLocalStorage = resolved.mirrorToLocalStorage !== false;
      this.state = {
        startedAt: new Date().toISOString(),
        messageCounts: {},
        routeSuggestionsIssued: 0,
        taskActionsPerformed: 0,
        exportEvents: 0,
        setupEvents: 0,
        responseTimings: [],
        recentEvents: []
      };
      this.load();
    }

    load() {
      if (!this.mirrorToLocalStorage || !this.storage || typeof this.storage.getItem !== 'function') return;
      try {
        const raw = this.storage.getItem(this.storageKey);
        const parsed = raw ? JSON.parse(raw) : null;
        if (parsed && typeof parsed === 'object') {
          this.state = {
            ...this.state,
            ...parsed,
            messageCounts: parsed.messageCounts || {},
            responseTimings: Array.isArray(parsed.responseTimings) ? parsed.responseTimings : [],
            recentEvents: Array.isArray(parsed.recentEvents) ? parsed.recentEvents : []
          };
        }
      } catch (_error) {
        // ignore malformed telemetry cache
      }
    }

    persist() {
      if (!this.mirrorToLocalStorage || !this.storage || typeof this.storage.setItem !== 'function') return;
      this.storage.setItem(this.storageKey, JSON.stringify(this.state));
    }

    track(eventType, meta) {
      const type = String(eventType || 'unknown').trim() || 'unknown';
      const payload = meta && typeof meta === 'object' ? clone(meta) : {};
      const entry = { eventType: type, meta: payload, createdAt: new Date().toISOString() };
      this.state.recentEvents.push(entry);
      this.state.recentEvents = this.state.recentEvents.slice(-40);

      if (type in this.state.messageCounts || /message/.test(type)) {
        this.state.messageCounts[type] = (this.state.messageCounts[type] || 0) + 1;
      }
      if (type === 'route_suggestion') this.state.routeSuggestionsIssued += 1;
      if (/task_/.test(type)) this.state.taskActionsPerformed += 1;
      if (type === 'export_event') this.state.exportEvents += 1;
      if (type === 'setup_event' || type === 'test_key_event') this.state.setupEvents += 1;
      if (Number.isFinite(payload.durationMs)) {
        this.state.responseTimings.push(payload.durationMs);
        this.state.responseTimings = this.state.responseTimings.slice(-100);
      }

      this.persist();
      return entry;
    }

    getSnapshot() {
      const timings = this.state.responseTimings;
      const averageResponseTiming = timings.length
        ? Math.round(timings.reduce((sum, value) => sum + value, 0) / timings.length)
        : 0;
      return {
        ...clone(this.state),
        averageResponseTiming
      };
    }

    flush() {
      const snapshot = this.getSnapshot();
      this.state.recentEvents = [];
      this.state.responseTimings = [];
      this.persist();
      return snapshot;
    }
  }

  global.AgentTelemetryTracker = AgentTelemetryTracker;
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = AgentTelemetryTracker;
  }
})(typeof window !== 'undefined' ? window : globalThis);
