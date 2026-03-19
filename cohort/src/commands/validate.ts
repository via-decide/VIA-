import { getCanonicalAudio, loadManifest } from "../load.ts";

export const runValidateCommand = async (manifestPath?: string): Promise<void> => {
  const manifest = loadManifest(manifestPath);
  const canonicalAudio = getCanonicalAudio(manifest);

  console.log(`Manifest valid: ${manifest.production?.title ?? manifest.production?.id ?? manifest.version}`);
  console.log(`Videos: ${manifest.inputs.videos.length}`);
  console.log(`Audios: ${manifest.inputs.audios.length}`);
  console.log(`Canonical audio: ${canonicalAudio.id}`);
  console.log(`Primary audio: ${manifest.sync.primaryAudioId}`);
  console.log(`Output: ${manifest.output.path}`);
};
