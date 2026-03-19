import React from "react";
import { interpolate } from "remotion";

type Point = { x: number; y: number };

type Colors = {
  cyan: string;
  pink: string;
  yellow: string;
  dim: string;
  white: string;
};

type SquareSpec = {
  points: Point[];
  label: string;
  color: string;
  start: number;
  end: number;
};

const add = (a: Point, b: Point): Point => ({ x: a.x + b.x, y: a.y + b.y });
const sub = (a: Point, b: Point): Point => ({ x: a.x - b.x, y: a.y - b.y });
const mul = (p: Point, scalar: number): Point => ({ x: p.x * scalar, y: p.y * scalar });
const norm = (p: Point): number => Math.hypot(p.x, p.y);
const unit = (p: Point): Point => {
  const n = norm(p);
  return n === 0 ? { x: 0, y: 0 } : { x: p.x / n, y: p.y / n };
};
const leftNormal = (v: Point): Point => ({ x: -v.y, y: v.x });

const toPoints = (p: Point[]) => p.map((pt) => `${pt.x},${pt.y}`).join(" ");
const midPoint = (a: Point, b: Point): Point => mul(add(a, b), 0.5);

const makeSquare = (p1: Point, p2: Point): Point[] => {
  const edge = sub(p2, p1);
  const outward = mul(leftNormal(unit(edge)), -norm(edge));
  const p3 = add(p2, outward);
  const p4 = add(p1, outward);
  return [p1, p2, p3, p4];
};

const drawProgress = (frame: number, start: number, end: number) =>
  interpolate(frame, [start, end], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

export const Geometry: React.FC<{
  frame: number;
  translateY: number;
  pulse: number;
  colors: Colors;
}> = ({ frame, translateY, pulse, colors }) => {
  const A = { x: 0, y: -252 };
  const B = { x: -576, y: 180 };
  const C = { x: 0, y: 180 };

  const strokeWidth = 12;
  const sideA = [B, C];
  const sideB = [C, A];
  const sideC = [A, B];

  const sqA = makeSquare(B, C);
  const sqB = makeSquare(C, A);
  const sqC = makeSquare(A, B);

  const squares: SquareSpec[] = [
    { points: sqA, label: "a²", color: colors.pink, start: 126, end: 180 },
    { points: sqB, label: "b²", color: colors.yellow, start: 156, end: 216 },
    { points: sqC, label: "c²", color: colors.cyan, start: 192, end: 225 },
  ];

  return (
    <svg
      viewBox="-700 -700 1400 1400"
      style={{
        width: "92%",
        height: "62%",
        transform: `translateY(${translateY}px)`,
      }}
    >
      {[{ side: sideA, color: colors.pink, start: 60 }, { side: sideB, color: colors.yellow, start: 84 }, { side: sideC, color: colors.cyan, start: 96 }].map(
        ({ side, color, start }, index) => {
          const progress = drawProgress(frame, start, 126);
          const lineLength = norm(sub(side[1], side[0]));
          return (
            <line
              key={`side-${index}`}
              x1={side[0].x}
              y1={side[0].y}
              x2={side[1].x}
              y2={side[1].y}
              stroke={color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeDasharray={lineLength}
              strokeDashoffset={lineLength * (1 - progress)}
            />
          );
        }
      )}

      {squares.map((square) => {
        const progress = drawProgress(frame, square.start, square.end);
        const areaOpacity = 0.18 + pulse * 0.3;
        const center = midPoint(midPoint(square.points[0], square.points[2]), midPoint(square.points[1], square.points[3]));
        return (
          <g key={square.label} opacity={progress}>
            <polygon points={toPoints(square.points)} fill={square.color} fillOpacity={areaOpacity} stroke={square.color} strokeWidth={8} />
            <text
              x={center.x}
              y={center.y}
              fill={colors.white}
              fontSize={64}
              fontWeight={800}
              textAnchor="middle"
              dominantBaseline="middle"
            >
              {square.label}
            </text>
          </g>
        );
      })}

      <path
        d={`M ${B.x} ${B.y} L ${C.x} ${C.y} L ${A.x} ${A.y} Z`}
        fill="none"
        stroke={colors.dim}
        strokeWidth={4}
        opacity={0.5}
      />
    </svg>
  );
};
