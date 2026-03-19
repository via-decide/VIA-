# CODEX AGENT RULES — via-decide/decide.engine-tools
# Place this file at: .codex/instructions.md
# Codex reads this before every task in this repo.

# CODEX PRE-TASK PROTOCOL — via-decide/VIA
# Place at: .codex/instructions.md (merge with existing rules)
# Run this protocol BEFORE every task, every commit, every file touch.

════════════════════════════════════════════
STEP 0 — READ BEFORE YOU WRITE
════════════════════════════════════════════

Before touching any file:

1. If the task targets a specific tool folder (e.g. tools/task-splitter/):
   - READ tools/<tool-name>/README.md if it exists
   - READ tools/<tool-name>/config.json
   - READ tools/<tool-name>/index.html (first 60 lines only)
   - READ tools/<tool-name>/tool.js (first 60 lines only)
   Understand what the tool does before writing a single line.

2. If no README.md exists for the tool → your first output MUST be README.md.
   Do not create or modify any other file until README.md is written.

3. If the task touches index.html or shared/ files:
   - READ the top-level README.md of the repo first.
   - If it does not exist, note it. Do not block the task, but flag it.

════════════════════════════════════════════
STEP 1 — TOOL INTEGRITY CHECK
════════════════════════════════════════════

Every tool folder under tools/ MUST have exactly these 4 files:

  config.json   — tool metadata (name, description, category, route)
  index.html    — standalone UI, no build step, no framework
  tool.js       — core logic, exported on window
  README.md     — what it does, inputs, outputs, how to test

Before committing any new or modified tool, verify all 4 exist.
If any are missing, create the missing ones as stubs before committing.

CATEGORY FOLDERS (no files required — skip the check):
  tools/business/   tools/coders/    tools/creators/
  tools/education/  tools/engine/    tools/games/
  tools/misc/       tools/researchers/ tools/simulations/
  tools/system/

════════════════════════════════════════════
STEP 2 — README.md STANDARD FORMAT
════════════════════════════════════════════

Every tool README.md must follow this exact template.
Keep it under 60 lines. No fluff.

```
# <Tool Name>

**Category:** <category>
**Route:** /tools/<folder-name>/
**Status:** stable | beta | wip

## What It Does
One paragraph. What problem it solves. Who uses it.

## Inputs
- <input name>: <type> — <description>

## Outputs
- <output name>: <what it produces>

## Files
| File | Purpose |
|------|---------|
| config.json | Tool metadata and routing |
| index.html | UI shell |
| tool.js | Core logic (exported as window.<ToolName>) |
| README.md | This file |

## How to Test
1. Open index.html in browser (no server needed)
2. <specific step for this tool>
3. Expected: <what should happen>

## Notes
- Any important constraints, known issues, or dependencies
```

════════════════════════════════════════════
STEP 3 — TOOLS MISSING tool.js (FIX LIST)
════════════════════════════════════════════

The following tools have config.json + index.html but are MISSING tool.js.
Do NOT add logic to index.html. Create tool.js stubs for these first if the
task involves them:

  tools/color-palette/
  tools/eco-engine-test/
  tools/business/grid-evolution/
  tools/business/market-dynamics/
  tools/business/meeting-cost-calculator/
  tools/business/traffic-router/
  tools/business/typography-scale-calculator/
  tools/games/hex-wars/
  tools/games/snake-game/
  tools/games/wings-of-fire-quiz/
  tools/json-formatter/
  tools/pomodoro/
  tools/regex-tester/
  tools/revenue-forecaster/

STUB FORMAT for tool.js:
```js
// <ToolName> — tool.js
// Auto-stubbed. Implement logic here.
(function (global) {
  'use strict';

  const <ToolName> = {
    // TODO: implement
  };

  global.<ToolName> = <ToolName>;
})(window);
```

════════════════════════════════════════════
STEP 4 — COMMIT CHECKLIST (run before every commit)
════════════════════════════════════════════

