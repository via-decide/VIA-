export type SceneType =
  | "intro_animation"
  | "talking_explanation"
  | "story_scene"
  | "repo_screen_capture"
  | "diagram_animation"
  | "decision_overlay"
  | "outro";

export interface TextOverlay {
  text: string;
  style: string;
  position: string;
  appear_frame: number;
}

export interface Scene {
  id: string;
  type: SceneType;
  start_frame: number;
  duration_frames: number;
  description?: string;
  text_overlays?: TextOverlay[];
  transition?: string;
}

export interface DecisionOption {
  id: string;
  label: string;
  description?: string;
  leads_to: string;
}

export interface YoutubeMeta {
  title: string;
  description: string;
  tags: string[];
  thumbnail_concept?: string;
}

export interface VideoVisuals {
  github_repos?: string[];
}

export interface VideoDefinition {
  id: string;
  title: string;
  parent_id?: string | null;
  branch_from_option?: string | null;
  concept?: string;
  repo_stage?: string;
  notebookllm_prompt?: string;
  youtube?: YoutubeMeta;
  visuals?: VideoVisuals;
  full_script?: Record<string, string>;
  creator_script?: Record<string, string>;
  decision_point?: {
    question: string;
    options: DecisionOption[];
  };
  leads_to?: string[];
  remotion_spec: {
    fps: number;
    total_duration_frames: number;
    scenes: Scene[];
  };
}

export interface ProductionData {
  series: {
    id: string;
    title: string;
    fps: number;
    frames_per_video: number;
  };
  videos: VideoDefinition[];
  branching_map?: {
    edges: Record<string, Record<string, string> | "TERMINAL">;
  };
}

export interface EpisodeProps {
  videoId: string;
  voEnabled?: boolean;
}

export interface VideoInput {
  id: string;
  path: string;
  trimStartSec?: number;
  trimEndSec?: number | null;
  volume?: number;
  mute?: boolean;
}

export interface AudioInput {
  id: string;
  path: string;
  trimStartSec?: number;
  trimEndSec?: number | null;
  volume?: number;
  isCanonical?: boolean;
  delayStartSec?: number;
}

export interface ProductionManifest {
  version: string;
  studio: {
    name?: string;
    mode: "audio-video-composer";
  };
  production?: {
    id?: string;
    title?: string;
    slug?: string;
    status?: string;
  };
  inputs: {
    videos: VideoInput[];
    audios: AudioInput[];
  };
  sync: {
    mode?: string;
    primaryAudioId: string;
    muteOriginalVideoAudio?: boolean;
    autoFitVideoToAudio?: boolean;
    allowVideoLoop?: boolean;
  };
  output: {
    path: string;
    format?: string;
    videoCodec?: string;
    audioCodec?: string;
    fps?: number;
    width?: number;
    height?: number;
    crf?: number;
    preset?: string;
  };
}

export interface MediaPlanSummary {
  id: string;
  sourcePath: string;
  outputPath: string;
  trimStartSec: number;
  trimEndSec: number | null;
  volume: number;
  mute: boolean;
  delayStartSec: number;
}
