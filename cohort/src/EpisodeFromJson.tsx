import React from "react";
import { AbsoluteFill } from "remotion";
import { production } from "./data/load-production";
import type { EpisodeProps, Scene } from "./types";
import { SceneFrame } from "./components/SceneFrame";
import { TextOverlays } from "./components/TextOverlays";
import { IntroScene } from "./components/scenes/IntroScene";
import { TalkingExplanationScene } from "./components/scenes/TalkingExplanationScene";
import { StoryScene } from "./components/scenes/StoryScene";
import { RepoScreenCaptureScene } from "./components/scenes/RepoScreenCaptureScene";
import { DiagramAnimationScene } from "./components/scenes/DiagramAnimationScene";
import { DecisionOverlayScene } from "./components/scenes/DecisionOverlayScene";
import { OutroScene } from "./components/scenes/OutroScene";

const renderScene = (scene: Scene, videoId: string) => {
  switch (scene.type) {
    case "intro_animation":
      return <IntroScene scene={scene} videoId={videoId} />;
    case "talking_explanation":
      return <TalkingExplanationScene scene={scene} videoId={videoId} />;
    case "story_scene":
      return <StoryScene scene={scene} videoId={videoId} />;
    case "repo_screen_capture":
      return <RepoScreenCaptureScene scene={scene} videoId={videoId} />;
    case "diagram_animation":
      return <DiagramAnimationScene scene={scene} videoId={videoId} />;
    case "decision_overlay":
      return <DecisionOverlayScene scene={scene} videoId={videoId} />;
    case "outro":
      return <OutroScene scene={scene} videoId={videoId} />;
  }
};

export const EpisodeFromJson: React.FC<EpisodeProps> = ({ videoId, voEnabled = false }) => {
  const _voEnabled = voEnabled;
  const video = production.videos.find((v) => v.id === videoId) ?? production.videos[0];

  return (
    <AbsoluteFill style={{ backgroundColor: "#030712", color: "white", fontFamily: "Inter, sans-serif" }}>
      {video.remotion_spec.scenes.map((scene) => (
        <SceneFrame key={scene.id} scene={scene} videoId={videoId}>
          {renderScene(scene, videoId)}
          <TextOverlays overlays={scene.text_overlays ?? []} />
          {_voEnabled ? null : null}
        </SceneFrame>
      ))}
    </AbsoluteFill>
  );
};
