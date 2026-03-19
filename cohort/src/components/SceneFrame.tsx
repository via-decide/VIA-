import React from "react";
import { Sequence, spring, useCurrentFrame } from "remotion";
import type { Scene } from "../types";

export const BRANCH_COLORS: Record<string, string> = {
  A: "#2563eb",
  B: "#7c3aed",
  C: "#0891b2",
  D: "#059669",
  V: "#f59e0b",
};

interface SceneFrameProps {
  scene: Scene;
  videoId?: string;
  children: React.ReactNode;
}

export const SceneFrame: React.FC<SceneFrameProps> = ({ scene, videoId = "V01", children }) => {
  const frame = useCurrentFrame();
  const color = BRANCH_COLORS[videoId[0]] ?? "#f59e0b";
  const entrance = spring({ frame, fps: 30, config: { stiffness: 120, damping: 14 } });

  return (
    <Sequence from={scene.start_frame} durationInFrames={scene.duration_frames}>
      <div
        style={{
          width: "100%",
          height: "100%",
          transform: `scale(${0.96 + entrance * 0.04})`,
          border: `3px solid ${color}`,
          borderRadius: 24,
          padding: 48,
          boxSizing: "border-box",
          background: "radial-gradient(circle at top right, #111827, #030712)",
        }}
      >
        {children}
      </div>
    </Sequence>
  );
};
