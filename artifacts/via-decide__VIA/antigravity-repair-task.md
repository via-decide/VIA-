Repair mode for repository via-decide/VIA.

TARGET
Validate and repair only the files touched by the previous implementation.

TASK
Implement a core backend module called via-dynamic-payload-validator to enforce schema strictness and sanitize data flowing between autonomous agents. 1. Create a new directory src/core/security/payload-validator/. 2. Create schema-registry.json defining expected data structures for different event topics (e.g., a "user_message" schema requires a string text and timestamp; an "agent_action" schema requires a tool_name and parameters object). 3. Implement Validator.js (or .ts). This module will act as a strict gatekeeper for the EventBus and PredictiveEngine. 4. Build a lightweight schema parser that validates incoming JSON payloads against the registry in real-time. It must perform deep type-checking, verify required fields, and strip out unexpected or malicious properties (e.g., sanitizing potential injection attacks before they reach a database or a UI client). 5. Hook the Validator into the EventBus.publish pipeline. If a message fails validation, it must NOT be broadcast to subscribers. Instead, throw a specific SchemaValidationError and route the bad payload to the Dead Letter Topic for debugging. 6. Expose a dynamic update method so new schemas can be registered at runtime without restarting the Node server.

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