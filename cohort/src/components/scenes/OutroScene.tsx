import React from "react";
import type { Scene } from "../../types";

export const OutroScene: React.FC<{ scene: Scene; videoId: string }> = ({ videoId }) => (
  <div><h1>Outro · {videoId}</h1></div>
);
