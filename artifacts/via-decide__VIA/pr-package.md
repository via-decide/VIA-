Branch: simba/implement-decision-confidence-meter-create-srcco
Title: Implement "Decision Confidence Meter". Create src/core/decision/confi...

## Summary
- Repo orchestration task for via-decide/VIA
- Goal: Help users trust and evaluate outputs quickly.

## Testing Checklist
- [ ] Run unit/integration tests
- [ ] Validate command flow
- [ ] Validate generated artifact files

## Risks
- Prompt quality depends on repository metadata completeness.
- GitHub API limits/token scope can block deep inspection.

## Rollback
- Revert branch and remove generated artifact files if workflow output is invalid.