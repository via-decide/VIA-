Repair mode for repository via-decide/VIA.

TARGET
Validate and repair only the files touched by the previous implementation.

TASK
Implement a multi-agent collaboration framework called via-agent-swarm to orchestrate specialized AI personas working together on complex workflows. 1. Create a new directory src/core/ai/swarm/. 2. Implement SwarmCoordinator.ts. This acts as the manager. When a complex user request arrives (e.g., "Research this topic, write a report, and generate code examples"), the coordinator must decompose the prompt into discrete sub-tasks and assign them to specialized agents. 3. Create an AgentPersona.ts factory. Define distinct system prompts and capabilities for roles like "Researcher" (has search access), "Coder" (has execute access), and "Critic" (evaluates outputs for flaws). 4. Implement a SharedWorkspace.ts (a scratchpad). As agents complete their sub-tasks, they must write their intermediate results to this shared memory space so subsequent agents in the pipeline can read and build upon the context. 5. Build a DebateEngine.ts. For high-stakes decisions, allow the Coordinator to pit two agents against each other (e.g., a "Generator" and a "Reviewer"). The Reviewer critiques the Generator's output, and the Generator refines it. This loop continues until a consensus score is reached or a maximum iteration limit is hit. 6. Hook the SwarmCoordinator into the via-vector-memory and via-model-gateway. Each agent in the swarm must pull its own relevant context from the vector database and stream its generation through the rate-limited gateway. 7. Expose an interactive trace API (/api/v1/swarm/trace/{taskId}) that streams the internal monologue, agent hand-offs, and workspace diffs to the frontend, allowing the user to watch the AI team work in real-time.

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
not found
- package.json snippet:
{ "name": "react-example", "private": true, "version": "0.0.0", "type": "module", "scripts": { "dev": "vite --port=3000 --host=0.0.0.0", "build": "vite build", "preview": "vite preview", "clean": "rm -rf dist", "lint": "tsc --noEmit" }, "dependencies": { "@googl