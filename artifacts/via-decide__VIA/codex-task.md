You are working in repository via-decide/VIA on branch main.

MISSION
Implement a highly scalable, bi-directional event stream called via-realtime-bus using WebSockets to stream agent thoughts, tool executions, and LLM tokens directly to the client UI. 1. Create a new directory src/core/network/realtime/. 2. Implement SocketManager.ts. Initialize a WebSocket server (e.g., using ws or Socket.io) that requires strict JWT authentication during the initial upgrade handshake to prevent unauthorized connections. 3. Create an EventBroadcaster.ts hooked into a Redis Pub/Sub backplane. Because VIA may scale horizontally across multiple Node.js instances, if Agent Swarm A is running on Server 1, but the User is connected to Server 2, the events must instantly bridge across the Redis backplane to reach the correct client. 4. Implement an LLMStreamer.ts. As the via-model-gateway receives raw text chunks from OpenAI/Anthropic, this module must instantly forward those partial strings to the client (e.g., emitting a chunk event) to create a fluid, typewriter-style UI experience. 5. Build an AgentStateTracker.ts. When the via-agent-swarm shifts context or uses the via-agent-tools, emit structured state changes (e.g., {"status": "running_tool", "tool": "fetch_url", "agent": "Researcher"}) so the frontend can render dynamic loading indicators or "thought bubbles." 6. Implement a bi-directional InterruptSignal.ts. Allow the user to click a "Stop Generation" button on the UI, which immediately sends an abort signal up the WebSocket, instantly killing the upstream LLM request and halting the swarm to save token costs. 7. Expose an interactive connection debugger (/api/v1/realtime/health) that tracks active socket connections, average message latency, and dropped frames per user session.

CONSTRAINTS
Do NOT buffer the LLM tokens in memory waiting for a complete sentence; you MUST stream them to the client the millisecond they arrive from the provider to minimize Time To First Token (TTFT). Ensure strict connection cleanup: if a WebSocket drops, gracefully pause or kill the attached Swarm execution after a short timeout so headless agents don't drain API credits in the background.

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