You are working in repository via-decide/VIA on branch main.

MISSION
Finalize and deploy the via-realtime-bus system. 1. Integrate SocketManager.ts and EventBroadcaster.ts into the main server. 2. Implement LLMStreamer.ts to pipe partial tokens from the gateway to the UI. 3. Hook AgentStateTracker.ts into the existing agent logic to stream execution status.

CONSTRAINTS
Zero-buffer token streaming is mandatory. Ensure strict cleanup of stale WebSocket connections.
Migrate the second batch of productivity tools and interactive games. 1. Port food.decider and creator-tool to tools/productivity/. 2. Port HexWars and RoboOS to tools/games/. 3. Update nav-registry.json with the new tool paths and icons.

CONSTRAINTS
Ensure all Canvas-based games handle iframe resizing correctly without resolution loss.
Implement a unified analytics service for the entire platform. 1. Create services/analytics.js to track tool usage and performance. 2. Implement an event-forwarding layer in the Shell to collect data from tool iframes. 3. Connect the service to a central database/dashboard.

CONSTRAINTS
Must be GDRP compliant. Use non-blocking event collection to avoid performance impact.
Create a shared CSS library to standardize the look and feel of all tools. 1. Build shared/styles/via-theme.css with a core set of CSS variables (colors, spacing, fonts). 2. Implement a theme-switching listener in the Shell that propagates to all tool iframes. 3. Update Batch 1 & 2 tools to use the standardized via-theme.

CONSTRAINTS
Use Vanilla CSS custom properties only. Ensure accessibility (WCAG AA) compliance.

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
# AGENTS — via-decide/VIA Rules for ALL coding agents (Codex, Claude, automated PRs) working in this repository. --- ## 1. Preservation Policy 1. Never delete tool folders under `tools/`. 2. Never remove working code — upgrades are additive only. 3. Never replace a functioning file with a placeh


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