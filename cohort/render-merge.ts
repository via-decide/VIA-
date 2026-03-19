import fs from "node:fs";
import path from "node:path";
import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition } from "@remotion/renderer";
import { getCanonicalAudio, loadMergeManifest } from "./src/data/load-merge.ts";

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");

const manifest = loadMergeManifest();
const canonicalAudio = getCanonicalAudio(manifest);

console.log(`Production: ${manifest.production.title}`);
console.log(`Canonical audio: ${canonicalAudio.id} (${canonicalAudio.path})`);
console.log(`Tracks: ${manifest.timeline.tracks.length} total`);
console.log(`Videos: ${manifest.inputs.videos.length}, Audios: ${manifest.inputs.audios.length}`);

const durationFrames =
  manifest.timeline.durationMs == null
    ? dryRun
      ? manifest.output.fps * 30
      : null
    : Math.round((manifest.timeline.durationMs / 1000) * manifest.output.fps);

if (manifest.timeline.durationMs == null && dryRun) {
  console.log("timeline.durationMs is null; using preview default duration of 30 seconds for dry-run.");
}

if (durationFrames == null) {
  console.error("timeline.durationMs is null. Set timeline.durationMs before rendering.");
  console.error("Tip: ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 <audio-or-video-file>");
  process.exit(1);
}

if (dryRun) {
  const rows = manifest.timeline.tracks
    .slice()
    .sort((a, b) => a.layer - b.layer)
    .map((track) => {
      const asset =
        track.type === "video"
          ? manifest.inputs.videos.find((v) => v.id === track.assetId)
          : manifest.inputs.audios.find((a) => a.id === track.assetId);
      return {
        layer: track.layer,
        type: track.type,
        id: track.id,
        assetId: track.assetId,
        startMs: track.startMs,
        path: asset?.path ?? "<missing>",
        isCanonical: track.type === "audio" ? String(asset?.isCanonical ?? false) : "",
      };
    });

  console.table(rows);
  process.exit(0);
}

const run = async () => {
  const bundleLocation = await bundle({ entryPoint: path.join(process.cwd(), "src/index.ts") });

  fs.mkdirSync(path.dirname(manifest.output.outputPath), { recursive: true });

  const composition = await selectComposition({
    serveUrl: bundleLocation,
    id: "MergeComposition",
    inputProps: { manifest },
  });

  await renderMedia({
    composition: { ...composition, durationInFrames: durationFrames },
    serveUrl: bundleLocation,
    codec: manifest.output.videoCodec,
    outputLocation: manifest.output.outputPath,
    inputProps: { manifest },
  });
};

void run();
