import { spawn, spawnSync } from "node:child_process";

export function formatCommand(command: string, args: string[]): string {
  const parts = [command, ...args].map((part) => {
    return /[\s"']/.test(part) ? JSON.stringify(part) : part;
  });
  return parts.join(" ");
}

export function commandExists(command: string): boolean {
  const result = spawnSync(command, ["-version"], {
    stdio: "ignore",
    env: process.env,
  });
  return result.status === 0;
}

export function ensureFfmpeg(): void {
  if (!commandExists("ffmpeg")) {
    throw new Error("ffmpeg is not installed or is not available on PATH");
  }
  if (!commandExists("ffprobe")) {
    throw new Error("ffprobe is not installed or is not available on PATH");
  }
}

export async function runProcess(command: string, args: string[]): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: "inherit",
      env: process.env,
    });

    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) {
        resolve();
        return;
      }
      reject(new Error(`${formatCommand(command, args)} exited with code ${code ?? "unknown"}`));
    });
  });
}

export async function captureProcess(command: string, args: string[]): Promise<string> {
  return await new Promise<string>((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: ["ignore", "pipe", "pipe"],
      env: process.env,
    });

    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (chunk) => {
      stdout += chunk.toString();
    });

    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });

    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) {
        resolve(stdout.trim());
        return;
      }
      reject(new Error(`${formatCommand(command, args)} exited with code ${code ?? "unknown"}\n${stderr.trim()}`));
    });
  });
}

export async function probeDurationSeconds(filePath: string): Promise<number> {
  const output = await captureProcess("ffprobe", [
    "-v",
    "error",
    "-show_entries",
    "format=duration",
    "-of",
    "default=noprint_wrappers=1:nokey=1",
    filePath,
  ]);

  const seconds = Number.parseFloat(output);
  if (!Number.isFinite(seconds)) {
    throw new Error(`Unable to read duration from ffprobe output for ${filePath}`);
  }

  return seconds;
}
