You are working in repository via-decide/VIA on branch main.

MISSION
Implement a core backend module called via-identity-resolver to bridge the gap between fragmented decentralized identities (ENS, Lens, Farcaster) and create a unified GlobalID. 1. Create a new directory src/core/identity/identity-resolver/. 2. Create identity-config.json defining supported namespaces (e.g., "eth", "lens", "farcaster"), priority weighting for identity "closeness," and cache TTL settings. 3. Implement IdentityResolver.js (or .ts). This module must serve as the "Universal Address Book" for the VIA swarm. 4. Build a "Multi-Chain Lookup" engine: Create lightweight adapters for ENS (via JSON-RPC), Lens (via GraphQL), and Farcaster (via Hub-RPC) to resolve handles to their root EVM or EdDSA addresses. 5. Implement "Identity Aggregation": When a user interacts with the system via a new platform, the resolver should attempt to "soft-link" them to an existing GlobalID using common public keys or verifiable cross-platform signatures. 6. Build an "Identity Cache": Store resolved mappings in a high-performance local cache (using Map or a shared buffer) to eliminate redundant external RPC calls during high-frequency social interactions. 7. Integrate with the PersonalizationEngine: Ensure that user preferences and "Interest Vectors" are correctly associated with the unified GlobalID, even if the user switches platforms.

CONSTRAINTS
Do NOT use heavy, slow SDKs for every lookup. You must implement raw, optimized fetch/RPC calls to maintain <20ms lookup times for cached identities. To protect privacy, the resolver should only store the *hashes* of linked identities in the primary database, keeping the raw "Social Graph" mappings in volatile memory or encrypted at rest.

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