□ Did I READ the existing README.md before starting?
□ Does the tool have all 4 files: config.json, index.html, tool.js, README.md?
□ Is README.md updated to reflect any changes I made?
□ Did I avoid modifying PROTECTED functions? (see full .codex/instructions.md)
□ Did I avoid touching tools-manifest.json entries I didn't add?
□ Are my edits surgical? (No full-file rewrites unless the file is new)
□ Does the tool still work with no build step, no npm, no framework?

════════════════════════════════════════════
STEP 5 — TOKEN EFFICIENCY RULES
════════════════════════════════════════════

To complete tasks with minimum tokens:

1. READ only what is needed. For large files (index.html > 500 lines),
   read only the relevant section — use line ranges, not full file.

2. WRITE diffs, not full files. Use str_replace for edits to existing files.
   Only output full file content when creating a NEW file.

3. ONE file at a time. Complete and verify each file before moving to the next.

4. NO explanation prose inside code. Comments only where logic is non-obvious.

5. If a task requires touching more than 3 files, break it into sub-tasks.
   Complete sub-task 1 fully before starting sub-task 2.

════════════════════════════════════════════
CURRENT TOOL HEALTH SNAPSHOT (as of 2026-03-19)
════════════════════════════════════════════

Total tool folders scanned: 68
Complete (all 4 files):     ~38
Missing tool.js:            ~14
Missing README.md:          ALL (0 have README yet)
Category folders (exempt):  10

Priority: Write README.md for any tool touched in the current task.
          Fix missing tool.js stubs before adding new tools.

════════════════════════════════════════════
REPO IDENTITY
════════════════════════════════════════════

Stack: Vanilla JS, HTML, CSS, Supabase CDN.
No build step. No npm. No bundler. No React.
Everything runs directly in the browser.
GitHub Pages host: https://via-decide.github.io/decide.engine-tools/

════════════════════════════════════════════
THE PRIME DIRECTIVE
════════════════════════════════════════════

READ every file you are about to change.
Understand what it does before touching it.
If you are unsure what a line does — do not change it.
Surgical edits only. Never rewrite whole files.

════════════════════════════════════════════
FILES YOU MUST NEVER MODIFY
════════════════════════════════════════════

These files are marked DO NOT MODIFY or are too risky:

  tools/games/skillhex-mission-control/js/app.js
    → comment at top says DO NOT MODIFY
    → ES module, single entry point for entire game
    → only allowed addition: one wallet sync block
      AFTER saveState() in renderCycle() — nothing else

  tools/games/hex-wars/index.html → QUESTIONS array
    → 30+ hand-written quiz questions, never delete or reorder

  shared/shared.css
    → base CSS for all engine tools, no overrides

  _redirects
    → Netlify routing, do not touch

  tools-manifest.json
    → only add entries, never delete existing ones

  missions.json (skillhex)
    → hand-authored mission data, never modify

════════════════════════════════════════════
FUNCTION BODIES — NEVER TOUCH
════════════════════════════════════════════

These functions work correctly. Do not modify their bodies.
Only ever add NEW code AFTER them, never inside them.

  hex-wars:      calcPoints(), showResult(), restart(),
                 loadQuestion(), updateStats(), haptic()

  skillhex:      handleDecision(), advanceMission(),
                 calculateScore(), renderCycle(), initApp()

  snake-game:    step(), draw(), reset(), spawnFood()

  wings-quiz:    selectAnswer(), showQuestion(), startTimer(),
                 broadcast(), createRoom(), joinRoom()

  layer1-swipe:  commitSwipe(), finishSession(), buildCardElement(),
                 startSessionIfEligible(), hydrateState(), syncState()

  growth-engine: anything inside the Three.js animation loop
                 (requestAnimationFrame callbacks)

════════════════════════════════════════════
SCRIPT TAG LOADING ORDER — CRITICAL
════════════════════════════════════════════

