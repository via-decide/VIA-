# CODEX AGENT RULES — via-decide/decide.engine-tools
# Codex reads this before every task in this repo.

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
  tools/games/hex-wars/index.html → QUESTIONS array
  shared/shared.css
  _redirects
  tools-manifest.json
  missions.json (skillhex)

════════════════════════════════════════════
FUNCTION BODIES — NEVER TOUCH
════════════════════════════════════════════

Do not modify protected function bodies in the listed games/tools.
Only ever add NEW code AFTER them, never inside them.

════════════════════════════════════════════
SCRIPT TAG LOADING ORDER — CRITICAL
════════════════════════════════════════════

Always follow this order in <head>:
1. Three.js CDN (if used)
2. Other CDN scripts
3. shared/vd-nav-fix.js
4. shared/vd-wallet.js (if needed)
5. shared/tool-storage.js (if needed)
6. Other shared/*.js files
7. Inline <script> OR type="module" scripts

════════════════════════════════════════════
SUPABASE RULES
════════════════════════════════════════════

Project URL: https://bfocxgtlemhxfwfuhlxn.supabase.co
Anon key: set by developer, stored as window.ECO_SUPABASE_ANON_KEY
- NEVER hardcode the anon key in committed files
- ALWAYS use snake_case column names
- ALWAYS use .single() when fetching one row
- ALWAYS handle the error field from Supabase responses
- NEVER call .rpc() without verifying the function exists in SQL

════════════════════════════════════════════
GITHUB PAGES PATH RULES
════════════════════════════════════════════

The site lives at: /decide.engine-tools/ NOT at /
Use relative internal links and depth-correct shared script paths.

════════════════════════════════════════════
BEFORE EVERY COMMIT — RUN THESE CHECKS
════════════════════════════════════════════

1. grep -n "const canonicalRoute" router.js
2. grep -n "const navLinks\|const sections" router.js
3. node --check router.js 2>&1
4. python3 -c "import json; json.load(open('tools-manifest.json'))"
5. grep -n "bar.href" shared/vd-nav-fix.js
6. grep -n "example.supabase.co\|replace-with-anon-key" tools/eco-engine-test/index.html
7. grep -n "!important" tools/games/*/index.html | grep -i "transform\|opacity"
8. for each modified HTML file: check opening/closing <script> tags balance
