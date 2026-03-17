You are working in repository via-decide/VIA on branch main.

MISSION
Implement a core backend module called via-persona-morpher to dynamically adjust the tone, style, and vocabulary of agents based on real-time emotional feedback. 1. Create a new directory src/core/nlp/persona-morpher/. 2. Create persona-registry.json defining "Style Vectors" (e.g., Formality, Empathy, Humor, Brevity) and specific prompt modifiers or linguistic rules for each persona (e.g., "The Sage," "The Peer," "The Assistant"). 3. Implement Morpher.js (or .ts). This module must act as a stylistic interceptor in the PredictiveEngine pipeline. 4. Build a "Sentiment-to-Style" mapping engine: Based on the sentiment_score and emotion_tag provided by the SentimentTracker, the Morpher should calculate a target persona shift (e.g., if a user is "Angry," shift the agent from "Witty" to "High Empathy/Direct"). 5. Implement a "Dynamic Prompt Decorator": Before a request is dispatched to an LLM, the Morpher must inject hidden stylistic constraints into the system prompt to ensure the output aligns with the calculated persona. 6. Build a "Post-Processing Filter": For deterministic or local agent responses, use a native regex-based substitution engine to adjust greetings, sign-offs, and common phrases to match the active persona. 7. Log "Persona Transitions" to the telemetry stream to track how the swarm is adapting to different user segments.

CONSTRAINTS
Do NOT use heavy linguistic libraries like compromise or natural for basic stylistic shifts. You must rely on native String/Regex operations and efficient prompt engineering. The Morpher must not introduce more than 10ms of latency to the request flow. Ensure the "System Prompt" remains immutable; persona modifiers must be appended as "Contextual Overrides" only.

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