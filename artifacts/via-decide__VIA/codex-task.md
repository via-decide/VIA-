You are working in the `via-decide/VIA` repository.

This is a vanilla HTML/CSS/JavaScript website, not a React app.

Task:
Integrate locally published creator drafts into the main VIA feed.

The creator onboarding flow already stores published drafts in browser localStorage under this key:

`via_creator_published_drafts`

You need to make the main feed read those drafts and render them automatically.

==================================================
GOAL
==================================================

When a creator publishes from `creator-onboarding.html`, the main VIA feed should display those drafts on the same device/browser.

This is a local preview system only.
Do NOT build backend publishing yet.
Do NOT add Supabase for this task.

==================================================
FILES TO CREATE / MODIFY
==================================================

1. CREATE:
- `social-core.js`

2. MODIFY:
- the main feed page file that renders the VIA feed
  (likely `index.html`, unless the repo structure clearly uses another main homepage file)

Do NOT modify unrelated files.

==================================================
FUNCTIONAL REQUIREMENTS
==================================================

A. In `social-core.js`, implement a standalone local feed renderer.

Requirements:

1. Read localStorage key:
   `via_creator_published_drafts`

2. Safely parse it:
   - if missing → use empty array
   - if invalid JSON → fail safely and log warning
   - if not an array → use empty array

3. Sort posts newest first using `createdAt`

4. Render posts into a mount element:
   `#viaCreatorFeedMount`

5. Each rendered card must show:
   - title
   - author
   - creatorType
   - type
   - audience
   - extracted hook
   - extracted structure bullets (up to 4)
   - relative time / createdAt label

6. Add two actions per card:
   - `Copy Draft`
   - `Open Creator Flow`

7. `Copy Draft`:
   - copies the post body to clipboard
   - temporary button label becomes `Copied`

8. `Open Creator Flow`:
   - navigates to:
     `./creator-onboarding.html?source=feed`

9. Add empty state UI:
   - If no local creator posts exist, show a simple message explaining that posts published from creator onboarding will appear here on this device.

10. Expose helper on `window`:
   - `window.VIASocialCore.renderLocalCreatorFeed`
   - `window.VIASocialCore.readPublishedDrafts`

11. Auto-render on page load

12. Refresh on `storage` event when possible

==================================================
DATA ASSUMPTIONS
==================================================

Each local published draft may look like:

{
  id: "draft_123",
  title: "Decision Post: Creator Strategy",
  type: "Decision Post",
  creatorType: "Writer",
  author: "Name",
  email: "name@example.com",
  audience: "Founders",
  idea: "Core thesis",
  body: "Full generated draft text",
  createdAt: "2026-01-01T00:00:00.000Z",
  source: "creator-onboarding"
}

Handle missing fields safely.

==================================================
UI REQUIREMENTS
==================================================

Use lightweight embedded styles inside `social-core.js` via injected `<style>` tag.

Style should match VIA:
- dark
- rounded cards
- subtle borders
- orange accent
- mobile friendly

Do NOT redesign the whole site.
Only style the local creator feed block and its cards.

==================================================
INDEX / MAIN FEED PAGE INTEGRATION
==================================================

Modify the main feed page so it includes a mount point:

```html
<div id="viaCreatorFeedMount"></div>
```

Place it in a logical feed section where creator content preview should appear.

Also load:

<script src="./social-core.js"></script>

Do NOT duplicate the script if already present. Do NOT remove existing feed logic. Do NOT replace the homepage. Only augment it.

If the repo already has a feed section, add this mount inside that section. If not, create a small “Creator Feed Preview” block with:

heading

short description

mount div


================================================== IMPLEMENTATION CONSTRAINTS

1. Do NOT use frameworks.


2. Do NOT add npm dependencies.


3. Do NOT rewrite existing feed architecture.


4. Do NOT change backend/auth logic.


5. Do NOT rename the localStorage key.


6. Do NOT break current feed/discover/about/profile UI.


7. Prefer surgical edits.



================================================== HELPER LOGIC DETAILS

In social-core.js, include helper functions like:

escapeHtml(value)

readPublishedDrafts()

extractHook(body)

extractStructure(body)

formatTime(value)

renderLocalCreatorFeed(mountId)

attachActions(mount, posts)

ensureStyleTag()


extractHook(body):

try to extract text after Hook:

fallback to first ~180 chars


extractStructure(body):

try to parse lines under Structure:

stop near CTA:

limit to 4 items


================================================== SELF-CHECK BEFORE FINISHING

Before returning final code, verify:

social-core.js exists

main feed page includes #viaCreatorFeedMount

main feed page includes ./social-core.js

no framework code was introduced

no backend code was introduced

local drafts render newest first

empty state works

copy button works

onboarding navigation works

current feed page is still intact


================================================== OUTPUT FORMAT

Return FULL final contents of every modified/created file only.

Use this exact format:

FILE: relative/path/to/file

<full file contents>

or

FILE: relative/path/to/file

<full file contents>

Do not explain anything. Do not summarize. Do not use diffs. Only return final file contents.
