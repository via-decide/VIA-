import { probeDurationSeconds, ensureFfmpeg } from "../ffmpeg.ts";
import { getCanonicalAudio, loadManifest } from "../load.ts";

export const runInfoCommand = async (manifestPath?: string): Promise<void> => {
  const manifest = loadManifest(manifestPath);
  ensureFfmpeg();
  const canonicalAudio = getCanonicalAudio(manifest);

  console.log(`Production: ${manifest.production?.title ?? manifest.production?.id ?? "<untitled>"}`);
  console.log(`Primary audio id: ${manifest.sync.primaryAudioId}`);
  console.log(`Canonical audio id: ${canonicalAudio.id}`);
  console.log(`Output path: ${manifest.output.path}`);

  console.log("\nVideos:");
  for (const video of manifest.inputs.videos) {
    const duration = await probeDurationSeconds(video.path);
    console.log(
      `- ${video.id}: duration=${duration.toFixed(3)}s trimStart=${(video.trimStartSec ?? 0).toFixed(3)}s trimEnd=${video.trimEndSec ?? "<end>"} mute=${video.mute === true}`
    );
  }

  console.log("\nAudios:");
  for (const audio of manifest.inputs.audios) {
    const duration = await probeDurationSeconds(audio.path);
    console.log(
      `- ${audio.id}: duration=${duration.toFixed(3)}s trimStart=${(audio.trimStartSec ?? 0).toFixed(3)}s trimEnd=${audio.trimEndSec ?? "<end>"} delay=${(audio.delayStartSec ?? 0).toFixed(3)}s volume=${audio.volume ?? 1} canonical=${audio.isCanonical === true}`
    );
  }
};
