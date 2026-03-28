Repair mode for repository via-decide/VIA.

TARGET
Validate and repair only the files touched by the previous implementation.

TASK
Fix the World Map routing bug: Register subpage routes in the central Router. 1. Locate your central routing logic file (likely router.js, app.js, or commandRouter.js). 2. Check the route registration map/switch statement. The reason the map redirects to the platform is likely because the router catches the /map/region URL, fails to find a match, and executes its fallback logic (default: loadPlatform()). 3. Dynamically or statically register the map subpages. If the regions share a template, create a wildcard route handler like matchRoute('/map/:regionId'). 4. When this route is matched, write the logic to fetch/render the correct subpage view (e.g., loading views/map/[regionId].html into the main DOM container). 5. If the subpages are standalone tools, ensure their IDs are added to the exact same registry that handles normal tool routing.
Fix the World Map routing bug: Implement a robust 404 / Deep Linking handler for GitHub Pages. 1. Because this is hosted on GitHub Pages, if a user refreshes the page while on a map subpage (e.g., via-decide.github.io/VIA/map/greece), GitHub will look for a physical folder named /map/greece/ and throw a 404, redirecting to the main platform. 2. Implement the standard SPA hash-routing fix OR the 404.html redirect hack for GitHub Pages. 3. Option A (Hash Routing): Refactor the router to use window.location.hash (e.g., #/map/greece). Update the hashchange event listener to trigger view updates. 4. Option B (404 Hack): Create a 404.html file in the root that captures the intended URL, saves it to sessionStorage, and redirects to index.html. Then, in index.html's init script, check sessionStorage for a saved redirect and force the router to load that subpage immediately.
Fix Subpage Card routing on index.html: Convert absolute paths to relative/hash paths. 1. Open index.html and locate all the "Subpage Card" elements. 2. Inspect their href attributes or data-route attributes. 3. If they start with a forward slash (e.g., href="/pages/tool.html" or href="/subpage"), remove the leading slash or replace it with a dot (e.g., href="./pages/tool.html" or href="?page=subpage" or href="#/subpage" depending on the routing architecture). 4. If the cards use JavaScript onclick events featuring window.location.href = '/something', update those strings to be relative to the current path. 5. Apply this same fix to any navigation menus or headers present in index.html.
Implement global click interception for Subpage Cards to prevent default browser navigation. 1. Create or update the main JavaScript file loaded by index.html (e.g., app.js or router.js). 2. Add a global event listener to the document that listens for click events. 3. If the clicked element (or its parent) has a specific class like .subpage-card or an attribute like data-link, call event.preventDefault(). 4. Extract the target destination from the card's href or data-route attribute. 5. Pass this destination to your internal JavaScript router to dynamically load the content into the DOM, OR manually construct the correct GitHub Pages URL (appending the repo name) and set window.location.assign().
Build a URLResolver utility to permanently safeguard against GitHub Pages pathing errors. 1. Create a new utility file shared/url-resolver.js. 2. Implement a function resolvePath(targetPath) that detects the current environment. 3. Logic: Check window.location.hostname. If it includes github.io, detect the repository name from window.location.pathname (which will be /VIA/). 4. If the environment is GitHub Pages, the function must automatically prepend /VIA/ (or the detected repo name) to any path passed into it (e.g., resolvePath('subpage.html') returns /VIA/subpage.html). 5. If the environment is localhost, it just returns /subpage.html. 6. Refactor the index.html card rendering logic or the central router to wrap all destination URLs in this resolvePath() function before attempting navigation.

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
# VIA - Bharat's Social Platform VIA is a production-focused social platform for Bharat-centric communities. It combines a real-time social feed, long-form knowledge spaces, and discovery tools in a modern React experience backed by Firebase. ## Features - **Feed**: Browse a fast, social-first st
- AGENTS snippet:
# AGENTS — via-decide/VIA Rules for ALL coding agents (Codex, Claude, automated PRs) working in this repository. --- ## 1. Preservation Policy 1. Never delete tool folders under `tools/`. 2. Never remove working code — upgrades are additive only. 3. Never replace a functioning file with a placeh
- package.json snippet:
{ "name": "viadecide", "version": "1.0.0", "description": "ViaD\u00e9cide: Unified decision-making platform", "private": true, "scripts": { "start": "echo 'static site \u2014 no build required'", "setup": "bash setup-monorepo.sh", "init": "node init-monorepo.js", "validate"