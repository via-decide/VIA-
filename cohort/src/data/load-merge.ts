import fs from "node:fs";
import path from "node:path";
import type { AudioAsset, MergeManifest } from "../types-merge";

export function resolveAssetPath(assetPath: string): string {
  return path.resolve(process.cwd(), assetPath);
}

export function enforceCanonicalAudio(audios: AudioAsset[]): AudioAsset {
  const canonical = audios.filter((audio) => audio.isCanonical === true);
  if (canonical.length === 0) {
    throw new Error('No canonical audio found. Exactly one audio asset must have "isCanonical": true');
  }
  if (canonical.length > 1) {
    const ids = canonical.map((audio) => audio.id).join(", ");
    throw new Error(`Multiple canonical audio assets: [${ids}]. Only one may be canonical`);
  }
  return canonical[0];
}

export function getCanonicalAudio(manifest: MergeManifest): AudioAsset {
  return enforceCanonicalAudio(manifest.inputs.audios);
}

export function loadMergeManifest(manifestPath?: string): MergeManifest {
  const finalPath = manifestPath ?? path.join(process.cwd(), "production.json");
  const raw = fs.readFileSync(finalPath, "utf8");
  const manifest = JSON.parse(raw) as MergeManifest;

  if (manifest?.studio?.mode !== "audio-video-composer") {
    throw new Error(
      'Invalid studio.mode. Expected "audio-video-composer". Copy the merge example manifest into production.json and try again.'
    );
  }

  const requiredBlocks: Array<keyof MergeManifest> = [
    "version",
    "studio",
    "production",
    "inputs",
    "timeline",
    "sync",
    "output",
    "validation",
  ];

  for (const block of requiredBlocks) {
    if (manifest[block] == null) {
      throw new Error(`Missing required top-level block: ${block}`);
    }
  }

  if (!Array.isArray(manifest.inputs.videos)) {
    throw new Error("inputs.videos must be an array");
  }

  if (!Array.isArray(manifest.inputs.audios)) {
    throw new Error("inputs.audios must be an array");
  }

  if (manifest.validation.requireVideo && manifest.inputs.videos.length === 0) {
    throw new Error("validation.requireVideo is true but inputs.videos is empty");
  }

  if (manifest.validation.requireAudio && manifest.inputs.audios.length === 0) {
    throw new Error("validation.requireAudio is true but inputs.audios is empty");
  }

  if (manifest.validation.requireCanonicalAudio) {
    enforceCanonicalAudio(manifest.inputs.audios);
  }

  if (!manifest.inputs.audios.some((audio) => audio.id === manifest.sync.primaryAudioAssetId)) {
    throw new Error(`sync.primaryAudioAssetId not found in inputs.audios: ${manifest.sync.primaryAudioAssetId}`);
  }

  if (manifest.validation.rejectMissingFiles) {
    const allAssets = [...manifest.inputs.videos, ...manifest.inputs.audios];
    for (const asset of allAssets) {
      const absolutePath = resolveAssetPath(asset.path);
      if (!fs.existsSync(absolutePath)) {
        console.warn(`Missing asset file: ${asset.path} (${absolutePath})`);
      }
    }
  }

  return manifest;
}
