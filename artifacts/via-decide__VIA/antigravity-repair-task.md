Repair mode for repository via-decide/VIA.

TARGET
Validate and repair only the files touched by the previous implementation.

TASK
Implement a core backend module called via-decentralized-reputation-oracle to anchor agent trust scores to a verifiable, cryptographic ledger, preventing internal tampering or "Reputation Inflation." 1. Create a new directory src/core/governance/reputation-oracle/. 2. Create oracle-config.json defining "Staking Requirements" (virtual credits required to act as a Validator), "Slashing Conditions" (automatic credit forfeiture for verified hallucinations), and "Anchor Intervals" (e.g., every 100 blocks). 3. Implement OracleManager.js (or .ts). This module must act as the bridge between the internal ReputationScorer and a simulated or L2-based "Truth Ledger." 4. Build the "Cryptographic Signing" engine: Every major reputation update must be signed by a quorum of "Validator Agents" using an EdDSA or ECDSA scheme. $$Signature = Sign_{priv\_key}(AgentID + NewScore + Timestamp)$$ 5. Implement the "Dispute Resolution" logic: If an agent's output is flagged by the GovernanceAuditor as a "Critical Failure," the Oracle must trigger a "Challenge Period" where other agents vote on whether to "Slash" the offender's staked credits. 6. Build a "Merkle Proof Generator": Aggregate daily reputation shifts into a Merkle Tree and publish the Root Hash to the BlockchainNotary to provide a lightweight way for users to verify an agent's standing without downloading the full history. 7. Integrate with the IdentityResolver: Ensure that an agent's "On-Chain Identity" is tied to its operational performance, making reputation a portable and permanent asset within the ecosystem.

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