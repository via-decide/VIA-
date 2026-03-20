You are working in repository via-decide/VIA on branch main.

MISSION
Implement a lightweight, cross-platform Developer SDK and CLI tool called via-sdk-core to enable programmatic access to the AI Swarm and Gateway. 1. Create a new directory src/tools/sdk/ for the Node.js/Browser client, and src/tools/cli/ for the terminal interface. 2. Implement ViaClient.ts (The SDK). Expose clean, strongly-typed methods: via.agents.spawn(), via.swarm.execute(prompt), and via.memory.search(query). 3. Create an AsyncStreamHandler.ts within the SDK. It must seamlessly wrap the backend's via-realtime-bus (WebSockets or Server-Sent Events) into standard async iterables (for await (const chunk of stream)), making it trivial for developers to consume streaming LLM tokens in their own React/Vue apps. 4. Implement cli.ts using a library like Commander.js or Yargs. Support commands like via run "analyze this codebase" --agent=Coder --context=./src. 5. Build AuthManager.ts for the CLI. Allow developers to run via login to securely store a long-lived Personal Access Token (PAT) in their local OS keychain or a ~/.via/config.json file. 6. Hook the CLI into the via-agent-tools local execution environment. Allow a flag like --allow-local-fs to permit the cloud-based AI swarm to read/write files directly to the developer's local machine via the CLI tunnel. 7. Expose an automated build step that bundles the SDK into a heavily minified npm package (@via-decide/sdk) and compiles the CLI into standalone binaries for Windows, macOS, and Linux using Vercel's pkg or similar.

CONSTRAINTS
The SDK MUST have zero heavy dependencies to ensure it doesn't bloat the bundle size of consumer applications. Use native fetch and standard Web APIs where possible. The CLI must handle network interruptions gracefully, buffering local output and resuming the stream if the connection to the via-model-gateway stutters.

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