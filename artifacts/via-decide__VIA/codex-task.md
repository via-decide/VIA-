You are working in repository via-decide/VIA on branch main.

MISSION
We need to replace the external tool redirects on the social feed cards with a native, in-app "Story Reader" modal that displays actual Hindi/Hinglish content. Step 1: Create a data file src/data/mock-stories.json (or embed it as a const MOCK_STORIES array in the main JS file if a bundler isn't set up yet). Populate it with the 5 realistic Bharat-focused story payloads (Mumbai street food, Bihar AgriTech, IIT AI Doctor, 15yr old cricketer, Rajasthan NFT art) provided in the previous context. Step 2: Inject a new UI component into index.html called #story-reader-overlay. - It should be a full-screen, slide-up modal (starting at transform: translateY(100%)). - Use the existing design system: background: var(--deep);, z-index: 300, and include a glassmorphic sticky header with a "Close" (✕) button. - The inner content should have specific typography classes for: story-title (Playfair Display), story-meta (Author + Read Time in muted text), story-body (DM Sans, line-height 1.8), and a story-tags flex container for the hashtags. Step 3: Update the REDIRECT_MAP and handleRedirect(key) function in the frontend. - Remove the hardcoded StudyOS URLs for the story cards. - When handleRedirect(key) is called, search the MOCK_STORIES array for an object where story_id === key. - If found, dynamically inject the title, author, read_time, content_body, and tags into the #story-reader-overlay DOM elements. - Trigger the CSS class to slide the modal into view (transform: translateY(0)). Step 4: Add a "swipe-down to close" touch listener or a simple click listener on the close button to dismiss the modal, resetting its transform state and clearing the DOM content to prevent memory leaks. Step 5: Push these changes to the remote branch and open a Pull Request against main.

CONSTRAINTS
Preserve existing code; prefer additive changes.

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
not found

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