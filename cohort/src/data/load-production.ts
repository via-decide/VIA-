import type { ProductionData } from "../types";

const mode = (process.env.PRODUCTION_MODE ?? "v2").toLowerCase();

// eslint-disable-next-line @typescript-eslint/no-var-requires
const raw = require(mode === "v1" ? "../../production.json" : "../../production-v2.json") as ProductionData;

export const production: ProductionData = raw;
export const productionMode: "v1" | "v2" = mode === "v1" ? "v1" : "v2";
