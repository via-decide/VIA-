Branch: simba/1-extract-core-authentication-logic-from-legacy-
Title: 1. Extract core authentication logic from legacy-auth-repo and port i...

## Summary
- Repo orchestration task for via-decide/VIA
- Goal: Centralize and standardize authentication within the VIA monorepo to enable seamless Single Sign-On (SSO) across all consolidated tools.

## Testing Checklist
- [ ] Run unit/integration tests
- [ ] Validate command flow
- [ ] Validate generated artifact files

## Risks
- Prompt quality depends on repository metadata completeness.
- GitHub API limits/token scope can block deep inspection.

## Rollback
- Revert branch and remove generated artifact files if workflow output is invalid.