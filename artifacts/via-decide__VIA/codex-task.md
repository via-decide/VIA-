You are working in repository via-decide/VIA on branch main.

MISSION
Implement a core backend module called via-swarm-security-sandbox to isolate and restrict the execution of untrusted or third-party agent code within the engine. 1. Create a new directory src/core/security/swarm-sandbox/. 2. Create sandbox-config.json defining "Hard Limits" for execution: max memory (e.g., 128MB), max CPU time (e.g., 500ms per turn), and a whitelist of permitted Node.js modules (e.g., path, crypto, but NOT fs or child_process). 3. Implement SandboxEngine.js (or .ts). This module must utilize Node's vm (Virtual Machine) module or worker_threads with a restricted global context. 4. Build a "Capability-Based Access" layer: Agents running in the sandbox cannot directly access the EventBus or DatabaseSync. They must use a restricted "Bridge" object that validates every outgoing request against the agent's assigned permissions. 5. Implement "Entropy Sealing": Ensure that sandboxed agents cannot access sensitive environment variables, system headers, or the global process object. 6. Add a "Watchdog Timer": If a sandboxed agent enters an infinite loop or exceeds its CPU quota, the SandboxEngine must immediately terminate the worker thread and log a "Security Violation" to the TraceLogger. 7. Integrate with the PluginLoader: Every plugin marked as "External" or "Untrusted" must be automatically wrapped in this sandbox before execution.

CONSTRAINTS
Do NOT use external containerization like Docker or Firecracker for this layer; it must be a native, low-latency JavaScript sandbox. The context-switching overhead between the main engine and the sandbox must be <5ms. You must ensure that "Prototype Pollution" attacks from within the sandbox cannot affect the host's global objects.

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
not found

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