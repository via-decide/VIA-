Repair mode for repository via-decide/VIA.

TARGET
Validate and repair only the files touched by the previous implementation.

TASK
Replace all flat solid backgrounds with layered atmospheric depth backgrounds. 1. In shared/shared.css, replace background: #000 on body with:
Upgrade all typography across the site to a distinctive, high-contrast type system. 1. Replace font-family: 'Inter' everywhere in shared/shared.css with a 3-font stack:
Build a glow + border animation system for all interactive elements. 1. In shared/shared.css add glow token variables:
Add a staggered fade-slide entrance animation system for all page content. 1. In shared/shared.css add: @keyframes fadeSlideIn { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } } 2. Create utility classes .anim-1 through .anim-8 each with:

RULES
1. Audit touched files first and identify regressions.
2. Preserve architecture and naming conventions.
3. Make minimal repairs only; do not expand scope.
4. Re-run checks and provide concise root-cause notes.
5. Return complete contents for changed files only.

SOP: REPAIR PROTOCOL (MANDATORY)
1. Strict Fix Only: Do not use repair mode to expand scope or add features.
2. Regression Check: Audit why previous attempt failed before proposing a fix.
3. Minimal Footprint: Only return contents for the actual repaired files.

REPO CONTEXT
- README snippet:
# ViaLogicHub
- AGENTS snippet:
not found
- package.json snippet:
not found