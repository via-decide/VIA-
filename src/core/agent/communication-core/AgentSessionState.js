(function (global) {
  'use strict';

  const DEFAULT_STORAGE_KEY = 'viadecide.agent.session';

  function safeClone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  class AgentSessionState {
    constructor(options) {
      const resolved = options && typeof options === 'object' ? options : {};
      this.storage = resolved.storage || global.localStorage;
      this.storageKey = resolved.storageKey || DEFAULT_STORAGE_KEY;
      this.session = {
        id: '',
        state: 'idle',
        createdAt: '',
        updatedAt: '',
        meta: {},
        conversation: [],
        pageContext: {},
        setupState: {},
        routeSuggestions: [],
        taskReferences: []
      };
      this.loadFromStorage();
    }

    persist() {
      this.session.updatedAt = new Date().toISOString();
      if (this.storage && typeof this.storage.setItem === 'function') {
        this.storage.setItem(this.storageKey, JSON.stringify(this.session));
      }
      return this.getSession();
    }

    startSession(meta) {
      const timestamp = new Date().toISOString();
      this.session = {
        id: `session-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        state: meta && meta.state ? meta.state : 'listening',
        createdAt: timestamp,
        updatedAt: timestamp,
        meta: meta && typeof meta === 'object' ? safeClone(meta) : {},
        conversation: [],
        pageContext: meta && meta.pageContext ? safeClone(meta.pageContext) : {},
        setupState: meta && meta.setupState ? safeClone(meta.setupState) : {},
        routeSuggestions: [],
        taskReferences: []
      };
      return this.persist();
    }

    appendTurn(turn) {
      const nextTurn = turn && typeof turn === 'object' ? safeClone(turn) : { role: 'system', text: String(turn || '') };
      nextTurn.createdAt = nextTurn.createdAt || new Date().toISOString();
      this.session.conversation.push(nextTurn);
      this.session.state = nextTurn.role === 'user' ? 'thinking' : 'listening';
      return this.persist();
    }

    getSession() {
      return safeClone(this.session);
    }

    clearSession() {
      this.session = {
        id: '',
        state: 'idle',
        createdAt: '',
        updatedAt: '',
        meta: {},
        conversation: [],
        pageContext: {},
        setupState: {},
        routeSuggestions: [],
        taskReferences: []
      };
      if (this.storage && typeof this.storage.removeItem === 'function') {
        this.storage.removeItem(this.storageKey);
      }
      return this.getSession();
    }

    exportSessionData() {
      return {
        exportedAt: new Date().toISOString(),
        session: this.getSession()
      };
    }

    loadFromStorage() {
      if (!this.storage || typeof this.storage.getItem !== 'function') return this.getSession();
      try {
        const raw = this.storage.getItem(this.storageKey);
        if (!raw) return this.getSession();
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') {
          this.session = {
            ...this.session,
            ...parsed,
            conversation: Array.isArray(parsed.conversation) ? parsed.conversation : [],
            routeSuggestions: Array.isArray(parsed.routeSuggestions) ? parsed.routeSuggestions : [],
            taskReferences: Array.isArray(parsed.taskReferences) ? parsed.taskReferences : []
          };
        }
      } catch (_error) {
        // keep default state on malformed storage
      }
      return this.getSession();
    }
  }

  global.AgentSessionState = AgentSessionState;
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = AgentSessionState;
  }
})(typeof window !== 'undefined' ? window : globalThis);
