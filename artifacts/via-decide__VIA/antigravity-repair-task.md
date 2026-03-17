Repair mode for repository via-decide/VIA.

TARGET
Validate and repair only the files touched by the previous implementation.

TASK
Implement a core backend middleware module called via-predictive-router (inspired by Meta's Moltbot) to handle high-scale, AI-driven traffic routing. 1. Create a new directory src/core/network/predictive-router/. 2. Create router-config.json defining routing schemas, priority queues, and target execution nodes (e.g., "edge_cache", "core_db", "integrity_agent"). 3. Implement PredictiveEngine.js (or .ts). This class must act as a central middleware interceptor for all incoming system requests, agent messages, and data payloads. 4. The engine must classify payloads in real-time (e.g., separating lightweight data queries from heavy AI tasks or media uploads) and dynamically route them to the appropriate processing queues to prevent database bottlenecks. 5. Integrate this router into the main event loop or server entry point (src/index.js or src/server.js), ensuring all incoming traffic passes through PredictiveEngine.route(). 6. Create an internal telemetry tracker that logs latency metrics, routing decisions, and dropped packets to a shared memory space or log file. 7. Expose a WebSocket or API endpoint (e.g., /api/v1/system/traffic) so that external dashboard UI tools (like the engine-tools) can connect and visualize real-time flow and load balancing.

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