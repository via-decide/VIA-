You are working in repository via-decide/VIA on branch main.

MISSION
Implement a core backend module called via-dependency-auditor to automatically scan, verify, and monitor third-party agent dependencies for security vulnerabilities and license compliance. 1. Create a new directory src/core/security/dependency-auditor/. 2. Create auditor-config.json defining "Severity Thresholds" (e.g., block on 'High' or 'Critical'), a whitelist of "Permitted Licenses" (e.g., MIT, Apache-2.0, BSD), and a list of "Banned Packages." 3. Implement AuditorEngine.js (or .ts). This module must hook into the PluginLoader to intercept any new agent before it is initialized. 4. Build a "Manifest Scanner": Parse the package.json or lockfile of a plugin to identify all direct and transitive dependencies without running an external CLI. 5. Implement a "Local Vulnerability Check": Compare the dependency tree against a cached local mirror of a vulnerability database (like the GitHub Advisory Database) to identify known CVEs. 6. Build a "License Guard": Ensure no plugin introduces viral or incompatible licenses that could compromise the VIA core's legal posture. 7. Integrate with the EventBus: If a dependency is flagged, publish a "SecurityAlertEvent" and prevent the PluginLoader from enabling the agent until the issue is resolved.

CONSTRAINTS
Do NOT execute npm audit or yarn audit CLI commands at runtime, as they are too slow and rely on external binaries. You must use a programmatic, lightweight library or a direct API fetch with local caching. The audit must complete in <500ms to maintain the "Hot-Swap" speed of the engine.

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