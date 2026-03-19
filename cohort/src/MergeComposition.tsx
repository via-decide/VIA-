import React from "react";
import { AbsoluteFill, Audio, Sequence, useVideoConfig, Video } from "remotion";
import type { MergeProps } from "./types-merge";

const msToFrames = (ms: number, fps: number) => Math.round((ms / 1000) * fps);

export const MergeComposition: React.FC<MergeProps> = ({ manifest }) => {
  const { fps } = useVideoConfig();
  const tracks = [...manifest.timeline.tracks].sort((a, b) => a.layer - b.layer);

  return (
    <AbsoluteFill style={{ backgroundColor: manifest.timeline.backgroundColor }}>
      {tracks.map((track) => {
        if (track.type === "video") {
          const asset = manifest.inputs.videos.find((v) => v.id === track.assetId);
          if (!asset) {
            console.warn(`Video asset not found for track ${track.id}: ${track.assetId}`);
            return null;
          }

          return (
            <Sequence key={track.id} from={msToFrames(track.startMs, fps)}>
              <Video
                src={asset.path}
                volume={asset.volume}
                playbackRate={asset.playbackRate}
                startFrom={msToFrames(asset.trimStartMs, fps)}
                endAt={asset.trimEndMs == null ? undefined : msToFrames(asset.trimEndMs, fps)}
              />
            </Sequence>
          );
        }

        const asset = manifest.inputs.audios.find((a) => a.id === track.assetId);
        if (!asset) {
          console.warn(`Audio asset not found for track ${track.id}: ${track.assetId}`);
          return null;
        }

        return (
          <Sequence key={track.id} from={msToFrames(track.startMs, fps)}>
            <Audio
              src={asset.path}
              volume={asset.volume}
              playbackRate={asset.playbackRate}
              startFrom={msToFrames(asset.trimStartMs, fps)}
              endAt={asset.trimEndMs == null ? undefined : msToFrames(asset.trimEndMs, fps)}
            />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
