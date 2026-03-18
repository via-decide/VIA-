# Agent Backend Option 3

This package starts Option 3 using browser-safe shared modules.

## Included modules

- `shared/agent-backend.js`
  - topic schema registry for the pipeline bus
  - payload validation and sanitization
  - local semantic memory using token vectors + cosine similarity
  - request aggregation with correlation IDs
- `shared/tool-bus.js`
  - validates bus payloads before emit
  - indexes emitted payloads into local semantic memory
  - exposes an `aggregate(...)` helper for pipeline tools
- `tools/output-evaluator/tool.js`
  - hydrates pipeline context through the shared aggregator
  - stores aggregated context/review snapshots into local memory
- `shared/agent-runtime.js`
  - indexes successful LLM prompt/result pairs into local agent memory

## Runtime model

Everything remains browser-first:

- schemas live in memory
- semantic memory lives in `localStorage`
- aggregation is Promise-based and local to the page
- module usage is optional and guarded behind `window.AgentBackend`

## Memory namespaces

- `tool-bus`
- `pipeline-snapshots`
- `agent-runtime:<agentId>`

## Next safe step

Add a small inspection UI that can list schemas, replay bus payloads, and surface the top semantic matches for a given prompt.
