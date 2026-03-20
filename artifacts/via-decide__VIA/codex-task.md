You are working in repository via-decide/VIA on branch main.

MISSION
Implement a secure, sandboxed tool execution engine called via-agent-tools allowing LLMs to safely execute code and API calls. 1. Create src/core/ai/tools/. 2. Implement ToolRegistry.ts to maintain dynamic OpenAPI JSON Schemas for function calling. 3. Create SandboxExecutor.ts using WebAssembly (Pyodide) or isolated-vm to execute LLM-generated code with strict memory/CPU quotas and zero network access. 4. Implement ApiIntegrator.ts for standardized HTTP interactions using user-authenticated OAuth tokens. 5. Build HumanInTheLoop.ts (HITL) to pause agent execution and require explicit user UI approval for high-risk actions (e.g., dropping a database table, spending money).

CONSTRAINTS
Under absolutely no circumstances should LLM-generated code be executed directly on the host Node.js environment using eval(). The sandbox MUST have a hard timeout.

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