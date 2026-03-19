import React from "react";
import type { Scene } from "../../types";

export const DecisionOverlayScene: React.FC<{ scene: Scene; videoId: string }> = ({ scene }) => (
  <div><h1>Decision</h1><p>{scene.description}</p></div>
);
