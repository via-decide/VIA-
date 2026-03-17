Repair mode for repository via-decide/VIA.

TARGET
Validate and repair only the files touched by the previous implementation.

TASK
Implement a core backend module called via-governance-auditor to enforce ethical guardrails, policy compliance, and transparency for every autonomous agent action. 1. Create a new directory src/core/security/governance-auditor/. 2. Create governance-rules.json defining "Redlines" (e.g., no financial advice, no hate speech, no PII extraction), mandatory disclosure rules (e.g., "I am an AI"), and geographic compliance flags. 3. Implement GovernanceEngine.js (or .ts). This module acts as a "Final Censor" that inspects every message on the EventBus before it is broadcast to the SocialSyncManager. 4. Build the "Policy Matcher": Use high-speed regex and keyword density analysis to flag potential violations of the governance-rules.json in <15ms. 5. Implement "Decision Rationalization": For every high-stakes action, the engine must require the agent to provide a reasoning_hash. The auditor logs this alongside the action to ensure a "Right to Explanation" for users. 6. Build an "Intervention Trigger": If a violation is detected, the auditor must have the authority to "Kill" the outgoing packet, notify the Fault-Tolerance-System, and optionally trigger an EscalationEvent via the HandoverManager. 7. Integrate with BlockchainNotary: Periodically anchor a "Compliance Report" (a hash of all audited actions) to the ledger to provide a verifiable proof of the swarm's adherence to its own rules.

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
not found
- AGENTS snippet:
not found
- package.json snippet:
not found