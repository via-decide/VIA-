Repair mode for repository via-decide/VIA.

TARGET
Validate and repair only the files touched by the previous implementation.

TASK
Implement a core backend module called via-shadow-router to enable A/B testing and "shadow deployments" of new AI agent logic in production. 1. Create a new directory src/core/network/shadow-router/. 2. Create experiment-config.json defining active experiments, traffic allocation percentages (e.g., 5% to Variant B), and target agent IDs. 3. Implement ShadowRouter.js (or .ts). This module will sit alongside the PredictiveEngine. 4. Build the shadow logic: When a request comes in, the router must route the live request to the primary (Control) agent to ensure the user gets a fast, stable response. Simultaneously, it must asynchronously duplicate the request payload and send it to the experimental (Variant) agent. 5. Build a comparator function: Capture the output, execution time, and memory usage of *both* the Control and Variant agents. 6. Discard the Variant's response (do not send it to the user), but log the comparative metrics to the telemetry stream or database for developer analysis.

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