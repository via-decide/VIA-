Branch: simba/implement-a-core-backend-module-called-via-swarm
Title: Implement a core backend module called via-swarm-security-sandbox to ...

## Summary
- Repo orchestration task for via-decide/VIA
- Goal: Enable "Permissionless Innovation." In a decentralized ecosystem, developers may want to contribute new agents or tools. This sandbox ensures that the VIA backend can run third-party code with total confidence, knowing that a malicious or poorly written agent cannot steal user data, crash the server, or escalate its privileges.

## Testing Checklist
- [ ] Run unit/integration tests
- [ ] Validate command flow
- [ ] Validate generated artifact files

## Risks
- Prompt quality depends on repository metadata completeness.
- GitHub API limits/token scope can block deep inspection.

## Rollback
- Revert branch and remove generated artifact files if workflow output is invalid.