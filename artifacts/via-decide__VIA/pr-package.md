Branch: simba/implement-studyos-adaptive-path-engine-create-sr
Title: Implement "StudyOS Adaptive Path Engine". Create src/modules/studyos/...

## Summary
- Repo orchestration task for via-decide/VIA
- Goal: Make StudyOS feel intelligent without heavy infra.

## Testing Checklist
- [ ] Run unit/integration tests
- [ ] Validate command flow
- [ ] Validate generated artifact files

## Risks
- Prompt quality depends on repository metadata completeness.
- GitHub API limits/token scope can block deep inspection.

## Rollback
- Revert branch and remove generated artifact files if workflow output is invalid.