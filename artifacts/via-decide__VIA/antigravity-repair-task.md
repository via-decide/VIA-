Repair mode for repository via-decide/VIA.

TARGET
Validate and repair only the files touched by the previous implementation.

TASK
<<<<<<< simba/implement-a-core-backend-module-called-via-plugi
Implement a core backend module called via-plugin-loader to allow the engine to hot-swap agent capabilities and toolsets without restarting the Node process. 1. Create a new directory src/core/runtime/plugin-loader/. 2. Create plugin-manifest.json defining the directory structure for external plugins, permitted NPM dependencies, and security sandbox levels. 3. Implement PluginManager.js (or .ts). This module must be capable of scanning a plugins/ folder and dynamically importing JavaScript modules using import() or require(). 4. Build a "Lifecycle Hook" system: Each plugin must export a standard interface including onLoad(), onEnable(), onDisable(), and getMetadata(). 5. Integrate with the EventBus and SwarmBalancer. When a plugin is loaded, it must automatically register its specialized agents or tools with the PredictiveEngine so they can immediately begin receiving routed traffic. 6. Implement a "Hot-Reload" watcher using fs.watch. If a developer or an automated CI/CD pipeline updates a plugin file, the PluginManager should gracefully disable the old version, clear the module cache, and load the new version in real-time.
=======
Implement a core backend module called via-api-gateway-aggregator to orchestrate complex "Scatter-Gather" patterns across multiple autonomous agents. 1. Create a new directory src/core/network/gateway-aggregator/. 2. Create aggregator-config.json defining scatter-gather timeout limits (e.g., 5000ms), partial-response policies, and correlation ID formatting. 3. Implement Aggregator.js (or .ts). This module will sit between the client-facing HTTP/WebSocket layer and the internal SwarmBalancer. 4. Build a concurrent dispatch mechanism. When a complex user query arrives (e.g., "Analyze my profile and cross-reference with trending news"), the Aggregator must break this into sub-tasks, assign a unique correlationId, and dispatch them simultaneously to different specialized agents (e.g., a "ProfileAgent" and a "NewsAgent"). 5. Wait for the asynchronous responses using the correlation IDs. Once all agents reply (or a strict timeout is reached), combine their JSON outputs into a single, unified, and formatted payload. 6. Return this unified payload to the client so the frontend only has to make a single network request.
Implement a core backend module called via-local-vector-store to give autonomous agents fast, in-memory semantic search capabilities for their immediate context. 1. Create a new directory src/core/memory/local-vector-store/. 2. Create vector-config.json defining embedding dimensions (e.g., 1536 for standard OpenAI embeddings or 384 for lightweight local models), max vectors per agent, and the similarity threshold. 3. Implement VectorStore.js (or .ts). This module will manage localized, short-term semantic memory for active agents. 4. Build a highly optimized Cosine Similarity or Dot Product search function to calculate the distance between a query vector and the stored memory chunks. 5. Integrate this with the PredictiveEngine and agent runtime. When an agent receives a large prompt or needs to recall recent conversation history, it should query this local store to fetch the most relevant context chunks (RAG - Retrieval-Augmented Generation) before hitting the LLM API. 6. Implement a rolling window (FIFO) eviction policy so the store does not exceed memory limits over long-running sessions.
Implement a core backend module called via-dynamic-payload-validator to enforce schema strictness and sanitize data flowing between autonomous agents. 1. Create a new directory src/core/security/payload-validator/. 2. Create schema-registry.json defining expected data structures for different event topics (e.g., a "user_message" schema requires a string text and timestamp; an "agent_action" schema requires a tool_name and parameters object). 3. Implement Validator.js (or .ts). This module will act as a strict gatekeeper for the EventBus and PredictiveEngine. 4. Build a lightweight schema parser that validates incoming JSON payloads against the registry in real-time. It must perform deep type-checking, verify required fields, and strip out unexpected or malicious properties (e.g., sanitizing potential injection attacks before they reach a database or a UI client). 5. Hook the Validator into the EventBus.publish pipeline. If a message fails validation, it must NOT be broadcast to subscribers. Instead, throw a specific SchemaValidationError and route the bad payload to the Dead Letter Topic for debugging. 6. Expose a dynamic update method so new schemas can be registered at runtime without restarting the Node server.
Implement a core backend module called via-shadow-router to enable A/B testing and "shadow deployments" of new AI agent logic in production. 1. Create a new directory src/core/network/shadow-router/. 2. Create experiment-config.json defining active experiments, traffic allocation percentages (e.g., 5% to Variant B), and target agent IDs. 3. Implement ShadowRouter.js (or .ts). This module will sit alongside the PredictiveEngine. 4. Build the shadow logic: When a request comes in, the router must route the live request to the primary (Control) agent to ensure the user gets a fast, stable response. Simultaneously, it must asynchronously duplicate the request payload and send it to the experimental (Variant) agent. 5. Build a comparator function: Capture the output, execution time, and memory usage of *both* the Control and Variant agents. 6. Discard the Variant's response (do not send it to the user), but log the comparative metrics to the telemetry stream or database for developer analysis.
>>>>>>> main

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