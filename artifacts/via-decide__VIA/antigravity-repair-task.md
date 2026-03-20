Repair mode for repository via-decide/VIA.

TARGET
Validate and repair only the files touched by the previous implementation.

TASK
Implement a lightweight Developer SDK and CLI tool called via-sdk-core for programmatic access to the swarm. 1. Create src/tools/sdk/ (Node/Browser) and src/tools/cli/ (Terminal). 2. Implement ViaClient.ts exposing clean methods: via.agents.spawn(), via.swarm.execute(). 3. Create AsyncStreamHandler.ts to wrap WebSockets/SSE into standard async iterables (for await). 4. Implement cli.ts (using Commander.js) supporting commands like via run "analyze codebase" --context=./src. 5. Hook the CLI into the via-agent-tools to allow cloud agents local file-system access via secure tunnels.

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