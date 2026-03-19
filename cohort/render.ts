import fs from "node:fs";
import path from "node:path";
import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition } from "@remotion/renderer";
import type { ProductionData } from "./src/types";

const mode = (process.env.PRODUCTION_MODE ?? "v2").toLowerCase();
const sourceFile = mode === "v1" ? "production.json" : "production-v2.json";
const production = JSON.parse(fs.readFileSync(path.join(process.cwd(), sourceFile), "utf8")) as ProductionData;
const ids = production.videos.map((v) => v.id);
const args = process.argv.slice(2);

if (args.includes("--list")) {
  console.log(ids.join("\n"));
  process.exit(0);
}

const wanted = args.includes("--all") ? ids : args.filter((a) => !a.startsWith("--"));
if (wanted.length === 0) {
  console.error("Usage: ts-node --esm render.ts --list | --all | <ids>");
  process.exit(1);
}

const invalid = wanted.filter((id) => !ids.includes(id));
if (invalid.length) {
  console.error(`Unknown video id(s): ${invalid.join(", ")}`);
  process.exit(1);
}

const run = async () => {
  const bundleLocation = await bundle({ entryPoint: path.join(process.cwd(), "src/index.ts") });
  fs.mkdirSync("renders", { recursive: true });

  for (const id of wanted) {
    const composition = await selectComposition({
      serveUrl: bundleLocation,
      id: "EpisodeFromJson",
      inputProps: { videoId: id, voEnabled: false },
    });

    await renderMedia({
      composition,
      serveUrl: bundleLocation,
      codec: "h264",
      outputLocation: path.join(process.cwd(), "renders", `${id}.mp4`),
      inputProps: { videoId: id, voEnabled: false },
    });
  }
};

void run();
