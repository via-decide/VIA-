/**
 * VIA Agent Service
 *
 * Content generation via Gemini + Firestore logging, following the same
 * Firebase patterns used in game/src/App.tsx and game/src/firebase.ts.
 *
 * Slash commands (matching the gn8r Telegram bot interface):
 *   /post      → viral VIA / social post
 *   /linkedin  → professional long-form post
 *   /youtube   → video title + description + timestamps
 *   /task      → freeform agent task
 *
 * Each run is persisted to Firestore at:
 *   agent_runs/{uid}/runs/{runId}
 * so the full history is available on the agent surface.
 */

import {
  db,
  auth,
  handleFirestoreError,
  OperationType,
} from '../firebase';
import {
  collection,
  addDoc,
  serverTimestamp,
} from 'firebase/firestore';

// ── Types ─────────────────────────────────────────────────────────────────────

export type PostCommand = '/post' | '/linkedin' | '/youtube' | '/task';

export interface AgentRun {
  uid: string;
  command: PostCommand;
  topic: string;
  output: string;
  createdAt: ReturnType<typeof serverTimestamp>;
}

// ── Gemini call ───────────────────────────────────────────────────────────────

const GEMINI_MODEL = 'gemini-1.5-flash';
const GEMINI_ENDPOINT =
  `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

const SYSTEM_PROMPTS: Record<PostCommand, string> = {
  '/post': `You are a social media content creator for VIA, a Bharat-first social platform.
Write a short, punchy social media post (3–6 lines + hashtags) about the given topic.
Style: conversational, energetic, India-rooted. Use 1 emoji opener.
End with 2–4 relevant hashtags including #BharatBuilds and #VIA.
Return ONLY the post text, nothing else.`,

  '/linkedin': `You are a LinkedIn content strategist for Indian founders and professionals.
Write a thoughtful LinkedIn post (150–250 words) about the given topic.
Structure: hook → 3 numbered insights → strong closing question → hashtags.
Tone: confident, warm, professional. First-person perspective.
Return ONLY the post text, nothing else.`,

  '/youtube': `You are a YouTube content strategist for Indian creators.
Given a topic write:
TITLE: (under 70 chars)
DESCRIPTION: (100–150 words with emojis)
TIMESTAMPS:
(5 entries in 0:00 format)
TAGS: (5 comma-separated tags)
Return ONLY this formatted block, nothing else.`,

  '/task': `You are the VIA Agent, a productivity AI for Indian builders and creators.
Execute the given task concisely. If it is a content request, generate the content.
If it is a research task, provide a structured summary.
Be direct and actionable. Return the result only.`,
};

async function callGemini(command: PostCommand, topic: string, displayName?: string): Promise<string> {
  const apiKey = (process.env.GEMINI_API_KEY as string | undefined) ?? '';
  if (!apiKey) throw new Error('GEMINI_API_KEY not configured');

  const userPrompt = displayName
    ? `Creator: ${displayName}\nTopic: ${topic}`
    : `Topic: ${topic}`;

  const res = await fetch(`${GEMINI_ENDPOINT}?key=${encodeURIComponent(apiKey)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      system_instruction: { parts: [{ text: SYSTEM_PROMPTS[command] }] },
      contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
      generationConfig: { temperature: 0.85, maxOutputTokens: 512, topP: 0.95 },
    }),
  });

  if (!res.ok) throw new Error(`Gemini API ${res.status}`);

  const data = await res.json();
  const text: string | undefined = data.candidates?.[0]?.content?.parts
    ?.map((p: { text?: string }) => p.text ?? '')
    .join('')
    .trim();

  if (!text) throw new Error('Empty Gemini response');
  return text;
}

// ── Firestore logging (game/src/App.tsx pattern) ──────────────────────────────

async function logRunToFirestore(
  uid: string,
  command: PostCommand,
  topic: string,
  output: string,
): Promise<void> {
  const runsRef = collection(db, 'agent_runs', uid, 'runs');
  const run: Omit<AgentRun, 'uid'> & { uid: string } = {
    uid,
    command,
    topic,
    output,
    createdAt: serverTimestamp(),
  };
  await addDoc(runsRef, run).catch((err) =>
    handleFirestoreError(err, OperationType.CREATE, `agent_runs/${uid}/runs`),
  );
}

// ── Fallback templates (no API key / offline) ─────────────────────────────────

function buildFallback(cmd: PostCommand, topic: string, displayName?: string): string {
  const name = displayName ?? 'Creator';
  const t = topic.trim() || 'this topic';
  const T = t.charAt(0).toUpperCase() + t.slice(1);
  const tag = t.replace(/\s+/g, '');

  if (cmd === '/post') {
    return `🔥 ${T} is changing the game in India.\n\nHere's what most people don't realise:\n\n→ The opportunity is bigger than it looks\n→ Early movers are already seeing results\n→ You don't need to wait for the "right time"\n\nStart now. Build in public. Learn as you go.\n\nWhat's your take? 👇\n\n#BharatBuilds #${tag} #VIA #India`;
  }

  if (cmd === '/linkedin') {
    return `I've been thinking deeply about ${t}.\n\nHere's what I've learned:\n\n1️⃣ Most people overcomplicate the starting point\n2️⃣ The first 10% of progress comes from clarity, not effort\n3️⃣ Consistency over 90 days beats any shortcut\n\nThe real insight? ${T} rewards those who stay in the game.\n\nWhat has your experience taught you?\n\n— ${name}\n\n#${tag} #Leadership #BuildingInIndia #GrowthMindset`;
  }

  if (cmd === '/youtube') {
    return `TITLE: ${T} Explained in 60 Seconds | Must Watch\n\nDESCRIPTION:\nIn this video I break down ${t} so you can apply it today.\n\n✅ What ${t} actually means\n✅ Why it matters right now in India\n✅ The one thing you should do first\n\n👍 Like if this helped | Subscribe for more Bharat builds\n\nTIMESTAMPS:\n0:00 — Hook\n0:20 — Core concept\n0:45 — Real example\n1:10 — What to do next\n1:30 — Wrap up\n\nTAGS: ${t}, India, Bharat, ${name}Builds, ${tag}Explained`;
  }

  // /task fallback
  return `[Agent Task: ${t}]\n\n→ Goal: ${T}\n→ Step 1: Define the problem clearly\n→ Step 2: Break into 3 sub-tasks\n→ Step 3: Execute the first sub-task today\n\nFull workflow available at /agent.html`;
}

// ── Public API ─────────────────────────────────────────────────────────────────

/**
 * Generate content for a slash command.
 * Tries Gemini first; falls back to templates on any error.
 * Always logs the run to Firestore if the user is authenticated.
 */
export async function generateContent(
  command: PostCommand,
  topic: string,
  displayName?: string,
): Promise<string> {
  let output: string;

  try {
    output = await callGemini(command, topic, displayName);
  } catch (err) {
    console.warn('[AgentService] Gemini failed, using template fallback:', err);
    output = buildFallback(command, topic, displayName);
  }

  // Log to Firestore (non-blocking, mirrors game save pattern)
  const uid = auth.currentUser?.uid;
  if (uid) {
    logRunToFirestore(uid, command, topic, output).catch((err) =>
      console.warn('[AgentService] Firestore log failed:', err),
    );
  }

  return output;
}
