You are working in repository via-decide/VIA on branch main.

MISSION
Implement a core backend module called via-media-processing-agent to handle high-performance asset optimization and metadata extraction for social media content. 1. Create a new directory src/core/media/processing-agent/. 2. Create media-config.json defining supported formats (JPEG, PNG, WebP, MP4), maximum upload sizes, and target resolution variants (e.g., thumbnail, mobile-hd, desktop-4k). 3. Implement MediaProcessor.js (or .ts). This module must act as a background service triggered by the EventBus whenever a new media payload is uploaded or linked by an agent. 4. Build an optimization pipeline: Use a high-performance, non-blocking library (like sharp for Node.js) to generate multi-size variants and extract "BlurHash" strings for instant frontend loading placeholders. 5. Implement "Visual Context Tagging": Extract basic metadata (dimensions, orientation, color palette) and prepare the binary data for potential "Computer Vision" agents downstream. 6. Integrate with the WorkerPool. All heavy resizing or transcoding operations MUST be offloaded to worker threads to ensure the main event loop remains responsive for real-time socket communication. 7. Add a "Media Deduplication" check: Generate a hash (e.g., SHA-256) of the raw buffer to ensure the same image isn't processed and stored multiple times across different agent sessions.

CONSTRAINTS
Do NOT use external cloud-based transformation APIs (like Cloudinary) for the core processing. All logic must reside within the VIA engine. Use native Node.js Buffer and Stream APIs for efficient memory handling. The processor must implement a "Backpressure" mechanism; if the WorkerPool is saturated, it must pause new media intake rather than crashing the process.

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