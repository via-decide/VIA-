(function (global) {
  'use strict';

  const MEMORY_KEY = 'viadecide.agent-backend.memory';
  const MAX_NAMESPACE_ITEMS = 40;

  const schemas = {
    'agent:pipeline:active': {
      type: 'object',
      required: ['toolId'],
      properties: {
        toolId: { type: 'string' },
        steps: { type: 'array', items: { type: 'string' } }
      }
    },
    'agent:context-packager:output': {
      type: 'object',
      required: ['packet'],
      properties: {
        packet: { type: 'string' },
        project: { type: 'string' },
        task: { type: 'string' },
        source: { type: 'string' },
        taskFromSplitter: { type: 'string' }
      }
    },
    'agent:spec-builder:output': {
      type: 'object',
      required: ['spec'],
      properties: {
        spec: { type: 'string' },
        feature: { type: 'string' }
      }
    },
    'agent:code-generator:output': {
      type: 'object',
      required: ['prompt'],
      properties: {
        prompt: { type: 'string' },
        spec: { type: 'string' }
      }
    },
    'agent:code-reviewer:feedback': {
      type: 'object',
      required: ['report', 'passed'],
      properties: {
        report: { type: 'string' },
        passed: { type: 'boolean' },
        issues: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              sev: { type: 'string' },
              message: { type: 'string' }
            }
          }
        }
      }
    },
    'agent:output-evaluator:result': {
      type: 'object',
      required: ['report', 'scores'],
      properties: {
        report: { type: 'string' },
        featureName: { type: 'string' },
        scores: { type: 'object' }
      }
    },
    'agent:task-splitter:output': {
      type: 'object',
      required: ['tasks'],
      properties: {
        epic: { type: 'string' },
        tasks: { type: 'array', items: { type: 'object' } }
      }
    }
  };

  function readMemory() {
    try {
      const raw = localStorage.getItem(MEMORY_KEY);
      const parsed = raw ? JSON.parse(raw) : {};
      return parsed && typeof parsed === 'object' ? parsed : {};
    } catch (_error) {
      return {};
    }
  }

  function writeMemory(memory) {
    try {
      localStorage.setItem(MEMORY_KEY, JSON.stringify(memory));
      return true;
    } catch (_error) {
      return false;
    }
  }

  function tokenize(text) {
    return String(text || '')
      .toLowerCase()
      .split(/[^a-z0-9]+/g)
      .map((token) => token.trim())
      .filter((token) => token.length > 1);
  }

  function toVector(text) {
    return tokenize(text).reduce((acc, token) => {
      acc[token] = (acc[token] || 0) + 1;
      return acc;
    }, {});
  }

  function cosineSimilarity(left, right) {
    const leftKeys = Object.keys(left || {});
    const rightKeys = Object.keys(right || {});
    if (!leftKeys.length || !rightKeys.length) return 0;

    let dot = 0;
    let leftNorm = 0;
    let rightNorm = 0;
    leftKeys.forEach((key) => {
      const leftValue = Number(left[key] || 0);
      const rightValue = Number(right[key] || 0);
      dot += leftValue * rightValue;
      leftNorm += leftValue * leftValue;
    });
    rightKeys.forEach((key) => {
      const rightValue = Number(right[key] || 0);
      rightNorm += rightValue * rightValue;
    });

    if (!leftNorm || !rightNorm) return 0;
    return dot / (Math.sqrt(leftNorm) * Math.sqrt(rightNorm));
  }

  function namespaceItems(namespace) {
    const memory = readMemory();
    const items = memory[namespace];
    return Array.isArray(items) ? items : [];
  }

  function indexMemory(namespace, text, metadata = {}) {
    const body = String(text || '').trim();
    if (!body) return null;

    const memory = readMemory();
    const items = namespaceItems(namespace).filter((item) => item && typeof item === 'object');
    items.push({
      id: metadata.id || `memory-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      text: body,
      vector: toVector(body),
      metadata,
      updatedAt: new Date().toISOString()
    });
    memory[namespace] = items.slice(-MAX_NAMESPACE_ITEMS);
    writeMemory(memory);
    return memory[namespace][memory[namespace].length - 1];
  }

  function searchMemory(namespace, query, limit = 3) {
    const queryText = String(query || '').trim();
    if (!queryText) return [];
    const vector = toVector(queryText);
    return namespaceItems(namespace)
      .map((item) => ({ ...item, score: cosineSimilarity(vector, item.vector || {}) }))
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score || String(b.updatedAt || '').localeCompare(String(a.updatedAt || '')))
      .slice(0, limit);
  }

  function sanitizeString(value) {
    return String(value == null ? '' : value).replace(/[<>]/g, '').trim();
  }

  function validateValue(value, schema, path, errors) {
    if (!schema || typeof schema !== 'object') return value;
    const type = schema.type || 'any';

    if (type === 'string') {
      return sanitizeString(value);
    }

    if (type === 'boolean') {
      return Boolean(value);
    }

    if (type === 'number') {
      const numberValue = Number(value);
      if (!Number.isFinite(numberValue)) errors.push(`${path} must be a finite number`);
      return Number.isFinite(numberValue) ? numberValue : 0;
    }

    if (type === 'array') {
      if (!Array.isArray(value)) {
        errors.push(`${path} must be an array`);
        return [];
      }
      return value.map((item, index) => validateValue(item, schema.items || {}, `${path}[${index}]`, errors));
    }

    if (type === 'object') {
      if (!value || typeof value !== 'object' || Array.isArray(value)) {
        errors.push(`${path} must be an object`);
        return {};
      }
      const output = {};
      const required = Array.isArray(schema.required) ? schema.required : [];
      const properties = schema.properties || {};
      required.forEach((key) => {
        if (!(key in value)) errors.push(`${path}.${key} is required`);
      });
      Object.keys(properties).forEach((key) => {
        if (!(key in value)) return;
        output[key] = validateValue(value[key], properties[key], `${path}.${key}`, errors);
      });
      return output;
    }

    return value;
  }

  function validateTopicPayload(topic, payload) {
    const schema = schemas[topic];
    if (!schema) {
      return { ok: true, payload };
    }

    const errors = [];
    const sanitized = validateValue(payload, schema, topic, errors);
    return {
      ok: errors.length === 0,
      payload: sanitized,
      errors
    };
  }

  function registerSchema(topic, schema) {
    if (!topic || !schema || typeof schema !== 'object') return null;
    schemas[topic] = schema;
    return schema;
  }

  function listSchemas() {
    return Object.keys(schemas).sort();
  }

  async function aggregate(request, handlers, options = {}) {
    const items = Array.isArray(handlers) ? handlers.filter(Boolean) : [];
    const correlationId = options.correlationId || `corr-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const settled = await Promise.allSettled(items.map(async (handler) => {
      const run = typeof handler === 'function' ? handler : handler.run;
      const id = typeof handler === 'function' ? `handler-${Math.random().toString(36).slice(2, 6)}` : (handler.id || 'handler');
      const startedAt = Date.now();
      const value = await run(request, { correlationId });
      return {
        id,
        latencyMs: Date.now() - startedAt,
        value
      };
    }));

    const results = [];
    const errors = [];
    settled.forEach((entry) => {
      if (entry.status === 'fulfilled') {
        results.push(entry.value);
        return;
      }
      errors.push({ message: entry.reason?.message || String(entry.reason || 'Unknown aggregator error') });
    });

    return {
      correlationId,
      ok: errors.length === 0,
      results,
      errors,
      request
    };
  }

  global.AgentBackend = {
    indexMemory,
    searchMemory,
    validateTopicPayload,
    registerSchema,
    listSchemas,
    aggregate
  };
})(window);
