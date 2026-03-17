Repair mode for repository via-decide/VIA.

TARGET
Validate and repair only the files touched by the previous implementation.

TASK
Implement a core backend module called via-swarm-consensus-engine to enable multi-agent voting and agreement for high-stakes autonomous decisions. 1. Create a new directory src/core/compute/swarm-consensus/. 2. Create consensus-config.json defining quorum requirements (e.g., 66% majority), voting algorithms (Majority, Unanimous, or Weighted Borda Count), and decision timeouts. 3. Implement ConsensusEngine.js (or .ts). This module must act as a "Supreme Court" for the AI swarm, triggered when the PredictiveRouter flags a request as "High-Stakes" (e.g., financial transactions, content moderation bans, or system-wide policy changes). 4. Build the "Proposal Dispatcher": When a high-stakes event is detected, the engine must spawn N diverse agents (e.g., a "LegalAgent," a "SafetyAgent," and an "EfficiencyAgent") and present them with the same context. 5. Implement "Blind Voting": Agents must submit their recommended action and a "Confidence Score" to the engine without seeing the output of other agents to prevent "Information Cascades" or groupthink. 6. Build the "Resolution Logic": Apply the configured consensus algorithm to determine the final path forward. If consensus cannot be reached within the timeout, the engine must automatically trigger a HandoverEvent to a human operator. 7. Integrate with BlockchainNotary: Once a consensus is reached, generate a "Consensus Certificate" containing the votes and rationales of all participating agents and anchor it to the ledger for auditability.

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