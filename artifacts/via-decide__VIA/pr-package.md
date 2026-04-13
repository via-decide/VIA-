Branch: simba/create-outcome-calibration-tracker
Title: Create outcome calibration tracker.

## Summary
- Repo orchestration task for via-decide/VIA
- Goal: Create outcome calibration tracker.

## Testing Checklist
- [ ] Run unit/integration tests
- [ ] Validate command flow
- [ ] Validate generated artifact files

## Risks
- Prompt quality depends on repository metadata completeness.
- GitHub API limits/token scope can block deep inspection.

## Rollback
- Revert branch and remove generated artifact files if workflow output is invalid.