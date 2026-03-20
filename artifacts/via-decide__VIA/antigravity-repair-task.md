Repair mode for repository via-decide/VIA.

TARGET
Validate and repair only the files touched by the previous implementation.

TASK
Implement a secure, sandboxed tool execution engine called via-agent-tools allowing LLMs to trigger webhooks, query databases, and execute dynamic code safely. 1. Create a new directory src/core/ai/tools/. 2. Implement a ToolRegistry.ts. This module must maintain a dynamic list of available functions (e.g., fetch_url, run_python_script, query_sql) and automatically generate strict JSON Schemas (OpenAPI format) to pass to the via-model-gateway for LLM function calling. 3. Create a SandboxExecutor.ts. When an agent decides to write and run code (e.g., a Python script for data analysis), this module MUST execute the code inside a highly restricted environment. Use WebAssembly (e.g., Pyodide), isolated-vm for JS, or ephemeral Docker containers with no network access and strict memory/CPU quotas. 4. Implement an ApiIntegrator.ts for standard HTTP interactions. This tool allows agents to interact with external services (like Jira, GitHub, or Slack) using pre-authenticated OAuth tokens stored securely in the user's session. 5. Build a HumanInTheLoop.ts (HITL) permission gate. High-risk actions (e.g., sending an email, dropping a database table, or spending money) must halt the agent's execution and push a pending approval request to the UI. The agent remains paused until the user explicitly clicks "Approve" or "Deny." 6. Hook the tool execution feedback loop back into the via-agent-swarm. If a tool throws an error (e.g., a Python syntax error or a 404 from a web fetch), the exact error trace must be fed back to the agent so it can self-correct and try again. 7. Expose an audit log API (/api/v1/tools/audit) that immutably records every tool invoked by an agent, the exact payload sent, the execution time, and the result, ensuring complete traceability.

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