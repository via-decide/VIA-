Branch: simba/implement-content-freshness-scorer-create-srccor
Title: Implement "Content Freshness Scorer". Create src/core/feed/freshness/...

## Summary
- Repo orchestration task for via-decide/VIA
- Goal: Keep feed dynamic and relevant.

## Testing Checklist
- [ ] Run unit/integration tests
- [ ] Validate command flow
- [ ] Validate generated artifact files

## Risks
- Prompt quality depends on repository metadata completeness.
- GitHub API limits/token scope can block deep inspection.

## Rollback
- Revert branch and remove generated artifact files if workflow output is invalid.