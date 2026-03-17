Branch: simba/implement-a-core-backend-module-called-via-knowl
Title: Implement a core backend module called via-knowledge-distillation-eng...

## Summary
- Repo orchestration task for via-decide/VIA
- Goal: Achieve "Intelligence Compression." By capturing the reasoning of expensive, top-tier models and feeding it back into smaller, local instances, the VIA engine can "level up" its own internal swarm. Over time, this allows the system to handle increasingly complex tasks locally, drastically reducing API costs and latency without sacrificing quality.

## Testing Checklist
- [ ] Run unit/integration tests
- [ ] Validate command flow
- [ ] Validate generated artifact files

## Risks
- Prompt quality depends on repository metadata completeness.
- GitHub API limits/token scope can block deep inspection.

## Rollback
- Revert branch and remove generated artifact files if workflow output is invalid.