# Orchard Launcher

**Category:** Games · Simulation  
**Route:** `/tools/games/orchard/`  
**Status:** stable  
**External URL:** https://orchard.viadecide.com  
**Repo:** via-decide/Game-

## What It Does

Provides a manifest-listed launcher for the Orchard experience. The local
launcher page stays static and forwards players to the live Orchard deploy at
`https://orchard.viadecide.com`.

## Gameplay

- Plant and grow specimens across 3 unlockable orchards
- Research genetics to evolve plants through 5 stages
- Breed hybrids by cross-pollinating mature plants
- Manage weather effects and upgrades
- Transfer credits to other players

## Tech Stack

The live Orchard app is built with React 19, TypeScript, Vite, Tailwind v4,
Firebase v12, Three.js, and Framer Motion. The launcher in this folder is plain
HTML/CSS/JS only.

## Inputs

- `navigation_request` — route hint that opens the Orchard launcher

## Outputs

- `orchard_launch` — browser redirect to the live Orchard deployment

## Files

| File | Purpose |
|------|---------|
| `config.json` | Tool metadata and routing |
| `index.html` | Static launcher page with external redirect |
| `README.md` | Tool notes and test steps |
| `tool.js` | External launcher stub |

## Integration Roadmap

- Phase 1 ✅ Standalone deploy at `orchard.viadecide.com`
- Phase 2 ✅ VIA nav bar + registered in manifest
- Phase 3 🔜 Economy bridge (harvest XP → VIA XP)
- Phase 4 🔜 Harvest events auto-post to VIA social feed

## How to Test

1. Open `tools/games/orchard/index.html` in a browser.
2. Confirm the launcher renders a static Orchard card immediately.
3. Confirm it redirects to `https://orchard.viadecide.com` after a short delay.
4. Confirm the “Launch Game” button also opens `https://orchard.viadecide.com`.
5. Confirm the “Back to VIA” link returns to `../../../index.html`.

## Notes

- The launcher intentionally keeps all game logic out of the repo-local page.
- Main-site game links should target this launcher or the live Orchard URL, not
  the broken local React shell.
