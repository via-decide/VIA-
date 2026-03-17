Repair mode for repository via-decide/VIA.

TARGET
Validate and repair only the files touched by the previous implementation.

TASK
Implement a core backend module called via-dependency-auditor to automatically scan, verify, and monitor third-party agent dependencies for security vulnerabilities and license compliance. 1. Create a new directory src/core/security/dependency-auditor/. 2. Create auditor-config.json defining "Severity Thresholds" (e.g., block on 'High' or 'Critical'), a whitelist of "Permitted Licenses" (e.g., MIT, Apache-2.0, BSD), and a list of "Banned Packages." 3. Implement AuditorEngine.js (or .ts). This module must hook into the PluginLoader to intercept any new agent before it is initialized. 4. Build a "Manifest Scanner": Parse the package.json or lockfile of a plugin to identify all direct and transitive dependencies without running an external CLI. 5. Implement a "Local Vulnerability Check": Compare the dependency tree against a cached local mirror of a vulnerability database (like the GitHub Advisory Database) to identify known CVEs. 6. Build a "License Guard": Ensure no plugin introduces viral or incompatible licenses that could compromise the VIA core's legal posture. 7. Integrate with the EventBus: If a dependency is flagged, publish a "SecurityAlertEvent" and prevent the PluginLoader from enabling the agent until the issue is resolved.

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