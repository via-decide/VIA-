You are working in repository via-decide/VIA on branch main.

MISSION
Implement a core backend module called via-governance-auditor to enforce ethical guardrails, policy compliance, and transparency for every autonomous agent action. 1. Create a new directory src/core/security/governance-auditor/. 2. Create governance-rules.json defining "Redlines" (e.g., no financial advice, no hate speech, no PII extraction), mandatory disclosure rules (e.g., "I am an AI"), and geographic compliance flags. 3. Implement GovernanceEngine.js (or .ts). This module acts as a "Final Censor" that inspects every message on the EventBus before it is broadcast to the SocialSyncManager. 4. Build the "Policy Matcher": Use high-speed regex and keyword density analysis to flag potential violations of the governance-rules.json in <15ms. 5. Implement "Decision Rationalization": For every high-stakes action, the engine must require the agent to provide a reasoning_hash. The auditor logs this alongside the action to ensure a "Right to Explanation" for users. 6. Build an "Intervention Trigger": If a violation is detected, the auditor must have the authority to "Kill" the outgoing packet, notify the Fault-Tolerance-System, and optionally trigger an EscalationEvent via the HandoverManager. 7. Integrate with BlockchainNotary: Periodically anchor a "Compliance Report" (a hash of all audited actions) to the ledger to provide a verifiable proof of the swarm's adherence to its own rules.

CONSTRAINTS
Do NOT use an external LLM for governance checks; the logic must be deterministic and local to prevent "Recursive Hallucination." The memory footprint of the ruleset must remain under 2MB. Ensure the auditor is "Tamper-Proof"-its core logic should be loaded into a read-only memory segment in the WorkerPool to prevent compromised agents from disabling their own guardrails.

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