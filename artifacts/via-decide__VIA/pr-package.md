Branch: simba/implement-contextmemorylayer-for-session-continu
Title: Implement ContextMemoryLayer for session continuity.

## Summary
- Repo orchestration task for via-decide/VIA
- Goal: Enable cross-tool context persistence.

## Testing Checklist
- [ ] Run unit/integration tests
- [ ] Validate command flow
- [ ] Validate generated artifact files

## Risks
- Prompt quality depends on repository metadata completeness.
- GitHub API limits/token scope can block deep inspection.

## Rollback
- Revert branch and remove generated artifact files if workflow output is invalid.