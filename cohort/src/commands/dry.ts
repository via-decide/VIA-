import { printMergePlan } from "./merge.ts";

export const runDryCommand = async (manifestPath?: string): Promise<void> => {
  await printMergePlan(manifestPath);
};
