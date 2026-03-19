import React, {useMemo} from "react";
import {interpolate, useCurrentFrame} from "remotion";

export type GeometryPath = {
  id: string;
  d: string;
  strokeWidth?: number;
  color?: "rust" | "gold";
};

export type GeometrySvgData = {
  viewBox: string;
  paths: GeometryPath[];
};

const COLOR_MAP = {
  rust: "#c84b2f",
  gold: "#c9a84c",
} as const;

const estimatePathLength = (d: string): number => {
  const commandCount = (d.match(/[MLCQAZHVST]/gi) ?? []).length;
  return Math.max(240, commandCount * 180);
};

export const GeometryAnimation: React.FC<{svgData: GeometrySvgData}> = ({svgData}) => {
  const frame = useCurrentFrame();

  const totalLengths = useMemo(
    () => svgData.paths.map((path) => estimatePathLength(path.d)),
    [svgData.paths],
  );

  return (
    <svg width="100%" height="100%" viewBox={svgData.viewBox}>
      {svgData.paths.map((path, index) => {
        const strokeColor = path.color === "gold" ? COLOR_MAP.gold : COLOR_MAP.rust;
        const pathLength = totalLengths[index];
        const dashOffset = interpolate(frame, [0, 150], [pathLength, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });

        return (
          <path
            key={path.id}
            d={path.d}
            fill="none"
            stroke={strokeColor}
            strokeWidth={path.strokeWidth ?? 8}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray={pathLength}
            strokeDashoffset={dashOffset}
          />
        );
      })}
    </svg>
  );
};
