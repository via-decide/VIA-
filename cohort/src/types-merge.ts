export interface VideoAsset {
  id: string;
  path: string;
  startMs: number;
  endMs: number | null;
  trimStartMs: number;
  trimEndMs: number | null;
  volume: number;
  playbackRate: number;
}

export interface AudioAsset extends VideoAsset {
  isCanonical: boolean;
}

export type TrackType = "video" | "audio";

export interface Track {
  id: string;
  type: TrackType;
  assetId: string;
  layer: number;
  startMs: number;
}

export interface MergeManifest {
  version: string;
  studio: {
    name: string;
    mode: string;
  };
  production: {
    id: string;
    title: string;
    slug: string;
    status: string;
  };
  inputs: {
    videos: VideoAsset[];
    audios: AudioAsset[];
  };
  timeline: {
    durationMs: number | null;
    backgroundColor: string;
    tracks: Track[];
  };
  sync: {
    mode: string;
    primaryAudioAssetId: string;
    autoFitVideoToAudio: boolean;
    allowVideoLoop: boolean;
    allowAudioTrim: boolean;
  };
  output: {
    format: string;
    videoCodec: "h264" | "h265";
    audioCodec: string;
    fps: number;
    width: number;
    height: number;
    outputPath: string;
  };
  validation: {
    requireVideo: boolean;
    requireAudio: boolean;
    requireCanonicalAudio: boolean;
    rejectMissingFiles: boolean;
  };
}

export interface MergeProps {
  manifest: MergeManifest;
}
