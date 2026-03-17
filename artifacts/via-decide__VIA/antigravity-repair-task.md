Repair mode for repository via-decide/VIA.

TARGET
Validate and repair only the files touched by the previous implementation.

TASK
Implement a core backend module called via-persona-morpher to dynamically adjust the tone, style, and vocabulary of agents based on real-time emotional feedback. 1. Create a new directory src/core/nlp/persona-morpher/. 2. Create persona-registry.json defining "Style Vectors" (e.g., Formality, Empathy, Humor, Brevity) and specific prompt modifiers or linguistic rules for each persona (e.g., "The Sage," "The Peer," "The Assistant"). 3. Implement Morpher.js (or .ts). This module must act as a stylistic interceptor in the PredictiveEngine pipeline. 4. Build a "Sentiment-to-Style" mapping engine: Based on the sentiment_score and emotion_tag provided by the SentimentTracker, the Morpher should calculate a target persona shift (e.g., if a user is "Angry," shift the agent from "Witty" to "High Empathy/Direct"). 5. Implement a "Dynamic Prompt Decorator": Before a request is dispatched to an LLM, the Morpher must inject hidden stylistic constraints into the system prompt to ensure the output aligns with the calculated persona. 6. Build a "Post-Processing Filter": For deterministic or local agent responses, use a native regex-based substitution engine to adjust greetings, sign-offs, and common phrases to match the active persona. 7. Log "Persona Transitions" to the telemetry stream to track how the swarm is adapting to different user segments.

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