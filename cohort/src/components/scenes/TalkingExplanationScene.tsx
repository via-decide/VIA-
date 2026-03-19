import React from "react";
import type { Scene } from "../../types";

export const TalkingExplanationScene: React.FC<{ scene: Scene; videoId: string }> = ({ scene }) => (
  <div><h1>Hook + Context</h1><p>{scene.description}</p></div>
);
