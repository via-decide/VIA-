You are working in repository via-decide/VIA on branch main.

MISSION
Implement a lightweight, cross-platform Developer SDK and CLI tool called via-sdk-core to enable programmatic access to the AI Swarm and Gateway. 1. Create a new directory src/tools/sdk/ for the Node.js/Browser client, and src/tools/cli/ for the terminal interface. 2. Implement ViaClient.ts (The SDK). Expose clean, strongly-typed methods: via.agents.spawn(), via.swarm.execute(prompt), and via.memory.search(query). 3. Create an AsyncStreamHandler.ts within the SDK. It must seamlessly wrap the backend's via-realtime-bus (WebSockets or Server-Sent Events) into standard async iterables (for await (const chunk of stream)), making it trivial for developers to consume streaming LLM tokens in their own React/Vue apps. 4. Implement cli.ts using a library like Commander.js or Yargs. Support commands like via run "analyze this codebase" --agent=Coder --context=./src. 5. Build AuthManager.ts for the CLI. Allow developers to run via login to securely store a long-lived Personal Access Token (PAT) in their local OS keychain or a ~/.via/config.json file. 6. Hook the CLI into the via-agent-tools local execution environment. Allow a flag like --allow-local-fs to permit the cloud-based AI swarm to read/write files directly to the developer's local machine via the CLI tunnel. 7. Expose an automated build step that bundles the SDK into a heavily minified npm package (@via-decide/sdk) and compiles the CLI into standalone binaries for Windows, macOS, and Linux using Vercel's pkg or similar.

CONSTRAINTS
The SDK MUST have zero heavy dependencies to ensure it doesn't bloat the bundle size of consumer applications. Use native fetch and standard Web APIs where possible. The CLI must handle network interruptions gracefully, buffering local output and resuming the stream if the connection to the via-model-gateway stutters.
Implement a highly scalable, bi-directional event stream called via-realtime-bus using WebSockets to stream agent thoughts, tool executions, and LLM tokens directly to the client UI. 1. Create a new directory src/core/network/realtime/. 2. Implement SocketManager.ts. Initialize a WebSocket server (e.g., using ws or Socket.io) that requires strict JWT authentication during the initial upgrade handshake to prevent unauthorized connections. 3. Create an EventBroadcaster.ts hooked into a Redis Pub/Sub backplane. Because VIA may scale horizontally across multiple Node.js instances, if Agent Swarm A is running on Server 1, but the User is connected to Server 2, the events must instantly bridge across the Redis backplane to reach the correct client. 4. Implement an LLMStreamer.ts. As the via-model-gateway receives raw text chunks from OpenAI/Anthropic, this module must instantly forward those partial strings to the client (e.g., emitting a chunk event) to create a fluid, typewriter-style UI experience. 5. Build an AgentStateTracker.ts. When the via-agent-swarm shifts context or uses the via-agent-tools, emit structured state changes (e.g., {"status": "running_tool", "tool": "fetch_url", "agent": "Researcher"}) so the frontend can render dynamic loading indicators or "thought bubbles." 6. Implement a bi-directional InterruptSignal.ts. Allow the user to click a "Stop Generation" button on the UI, which immediately sends an abort signal up the WebSocket, instantly killing the upstream LLM request and halting the swarm to save token costs. 7. Expose an interactive connection debugger (/api/v1/realtime/health) that tracks active socket connections, average message latency, and dropped frames per user session.

