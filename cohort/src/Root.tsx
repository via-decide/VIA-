import React from "react";
import { Composition } from "remotion";
import config from "../data/config.json";
import { EpisodeFromJson } from "./EpisodeFromJson";
import { PythagoreanProofMain } from "./PythagoreanProof/Main";
import type { EpisodeProps, ProductionData } from "./types";
import type { MergeProps } from "./types-merge";

const mode = (process.env.PRODUCTION_MODE ?? "v2").toLowerCase();
// eslint-disable-next-line @typescript-eslint/no-var-requires
const production = require(mode === "v1" ? "../production.json" : "../production-v2.json") as unknown as ProductionData;

const FPS = production.series.fps;
const DURATION = production.series.frames_per_video;

type MergeCompositionType = React.ComponentType<MergeProps>;

let MergeCompositionComponent: MergeCompositionType | null = null;
let mergeManifest: MergeProps["manifest"] | null = null;

if (typeof window === "undefined") {
  try {
    // Load merge modules only in the Node render environment.
    const dynamicRequire = (0, eval)("require") as NodeRequire;
    const { MergeComposition } = dynamicRequire("./MergeComposition");
    const { loadMergeManifest } = dynamicRequire("./data/load-merge");

    MergeCompositionComponent = MergeComposition as MergeCompositionType;
    mergeManifest = loadMergeManifest() as MergeProps["manifest"];
  } catch {
    MergeCompositionComponent = null;
    mergeManifest = null;
  }
}

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {production.videos.map((video) => (
        <Composition
          key={video.id}
          id={video.id}
          component={EpisodeFromJson}
          durationInFrames={DURATION}
          fps={FPS}
          width={1920}
          height={1080}
          defaultProps={{ videoId: video.id, voEnabled: false } as EpisodeProps}
        />
      ))}
      <Composition
        id="EpisodeFromJson"
        component={EpisodeFromJson}
        durationInFrames={DURATION}
        fps={FPS}
        width={1920}
        height={1080}
        defaultProps={{ videoId: production.videos[0]?.id ?? "V01", voEnabled: false } as EpisodeProps}
      />
      <Composition
        id="PythagoreanVisualProof"
        component={PythagoreanProofMain}
        durationInFrames={config.video.durationInFrames}
        fps={config.video.fps}
        width={config.video.width}
        height={config.video.height}
      />
      {mergeManifest && MergeCompositionComponent ? (
        <Composition
          id="MergeComposition"
          component={MergeCompositionComponent}
          durationInFrames={
            mergeManifest.timeline.durationMs == null
              ? mergeManifest.output.fps * 30
              : Math.round((mergeManifest.timeline.durationMs / 1000) * mergeManifest.output.fps)
          }
          fps={mergeManifest.output.fps}
          width={mergeManifest.output.width}
          height={mergeManifest.output.height}
          defaultProps={{ manifest: mergeManifest } as MergeProps}
        />
      ) : null}
    </>
  );
};
