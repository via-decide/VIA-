import React, { useEffect, useMemo, useState } from "react";
import { Audio, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import config from "../../data/config.json";
import { Geometry } from "./Geometry";

type TimelineRow = {
  StartFrame: number;
  EndFrame: number;
  TextContent: string;
  ActionType: string;
};

const parseCsv = (csv: string): TimelineRow[] => {
  const [header, ...lines] = csv.trim().split("\n");
  if (!header) return [];
  const keys = header.split(",");
  return lines
    .map((line) => {
      const values = line.match(/("[^"]*"|[^,]+)/g) ?? [];
      const cleaned = values.map((v) => v.replace(/^"|"$/g, ""));
      const row = Object.fromEntries(keys.map((key, i) => [key, cleaned[i] ?? ""]));
      return {
        StartFrame: Number(row.StartFrame),
        EndFrame: Number(row.EndFrame),
        TextContent: row.TextContent,
        ActionType: row.ActionType,
      };
    })
    .filter((row) => Number.isFinite(row.StartFrame) && Number.isFinite(row.EndFrame));
};

const rowVisible = (row: TimelineRow, frame: number) => frame >= row.StartFrame && frame <= row.EndFrame;

export const PythagoreanProofMain: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const [timeline, setTimeline] = useState<TimelineRow[]>([]);

  useEffect(() => {
    fetch(staticFile("timeline.csv"))
      .then((res) => res.text())
      .then((csv) => setTimeline(parseCsv(csv)))
      .catch(() => setTimeline([]));
  }, []);

  const activeRows = useMemo(() => timeline.filter((row) => rowVisible(row, frame)), [frame, timeline]);

  const getText = (actionType: string) => activeRows.find((r) => r.ActionType === actionType)?.TextContent;

  const hookProgress = spring({ frame, fps, config: { damping: 200 } });
  const geometrySlideY = interpolate(frame, [225, 270], [0, 260], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const pulse = interpolate(frame, [375, 420, 465], [0.1, 1, 0.1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        flex: 1,
        backgroundColor: config.brand.colors.background,
        color: config.brand.colors.white,
        fontFamily: config.brand.typography.fontFamily,
        position: "relative",
        overflow: "hidden",
      }}
    >
      <Audio src={staticFile("background-beat.mp3")} volume={0.2} />

      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "repeating-linear-gradient(0deg, rgba(90,96,128,0.09) 0px, rgba(90,96,128,0.09) 1px, transparent 1px, transparent 28px)",
          opacity: 0.5,
        }}
      />

      <div style={{ position: "absolute", top: 130, width: "100%", textAlign: "center" }}>
        <div style={{ fontSize: 66, fontWeight: config.brand.typography.titleWeight, opacity: getText("hook") ? hookProgress : 0 }}>
          {getText("hook")}
        </div>
        <div
          style={{
            marginTop: 16,
            fontSize: 88,
            fontWeight: 900,
            color: config.brand.colors.cyan,
            letterSpacing: 1,
            opacity: getText("hook-equation") ? hookProgress : frame > 225 ? 1 : 0,
          }}
        >
          {getText("equation-reveal") ?? getText("hook-equation")}
        </div>
      </div>

      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Geometry
          frame={frame}
          translateY={geometrySlideY}
          pulse={pulse}
          colors={{
            cyan: config.brand.colors.cyan,
            pink: config.brand.colors.pink,
            yellow: config.brand.colors.yellow,
            dim: config.brand.colors.dim,
            white: config.brand.colors.white,
          }}
        />
      </div>

      {getText("pulse-callout") ? (
        <div style={{ position: "absolute", bottom: 330, width: "100%", textAlign: "center", fontSize: 48, color: config.brand.colors.dim }}>
          {getText("pulse-callout")}
        </div>
      ) : null}

      {getText("cta") ? (
        <div
          style={{
            position: "absolute",
            bottom: 220,
            width: "100%",
            textAlign: "center",
            fontSize: 54,
            fontWeight: 800,
            color: config.brand.colors.yellow,
          }}
        >
          {getText("cta")}
        </div>
      ) : null}

      {getText("watermark") ? (
        <div style={{ position: "absolute", bottom: 90, right: 70, fontSize: 38, color: config.brand.colors.cyan, opacity: 0.9 }}>
          {getText("watermark")}
        </div>
      ) : null}
    </div>
  );
};
