Branch: simba/implement-user-action-heatmap-tracker-create-src
Title: Implement "User Action Heatmap Tracker". Create src/core/analytics/he...

## Summary
- Repo orchestration task for via-decide/VIA
- Goal: Understand what users actually engage with.

## Testing Checklist
- [ ] Run unit/integration tests
- [ ] Validate command flow
- [ ] Validate generated artifact files

## Risks
- Prompt quality depends on repository metadata completeness.
- GitHub API limits/token scope can block deep inspection.

## Rollback
- Revert branch and remove generated artifact files if workflow output is invalid.