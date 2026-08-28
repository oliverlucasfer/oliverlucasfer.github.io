import { readFileSync } from "node:fs";

const files = process.argv.slice(2).length
  ? process.argv.slice(2)
  : ["./lighthouse-home.json", "./lighthouse-case.json"];

const budgets = {
  performance: 0.9,
  accessibility: 0.95,
  "best-practices": 0.9,
  seo: 1
};

let failed = false;

for (const file of files) {
  const report = JSON.parse(readFileSync(file, "utf8"));
  const url = report.finalDisplayedUrl ?? file;
  console.log(`\n== ${url}`);
  for (const [category, min] of Object.entries(budgets)) {
    const score = report.categories?.[category]?.score;
    if (score == null) {
      console.log(`  ${category}: n/d`);
      continue;
    }
    const ok = score >= min;
    if (!ok) failed = true;
    console.log(
      `  ${category}: ${(score * 100).toFixed(0)} ${ok ? "OK" : `ABAIXO DO MINIMO (${min * 100})`}`
    );
  }
}

if (failed) {
  console.error("\nFalha nos budgets do Lighthouse.");
  process.exit(1);
}
console.log("\nLighthouse OK.");
