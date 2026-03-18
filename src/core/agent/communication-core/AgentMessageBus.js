(function (global) {
  'use strict';

  function makeId(prefix) {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  }

  function nowIso() {
    return new Date().toISOString();
  }

  class AgentMessageBus {
    constructor(config) {
      const resolved = config && typeof config === 'object' ? config : {};
      this.config = resolved;
      this.supportedChannels = Array.isArray(resolved.channels) ? resolved.channels.slice() : [];
      this.supportedTypes = Array.isArray(resolved.messageTypes) ? resolved.messageTypes.slice() : [];
      this.supportedPriorities = Array.isArray(resolved.priorities) ? resolved.priorities.slice() : ['normal'];
      this.handlers = new Map();
      this.history = new Map();
      this.maxHistory = Number.isFinite(resolved.maxHistory) ? resolved.maxHistory : 200;
    }

    normalize(channel, message) {
      const input = message && typeof message === 'object' ? message : {};
      const resolvedChannel = String(channel || input.channel || 'chat_channel').trim() || 'chat_channel';
      const normalized = {
        id: input.id || makeId('msg'),
        type: this.supportedTypes.includes(input.type) ? input.type : 'system_notice',
        channel: this.supportedChannels.includes(resolvedChannel) ? resolvedChannel : resolvedChannel,
        priority: this.supportedPriorities.includes(input.priority) ? input.priority : 'normal',
        payload: input.payload && typeof input.payload === 'object' ? input.payload : {},
        source: input.source || 'agent-widget',
        target: input.target || 'broadcast',
        status: input.status || 'queued',
        createdAt: input.createdAt || nowIso()
      };
      return normalized;
    }

    record(message) {
      const bucket = this.history.get(message.channel) || [];
      bucket.push(message);
      this.history.set(message.channel, bucket.slice(-this.maxHistory));
      return message;
    }

    subscribe(channel, handler) {
      if (!channel || typeof handler !== 'function') return () => {};
      const bucket = this.handlers.get(channel) || new Set();
      bucket.add(handler);
      this.handlers.set(channel, bucket);
      return () => this.unsubscribe(channel, handler);
    }

    unsubscribe(channel, handler) {
      const bucket = this.handlers.get(channel);
      if (!bucket) return false;
      const deleted = bucket.delete(handler);
      if (!bucket.size) this.handlers.delete(channel);
      return deleted;
    }

    async publish(channel, message) {
      const normalized = this.normalize(channel, message);
      normalized.status = 'published';
      this.record(normalized);
      const handlers = Array.from(this.handlers.get(normalized.channel) || []);
      const results = await Promise.allSettled(handlers.map(async (handler) => handler(normalized)));
      const deliveryErrors = results
        .filter((entry) => entry.status === 'rejected')
        .map((entry) => entry.reason);
      normalized.status = deliveryErrors.length ? 'partial_failure' : 'delivered';
      return {
        message: normalized,
        ok: deliveryErrors.length === 0,
        errors: deliveryErrors,
        deliveries: results.length
      };
    }

    dispatch(message) {
      const channel = message && message.channel ? message.channel : 'chat_channel';
      return this.publish(channel, message);
    }

    getHistory(channel) {
      if (!channel) {
        return Array.from(this.history.values()).flat().sort((left, right) => {
          return String(left.createdAt || '').localeCompare(String(right.createdAt || ''));
        });
      }
      return (this.history.get(channel) || []).slice();
    }
  }

  global.AgentMessageBus = AgentMessageBus;
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = AgentMessageBus;
  }
})(typeof window !== 'undefined' ? window : globalThis);
