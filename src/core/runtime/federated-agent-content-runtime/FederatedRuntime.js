import { SurfaceAgentBridge } from './SurfaceAgentBridge.js';
import { SurfaceContentBridge } from './SurfaceContentBridge.js';
import { AgentContentOrchestrator } from './AgentContentOrchestrator.js';
import { SurfacePrefetchCoordinator } from './SurfacePrefetchCoordinator.js';
import { IntegratedTelemetryTracker } from './IntegratedTelemetryTracker.js';

const AGENT_CORE_SCRIPT_BASE = '../../agent/communication-core/';
const CONTENT_CORE_SCRIPT_BASE = '../../content/micro-content-architecture/';
const AGENT_CORE_SCRIPTS = [
  'AgentMessageBus.js',
  'AgentTaskCoordinator.js',
  'AgentRouteInterpreter.js',
  'AgentSessionState.js',
  'AgentTelemetryTracker.js',
  'index.js'
];
const CONTENT_CORE_SCRIPTS = [
  'MicroContentParser.js',
  'MicroContentComposer.js',
  'MicroContentRegistry.js',
  'index.js'
];

function createMemoryStorage() {
  const memory = new Map();
  return {
    getItem(key) {
      return memory.has(key) ? memory.get(key) : null;
    },
    setItem(key, value) {
      memory.set(key, String(value));
    },
    removeItem(key) {
      memory.delete(key);
    }
  };
}

function createEmitter() {
  const listeners = new Map();
  return {
    emit(eventName, payload) {
      const bucket = Array.from(listeners.get(eventName) || []);
      bucket.forEach((handler) => {
        try {
          handler(payload, { eventName, payload, timestamp: Date.now() });
        } catch (_error) {}
      });
    },
    subscribe(eventName, handler) {
      if (!eventName || typeof handler !== 'function') return () => {};
      const bucket = listeners.get(eventName) || new Set();
      bucket.add(handler);
      listeners.set(eventName, bucket);
      return () => {
        bucket.delete(handler);
        if (!bucket.size) listeners.delete(eventName);
      };
    }
  };
}

function buildFallbackRouteMap() {
  return {
    feed_surface: './index.html?surface=feed',
    discover_surface: './index.html?surface=discover',
    creator_surface: './creator-onboarding.html',
    story_surface: './creator-story.html',
    profile_surface: './index.html?surface=profile',
    about_surface: './index.html?surface=about',
    engine_tools_surface: './tools/tool-router/index.html',
    agent_surface: './agent/index.html'
  };
}

function safeClone(value, fallback = null) {
  try {
    return JSON.parse(JSON.stringify(value));
  } catch (_error) {
    return fallback;
  }
}

async function loadPlainScripts(basePath, files) {
  if (typeof document === 'undefined') return;
  for (let index = 0; index < files.length; index += 1) {
    const file = files[index];
    const url = new URL(file, new URL(basePath, import.meta.url)).href;
    const existing = document.querySelector(`script[data-federated-runtime-src="${url}"]`);
    if (existing) continue;
    await new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = url;
      script.async = false;
      script.dataset.federatedRuntimeSrc = url;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error(`Failed to load ${url}`));
      document.head.appendChild(script);
    });
  }
}

function createSharedRuntimeShim(storage) {
  const emitter = createEmitter();
  return {
    storage,
    emit(eventName, payload) {
      emitter.emit(eventName, payload);
      return { eventName, payload, timestamp: Date.now() };
    },
    subscribe(eventName, handler) {
      return emitter.subscribe(eventName, handler);
    },
    getStorage(key) {
      const raw = storage.getItem(`via.runtime.storage.${key}`);
      if (!raw) return null;
      try {
        return JSON.parse(raw);
      } catch (_error) {
        return raw;
      }
    },
    setStorage(key, value) {
      storage.setItem(`via.runtime.storage.${key}`, typeof value === 'string' ? value : JSON.stringify(value));
      emitter.emit('storage', { key, value });
      return value;
    },
    getAuthState() {
      return this.getStorage('auth_state');
    },
    setAuthState(value) {
      this.setStorage('auth_state', value);
      return value;
    }
  };
}

