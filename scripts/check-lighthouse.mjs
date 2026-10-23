import { readFileSync } from "node:fs";

const args = process.argv.slice(2);
const runsArg = args.find((arg) => arg.startsWith("--runs="));
const runs = Number(runsArg?.split("=")[1] ?? 3);
const targets = args.filter((arg) => !arg.startsWith("--"));

const budgets = {
  performance: 0.9,
  accessibility: 0.95,
  "best-practices": 0.9,
  seo: 1
};

const metrics = {
  FCP: "first-contentful-paint",
  LCP: "largest-contentful-paint",
  TBT: "total-blocking-time",
  CLS: "cumulative-layout-shift",
  SI: "speed-index"
};

const groups = (targets.length ? targets : ["lighthouse-home", "lighthouse-case"]).map(
  (target) =>
    target.endsWith(".json")
      ? { nome: target, arquivos: [target] }
      : {
          nome: target,
          arquivos: Array.from({ length: runs }, (_, index) => `${target}-${index + 1}.json`)
        }
);

let failed = false;

for (const group of groups) {
  const reports = [];
  for (const arquivo of group.arquivos) {
    try {
      reports.push(JSON.parse(readFileSync(arquivo, "utf8")));
    } catch (erro) {
      console.error(`\nFalha ao ler ${arquivo}: ${erro.message}`);
      process.exit(1);
    }
  }

  const url = reports[0].finalDisplayedUrl ?? group.nome;
  console.log(`\n== ${url}`);

  for (const [category, min] of Object.entries(budgets)) {
    const scores = reports
      .map((report) => report.categories?.[category]?.score)
      .filter((score) => score != null);
    if (!scores.length) {
      console.log(`  ${category}: n/d`);
      continue;
    }

    const melhor = Math.max(...scores);
    const ok = melhor >= min;
    if (!ok) failed = true;
    const notas = scores.map((score) => (score * 100).toFixed(0)).join(", ");
    const detalhe = scores.length > 1 ? ` (${notas} -> melhor ${(melhor * 100).toFixed(0)})` : "";
    console.log(
      `  ${category}: ${(melhor * 100).toFixed(0)} ${ok ? "OK" : `ABAIXO DO MINIMO (${min * 100})`}${detalhe}`
    );
  }

  const melhorRelatorio = reports.reduce((melhor, atual) =>
    (atual.categories?.performance?.score ?? -1) > (melhor.categories?.performance?.score ?? -1)
      ? atual
      : melhor
  );
  const medidas = Object.entries(metrics).map(
    ([rotulo, id]) => `${rotulo} ${melhorRelatorio.audits?.[id]?.displayValue ?? "n/d"}`
  );
  console.log(`  metricas: ${medidas.join(" | ")}`);

  const requests = melhorRelatorio.audits?.["network-requests"]?.details?.items ?? [];
  const bytes = requests.reduce((total, item) => total + (item.transferSize ?? 0), 0);
  const origem = new URL(url).origin;
  const terceiros = [
    ...new Set(
      requests
        .filter((item) => item.url.startsWith("http"))
        .map((item) => new URL(item.url).origin)
        .filter((origemItem) => origemItem !== origem)
    )
  ];
  console.log(
    `  rede: ${requests.length} requisicoes, ${(bytes / 1024).toFixed(0)} KB` +
      (terceiros.length ? `, terceiros: ${terceiros.join(", ")}` : "")
  );
}

if (failed) {
  console.error("\nFalha nos budgets do Lighthouse.");
  process.exit(1);
}
console.log("\nLighthouse OK.");