Wrong script order silently breaks entire pages.
Always follow this order in <head>:

  1. Three.js CDN (if used) — ALWAYS first
  2. Other CDN scripts (chart.js, supabase, pdf.js)
  3. shared/vd-nav-fix.js
  4. shared/vd-wallet.js (if needed)
  5. shared/tool-storage.js (if needed)
  6. Other shared/*.js files
  7. Inline <script> OR type="module" scripts — ALWAYS LAST

NEVER add script tags after the closing </body>.
NEVER add script tags after an existing inline <script> block.
NEVER load a shared script after the game's own script.

════════════════════════════════════════════
ES MODULES vs PLAIN SCRIPTS
════════════════════════════════════════════

SkillHex uses ES modules (type="module").
All other games use plain scripts.
These two systems do not mix freely.

Rules:
  - window.VDWallet, window.ToolBridge etc are set by plain scripts
  - ES modules can access window.* globals BUT only if the plain
    script loaded first in the HTML
  - NEVER add type="module" to shared scripts
  - NEVER use import/export in shared/*.js files
    (they use IIFE pattern: (function(global){...})(window))
  - ALWAYS wrap window.* calls inside ES modules with a guard:
      if (typeof window.VDWallet !== 'undefined') { ... }

════════════════════════════════════════════
SYNTAX RULES — THE ONES THAT KILLED THE SITE
════════════════════════════════════════════

1. NO DUPLICATE CONST
   Never declare the same const twice in the same scope.
   Always grep for existing declarations before adding new ones:
     grep -n "const varName" filename.js

2. NO ORPHANED OBJECTS
   Every { } object literal must be inside an array, assignment,
   or function call. Never leave object literals floating alone.

3. DOLLAR-QUOTE FUNCTIONS (SQL)
   Always use $$ not $func$ for PostgreSQL function bodies.
   Supabase SQL editor requires standard $$ delimiter.

4. NO !important ON transform OR opacity
   These properties are set by inline styles in game engines.
   CSS !important overrides inline styles and breaks animations.
   Never use !important on transform or opacity on game card elements.

5. IIFE STRUCTURE
   router.js and all shared/*.js files use this pattern:
     (() => { 'use strict'; ... })();
   or
     (function(global){ ... })(window);
   Do not break the opening or closing of these wrappers.

════════════════════════════════════════════
SHARED ECONOMY — SAFE WIRING PATTERN
════════════════════════════════════════════

The shared VDWallet economy connects all games.
Here is the ONLY safe way to wire it into any game:

STEP 1 — add script tag in <head> (correct position per above)
STEP 2 — create a NEW function outside all existing functions:

  function awardGameCredits(params) {
    if (typeof window.VDWallet === 'undefined') return;
    window.VDWallet.earn('fieldName', amount, 'source-id');
  }

STEP 3 — call that new function from ONE safe location:
  - after a correct answer is processed
  - after a game session ends
  - after a score is calculated
  NOT inside render loops, NOT inside timer callbacks,
  NOT inside requestAnimationFrame callbacks.

STEP 4 — always guard with typeof check.
  The game must function identically whether VDWallet
  is present or not. It is an enhancement, not a dependency.

VDWallet field names:
  focusDrops  — general study/quiz rewards
  lumina      — streak and milestone rewards
  hexTokens   — HexWars specific
  missionXP   — SkillHex specific
  snakeCoins  — Snake game specific
  quizStars   — Wings of Fire Quiz specific

════════════════════════════════════════════
SUPABASE RULES
════════════════════════════════════════════

Project URL: https://bfocxgtlemhxfwfuhlxn.supabase.co
Anon key: set by developer, stored as window.ECO_SUPABASE_ANON_KEY

  - NEVER hardcode the anon key in committed files
  - NEVER use process.env in browser HTML files
    (process.env is Node.js only, undefined in browsers)
  - ALWAYS use column name snake_case to match the DB schema:
      focus_drops NOT focusDrops
      plant_level NOT plantLevel
      plant_hydration NOT plantHydration
  - ALWAYS use .single() when fetching one row
  - ALWAYS handle the error field from Supabase responses
  - NEVER call .rpc() without verifying the function exists in SQL

════════════════════════════════════════════
GITHUB PAGES PATH RULES
════════════════════════════════════════════

The site lives at: /decide.engine-tools/ NOT at /

  - href="/" in vd-nav-fix.js → 404. Must be dynamic.
  - All internal links must use relative paths: ./path or ../path
  - Never use absolute paths like /tools/games/...
  - Back button must compute base path from window.location.pathname

Depth reference for script src paths:
  root level files (index.html):          ./shared/
  depth 1 (agent/, founder/):             ../shared/
  depth 2 (tools/something/):             ../../shared/
  depth 3 (tools/games/game/ or
           tools/engine/tool/):           ../../../shared/

════════════════════════════════════════════
BEFORE EVERY COMMIT — RUN THESE CHECKS
════════════════════════════════════════════

1. grep -n "const canonicalRoute" router.js
   → must appear exactly once

2. grep -n "const navLinks\|const sections" router.js
   → each must appear exactly once

3. node --check router.js 2>&1
   → must say nothing (no syntax errors)

4. python3 -c "import json; json.load(open('tools-manifest.json'))"
   → must not raise exception

5. grep -n "bar.href" shared/vd-nav-fix.js
   → must NOT contain href = '/'

6. grep -n "example.supabase.co\|replace-with-anon-key" tools/eco-engine-test/index.html
   → must return nothing

7. grep -n "!important" tools/games/*/index.html | grep -i "transform\|opacity"
   → must return nothing

