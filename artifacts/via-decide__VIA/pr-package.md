Branch: simba/we-need-to-replace-the-external-tool-redirects-o
Title: We need to replace the external tool redirects on the social feed car...

## Summary
- Repo orchestration task for via-decide/VIA
- Goal: Keep the user inside the VIA ecosystem. When they swipe right or click "Open" on a viral story card, they should get a seamless, instant, full-screen reading experience populated with realistic localized data, rather than being bounced to an external tool URL.

## Testing Checklist
- [ ] Run unit/integration tests
- [ ] Validate command flow
- [ ] Validate generated artifact files

## Risks
- Prompt quality depends on repository metadata completeness.
- GitHub API limits/token scope can block deep inspection.

## Rollback
- Revert branch and remove generated artifact files if workflow output is invalid.