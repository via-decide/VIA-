You are working in repository via-decide/VIA on branch main.

MISSION
Replace all flat solid backgrounds with layered atmospheric depth backgrounds. 1. In shared/shared.css, replace background: #000 on body with:

CONSTRAINTS
Grid overlay must use pointer-events: none and z-index: 0. No visible performance regression - use will-change: transform only on animated elements.
Upgrade all typography across the site to a distinctive, high-contrast type system. 1. Replace font-family: 'Inter' everywhere in shared/shared.css with a 3-font stack:

CONSTRAINTS
Do not touch any font-size values for body text - only font-family, letter-spacing, and line-height. Zero layout reflow allowed.
Build a glow + border animation system for all interactive elements. 1. In shared/shared.css add glow token variables:

CONSTRAINTS
All glows must use CSS variables. Never hardcode rgba values outside :root. Pulse animation only on elements with .live or .active class - not globally.
Add a staggered fade-slide entrance animation system for all page content. 1. In shared/shared.css add: @keyframes fadeSlideIn { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } } 2. Create utility classes .anim-1 through .anim-8 each with:

CONSTRAINTS
Use CSS custom property --i for delay - not hardcoded nth-child delays. Reduced motion override is mandatory. Touch only shared/shared.css for the keyframe - individual HTML files only add the class + --i value.

PROCESS (MANDATORY)
1. Read README.md and AGENTS.md before editing.
2. Audit architecture before coding. Summarize current behavior.
3. Preserve unrelated working code. Prefer additive modular changes.
4. Implement the smallest safe change set for the stated goal.
5. Run validation commands and fix discovered issues.
6. Self-review for regressions, missing env wiring, and docs drift.
7. Return complete final file contents for every modified or created file.

REPO AUDIT CONTEXT
- Description: 
- Primary language: HTML
- README snippet:
# ViaLogicHub

- AGENTS snippet:
not found


SOP: PRE-MODIFICATION PROTOCOL (MANDATORY)
1. Adherence to Instructions: No deviations without explicit user approval.
2. Mandatory Clarification: Immediately ask if instructions are ambiguous or incomplete.
3. Proposal First: Always propose optimizations or fixes before implementing them.
4. Scope Discipline: Do not add unrequested features or modify unrelated code.
5. Vulnerability Check: Immediately flag and explain security risks.

OUTPUT REQUIREMENTS
- Include: implementation summary, checks run, risks, rollback notes.
- Generate branch + PR package.
- Keep prompts deterministic and preservation-first.