Branch: simba/fix-subpage-card-routing-on-indexhtml-convert-ab
Title: Fix Subpage Card routing on index.html: Convert absolute paths to rel...

## Summary
- Repo orchestration task for via-decide/VIA
- Goal: Stop the browser from breaking out of the /VIA/ GitHub Pages repository subdirectory when a user clicks a card.

## Testing Checklist
- [ ] Run unit/integration tests
- [ ] Validate command flow
- [ ] Validate generated artifact files

## Risks
- Prompt quality depends on repository metadata completeness.
- GitHub API limits/token scope can block deep inspection.

## Rollback
- Revert branch and remove generated artifact files if workflow output is invalid.