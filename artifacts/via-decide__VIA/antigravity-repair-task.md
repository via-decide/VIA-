Repair mode for repository via-decide/VIA.

TARGET
Validate and repair only the files touched by the previous implementation.

TASK
Implement a core backend module called via-distributed-trace-logger to provide full observability for complex, multi-agent request chains. 1. Create a new directory src/core/diagnostics/trace-logger/. 2. Create trace-config.json defining sampling rates (e.g., trace 10% of standard traffic, 100% of errors), retention periods, and metadata tags. 3. Implement TraceProvider.js (or .ts). This module must generate a unique traceId for every incoming root request (from SocketMesh or API). 4. Build a "Context Propagator": As a request moves through the PredictiveEngine, gets assigned to a WorkerPool thread, or publishes an event to the SwarmBus, the traceId and a new spanId must be passed along in the message headers. 5. Create an asynchronous "Span Logger" that records the start time, end time, status, and agent ID for every step in the chain. 6. Integrate with AsyncDbSync: Instead of writing logs one-by-one, batch these trace spans and flush them to a specialized "telemetry_traces" table/collection. 7. Expose a retrieval API: getTraceTimeline(traceId) which reconstructs the entire journey of a request across all micro-agents into a structured JSON tree.

RULES
1. Audit touched files first and identify regressions.
2. Preserve architecture and naming conventions.
3. Make minimal repairs only; do not expand scope.
4. Re-run checks and provide concise root-cause notes.
5. Return complete contents for changed files only.

SOP: REPAIR PROTOCOL (MANDATORY)
1. Strict Fix Only: Do not use repair mode to expand scope or add features.
2. Regression Check: Audit why previous attempt failed before proposing a fix.
3. Minimal Footprint: Only return contents for the actual repaired files.

REPO CONTEXT
- README snippet:
not found
- AGENTS snippet:
not found
- package.json snippet:
not found