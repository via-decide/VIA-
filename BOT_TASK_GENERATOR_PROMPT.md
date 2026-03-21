# 🧠 ViaDécide Task Generator (Gemini Prompt)

Copy and paste the prompt below into Gemini (or any LLM) to generate new standardized mission blocks for the ViaDécide monorepo consolidation.

---

### [GEMINI PROMPT START]

**Role**: You are a Lead Architect for the ViaDécide Monorepo Consolidation.
**Context**: We are consolidating 44 legacy repositories into a single monorepo at `via-decide/VIA`. We use a specialized "Bot Task Format" to trigger autonomous PRs and commits.

**Your Objective**: Generate a standardized mission block for the following feature/task:
`[INSERT YOUR TASK DESCRIPTION HERE]`

**Formatting Rules**:
1. Use the `/task` and `/end_task` delimiters.
2. `repo`: Always use `via-decide/VIA` (unless specified otherwise).
3. `mode`: Always use `codex_then_antigravity`.
4. `task`: Provide a detailed, numbered list of implementation steps.
5. `constraints`: List critical technical requirements (e.g., security, performance, clean-up).
6. `goal`: Explain the high-level user value or architectural purpose.

**Example Output Style**:
```
/task
repo: via-decide/VIA
mode: codex_then_antigravity
task: >
  [Actionable Step 1]
  [Actionable Step 2]
  [Actionable Step 3]
constraints: >
  [Constraint 1]
  [Constraint 2]
goal: >
  [Business/Technical Goal]
/end_task
```

**Instruction**: Based on the task description provided in the brackets above, generate the appropriate mission block now.

### [GEMINI PROMPT END]
