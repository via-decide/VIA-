import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { ensureFfmpeg, formatCommand, probeDurationSeconds, runProcess } from "../ffmpeg.ts";
import { getCanonicalAudio, loadManifest } from "../load.ts";
import type { AudioInput, ProductionManifest, VideoInput } from "../types.ts";

interface PlannedStep {
  label: string;
  command: string;
  args: string[];
}

interface ProcessedVideo {
  input: VideoInput;
  outputPath: string;
}

interface ProcessedAudio {
  input: AudioInput;
  outputPath: string;
}

interface MergePlan {
  manifest: ProductionManifest;
  steps: PlannedStep[];
  tempDir: string;
  trimmedDir: string;
  processedVideos: ProcessedVideo[];
  processedAudios: ProcessedAudio[];
  concatListPath: string;
  concatenatedVideoPath: string;
  mixedAudioPath: string;
  finalOutputPath: string;
  canonicalAudio: AudioInput;
}

const audioCodecForPath = (filePath: string, fallback: string): string => {
  return path.extname(filePath).toLowerCase() === ".wav" ? "pcm_s16le" : fallback;
};

const resolveVideoEncoder = (codec: string | undefined): string => {
  if (codec === "h264") return "libx264";
  if (codec === "h265") return "libx265";
  return codec ?? "libx264";
};

const buildTrimArgs = (trimStartSec: number, trimEndSec: number | null): string[] => {
  const args: string[] = [];
  if (trimStartSec > 0) {
    args.push("-ss", trimStartSec.toString());
  }
  if (trimEndSec != null && trimEndSec > trimStartSec) {
    args.push("-to", trimEndSec.toString());
  }
  return args;
};

const buildVideoTrimStep = (
  input: VideoInput,
  outputPath: string,
  muteOriginalVideoAudio: boolean
): PlannedStep => {
  const args = [
    "-y",
    ...buildTrimArgs(input.trimStartSec ?? 0, input.trimEndSec ?? null),
    "-i",
    input.path,
    "-map",
    "0:v:0",
    "-c:v",
    "copy",
    "-an",
    outputPath,
  ];

  return {
    label: `Trim video ${input.id}${muteOriginalVideoAudio || input.mute ? " (muted)" : ""}`,
    command: "ffmpeg",
    args,
  };
};

const buildAudioTrimStep = (input: AudioInput, outputPath: string): PlannedStep => {
  const filters: string[] = [];
  const volume = input.volume ?? 1;
  const delayMs = Math.max(0, Math.round((input.delayStartSec ?? 0) * 1000));

  if (volume !== 1) {
    filters.push(`volume=${volume}`);
  }
  if (delayMs > 0) {
    filters.push(`adelay=${delayMs}|${delayMs}`);
  }

  const args = [
    "-y",
    ...buildTrimArgs(input.trimStartSec ?? 0, input.trimEndSec ?? null),
    "-i",
    input.path,
    ...(filters.length > 0 ? ["-af", filters.join(",")] : []),
    "-c:a",
    audioCodecForPath(outputPath, "aac"),
    outputPath,
  ];

  return {
    label: `Process audio ${input.id}`,
    command: "ffmpeg",
    args,
  };
};

const buildMixStep = (processedAudios: ProcessedAudio[], mixedAudioPath: string): PlannedStep | null => {
  if (processedAudios.length === 0) {
    return null;
  }

  if (processedAudios.length === 1) {
    return {
      label: `Reuse processed audio ${processedAudios[0].input.id}`,
      command: "ffmpeg",
      args: ["-y", "-i", processedAudios[0].outputPath, "-c:a", audioCodecForPath(mixedAudioPath, "aac"), mixedAudioPath],
    };
  }

  const args = ["-y"];
  for (const audio of processedAudios) {
    args.push("-i", audio.outputPath);
  }

  const amix = `amix=inputs=${processedAudios.length}:normalize=0`;
  args.push(
    "-filter_complex",
    amix,
    "-c:a",
    audioCodecForPath(mixedAudioPath, "aac"),
    mixedAudioPath
  );

  return {
    label: `Mix ${processedAudios.length} audio tracks`,
    command: "ffmpeg",
    args,
  };
};

const buildConcatStep = (concatListPath: string, outputPath: string): PlannedStep => ({
  label: "Concatenate processed video clips",
  command: "ffmpeg",
  args: ["-y", "-f", "concat", "-safe", "0", "-i", concatListPath, "-c:v", "copy", "-an", outputPath],
});

