import React from "react";
import type { Scene } from "../../types";

export const IntroScene: React.FC<{ scene: Scene; videoId: string }> = ({ scene, videoId }) => (
  <div><h1>{videoId} · Intro</h1><p>{scene.description}</p></div>
);
