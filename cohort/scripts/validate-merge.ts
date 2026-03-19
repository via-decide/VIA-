import { getCanonicalAudio, loadMergeManifest } from "../src/data/load-merge.ts";

try {
  const manifest = loadMergeManifest();
  const canonical = getCanonicalAudio(manifest);

  console.log("✓ production.json is valid");
  console.log(`✓ studio.mode: ${manifest.studio.mode}`);
  console.log(`✓ production.id: ${manifest.production.id}`);
  console.log(`✓ production.title: ${manifest.production.title}`);
  console.log(`✓ videos: ${manifest.inputs.videos.length}`);
  console.log(`✓ audios: ${manifest.inputs.audios.length}`);
  console.log(`✓ canonical audio: ${canonical.id} (${canonical.path})`);
  console.log(`✓ tracks: ${manifest.timeline.tracks.length}`);
  console.log(`✓ output: ${manifest.output.outputPath}`);
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
}
