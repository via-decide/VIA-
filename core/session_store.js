(function (global) {
  'use strict';

  function SessionStore(options) {
    var config = options || {};
    this._namespace = config.namespace || 'via:runtime:sessions';
    this._memoryFallback = [];
  }

  SessionStore.prototype._read = function _read() {
    try {
      var raw = global.localStorage.getItem(this._namespace);
      var parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      return this._memoryFallback.slice();
    }
  };

  SessionStore.prototype._write = function _write(sessions) {
    this._memoryFallback = sessions.slice();
    try {
      global.localStorage.setItem(this._namespace, JSON.stringify(sessions));
    } catch (error) {
      return;
    }
  };

  SessionStore.prototype.createSession = function createSession(toolId, metadata) {
    var sessions = this._read();
    var session = {
      id: 'session_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8),
      toolId: toolId,
      startedAt: new Date().toISOString(),
      endedAt: null,
      events: [],
      metadata: metadata || {}
    };
    sessions.push(session);
    this._write(sessions);
    return session;
  };

  SessionStore.prototype.appendEvent = function appendEvent(sessionId, eventType, payload) {
    var sessions = this._read();
    var session = sessions.find(function (item) { return item.id === sessionId; });
    if (!session) return null;

    session.events.push({
      type: eventType,
      payload: payload || {},
      at: new Date().toISOString()
    });

    this._write(sessions);
    return session;
  };

  SessionStore.prototype.endSession = function endSession(sessionId, metadata) {
    var sessions = this._read();
    var session = sessions.find(function (item) { return item.id === sessionId; });
    if (!session) return null;

    session.endedAt = new Date().toISOString();
    session.metadata = Object.assign({}, session.metadata, metadata || {});
    this._write(sessions);
    return session;
  };

  SessionStore.prototype.listSessions = function listSessions() {
    return this._read();
  };

  global.VIA = global.VIA || {};
  global.VIA.SessionStore = SessionStore;
})(window);
