You are working in repository via-decide/VIA on branch main.

MISSION
Implement a core backend module called via-local-vector-store to give autonomous agents fast, in-memory semantic search capabilities for their immediate context. 1. Create a new directory src/core/memory/local-vector-store/. 2. Create vector-config.json defining embedding dimensions (e.g., 1536 for standard OpenAI embeddings or 384 for lightweight local models), max vectors per agent, and the similarity threshold. 3. Implement VectorStore.js (or .ts). This module will manage localized, short-term semantic memory for active agents. 4. Build a highly optimized Cosine Similarity or Dot Product search function to calculate the distance between a query vector and the stored memory chunks. 5. Integrate this with the PredictiveEngine and agent runtime. When an agent receives a large prompt or needs to recall recent conversation history, it should query this local store to fetch the most relevant context chunks (RAG - Retrieval-Augmented Generation) before hitting the LLM API. 6. Implement a rolling window (FIFO) eviction policy so the store does not exceed memory limits over long-running sessions.

CONSTRAINTS
Do NOT use external vector databases like Pinecone, Weaviate, Milvus, or even local binaries like ChromaDB. You must build a native JavaScript/TypeScript implementation using Float32Array for efficient matrix math and vector storage. The search algorithm must be fast enough to perform a brute-force scan of up to 10,000 vectors in under 50ms without blocking the Node event loop.
Implement a core backend module called via-dynamic-payload-validator to enforce schema strictness and sanitize data flowing between autonomous agents. 1. Create a new directory src/core/security/payload-validator/. 2. Create schema-registry.json defining expected data structures for different event topics (e.g., a "user_message" schema requires a string text and timestamp; an "agent_action" schema requires a tool_name and parameters object). 3. Implement Validator.js (or .ts). This module will act as a strict gatekeeper for the EventBus and PredictiveEngine. 4. Build a lightweight schema parser that validates incoming JSON payloads against the registry in real-time. It must perform deep type-checking, verify required fields, and strip out unexpected or malicious properties (e.g., sanitizing potential injection attacks before they reach a database or a UI client). 5. Hook the Validator into the EventBus.publish pipeline. If a message fails validation, it must NOT be broadcast to subscribers. Instead, throw a specific SchemaValidationError and route the bad payload to the Dead Letter Topic for debugging. 6. Expose a dynamic update method so new schemas can be registered at runtime without restarting the Node server.

CONSTRAINTS
Do NOT use heavy external validation libraries like Zod or Joi if they introduce significant latency. You must implement a highly optimized, native recursive checking algorithm. The validation layer must add less than 2ms of overhead per message, ensuring the high-speed swarm communication remains frictionless.
Implement a core backend module called via-shadow-router to enable A/B testing and "shadow deployments" of new AI agent logic in production. 1. Create a new directory src/core/network/shadow-router/. 2. Create experiment-config.json defining active experiments, traffic allocation percentages (e.g., 5% to Variant B), and target agent IDs. 3. Implement ShadowRouter.js (or .ts). This module will sit alongside the PredictiveEngine. 4. Build the shadow logic: When a request comes in, the router must route the live request to the primary (Control) agent to ensure the user gets a fast, stable response. Simultaneously, it must asynchronously duplicate the request payload and send it to the experimental (Variant) agent. 5. Build a comparator function: Capture the output, execution time, and memory usage of *both* the Control and Variant agents. 6. Discard the Variant's response (do not send it to the user), but log the comparative metrics to the telemetry stream or database for developer analysis.

CONSTRAINTS
Do NOT block the main event loop or delay the Control agent's response to the user. The payload duplication and Variant execution must be strictly "fire-and-forget" from the main thread's perspective, offloaded entirely to the WorkerPool. Ensure that the Variant agent operates in a read-only or sandboxed database context so it cannot accidentally mutate real production user data during its test run.

PROCESS (MANDATORY)
1. Read README.md and AGENTS.md before editing.
2. Audit architecture before coding. Summarize current behavior.
3. Preserve unrelated working code. Prefer additive modular changes.
4. Implement the smallest safe change set for the stated goal.
5. Run validation commands and fix discovered issues.
6. Self-review for regressions, missing env wiring, and docs drift.
7. Return complete final file contents for every modified or created file.

REPO AUDIT CONTEXT
- Description: 
- Primary language: HTML
- README snippet:
not found

- AGENTS snippet:
not found


SOP: PRE-MODIFICATION PROTOCOL (MANDATORY)
1. Adherence to Instructions: No deviations without explicit user approval.
2. Mandatory Clarification: Immediately ask if instructions are ambiguous or incomplete.
3. Proposal First: Always propose optimizations or fixes before implementing them.
4. Scope Discipline: Do not add unrequested features or modify unrelated code.
5. Vulnerability Check: Immediately flag and explain security risks.

OUTPUT REQUIREMENTS
- Include: implementation summary, checks run, risks, rollback notes.
- Generate branch + PR package.
- Keep prompts deterministic and preservation-first.