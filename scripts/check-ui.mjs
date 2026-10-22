import fs from "node:fs";
import path from "node:path";

const failures = [];
const check = (condition, message) => {
  if (!condition) failures.push(message);
};

const css = fs.readFileSync("assets/css/style.css", "utf8");
for (const token of [
  "--bg: #0D1117",
  "--bg-elev: #161B22",
  "--accent: #58A6FF",
  "--accent-strong: #1F6FEB",
  "--radius-card: 6px",
  "--bg: #FFFFFF",
  "--accent: #0969DA"
]) {
  check(css.includes(token), `token ausente: ${token}`);
}
for (const legacy of ["#7c5cff", "#8b5cf6", "rgba(124, 92, 255", "rgba(139, 92, 246"]) {
  check(!css.includes(legacy), `cor antiga no CSS: ${legacy}`);
}
check(css.includes("html.js [data-anime]"), "fallback no-JS ausente");
check(css.includes("animation: marquee 42s linear infinite"), "marquee 42s ausente");

const pt = fs.readFileSync("dist/index.html", "utf8");
const en = fs.readFileSync("dist/en/index.html", "utf8");
for (const legacy of ["hero-logo.png", "scroll-progress", "grain", "lenis.min.js"]) {
  check(!pt.includes(legacy), `legado no HTML: ${legacy}`);
}
for (const required of ["hero-terminal", "hero-meta", "bento-stack", "card--destaque"]) {
  check(pt.includes(required), `estrutura ausente: ${required}`);
}
check((pt.match(/section-kicker/g) || []).length === 5, "esperados 5 section-kicker");
check((pt.match(/class="card(?:\s|")/g) || []).length === 10, "esperados 10 cards");
check(pt.includes("Barreiras, BA"), "metaLocal PT ausente");
check(pt.includes("Disponível para conversar"), "metaStatus PT ausente");
check(pt.includes("Stack atual"), "stackLabel PT ausente");
check(en.includes("Open to a conversation"), "metaStatus EN ausente");
check(en.includes("Current stack"), "stackLabel EN ausente");

for (const dir of ["dist/projetos", "dist/en/projects"]) {
  const entries = fs.readdirSync(dir, { withFileTypes: true }).filter((e) => e.isDirectory());
  check(entries.length === 10, `${dir}: esperados 10 cases, encontrados ${entries.length}`);
}
const caseHtml = fs.readFileSync("dist/projetos/smartschool/index.html", "utf8");
for (const required of ["case-badge", "case-meta", "case-cover", "case-section"]) {
  check(caseHtml.includes(required), `case ausente: ${required}`);
}
check(fs.existsSync("dist/404.html"), "404.html ausente");
check(fs.readFileSync("dist/404.html", "utf8").includes("pagina-404"), "classe pagina-404 ausente");
check(!fs.existsSync("assets/vendor/lenis.min.js"), "lenis.min.js ainda existe");
check(!fs.readFileSync("assets/js/app.js", "utf8").includes("mousemove"), "mousemove/tilt ainda presente");

if (failures.length) {
  console.error("UI FAIL");
  for (const failure of failures) console.error("- " + failure);
  process.exit(1);
}
console.log("UI OK");
