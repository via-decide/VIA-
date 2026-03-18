const BUS_PREFIX = 'bus:';

function getStorage() {
  if (typeof window === 'undefined') return null;
  return window.ToolStorage || null;
}

function getSource() {
  if (typeof document === 'undefined') return 'unknown';
  return document.body?.dataset?.toolId || document.documentElement?.dataset?.toolId || 'unknown';
}

function getAgentBackend() {
  if (typeof window === 'undefined') return null;
  return window.AgentBackend || null;
}

function sanitizePayload(channel, payload) {
  const backend = getAgentBackend();
  if (!backend || typeof backend.validateTopicPayload !== 'function') return payload;
  const result = backend.validateTopicPayload(channel, payload);
  if (result.ok) return result.payload;
  console.warn(`Payload rejected for ${channel}`, result.errors || []);
  return null;
}

function indexPayload(channel, envelope) {
  const backend = getAgentBackend();
  if (!backend || typeof backend.indexMemory !== 'function') return;
  const text = [channel, envelope?.source || '', JSON.stringify(envelope?.data || {})].join('\n');
  backend.indexMemory('tool-bus', text, { channel, source: envelope?.source || 'unknown' });
}

export function emit(channel, payload) {
  const storage = getStorage();
  if (!storage || typeof storage.write !== 'function') return;
  const nextPayload = sanitizePayload(channel, payload);
  if (nextPayload === null) return;
  const envelope = {
    data: nextPayload,
    emittedAt: new Date().toISOString(),
    source: getSource()
  };
  storage.write(`${BUS_PREFIX}${channel}`, envelope);
  indexPayload(channel, envelope);
}

export function read(channel) {
  const storage = getStorage();
  if (!storage || typeof storage.read !== 'function') return null;
  return storage.read(`${BUS_PREFIX}${channel}`, null);
}

export function clear(channel) {
  const storage = getStorage();
  if (!storage || typeof storage.remove !== 'function') return;
  storage.remove(`${BUS_PREFIX}${channel}`);
}

export function listChannels() {
  if (typeof localStorage === 'undefined') return [];
  const channels = [];
  for (let index = 0; index < localStorage.length; index += 1) {
    const key = localStorage.key(index);
    if (!key) continue;
    const busMarker = `.tools.${BUS_PREFIX}`;
    const markerIndex = key.indexOf(busMarker);
    if (markerIndex === -1) continue;
    channels.push(key.slice(markerIndex + busMarker.length));
  }
  return channels;
}

export function onUpdate(channel, callback, intervalMs = 1500) {
  let lastValue = JSON.stringify(read(channel));
  const timer = window.setInterval(() => {
    const next = read(channel);
    const serialized = JSON.stringify(next);
    if (serialized === lastValue) return;
    lastValue = serialized;
    callback(next);
  }, intervalMs);

  return () => window.clearInterval(timer);
}

export function buildPipelineStatus(steps, currentStep) {
  if (!Array.isArray(steps) || !steps.length) return '';
  const activeIndex = steps.indexOf(currentStep);

  return `<div class="pipeline-strip">${steps.map((step, index) => {
    let className = 'future';
    if (activeIndex !== -1 && index < activeIndex) className = 'past';
    if (step === currentStep) className = 'active';
    return `<span class="pipeline-step ${className}">${step}</span>`;
  }).join('<span class="pipeline-arrow">→</span>')}</div>`;
}

export async function aggregate(channel, handlers, options = {}) {
  const backend = getAgentBackend();
  if (backend && typeof backend.aggregate === 'function') {
    return backend.aggregate({ channel }, handlers, options);
  }
  const items = Array.isArray(handlers) ? handlers.filter(Boolean) : [];
  const settled = await Promise.allSettled(items.map((handler) => handler()));
  return {
    correlationId: options.correlationId || `corr-${Date.now()}`,
    ok: settled.every((item) => item.status === 'fulfilled'),
    results: settled.filter((item) => item.status === 'fulfilled').map((item) => item.value),
    errors: settled.filter((item) => item.status === 'rejected').map((item) => ({ message: item.reason?.message || String(item.reason || 'Unknown error') }))
  };
}
