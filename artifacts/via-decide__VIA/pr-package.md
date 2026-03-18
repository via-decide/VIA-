Branch: simba/implement-context-memory-layer-create-srccoremem
Title: Implement "Context Memory Layer". Create src/core/memory/context-laye...

## Summary
- Repo orchestration task for via-decide/VIA
- Goal: Allow VIA to feel continuous, not stateless.

## Testing Checklist
- [ ] Run unit/integration tests
- [ ] Validate command flow
- [ ] Validate generated artifact files

## Risks
- Prompt quality depends on repository metadata completeness.
- GitHub API limits/token scope can block deep inspection.

## Rollback
- Revert branch and remove generated artifact files if workflow output is invalid.