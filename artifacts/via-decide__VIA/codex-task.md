You are working in repository via-decide/VIA on branch main.

MISSION
Implement Secure Admin Authentication. 1. Create the '/api/auth/verify-admin' endpoint. 2. Modify the VIA authentication middleware to check for a 'role: sovereign' flag on the user profile linked to your specific Google ID. 3. Generate a long-lived 'Ops-Token' to secure the websocket data stream.

CONSTRAINTS
Must be unhackable by standard commercial methods. Include IP-whitelisting for your Gandhidham IP.
Build the Sovereign Telemetry Websocket (wss://api.viadecide.com/ops/stream). 1. Orchestrate a data aggregator service that collects metrics every 1 second from all 47 micro-services. 2. Aggregate 'Mars' metrics (active pilots, physics latency) and 'Orchade' metrics (consensus events, MBB rate, Casio status). 3. Stream this unified JSON packet over the secure websocket.

CONSTRAINTS
Minimize data overhead. Do not impact user-facing performance in the games.
Backend Integration for Orchade Module. 1. Set up a reverse-proxy route from 'viadecide.com/orchade' to the Orchade hub. 2. Implement the '/api/sync/orchade' endpoint that persists MBB (Mind, Body, Breath) telemetry from the user session into the main Cohort database.

CONSTRAINTS
Secure all socket connections with VIA's 2026-standard encryption.
Backend Integration for Mars Module. 1. Set up a reverse-proxy (Nginx/Envoy) route from 'viadecide.com/mars' to the internal IP of the Mars micro-service. 2. Implement the '/api/verify/mars' endpoint that confirms the active Google ID session before granting access to the relativistic physics parameters.

CONSTRAINTS
Must use the existing VIA authentication middleware. Maintain < 5ms latency on session validation.
Integrate 'Mars' exploration module into the VIA Core. 1. Synchronize the Mars physics engine with the VIA global coordinate system. 2. Implement the 'Relativistic Navigation' logic: Ensure that the 0.1c (10% light speed) simulation parameters from the Mars repo are accessible via the main VIA API. 3. Map the Mars 'Environment Generator' to the VIA rendering pipeline to allow instant planetary mesh generation.

CONSTRAINTS
Do not break the existing Google OAuth login logic in the main repo. The Mars integration must use the VIA-standard micro-service architecture (Module #48).
Integrate 'Orchade' social-hub module as the VIA Global Lobby. 1. Bridge the 'Orchade' UI components with the VIA frontend framework. 2. Implement the 'Social Consensus' layer: Ensure that player actions in the Orchade garden are recorded in the VIA 'Cohort' database. 3. Link the 'MBB' (Mind, Body, Breath) logic from VIA to the Orchade growth-mechanics, allowing user breathing patterns to influence the environment in real-time.

CONSTRAINTS
Maintain a strict 1Hz refresh rate for the Casio GBD-200 UI bridge within Orchade. Ensure the Google ID profile data persists between the main VIA engine and the Orchade lobby.

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