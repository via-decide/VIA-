(function (global) {
  'use strict';

  async function loadAgentCommunicationConfig(configUrl) {
    if (global.__VIA_AGENT_COMMUNICATION_CONFIG__) {
      return global.__VIA_AGENT_COMMUNICATION_CONFIG__;
    }

    const fallback = {
      messageTypes: ['user_message', 'agent_reply', 'task_create', 'task_update', 'task_complete', 'route_suggestion', 'setup_event', 'export_event', 'system_notice'],
      channels: ['chat_channel', 'task_channel', 'setup_channel', 'routing_channel', 'export_channel', 'telemetry_channel'],
      priorities: ['critical', 'high', 'normal', 'background'],
      states: ['idle', 'listening', 'thinking', 'routing', 'executing', 'failed', 'completed']
    };

    if (!configUrl || typeof fetch !== 'function') {
      global.__VIA_AGENT_COMMUNICATION_CONFIG__ = fallback;
      return fallback;
    }

    try {
      const response = await fetch(configUrl, { credentials: 'same-origin' });
      if (!response.ok) throw new Error(`Failed to load config: ${response.status}`);
      const data = await response.json();
      global.__VIA_AGENT_COMMUNICATION_CONFIG__ = data;
      return data;
    } catch (_error) {
      global.__VIA_AGENT_COMMUNICATION_CONFIG__ = fallback;
      return fallback;
    }
  }

  async function createAgentCommunicationCore(options) {
    const resolved = options && typeof options === 'object' ? options : {};
    const config = resolved.config || await loadAgentCommunicationConfig(resolved.configUrl);
    const bus = new global.AgentMessageBus(config);
    const tasks = new global.AgentTaskCoordinator({ bus, storage: resolved.storage, storageKey: resolved.taskStorageKey });
    const routes = new global.AgentRouteInterpreter({ routes: resolved.routes });
    const session = new global.AgentSessionState({ storage: resolved.storage, storageKey: resolved.sessionStorageKey });
    const telemetry = new global.AgentTelemetryTracker({ storage: resolved.storage, storageKey: resolved.telemetryStorageKey, mirrorToLocalStorage: resolved.mirrorTelemetry !== false });

    return { config, bus, tasks, routes, session, telemetry };
  }

  global.VIAAgentCommunicationCore = {
    createAgentCommunicationCore,
    loadAgentCommunicationConfig,
    AgentMessageBus: global.AgentMessageBus,
    AgentTaskCoordinator: global.AgentTaskCoordinator,
    AgentRouteInterpreter: global.AgentRouteInterpreter,
    AgentSessionState: global.AgentSessionState,
    AgentTelemetryTracker: global.AgentTelemetryTracker
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = global.VIAAgentCommunicationCore;
  }
})(typeof window !== 'undefined' ? window : globalThis);
