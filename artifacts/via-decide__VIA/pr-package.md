Branch: simba/implement-the-foundational-feed-intelligence-lay
Title: Implement the foundational "Feed Intelligence Layer" for VIA to trans...

## Summary
- Repo orchestration task for via-decide/VIA
- Goal: Establish VIA's first real content loop: Human → Content → Interaction → Tool Reuse. Prepare the system for seamless transition to GN8R-powered autonomous content without breaking the current UX. This is the bridge from "tool platform" → "execution-driven social system".

## Testing Checklist
- [ ] Run unit/integration tests
- [ ] Validate command flow
- [ ] Validate generated artifact files

## Risks
- Prompt quality depends on repository metadata completeness.
- GitHub API limits/token scope can block deep inspection.

## Rollback
- Revert branch and remove generated artifact files if workflow output is invalid.