CONSTRAINTS
Do NOT buffer the LLM tokens in memory waiting for a complete sentence; you MUST stream them to the client the millisecond they arrive from the provider to minimize Time To First Token (TTFT). Ensure strict connection cleanup: if a WebSocket drops, gracefully pause or kill the attached Swarm execution after a short timeout so headless agents don't drain API credits in the background.
Implement a multi-agent collaboration framework called via-agent-swarm to orchestrate specialized AI personas working together on complex workflows. 1. Create a new directory src/core/ai/swarm/. 2. Implement SwarmCoordinator.ts. This acts as the manager. When a complex user request arrives (e.g., "Research this topic, write a report, and generate code examples"), the coordinator must decompose the prompt into discrete sub-tasks and assign them to specialized agents. 3. Create an AgentPersona.ts factory. Define distinct system prompts and capabilities for roles like "Researcher" (has search access), "Coder" (has execute access), and "Critic" (evaluates outputs for flaws). 4. Implement a SharedWorkspace.ts (a scratchpad). As agents complete their sub-tasks, they must write their intermediate results to this shared memory space so subsequent agents in the pipeline can read and build upon the context. 5. Build a DebateEngine.ts. For high-stakes decisions, allow the Coordinator to pit two agents against each other (e.g., a "Generator" and a "Reviewer"). The Reviewer critiques the Generator's output, and the Generator refines it. This loop continues until a consensus score is reached or a maximum iteration limit is hit. 6. Hook the SwarmCoordinator into the via-vector-memory and via-model-gateway. Each agent in the swarm must pull its own relevant context from the vector database and stream its generation through the rate-limited gateway. 7. Expose an interactive trace API (/api/v1/swarm/trace/{taskId}) that streams the internal monologue, agent hand-offs, and workspace diffs to the frontend, allowing the user to watch the AI team work in real-time.

CONSTRAINTS
Strictly forbid infinite generation loops. You MUST implement a hard max_turns limit (e.g., 5 iterations) within the DebateEngine. If agents cannot reach consensus, the coordinator must gracefully halt and return the best partial result to the user. All agent-to-agent communication must be structured (enforcing strict JSON schemas via the LLM's function calling API) to prevent parsing errors.
Implement a scalable, distributed memory pipeline called via-vector-memory to provide AI agents with long-term recall, semantic search, and document ingestion capabilities. 1. Create a new directory src/core/ai/memory/. 2. Implement VectorStore.ts. This acts as an abstraction layer to interface with a scalable vector database (e.g., Qdrant, Milvus, Pinecone, or a local pgvector instance). It must handle namespace isolation to ensure Agent A's memory never leaks into Agent B's context. 3. Create DocumentChunker.ts. When a user uploads a large file (PDF, code repo, or long chat history), this utility must split the text into overlapping, semantically meaningful chunks (e.g., 512 tokens with a 50-token overlap) to preserve context. 4. Implement an Embedder.ts service that routes chunked text to an embedding model (like text-embedding-3-small or a local HuggingFace equivalent) and stores the resulting high-dimensional float arrays in the VectorStore alongside their original text metadata. 5. Build a ContextRetriever.ts using Hybrid Search (combining Dense Vector similarity with Sparse Keyword/BM25 search). When a user asks a question, this module embeds the query, retrieves the top-K most relevant chunks, and applies a re-ranking algorithm (like Cohere Re-rank or cross-encoders) to ensure maximum relevance. 6. Integrate this memory module into the via-model-gateway. Before the gateway forwards a prompt to an LLM, it must asynchronously fetch relevant historical context and dynamically inject it into the system prompt. 7. Expose a REST API (/api/v1/agents/{id}/memory) allowing frontend dashboards to visualize an agent's knowledge base, manually upload training documents, and surgically delete specific memories for GDPR/privacy compliance.

CONSTRAINTS
Strictly forbid injecting raw, un-chunked documents directly into the LLM context window, as this will result in massive API costs and prompt-truncation errors. You MUST enforce strict tenant isolation (Row-Level Security or separate Vector Namespaces) so a user cannot prompt-inject their way into reading another user's private vector data.

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
# VIA - Bharat's Social Platform VIA is a production-focused social platform for Bharat-centric communities. It combines a real-time social feed, long-form knowledge spaces, and discovery tools in a modern React experience backed by Firebase. ## Features - **Feed**: Browse a fast, social-first st

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