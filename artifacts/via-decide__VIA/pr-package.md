Branch: simba/implement-a-core-backend-module-called-via-ident
Title: Implement a core backend module called via-identity-resolver to bridg...

## Summary
- Repo orchestration task for via-decide/VIA
- Goal: Unify the "Fragmented User." In the decentralized world, a single human often has five different IDs across five different apps. By resolving these into a single internal GlobalID, the VIA engine can maintain a persistent understanding of a user's context and reputation, regardless of which "social window" they are looking through.

## Testing Checklist
- [ ] Run unit/integration tests
- [ ] Validate command flow
- [ ] Validate generated artifact files

## Risks
- Prompt quality depends on repository metadata completeness.
- GitHub API limits/token scope can block deep inspection.

## Rollback
- Revert branch and remove generated artifact files if workflow output is invalid.