8. for each modified HTML file: check opening/closing <script> tags balance

════════════════════════════════════════════
OUTPUT FORMAT FOR ALL TASKS
════════════════════════════════════════════

After every task, output:

  | File | Change | Lines affected | Verified |
  |------|--------|----------------|----------|

Then list any file you SKIPPED and why.
Then list any check from the checklist above that failed.

If a check fails: fix it before declaring the task done.
Never output "done" if a syntax check fails.

════════════════════════════════════════════
WHEN IN DOUBT
════════════════════════════════════════════

Ask before acting. A clarifying question is better than a broken game.

New addon rules 
1. Core Principle: Adherence to Original Instructions

Codex shall strictly adhere to the explicit instructions provided by the user. No changes, interpretations, or optimizations shall be implemented without prior clarification, explicit proposal, and user approval, as outlined in the following rules.
2. Clarification and Confirmation

Before proceeding with any coding task, Codex must ensure a complete and unambiguous understanding of the instructions.
2.1 Ambiguity Detection**: If any part of the instructions is unclear, vague, or open to multiple interpretations, Codex must immediately ask for clarification.
    *   *Example*: "Make it efficient." -> "Could you please specify what aspects of efficiency are most critical (e.g., execution speed, memory usage, network bandwidth, resource consumption) for this task?"
2.2 Incompleteness Identification**: If crucial information is missing that prevents the successful or complete execution of the task, Codex must identify the missing details and request them.
    *   *Example*: "Connect to the database." -> "Please provide the database type, host, port, credentials, and database name."
2.3 Contradiction Resolution**: If instructions appear to contradict each other, Codex must highlight the conflict and ask the user to resolve it.
    *   *Example*: "Use Python 2.7" and "Utilize f-strings for string formatting." -> "F-strings are a Python 3.6+ feature. Could you clarify whether Python 2.7 or Python 3.6+ is the target environment, or if an alternative string formatting method should be used for Python 2.7?"
2.4 Complex Instruction Paraphrasing**: For complex or multi-step instructions, Codex may paraphrase its understanding back to the user to confirm alignment before starting work.
    *   *Example*: "To confirm, you're requesting a Python script that reads data from `input.csv`, filters rows where 'status' is 'active', calculates the sum of 'amount' for these rows, and then writes the result to `summary.txt`?"
3. Proposal for Improvements or Alternatives

Codex may identify opportunities for improvement, but these must always be presented as proposals.
3.1 Proposing Best Practices**: If the user's instructions deviate from common best practices (e.g., security, performance, readability, maintainability, idiomatic code), Codex may propose an alternative approach.
    *   *Example*: "Instead of hardcoding the API key, I recommend storing it in an environment variable for better security. Would you like me to implement that?"
3.2 Proposing Optimizations**: If a more efficient or robust solution exists than what is directly implied by the instructions, Codex may suggest
