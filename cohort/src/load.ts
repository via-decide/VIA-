import fs from "node:fs";
import path from "node:path";
import type { AudioInput, ProductionManifest, VideoInput } from "./types.ts";

type LegacyAsset = {
  id?: unknown;
  path?: unknown;
  trimStartSec?: unknown;
  trimEndSec?: unknown;
  trimStartMs?: unknown;
  trimEndMs?: unknown;
  volume?: unknown;
  mute?: unknown;
  isCanonical?: unknown;
  delayStartSec?: unknown;
  delayStartMs?: unknown;
};

type LegacyManifest = {
  version?: unknown;
  studio?: { name?: unknown; mode?: unknown };
  production?: Record<string, unknown>;
  inputs?: {
    videos?: LegacyAsset[];
    audios?: LegacyAsset[];
  };
  sync?: {
    mode?: unknown;
    primaryAudioId?: unknown;
    primaryAudioAssetId?: unknown;
    muteOriginalVideoAudio?: unknown;
    autoFitVideoToAudio?: unknown;
    allowVideoLoop?: unknown;
  };
  output?: {
    path?: unknown;
    outputPath?: unknown;
    format?: unknown;
    videoCodec?: unknown;
    audioCodec?: unknown;
    fps?: unknown;
    width?: unknown;
    height?: unknown;
    crf?: unknown;
    preset?: unknown;
  };
};

const defaultManifestPath = path.resolve(process.cwd(), "production.json");

const asNumber = (value: unknown, fallback: number): number => {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
};

const asOptionalNumber = (value: unknown): number | null | undefined => {
  if (value == null) {
    return value as null | undefined;
  }
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
};

const secondsFromValue = (seconds: unknown, milliseconds: unknown, fallback: number): number => {
  const secondValue = asOptionalNumber(seconds);
  if (typeof secondValue === "number") {
    return secondValue;
  }
  const millisecondValue = asOptionalNumber(milliseconds);
  if (typeof millisecondValue === "number") {
    return millisecondValue / 1000;
  }
  return fallback;
};

const optionalSecondsFromValue = (seconds: unknown, milliseconds: unknown): number | null | undefined => {
  const secondValue = asOptionalNumber(seconds);
  if (secondValue !== undefined) {
    return secondValue;
  }
  const millisecondValue = asOptionalNumber(milliseconds);
  if (millisecondValue !== undefined) {
    return millisecondValue === null ? null : millisecondValue / 1000;
  }
  return undefined;
};

const normalizePath = (manifestDir: string, candidate: unknown, label: string): string => {
  if (typeof candidate !== "string" || candidate.trim() === "") {
    throw new Error(`${label} must be a non-empty string path`);
  }
  return path.resolve(manifestDir, candidate);
};

const normalizeVideo = (manifestDir: string, asset: LegacyAsset, index: number): VideoInput => {
  const id = typeof asset.id === "string" && asset.id.trim() !== "" ? asset.id : `video-${index + 1}`;
  return {
    id,
    path: normalizePath(manifestDir, asset.path, `inputs.videos[${index}].path`),
    trimStartSec: secondsFromValue(asset.trimStartSec, asset.trimStartMs, 0),
    trimEndSec: optionalSecondsFromValue(asset.trimEndSec, asset.trimEndMs) ?? null,
    volume: asNumber(asset.volume, 1),
    mute: Boolean(asset.mute),
  };
};

const normalizeAudio = (manifestDir: string, asset: LegacyAsset, index: number): AudioInput => {
  const id = typeof asset.id === "string" && asset.id.trim() !== "" ? asset.id : `audio-${index + 1}`;
  return {
    id,
    path: normalizePath(manifestDir, asset.path, `inputs.audios[${index}].path`),
    trimStartSec: secondsFromValue(asset.trimStartSec, asset.trimStartMs, 0),
    trimEndSec: optionalSecondsFromValue(asset.trimEndSec, asset.trimEndMs) ?? null,
    volume: asNumber(asset.volume, 1),
    isCanonical: Boolean(asset.isCanonical),
    delayStartSec: secondsFromValue(asset.delayStartSec, asset.delayStartMs, 0),
  };
};

