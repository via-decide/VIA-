Repair mode for repository via-decide/VIA.

TARGET
Validate and repair only the files touched by the previous implementation.

TASK
Implement a core backend module called via-plugin-loader to allow the engine to hot-swap agent capabilities and toolsets without restarting the Node process. 1. Create a new directory src/core/runtime/plugin-loader/. 2. Create plugin-manifest.json defining the directory structure for external plugins, permitted NPM dependencies, and security sandbox levels. 3. Implement PluginManager.js (or .ts). This module must be capable of scanning a plugins/ folder and dynamically importing JavaScript modules using import() or require(). 4. Build a "Lifecycle Hook" system: Each plugin must export a standard interface including onLoad(), onEnable(), onDisable(), and getMetadata(). 5. Integrate with the EventBus and SwarmBalancer. When a plugin is loaded, it must automatically register its specialized agents or tools with the PredictiveEngine so they can immediately begin receiving routed traffic. 6. Implement a "Hot-Reload" watcher using fs.watch. If a developer or an automated CI/CD pipeline updates a plugin file, the PluginManager should gracefully disable the old version, clear the module cache, and load the new version in real-time.

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
not found
- AGENTS snippet:
not found
- package.json snippet:
not found