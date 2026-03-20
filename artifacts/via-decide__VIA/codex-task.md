You are working in repository via-decide/VIA on branch main.

MISSION
Implement a secure, sandboxed tool execution engine called via-agent-tools allowing LLMs to trigger webhooks, query databases, and execute dynamic code safely. 1. Create a new directory src/core/ai/tools/. 2. Implement a ToolRegistry.ts. This module must maintain a dynamic list of available functions (e.g., fetch_url, run_python_script, query_sql) and automatically generate strict JSON Schemas (OpenAPI format) to pass to the via-model-gateway for LLM function calling. 3. Create a SandboxExecutor.ts. When an agent decides to write and run code (e.g., a Python script for data analysis), this module MUST execute the code inside a highly restricted environment. Use WebAssembly (e.g., Pyodide), isolated-vm for JS, or ephemeral Docker containers with no network access and strict memory/CPU quotas. 4. Implement an ApiIntegrator.ts for standard HTTP interactions. This tool allows agents to interact with external services (like Jira, GitHub, or Slack) using pre-authenticated OAuth tokens stored securely in the user's session. 5. Build a HumanInTheLoop.ts (HITL) permission gate. High-risk actions (e.g., sending an email, dropping a database table, or spending money) must halt the agent's execution and push a pending approval request to the UI. The agent remains paused until the user explicitly clicks "Approve" or "Deny." 6. Hook the tool execution feedback loop back into the via-agent-swarm. If a tool throws an error (e.g., a Python syntax error or a 404 from a web fetch), the exact error trace must be fed back to the agent so it can self-correct and try again. 7. Expose an audit log API (/api/v1/tools/audit) that immutably records every tool invoked by an agent, the exact payload sent, the execution time, and the result, ensuring complete traceability.

CONSTRAINTS
Under absolutely no circumstances should LLM-generated code be executed directly on the host Node.js environment using eval() or child_process.exec(). The sandbox MUST have a hard timeout (e.g., 5 seconds) to prevent infinite loops from locking up the worker pool. Tool descriptions in the registry must be hyper-concise to preserve the LLM's token window.

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