const buildFinalMergeStep = (
  manifest: ProductionManifest,
  concatenatedVideoPath: string,
  mixedAudioPath: string,
  canonicalAudioDuration: number,
  videoDuration: number,
  finalOutputPath: string
): PlannedStep => {
  const outputDir = path.dirname(finalOutputPath);
  fs.mkdirSync(outputDir, { recursive: true });

  const shouldLoopVideo =
    manifest.sync.autoFitVideoToAudio === true &&
    manifest.sync.allowVideoLoop === true &&
    videoDuration < canonicalAudioDuration;

  const args: string[] = ["-y"];
  if (shouldLoopVideo) {
    args.push("-stream_loop", "-1");
  }

  args.push("-i", concatenatedVideoPath, "-i", mixedAudioPath, "-map", "0:v:0", "-map", "1:a:0");

  if (manifest.output.width && manifest.output.height) {
    args.push("-vf", `scale=${manifest.output.width}:${manifest.output.height}`);
  }

  args.push(
    "-c:v",
    resolveVideoEncoder(manifest.output.videoCodec),
    "-c:a",
    manifest.output.audioCodec ?? "aac"
  );

  if (manifest.output.fps) {
    args.push("-r", manifest.output.fps.toString());
  }
  if (manifest.output.crf != null) {
    args.push("-crf", manifest.output.crf.toString());
  }
  if (manifest.output.preset) {
    args.push("-preset", manifest.output.preset);
  }

  if (shouldLoopVideo) {
    args.push("-t", canonicalAudioDuration.toString());
  } else if (videoDuration !== canonicalAudioDuration) {
    args.push("-shortest");
  }

  args.push(finalOutputPath);

  return {
    label: shouldLoopVideo ? "Render final output with looped video" : "Render final output",
    command: "ffmpeg",
    args,
  };
};

export async function createMergePlan(manifestPath?: string): Promise<MergePlan> {
  const manifest = loadManifest(manifestPath);

  const finalOutputPath = manifest.output.path;
  const outputRoot = path.dirname(finalOutputPath);
  const trimmedDir = path.join(outputRoot, "trimmed");
  const tempDir = await fs.promises.mkdtemp(path.join(os.tmpdir(), "cohert-studio-"));
  const concatListPath = path.join(tempDir, "videos.txt");
  const concatenatedVideoPath = path.join(tempDir, "video-concat.mp4");
  const mixedAudioPath = path.join(tempDir, "mixed-audio.wav");
  const canonicalAudio = getCanonicalAudio(manifest);

  const processedVideos = manifest.inputs.videos.map((input, index) => ({
    input,
    outputPath: path.join(tempDir, `video-${index + 1}.mp4`),
  }));
  const processedAudios = manifest.inputs.audios.map((input, index) => ({
    input,
    outputPath: path.join(tempDir, `audio-${index + 1}.wav`),
  }));

  const steps: PlannedStep[] = [
    ...processedVideos.map((video) =>
      buildVideoTrimStep(video.input, video.outputPath, manifest.sync.muteOriginalVideoAudio === true)
    ),
    ...processedAudios.map((audio) => buildAudioTrimStep(audio.input, audio.outputPath)),
  ];

  const mixStep = buildMixStep(processedAudios, mixedAudioPath);
  if (mixStep) {
    steps.push(mixStep);
  }

  steps.push(buildConcatStep(concatListPath, concatenatedVideoPath));

  return {
    manifest,
    steps,
    tempDir,
    trimmedDir,
    processedVideos,
    processedAudios,
    concatListPath,
    concatenatedVideoPath,
    mixedAudioPath,
    finalOutputPath,
    canonicalAudio,
  };
}

export const printMergePlan = async (manifestPath?: string): Promise<void> => {
  const plan = await createMergePlan(manifestPath);
  try {
    console.log(`Production: ${plan.manifest.production?.title ?? plan.manifest.production?.id ?? "<untitled>"}`);
    console.log(`Canonical audio: ${plan.canonicalAudio.id}`);
    console.log(`Final output: ${plan.finalOutputPath}`);
    for (const step of plan.steps) {
      console.log(`\n# ${step.label}`);
      console.log(formatCommand(step.command, step.args));
    }
  } finally {
    await fs.promises.rm(plan.tempDir, { recursive: true, force: true });
  }
};

export const runMergeCommand = async (manifestPath?: string): Promise<void> => {
  ensureFfmpeg();
  const plan = await createMergePlan(manifestPath);

  try {
    await fs.promises.mkdir(path.dirname(plan.finalOutputPath), { recursive: true });
    await fs.promises.mkdir(plan.trimmedDir, { recursive: true });

    for (const step of plan.steps.slice(0, plan.processedVideos.length + plan.processedAudios.length)) {
      await runProcess(step.command, step.args);
    }

    const concatFileBody = plan.processedVideos
      .map((video) => `file '${video.outputPath.replaceAll("'", "'\\''")}'`)
      .join("\n");
    await fs.promises.writeFile(plan.concatListPath, `${concatFileBody}\n`, "utf8");

    const remainingSteps = plan.steps.slice(plan.processedVideos.length + plan.processedAudios.length);
    for (const step of remainingSteps) {
      await runProcess(step.command, step.args);
    }

    const canonicalProcessedAudio = plan.processedAudios.find((audio) => audio.input.id === plan.canonicalAudio.id);
    const canonicalAudioDuration = await probeDurationSeconds(canonicalProcessedAudio?.outputPath ?? plan.canonicalAudio.path);
    const videoDuration = await probeDurationSeconds(plan.concatenatedVideoPath);
    const finalStep = buildFinalMergeStep(
      plan.manifest,
      plan.concatenatedVideoPath,
      plan.mixedAudioPath,
      canonicalAudioDuration,
      videoDuration,
      plan.finalOutputPath
    );

    console.log(formatCommand(finalStep.command, finalStep.args));
    await runProcess(finalStep.command, finalStep.args);
    console.log(`Render complete: ${plan.finalOutputPath}`);
  } finally {
    await fs.promises.rm(plan.tempDir, { recursive: true, force: true });
  }
};
