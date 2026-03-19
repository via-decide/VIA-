import fs from "node:fs";
import path from "node:path";
import puppeteer from "puppeteer";

const ROOT = process.cwd();
const PRODUCTION_PATH = path.join(ROOT, "production.json");

if (!fs.existsSync(PRODUCTION_PATH)) {
  throw new Error(`production.json not found at: ${PRODUCTION_PATH}`);
}

const production = JSON.parse(fs.readFileSync(PRODUCTION_PATH, "utf8"));

const ensureDir = (filePath) => {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
};

const exists = (filePath) => fs.existsSync(path.resolve(ROOT, filePath));

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const screenshotWithRetry = async (page, job, retries = 2) => {
  let attempt = 0;

  while (attempt <= retries) {
    try {
      await page.goto(job.url, {
        waitUntil: "networkidle2",
        timeout: 60000,
      });

      if (job.delay_ms) {
        await sleep(job.delay_ms);
      }

      const outputPath = path.resolve(ROOT, job.output);
      ensureDir(outputPath);

      if (job.type === "element") {
        if (!job.selector) {
          throw new Error(`Missing selector for element capture: ${job.id}`);
        }

        await page.waitForSelector(job.selector, { timeout: 15000 });
        const el = await page.$(job.selector);

        if (!el) {
          throw new Error(`Selector not found: ${job.selector}`);
        }

        await el.screenshot({ path: outputPath });
      } else if (job.type === "viewport") {
        await page.screenshot({
          path: outputPath,
          fullPage: false,
        });
      } else {
        await page.screenshot({
          path: outputPath,
          fullPage: true,
        });
      }

      return { ok: true, output: job.output };
    } catch (error) {
      attempt += 1;

      if (attempt <= retries) {
        await sleep(1500 * attempt);
      }

      if (attempt > retries) {
        return {
          ok: false,
          error: error instanceof Error ? error.message : String(error),
        };
      }
    }
  }

  return { ok: false, error: "Unknown capture failure" };
};

const main = async () => {
  const videos = Array.isArray(production.videos) ? production.videos : [];

  if (videos.length === 0) {
    console.log("No videos found in production.json");
    return;
  }

  const browser = await puppeteer.launch({
    headless: true,
    defaultViewport: {
      width: 1440,
      height: 900,
      deviceScaleFactor: 2,
    },
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  try {
    for (const video of videos) {
      const jobs = Array.isArray(video.capture_jobs) ? video.capture_jobs : [];

      if (jobs.length === 0) {
        console.log(`Skipping ${video.id}: no capture_jobs`);
        continue;
      }

      console.log(`\nProcessing ${video.id} (${jobs.length} jobs)`);

      for (const job of jobs) {
        if (!job.output || !job.url || !job.type) {
          console.log(`  Skipped invalid job: ${job.id ?? "unknown"}`);
          continue;
        }

        if (exists(job.output)) {
          console.log(`  Cached: ${job.output}`);
          continue;
        }

        const page = await browser.newPage();

        try {
          const result = await screenshotWithRetry(page, job);

          if (result.ok) {
            console.log(`  Captured: ${result.output}`);
          } else {
            console.log(`  Failed: ${job.id} -> ${result.error}`);
          }
        } finally {
          await page.close();
        }
      }
    }
  } finally {
    await browser.close();
  }

  console.log("\nCapture pass complete.");
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
