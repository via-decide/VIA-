You are working in repository via-decide/VIA on branch main.

MISSION
Implement a core backend module called via-swarm-pubsub-bus to enable decentralized, asynchronous communication across the AI agent swarm. 1. Create a new directory src/core/network/swarm-bus/. 2. Create bus-config.json defining event topics (e.g., "intent_parsed", "data_fetched", "moderation_flagged"), maximum message queue sizes, and TTL (Time-To-Live) for unread events. 3. Implement EventBus.js (or .ts). This module acts as the central nervous system for all autonomous agents running in the backend. 4. Build robust publish(topic, payload) and subscribe(topic, callback) methods. An agent (e.g., a "Web Scraper") should be able to publish a payload without knowing which agent (e.g., a "Summarizer") will consume it. 5. Integrate the EventBus closely with the WorkerPool. Since agents run in isolated worker_threads, the bus must use Node's MessageChannel or postMessage API to securely and efficiently route event payloads across thread boundaries. 6. Implement a "Dead Letter Topic" for events that are published but have no active subscribers or fail to process, logging them to the telemetry stream for debugging.

CONSTRAINTS
Do NOT use external message brokers like RabbitMQ, Kafka, or Redis Pub/Sub. You must build a native, high-performance in-memory event bus in JavaScript/TypeScript. The routing mechanism must use asynchronous iterators or non-blocking queues to ensure that a slow subscriber does not bottleneck the publisher or the main event loop.

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