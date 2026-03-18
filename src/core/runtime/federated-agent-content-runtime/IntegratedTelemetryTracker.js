const DEFAULT_STORAGE_KEY = 'via.runtime.federated.telemetry';

function safeClone(value, fallback = null) {
  try {
    return JSON.parse(JSON.stringify(value));
  } catch (_error) {
    return fallback;
  }
}

export class IntegratedTelemetryTracker {
  constructor(options = {}) {
    this.storage = options.storage || (typeof window !== 'undefined' ? window.localStorage : null);
    this.storageKey = options.storageKey || DEFAULT_STORAGE_KEY;
    this.state = {
      startedAt: new Date().toISOString(),
      counts: {
        surface_mounts: 0,
        surface_swaps: 0,
        agent_messages: 0,
        route_suggestions: 0,
        task_events: 0,
        draft_generation_events: 0,
        content_decomposition_events: 0,
        prefetch_decisions: 0
      },
      recentEvents: []
    };
    this.load();
  }

  load() {
    if (!this.storage || typeof this.storage.getItem !== 'function') return;
    try {
      const raw = this.storage.getItem(this.storageKey);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== 'object') return;
      this.state = {
        ...this.state,
        ...parsed,
        counts: {
          ...this.state.counts,
          ...(parsed.counts || {})
        },
        recentEvents: Array.isArray(parsed.recentEvents) ? parsed.recentEvents : []
      };
    } catch (_error) {}
  }

  persist() {
    if (!this.storage || typeof this.storage.setItem !== 'function') return;
    this.storage.setItem(this.storageKey, JSON.stringify(this.state));
  }

  track(eventType, meta = {}) {
    const type = String(eventType || 'unknown').trim() || 'unknown';
    const entry = {
      eventType: type,
      meta: safeClone(meta, {}) || {},
      createdAt: new Date().toISOString()
    };

    this.state.recentEvents.push(entry);
    this.state.recentEvents = this.state.recentEvents.slice(-120);

    if (type === 'surface_mount') this.state.counts.surface_mounts += 1;
    if (type === 'surface_swap') this.state.counts.surface_swaps += 1;
    if (/agent_|user_message|agent_reply/.test(type)) this.state.counts.agent_messages += 1;
    if (type === 'route_suggestion') this.state.counts.route_suggestions += 1;
    if (/task_/.test(type)) this.state.counts.task_events += 1;
    if (type === 'draft_generate') this.state.counts.draft_generation_events += 1;
    if (type === 'content_decomposition') this.state.counts.content_decomposition_events += 1;
    if (/prefetch/.test(type)) this.state.counts.prefetch_decisions += 1;

    this.persist();
    return entry;
  }

  getSnapshot() {
    return safeClone(this.state, this.state);
  }

  flush() {
    const snapshot = this.getSnapshot();
    this.state.recentEvents = [];
    this.persist();
    return snapshot;
  }
}
