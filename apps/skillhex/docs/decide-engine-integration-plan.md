# decide.engine Main Website Integration Plan

This repository currently contains SkillHex Mission Control as a standalone app (`index.html`).

## Goal
Embed and ship this app inside `decide.engine` main website repo without breaking:
- offline interview mode,
- local storage isolation (`skillhex-v3` + `retroInterviewSession_v1`),
- Firebase leaderboard updates,
- KADA wheel interactions.

## Recommended integration pattern

### Option A (preferred): static app mount under `/apps/skillhex/`
1. Copy these paths into `decide.engine`:
   - `index.html`
   - `css/`
   - `js/`
   - `missions.json`
   - `docs/` (optional, for maintenance)
2. Serve at: `https://<decide.engine>/apps/skillhex/index.html`.
3. Add nav entry in decide.engine: **Products → SkillHex Mission Control**.
4. Keep Firebase keys environment-specific (dev/prod variants).

### Option B: iframe embed into main website shell
1. Host SkillHex app as above under `/apps/skillhex/`.
2. Add container page in decide.engine with:
   ```html
   <iframe src="/apps/skillhex/index.html" title="SkillHex Mission Control" style="width:100%;height:100vh;border:0"></iframe>
   ```
3. If needed, use `postMessage` bridge for profile sync from decide.engine account context.

## Data bridge handoff (cross-repo)

If decide.engine has canonical user profile:
- On load, send `{name, company, role, level}` to SkillHex via JS bootstrap or query params.
- SkillHex already consumes these fields when converting interview results.

## Verification checklist in decide.engine

- Mission screen renders and timers run.
- V07–V10 open interview modal and conversion writes back to logbook.
- Warm-up Apply/Skip changes multiplier and affects subsequent mission score.
- LocalStorage keys remain separate:
  - `skillhex-v3`
  - `retroInterviewSession_v1`
- Firebase write attempts still occur when player identity is set.
