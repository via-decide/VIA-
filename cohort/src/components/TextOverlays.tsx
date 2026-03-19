import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import type { TextOverlay } from "../types";

const POSITIONS: Record<string, React.CSSProperties> = {
  center: { left: "50%", top: "50%", transform: "translate(-50%, -50%)" },
  top_left: { left: 80, top: 80 },
  top_right: { right: 80, top: 80 },
  bottom_left: { left: 80, bottom: 80 },
  bottom_right: { right: 80, bottom: 80 },
  lower_third: { left: 80, bottom: 220 },
  bottom_center: { left: "50%", bottom: 90, transform: "translateX(-50%)" },
};

const STYLES: Record<string, React.CSSProperties> = {
  title: { fontSize: 64, fontWeight: 800 },
  subtitle: { fontSize: 40, fontWeight: 600, color: "#c4b5fd" },
  body: { fontSize: 34, maxWidth: 1000, lineHeight: 1.35 },
  caption: { fontSize: 26, fontWeight: 600, color: "#e5e7eb" },
  decision_prompt: { fontSize: 42, fontWeight: 700, maxWidth: 1100 },
  option_label: { fontSize: 26, fontWeight: 600 },
  cta: { fontSize: 32, fontWeight: 700, color: "#34d399" },
};

export const TextOverlays: React.FC<{ overlays: TextOverlay[] }> = ({ overlays }) => {
  const frame = useCurrentFrame();

  return (
    <>
      {overlays.map((overlay, index) => {
        const local = frame - overlay.appear_frame;
        const opacity = interpolate(local, [0, 12], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        const scale = interpolate(local, [0, 12], [0.98, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });

        const baseStyle = STYLES[overlay.style] ?? STYLES.body;
        const basePosition = POSITIONS[overlay.position] ?? POSITIONS.lower_third;

        return (
          <div
            key={`${overlay.text}-${index}`}
            style={{
              position: "absolute",
              opacity,
              ...basePosition,
              ...baseStyle,
              transform: `${basePosition.transform ?? ""} scale(${scale})`.trim(),
            }}
          >
            {overlay.text}
          </div>
        );
      })}
    </>
  );
};
