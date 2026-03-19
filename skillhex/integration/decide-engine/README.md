# Integration Payload for `decide.engine`

Use this package to merge SkillHex Mission Control into the main website repo.

## Suggested git workflow (run in decide.engine repo)

```bash
# 1) add this repo as a temporary remote
git remote add skillhex-mission-control <URL_OR_PATH_TO_THIS_REPO>
git fetch skillhex-mission-control

# 2) bring app files into /apps/skillhex
mkdir -p apps/skillhex
git checkout skillhex-mission-control/work -- index.html css js missions.json docs
cp -r index.html css js missions.json docs apps/skillhex/

# 3) commit in decide.engine
git add apps/skillhex
git commit -m "Integrate SkillHex Mission Control + Interview rounds"
```

## Non-goals
- No binary assets required.
- No AI API dependency introduced.
