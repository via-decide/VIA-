import React from "react";
import type { Scene } from "../../types";

export const RepoScreenCaptureScene: React.FC<{ scene: Scene; videoId: string }> = ({ videoId }) => (
  <div><h1>Repo Walkthrough ({videoId})</h1></div>
);
