Repair mode for repository via-decide/VIA.

TARGET
Validate and repair only the files touched by the previous implementation.

TASK
Implement a highly scalable, bi-directional event stream called via-realtime-bus using WebSockets to stream agent thoughts, tool executions, and LLM tokens directly to the client UI. 1. Create a new directory src/core/network/realtime/. 2. Implement SocketManager.ts. Initialize a WebSocket server (e.g., using ws or Socket.io) that requires strict JWT authentication during the initial upgrade handshake to prevent unauthorized connections. 3. Create an EventBroadcaster.ts hooked into a Redis Pub/Sub backplane. Because VIA may scale horizontally across multiple Node.js instances, if Agent Swarm A is running on Server 1, but the User is connected to Server 2, the events must instantly bridge across the Redis backplane to reach the correct client. 4. Implement an LLMStreamer.ts. As the via-model-gateway receives raw text chunks from OpenAI/Anthropic, this module must instantly forward those partial strings to the client (e.g., emitting a chunk event) to create a fluid, typewriter-style UI experience. 5. Build an AgentStateTracker.ts. When the via-agent-swarm shifts context or uses the via-agent-tools, emit structured state changes (e.g., {"status": "running_tool", "tool": "fetch_url", "agent": "Researcher"}) so the frontend can render dynamic loading indicators or "thought bubbles." 6. Implement a bi-directional InterruptSignal.ts. Allow the user to click a "Stop Generation" button on the UI, which immediately sends an abort signal up the WebSocket, instantly killing the upstream LLM request and halting the swarm to save token costs. 7. Expose an interactive connection debugger (/api/v1/realtime/health) that tracks active socket connections, average message latency, and dropped frames per user session.

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
# VIA - Bharat's Social Platform VIA is a production-focused social platform for Bharat-centric communities. It combines a real-time social feed, long-form knowledge spaces, and discovery tools in a modern React experience backed by Firebase. ## Features - **Feed**: Browse a fast, social-first st
- AGENTS snippet:
not found
- package.json snippet:
{ "name": "react-example", "private": true, "version": "0.0.0", "type": "module", "scripts": { "dev": "vite --port=3000 --host=0.0.0.0", "build": "vite build", "preview": "vite preview", "clean": "rm -rf dist", "lint": "tsc --noEmit" }, "dependencies": { "@googl