function createAgentCoreShim(storage) {
  const emitter = createEmitter();
  const tasks = [];
  const sessionState = {
    id: '',
    state: 'idle',
    createdAt: '',
    updatedAt: '',
    pageContext: {},
    conversation: [],
    routeSuggestions: [],
    taskReferences: []
  };

  return {
    config: {},
    bus: {
      async publish(channel, message) {
        const normalized = {
          channel,
          ...message,
          createdAt: message && message.createdAt ? message.createdAt : new Date().toISOString()
        };
        emitter.emit(channel, normalized);
        return { ok: true, message: normalized, deliveries: 1, errors: [] };
      },
      subscribe(channel, handler) {
        return emitter.subscribe(channel, handler);
      },
      getHistory() {
        return [];
      }
    },
    tasks: {
      createTask(input = {}) {
        const task = {
          id: input.id || `task-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          title: String(input.title || input.text || 'Follow up').trim(),
          origin: input.origin || 'federated-runtime-shim',
          linkedRoute: input.linkedRoute || '',
          linkedPrompt: input.linkedPrompt || '',
          suggestedAction: input.suggestedAction || '',
          completed: false,
          createdAt: new Date().toISOString()
        };
        tasks.push(task);
        storage.setItem('via.runtime.federated.agent.tasks', JSON.stringify(tasks));
        return safeClone(task, task);
      },
      updateTask(taskId, patch = {}) {
        const index = tasks.findIndex((task) => task.id === taskId);
        if (index === -1) return null;
        tasks[index] = { ...tasks[index], ...patch };
        return safeClone(tasks[index], tasks[index]);
      },
      completeTask(taskId) {
        return this.updateTask(taskId, { completed: true, completedAt: new Date().toISOString() });
      },
      listTasks() {
        return safeClone(tasks, []) || [];
      }
    },
    routes: {
      suggestRoute(message, pageContext = {}) {
        const text = `${String(message || '')} ${String(pageContext.title || '')}`.toLowerCase();
        const routeMap = buildFallbackRouteMap();
        if (/creator|draft|post/.test(text)) {
          return { label: 'Creator Setup', path: routeMap.creator_surface, surfaceName: 'creator_surface', confidence: 0.83, reason: 'Matched creator drafting intent.' };
        }
        if (/about|why via|mission/.test(text)) {
          return { label: 'About VIA', path: routeMap.about_surface, surfaceName: 'about_surface', confidence: 0.77, reason: 'Matched product context intent.' };
        }
        return { label: 'Discover', path: routeMap.discover_surface, surfaceName: 'discover_surface', confidence: 0.75, reason: 'Matched general exploration intent.' };
      }
    },
    session: {
      session: sessionState,
      getSession() {
        return safeClone(sessionState, sessionState);
      },
      startSession(meta = {}) {
        sessionState.id = `session-${Date.now()}`;
        sessionState.createdAt = new Date().toISOString();
        sessionState.updatedAt = sessionState.createdAt;
        sessionState.pageContext = safeClone(meta.pageContext, {}) || {};
        sessionState.state = meta.state || 'listening';
        return this.persist();
      },
      appendTurn(turn = {}) {
        sessionState.conversation.push({ ...turn, createdAt: turn.createdAt || new Date().toISOString() });
        return this.persist();
      },
      persist() {
        sessionState.updatedAt = new Date().toISOString();
        storage.setItem('via.runtime.federated.agent.session', JSON.stringify(sessionState));
        return this.getSession();
      }
    },
    telemetry: {
      track() {},
      getSnapshot() { return {}; },
      flush() { return {}; }
    }
  };
}

function createContentCoreShim() {
  return {
    parser: {
      parseLongform(input) {
        const payload = input && typeof input === 'object' ? input : { body: String(input || '') };
        return {
          meta: {
            title: payload.title || 'Untitled',
            surface: payload.surface || 'story_surface',
            origin: payload.origin || 'agent_generated'
          },
          units: [
            { id: `hook-${Date.now()}`, type: 'hook', title: payload.title || 'Untitled', body: payload.body || payload.text || payload.idea || '', order: 1, tags: payload.tags || [], surface: payload.surface || 'story_surface', origin: payload.origin || 'agent_generated' },
            { id: `cta-${Date.now()}`, type: 'cta', title: 'Next move', body: 'Turn this into a creator draft or feed card inside VIA.', order: 2, tags: payload.tags || [], surface: payload.surface || 'story_surface', origin: payload.origin || 'agent_generated' }
          ],
          contentMap: {}
        };
      }
    },
    composer: {},
    registry: {
      registerBatch(units) {
        return Array.isArray(units) ? units.slice() : [];
      }
    },
    parseAndRegister(input) {
      return this.parser.parseLongform(input);
    }
  };
}

function createNavigationShim(baseUrl) {
  const routeMap = buildFallbackRouteMap();
  return {
    openSurface(name) {
      const path = routeMap[name] || routeMap.feed_surface;
      if (typeof window !== 'undefined') {
        window.location.href = new URL(path, baseUrl || window.location.href).href;
      }
      return path;
    },
    openSubpage(path) {
      if (!path) return '';
      if (typeof window !== 'undefined') {
        window.location.href = new URL(path, baseUrl || window.location.href).href;
      }
      return path;
    }
  };
}

function createLoaderShim(runtime) {
  return {
    async mountSurface(name, target) {
      if (target && target.setAttribute) {
        target.setAttribute('data-federated-surface', name);
      }
      runtime.emit('surface_mount', { surfaceName: name, degraded: true });
      return { name, target, degraded: true };
    },
    async prefetchSurface(name) {
      runtime.emit('surface_prefetch', { surfaceName: name, degraded: true });
      return { name, prefetched: false, degraded: true };
    }
  };
}

export class FederatedRuntime {
  constructor(config = {}, deps = {}) {
    this.config = config || {};
    this.deps = deps || {};
    this.storage = this.deps.storage || (typeof window !== 'undefined' ? window.localStorage : createMemoryStorage());
    this.emitter = createEmitter();
    this.bootstrapped = false;
    this.frontend = null;
    this.agent = null;
    this.content = null;
    this.sharedRuntime = null;
    this.loader = null;
    this.navigation = null;
    this.registry = null;
    this.telemetry = new IntegratedTelemetryTracker({ storage: this.storage });
    this.registeredSurfaces = new Map();
    this.pageContext = this.deps.pageContext || null;
    this.lastAgentResult = null;
    this.lastContentResult = null;
    this.lastMountedSurface = '';
    this.prefetchCoordinator = new SurfacePrefetchCoordinator({ runtime: this });
    this.agentBridge = new SurfaceAgentBridge({ runtime: this });
    this.contentBridge = new SurfaceContentBridge({ runtime: this });
    this.orchestrator = new AgentContentOrchestrator({
      runtime: this,
      contentBridge: this.contentBridge,
      prefetchCoordinator: this.prefetchCoordinator
    });
  }

  async bootstrap() {
    if (this.bootstrapped) return this;

    await this.discoverFrontend();
    await this.discoverAgent();
    await this.discoverContent();

    (this.config.surfaceModules || []).forEach((name) => this.registerSurface(name, this.resolveSurfaceDefinition(name)));

    this.prefetchCoordinator.loader = this.loader;
    this.agentBridge.agentCore = this.agent;
    this.agentBridge.navigation = this.navigation;
    this.contentBridge.contentCore = this.content;
    this.orchestrator.agentCore = this.agent;

    this.bootstrapped = true;
    this.emit('system_notice', {
      type: 'runtime_bootstrap',
      degraded: !this.frontend || !this.agent || !this.content
    });
    return this;
  }

  async discoverFrontend() {
    if (this.deps.frontend) {
      this.frontend = this.deps.frontend;
    } else {
      try {
        const frontendModule = await import('../../frontend/micro-frontend-architecture/index.js');
        this.frontend = await frontendModule.createMicroFrontendArchitecture(this.deps.frontendOptions || {});
      } catch (_error) {
        this.frontend = null;
      }
    }

    this.registry = this.frontend && this.frontend.registry ? this.frontend.registry : null;
    this.sharedRuntime = this.frontend && this.frontend.runtime ? this.frontend.runtime : createSharedRuntimeShim(this.storage || createMemoryStorage());
    this.loader = this.frontend && this.frontend.loader ? this.frontend.loader : createLoaderShim(this);
    this.navigation = this.frontend && this.frontend.navigation ? this.frontend.navigation : createNavigationShim(this.deps.baseUrl || (typeof window !== 'undefined' ? window.location.href : 'http://localhost/'));
    return this.frontend;
  }

  async discoverAgent() {
    if (this.deps.agentCore) {
      this.agent = this.deps.agentCore;
      return this.agent;
    }

    if (typeof window !== 'undefined' && window.VIAAgentCommunicationCore && typeof window.VIAAgentCommunicationCore.createAgentCommunicationCore === 'function') {
      this.agent = await window.VIAAgentCommunicationCore.createAgentCommunicationCore();
      return this.agent;
    }

    try {
      await loadPlainScripts(AGENT_CORE_SCRIPT_BASE, AGENT_CORE_SCRIPTS);
      if (typeof window !== 'undefined' && window.VIAAgentCommunicationCore && typeof window.VIAAgentCommunicationCore.createAgentCommunicationCore === 'function') {
        this.agent = await window.VIAAgentCommunicationCore.createAgentCommunicationCore();
        return this.agent;
      }
    } catch (_error) {}

    this.agent = createAgentCoreShim(this.storage || createMemoryStorage());
    return this.agent;
  }

  async discoverContent() {
    if (this.deps.contentCore) {
      this.content = this.deps.contentCore;
      return this.content;
    }

    if (typeof window !== 'undefined' && typeof window.createMicroContentArchitecture === 'function') {
      try {
        this.content = window.createMicroContentArchitecture();
        return this.content;
      } catch (_error) {}
    }

    try {
      await loadPlainScripts(CONTENT_CORE_SCRIPT_BASE, CONTENT_CORE_SCRIPTS);
      if (typeof window !== 'undefined' && typeof window.createMicroContentArchitecture === 'function') {
        this.content = window.createMicroContentArchitecture();
        return this.content;
      }
    } catch (_error) {}

    this.content = createContentCoreShim();
    return this.content;
  }

  resolveSurfaceDefinition(name) {
    const routeMap = buildFallbackRouteMap();
    return {
      name,
      path: routeMap[name] || routeMap.feed_surface
    };
  }

  registerSurface(name, moduleDef = {}) {
    if (!name) return null;
    this.registeredSurfaces.set(name, { name, ...moduleDef });
    if (this.registry && typeof this.registry.register === 'function' && !this.registry.get(name)) {
      try {
        this.registry.register(name, moduleDef);
      } catch (_error) {}
    }
    return this.registeredSurfaces.get(name);
  }

  registerAgent(agentCore) {
    this.agent = agentCore || createAgentCoreShim(this.storage || createMemoryStorage());
    this.agentBridge.agentCore = this.agent;
    this.orchestrator.agentCore = this.agent;
    return this.agent;
  }

  registerContentSystem(contentCore) {
    this.content = contentCore || createContentCoreShim();
    this.contentBridge.contentCore = this.content;
    return this.content;
  }

  async mountSurface(name, target, meta = {}) {
    const previousSurface = this.lastMountedSurface;
    let result = null;

    try {
      result = this.loader && typeof this.loader.mountSurface === 'function'
        ? await this.loader.mountSurface(name, target, meta)
        : await createLoaderShim(this).mountSurface(name, target, meta);
      this.lastMountedSurface = name;
      this.pageContext = {
        ...(this.pageContext || {}),
        ...(meta.pageContext || {}),
        surfaceName: name
      };
      this.telemetry.track(previousSurface && previousSurface !== name ? 'surface_swap' : 'surface_mount', {
        from: previousSurface || '',
        to: name,
        meta
      });
      this.emit('surface_open', { surfaceName: name, meta, pageContext: this.pageContext });
      return result;
    } catch (error) {
      this.telemetry.track('system_notice', { type: 'mount_surface_error', surfaceName: name, message: error.message });
      return { error, degraded: true };
    }
  }

  async handoffToAgent(payload = {}) {
    const result = await this.orchestrator.processUserIntent(payload.message || payload.text || '', {
      ...payload,
      pageContext: payload.pageContext || this.pageContext || {},
      surfaceName: payload.surfaceName || this.lastMountedSurface || (this.pageContext && this.pageContext.surfaceName) || ''
    });

    this.lastAgentResult = result;

    if (result.routeSuggestion && payload.openSurface !== false) {
      this.agentBridge.openSuggestedSurface(result.routeSuggestion);
    }

    if (result.contentResult && result.contentResult.draft && this.sharedRuntime && typeof this.sharedRuntime.setStorage === 'function') {
      this.sharedRuntime.setStorage('federated_runtime.creator_draft', result.contentResult);
    }

    if (result.task && this.sharedRuntime && typeof this.sharedRuntime.setStorage === 'function') {
      this.sharedRuntime.setStorage('federated_runtime.last_task', result.task);
    }

    return result;
  }

  handoffToContent(payload = {}) {
    const surfaceName = payload.surfaceName || this.lastMountedSurface || 'story_surface';
    const input = payload.input || payload.longform || payload;
    let result = null;

    if (payload.mode === 'feed_units') {
      result = this.contentBridge.buildFeedUnits(input);
    } else if (payload.mode === 'trend_stack') {
      result = this.contentBridge.buildTrendStack(input);
    } else {
      result = this.contentBridge.buildCreatorDraft(input);
    }

    this.lastContentResult = result;
    if (result && this.sharedRuntime && typeof this.sharedRuntime.setStorage === 'function') {
      this.sharedRuntime.setStorage(`federated_runtime.${surfaceName}.${payload.mode || 'creator_draft'}`, result);
    }
    this.emit('content_request', { surfaceName, mode: payload.mode || 'creator_draft', result });
    return result;
  }

  emit(eventName, payload = {}) {
    const trackedEvents = new Set([
      'surface_mount',
      'surface_swap',
      'user_message',
      'agent_reply',
      'route_suggestion',
      'task_create',
      'task_update',
      'draft_generate',
      'content_decomposition',
      'surface_prefetch'
    ]);

    if (trackedEvents.has(eventName)) {
      this.telemetry.track(eventName, payload);
    }

    this.emitter.emit(eventName, payload);
    if (this.sharedRuntime && typeof this.sharedRuntime.emit === 'function') {
      this.sharedRuntime.emit(eventName, payload);
    }
    if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
      window.dispatchEvent(new CustomEvent(`via:federated:${eventName}`, {
        detail: { eventName, payload, timestamp: Date.now() }
      }));
    }
    return { eventName, payload, timestamp: Date.now() };
  }

  subscribe(eventName, handler) {
    return this.emitter.subscribe(eventName, handler);
  }

  getSnapshot() {
    return {
      bootstrapped: this.bootstrapped,
      config: safeClone(this.config, this.config),
      pageContext: safeClone(this.pageContext, this.pageContext),
      registeredSurfaces: Array.from(this.registeredSurfaces.values()).map((item) => safeClone(item, item)),
      lastMountedSurface: this.lastMountedSurface,
      lastAgentResult: safeClone(this.lastAgentResult, this.lastAgentResult),
      lastContentResult: safeClone(this.lastContentResult, this.lastContentResult),
      dependencies: {
        frontend: Boolean(this.frontend),
        agent: Boolean(this.agent),
        content: Boolean(this.content),
        sharedRuntime: Boolean(this.sharedRuntime),
        loader: Boolean(this.loader),
        navigation: Boolean(this.navigation)
      },
      telemetry: this.telemetry.getSnapshot()
    };
  }
}
