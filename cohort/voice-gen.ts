import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import type { ProductionData, VideoDefinition } from "./src/types";

const mode = (process.env.PRODUCTION_MODE ?? "v2").toLowerCase();
const sourceFile = mode === "v1" ? "production.json" : "production-v2.json";
const production = JSON.parse(fs.readFileSync(path.join(process.cwd(), sourceFile), "utf8")) as ProductionData;
const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const force = args.includes("--force");
const list = args.includes("--list");
const all = args.includes("--all");
const ids = production.videos.map((v) => v.id);

if (list) {
  console.log(ids.join("\n"));
  process.exit(0);
}

const selected = all ? production.videos : production.videos.filter((v) => args.includes(v.id));
const voiceDir = path.join(process.cwd(), "public", "voice");
fs.mkdirSync(voiceDir, { recursive: true });

const timingsPath = path.join(voiceDir, "timings.json");
let existing: { entries?: unknown; flat?: unknown } = {};
if (fs.existsSync(timingsPath)) {
  try {
    existing = JSON.parse(fs.readFileSync(timingsPath, "utf8")) as { entries?: unknown; flat?: unknown };
  } catch {
    existing = {};
  }
}
const entries: Array<{ videoId: string; sceneId: string; durationSec: number; durationFrames: number; file: string }> =
  Array.isArray(existing.entries) ? existing.entries : [];
const flat: Record<string, number> = typeof existing.flat === "object" && existing.flat ? existing.flat : {};

const sceneText = (video: VideoDefinition, sceneId: string): string => {
  const script = video.full_script ?? video.creator_script ?? {};
  const map: Record<string, string> = {
    S01_INTRO: script.hook ?? "",
    S02_HOOK: [script.hook, script.context].filter(Boolean).join(" "),
    S03_STORY: script.context ?? script.story ?? "",
    S04_REPO: script.repo_explanation ?? script.story ?? "",
    S05_DIAGRAM: script.decision_moment ?? "",
    S06_DECISION: script.options_narration ?? script.decision_question ?? "",
    S07_OUTRO: script.outro ?? "",
  };
  return map[sceneId] ?? "";
};

for (const video of selected) {
  for (const scene of video.remotion_spec.scenes) {
    const key = `${video.id}_${scene.id}`;
    const fileName = `${key}.wav`;
    const output = path.join(voiceDir, fileName);

    if (!force && fs.existsSync(output)) {
      continue;
    }

    const text = sceneText(video, scene.id) || `${video.title} ${scene.id}`;
    const durationSec = Math.max(1, Math.round(text.split(/\s+/).length / 3));

    if (dryRun) {
      fs.writeFileSync(output, "");
    } else {
      execFileSync("edge-tts", ["--voice", "en-IN-PrabhatNeural", "--text", text, "--write-media", output], {
        stdio: "inherit",
      });
    }

    const idx = entries.findIndex((e) => e.videoId === video.id && e.sceneId === scene.id);
    const row = { videoId: video.id, sceneId: scene.id, durationSec, durationFrames: durationSec * 30, file: fileName };
    if (idx >= 0) {
      entries[idx] = row;
    } else {
      entries.push(row);
    }
    flat[key] = durationSec;
  }
}

const payload = {
  generated: new Date().toISOString(),
  mode: sourceFile,
  entries,
  flat,
};

fs.writeFileSync(timingsPath, JSON.stringify(payload, null, 2));
