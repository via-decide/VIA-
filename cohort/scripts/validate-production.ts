import fs from "node:fs";

const prod = JSON.parse(fs.readFileSync("production-v2.json", "utf8"));
if (!Array.isArray(prod.videos) || prod.videos.length === 0) {
  throw new Error(`Expected non-empty videos array, found ${prod.videos?.length ?? 0}`);
}
console.log(`production-v2.json valid: ${prod.videos.length} videos`);
