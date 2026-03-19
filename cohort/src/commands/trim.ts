import fs from "node:fs";
import path from "node:path";
import { ensureFfmpeg, runProcess } from "../ffmpeg.ts";
import { createMergePlan } from "./merge.ts";

export const runTrimCommand = async (manifestPath?: string): Promise<void> => {
  ensureFfmpeg();
  const plan = await createMergePlan(manifestPath);

  try {
    await fs.promises.mkdir(plan.trimmedDir, { recursive: true });

    for (const video of plan.processedVideos) {
      const outputPath = path.join(plan.trimmedDir, `${video.input.id}.mp4`);
      await runProcess("ffmpeg", [
        "-y",
        ...(video.input.trimStartSec && video.input.trimStartSec > 0 ? ["-ss", video.input.trimStartSec.toString()] : []),
        ...(video.input.trimEndSec != null && video.input.trimEndSec > (video.input.trimStartSec ?? 0)
          ? ["-to", video.input.trimEndSec.toString()]
          : []),
        "-i",
        video.input.path,
        "-map",
        "0:v:0",
        "-c:v",
        "copy",
        "-an",
        outputPath,
      ]);
      console.log(`Trimmed video: ${outputPath}`);
    }

    for (const audio of plan.processedAudios) {
      const outputPath = path.join(plan.trimmedDir, `${audio.input.id}.wav`);
      const filters: string[] = [];
      if ((audio.input.volume ?? 1) !== 1) {
        filters.push(`volume=${audio.input.volume ?? 1}`);
      }
      const delayMs = Math.max(0, Math.round((audio.input.delayStartSec ?? 0) * 1000));
      if (delayMs > 0) {
        filters.push(`adelay=${delayMs}|${delayMs}`);
      }
      await runProcess("ffmpeg", [
        "-y",
        ...(audio.input.trimStartSec && audio.input.trimStartSec > 0 ? ["-ss", audio.input.trimStartSec.toString()] : []),
        ...(audio.input.trimEndSec != null && audio.input.trimEndSec > (audio.input.trimStartSec ?? 0)
          ? ["-to", audio.input.trimEndSec.toString()]
          : []),
        "-i",
        audio.input.path,
        ...(filters.length > 0 ? ["-af", filters.join(",")] : []),
        "-c:a",
        "pcm_s16le",
        outputPath,
      ]);
      console.log(`Trimmed audio: ${outputPath}`);
    }
  } finally {
    await fs.promises.rm(plan.tempDir, { recursive: true, force: true });
  }
};
