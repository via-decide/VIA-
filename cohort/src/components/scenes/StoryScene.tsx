import React from "react";
import type { Scene } from "../../types";

export const StoryScene: React.FC<{ scene: Scene; videoId: string }> = ({ scene }) => (
  <div><h1>Story</h1><p>{scene.description}</p></div>
);
