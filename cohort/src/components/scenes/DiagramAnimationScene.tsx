import React from "react";
import type { Scene } from "../../types";

export const DiagramAnimationScene: React.FC<{ scene: Scene; videoId: string }> = ({ videoId }) => (
  <div><h1>Diagram ({videoId})</h1></div>
);
