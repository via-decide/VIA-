(function (global) {
  'use strict';

  const DEFAULT_STORAGE_KEY = 'viadecide.agent.tasks';

  function safeJsonParse(raw, fallback) {
    try {
      return raw ? JSON.parse(raw) : fallback;
    } catch (_error) {
      return fallback;
    }
  }

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  class AgentTaskCoordinator {
    constructor(options) {
      const resolved = options && typeof options === 'object' ? options : {};
      this.storage = resolved.storage || global.localStorage;
      this.storageKey = resolved.storageKey || DEFAULT_STORAGE_KEY;
      this.bus = resolved.bus || null;
      this.tasks = [];
      this.loadFromStorage();
    }

    buildTask(input) {
      const payload = input && typeof input === 'object' ? input : { title: String(input || '').trim() };
      const timestamp = new Date().toISOString();
      return {
        id: payload.id || `task-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        title: String(payload.title || payload.text || 'Untitled task').trim() || 'Untitled task',
        completed: Boolean(payload.completed),
        createdAt: payload.createdAt || timestamp,
        updatedAt: timestamp,
        origin: payload.origin || 'agent-widget',
        linkedRoute: payload.linkedRoute || '',
        linkedPrompt: payload.linkedPrompt || '',
        suggestedAction: payload.suggestedAction || '',
        notes: payload.notes || '',
        metadata: payload.metadata && typeof payload.metadata === 'object' ? payload.metadata : {}
      };
    }

    emit(type, task) {
      if (!this.bus) return;
      this.bus.publish('task_channel', {
        type,
        priority: type === 'task_complete' ? 'high' : 'normal',
        payload: { task: clone(task) },
        source: 'AgentTaskCoordinator',
        target: 'task_channel'
      });
    }

    createTask(input) {
      const task = this.buildTask(input);
      this.tasks.push(task);
      this.syncToStorage();
      this.emit('task_create', task);
      return clone(task);
    }

    updateTask(taskId, patch) {
      const index = this.tasks.findIndex((task) => task.id === taskId);
      if (index === -1) return null;
      const next = {
        ...this.tasks[index],
        ...(patch && typeof patch === 'object' ? patch : {}),
        updatedAt: new Date().toISOString()
      };
      this.tasks[index] = next;
      this.syncToStorage();
      this.emit('task_update', next);
      return clone(next);
    }

    completeTask(taskId) {
      const task = this.updateTask(taskId, { completed: true, completedAt: new Date().toISOString() });
      if (task) this.emit('task_complete', task);
      return task;
    }

    deleteTask(taskId) {
      const index = this.tasks.findIndex((task) => task.id === taskId);
      if (index === -1) return null;
      const removed = this.tasks.splice(index, 1)[0];
      this.syncToStorage();
      return clone(removed);
    }

    listTasks() {
      return this.tasks.map((task) => clone(task));
    }

    syncToStorage() {
      if (!this.storage || typeof this.storage.setItem !== 'function') return this.listTasks();
      this.storage.setItem(this.storageKey, JSON.stringify(this.tasks));
      return this.listTasks();
    }

    loadFromStorage() {
      if (!this.storage || typeof this.storage.getItem !== 'function') {
        this.tasks = [];
        return this.listTasks();
      }
      const parsed = safeJsonParse(this.storage.getItem(this.storageKey), []);
      this.tasks = Array.isArray(parsed) ? parsed : [];
      return this.listTasks();
    }
  }

  global.AgentTaskCoordinator = AgentTaskCoordinator;
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = AgentTaskCoordinator;
  }
})(typeof window !== 'undefined' ? window : globalThis);