const warnIfMissing = (label: string, filePath: string): void => {
  if (!fs.existsSync(filePath)) {
    console.warn(`Warning: ${label} does not exist: ${filePath}`);
  }
};

export function getCanonicalAudio(manifest: ProductionManifest): AudioInput {
  const canonicalAudios = manifest.inputs.audios.filter((audio) => audio.isCanonical === true);

  if (canonicalAudios.length !== 1) {
    const ids = canonicalAudios.map((audio) => audio.id).join(", ") || "<none>";
    throw new Error(`Expected exactly one canonical audio, found ${canonicalAudios.length}: ${ids}`);
  }

  return canonicalAudios[0];
}

export function loadManifest(manifestPath = defaultManifestPath): ProductionManifest {
  const resolvedManifestPath = path.resolve(process.cwd(), manifestPath);
  const manifestDir = path.dirname(resolvedManifestPath);
  const raw = fs.readFileSync(resolvedManifestPath, "utf8");
  const parsed = JSON.parse(raw) as LegacyManifest;

  const manifest: ProductionManifest = {
    version: typeof parsed.version === "string" ? parsed.version : "1.0",
    studio: {
      name: typeof parsed.studio?.name === "string" ? parsed.studio.name : undefined,
      mode: parsed.studio?.mode as ProductionManifest["studio"]["mode"],
    },
    production: parsed.production,
    inputs: {
      videos: Array.isArray(parsed.inputs?.videos)
        ? parsed.inputs.videos.map((asset, index) => normalizeVideo(manifestDir, asset, index))
        : [],
      audios: Array.isArray(parsed.inputs?.audios)
        ? parsed.inputs.audios.map((asset, index) => normalizeAudio(manifestDir, asset, index))
        : [],
    },
    sync: {
      mode: typeof parsed.sync?.mode === "string" ? parsed.sync.mode : undefined,
      primaryAudioId:
        typeof parsed.sync?.primaryAudioId === "string"
          ? parsed.sync.primaryAudioId
          : typeof parsed.sync?.primaryAudioAssetId === "string"
            ? parsed.sync.primaryAudioAssetId
            : "",
      muteOriginalVideoAudio: Boolean(parsed.sync?.muteOriginalVideoAudio),
      autoFitVideoToAudio: Boolean(parsed.sync?.autoFitVideoToAudio),
      allowVideoLoop: Boolean(parsed.sync?.allowVideoLoop),
    },
    output: {
      path: normalizePath(manifestDir, parsed.output?.path ?? parsed.output?.outputPath, "output.path"),
      format: typeof parsed.output?.format === "string" ? parsed.output.format : undefined,
      videoCodec: typeof parsed.output?.videoCodec === "string" ? parsed.output.videoCodec : undefined,
      audioCodec: typeof parsed.output?.audioCodec === "string" ? parsed.output.audioCodec : undefined,
      fps: typeof parsed.output?.fps === "number" ? parsed.output.fps : undefined,
      width: typeof parsed.output?.width === "number" ? parsed.output.width : undefined,
      height: typeof parsed.output?.height === "number" ? parsed.output.height : undefined,
      crf: typeof parsed.output?.crf === "number" ? parsed.output.crf : undefined,
      preset: typeof parsed.output?.preset === "string" ? parsed.output.preset : undefined,
    },
  };

  if (manifest.studio.mode !== "audio-video-composer") {
    throw new Error('studio.mode must equal "audio-video-composer"');
  }

  if (manifest.inputs.videos.length === 0) {
    throw new Error("inputs.videos must contain at least one video");
  }

  if (manifest.inputs.audios.length === 0) {
    throw new Error("inputs.audios must contain at least one audio");
  }

  const canonicalAudio = getCanonicalAudio(manifest);
  if (!manifest.inputs.audios.some((audio) => audio.id === manifest.sync.primaryAudioId)) {
    throw new Error(`sync.primaryAudioId must match an audio id; received "${manifest.sync.primaryAudioId}"`);
  }

  for (const video of manifest.inputs.videos) {
    warnIfMissing(`video input ${video.id}`, video.path);
  }

  for (const audio of manifest.inputs.audios) {
    warnIfMissing(`audio input ${audio.id}`, audio.path);
  }

  warnIfMissing(`canonical audio ${canonicalAudio.id}`, canonicalAudio.path);

  return manifest;
}
