// Copies the analysis results (../data/out) into public/data so the site can use them.
// Runs automatically before `npm run dev` and `npm run build`.
import { cpSync, existsSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const source = join(here, "..", "..", "data", "out");
const target = join(here, "..", "public", "data");

if (!existsSync(source)) {
  if (existsSync(target)) {
    console.log("data/out not found - using the copy already in public/data");
    process.exit(0);
  }
  console.error("No data found. Run `python analysis/4_calculate_metrics.py` first.");
  process.exit(1);
}
mkdirSync(target, { recursive: true });
cpSync(source, target, { recursive: true });
console.log("Copied data/out -> site/public/data");
