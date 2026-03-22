Branch: simba/implement-secure-admin-authentication-1-create-t
Title: Implement Secure Admin Authentication. 1. Create the '/api/auth/verif...

## Summary
- Repo orchestration task for via-decide/VIA
- Goal: Implement Secure Admin Authentication. 1. Create the '/api/auth/verify-admin' endpoint. 2. Modify the VIA authentication middleware to check for a 'role: sovereign' flag on the user profile linked to your specific Google ID. 3. Generate a long-lived 'Ops-Token' to secure the websocket data stream.

## Testing Checklist
- [ ] Run unit/integration tests
- [ ] Validate command flow
- [ ] Validate generated artifact files

## Risks
- Prompt quality depends on repository metadata completeness.
- GitHub API limits/token scope can block deep inspection.

## Rollback
- Revert branch and remove generated artifact files if workflow output is invalid.