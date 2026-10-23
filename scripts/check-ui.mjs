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

const hexLuminance = (hex) => {
  const channels = [1, 3, 5].map((index) => {
    const value = parseInt(hex.slice(index, index + 2), 16) / 255;
    return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
};
const contrast = (a, b) => {
  const [light, dark] = [hexLuminance(a), hexLuminance(b)].sort((x, y) => y - x);
  return (light + 0.05) / (dark + 0.05);
};
const hoverMatch = css.match(/--accent-hover:\s*(#[0-9A-Fa-f]{6})/);
check(hoverMatch, "accent-hover ausente");
if (hoverMatch) {
  check(contrast(hoverMatch[1], "#FFFFFF") >= 4.5, `hover do primário abaixo de 4.5:1 (${hoverMatch[1]})`);
}
check(css.includes(".pagina-404 > p:not(.codigo-404)"), "404: codigo pode ser sobrescrito");
check(/\.card:hover\s*\{[^}]*translate:\s*0\s+-3px/.test(css), "hover do card sem translate");
check(/\.skills-group:hover\s*\{[^}]*translate:\s*0\s+-3px/.test(css), "hover de skills sem translate");
check(css.includes("list-style: disc"), "listas de case/timeline sem bullets");
check(/\.skills-how li\s*\{[^}]*list-style:\s*disc/.test(css), "bullets de Como uso ausentes");
check(/\.timeline-card li\s*\{[^}]*list-style:\s*disc/.test(css), "bullets da timeline ausentes");
check(/\.case-list li\s*\{[^}]*list-style:\s*disc/.test(css), "bullets de case ausentes");
check(css.includes(".timeline-card p.timeline-empresa"), "cor da empresa na timeline sobrescrita");
check(css.includes(".case-section p.case-aprendizado"), "cor do aprendizado sobrescrita");
for (const legacy of ["#7c5cff", "#8b5cf6", "rgba(124, 92, 255", "rgba(139, 92, 246"]) {
  check(!css.includes(legacy), `cor antiga no CSS: ${legacy}`);
}
check(css.includes("html.js [data-anime]"), "fallback no-JS ausente");
check(css.includes("animation: marquee 42s linear infinite"), "marquee 42s ausente");

const pt = fs.readFileSync("dist/index.html", "utf8");
const en = fs.readFileSync("dist/en/index.html", "utf8");
check(/data-target="5">5<\/span>/.test(pt), "stats sem valor final no HTML (no-JS)");
check(/data-target="10">10<\/span>/.test(pt), "projetos sem valor final no HTML (no-JS)");
for (const legacy of ["hero-logo.png", "scroll-progress", "grain", "lenis.min.js"]) {
  check(!pt.includes(legacy), `legado no HTML: ${legacy}`);
}
for (const required of ["hero-terminal", "hero-meta", "bento-stack", "card--destaque"]) {
  check(pt.includes(required), `estrutura ausente: ${required}`);
}
check((pt.match(/card--destaque/g) || []).length === 2, "esperados 2 cards em destaque");
check(/Minhas Listas[\s\S]*ProDocs/.test(pt), "ProDocs deve vir depois de Minhas Listas");
check((pt.match(/section-kicker/g) || []).length === 5, "esperados 5 section-kicker");
check((pt.match(/class="card(?:\s|")/g) || []).length === 10, "esperados 10 cards");
check(pt.includes("Barreiras, BA"), "metaLocal PT ausente");
check(pt.includes("Disponível para conversar"), "metaStatus PT ausente");
check(pt.includes("Stack atual"), "stackLabel PT ausente");
check(pt.includes("Como uso"), "comoUso PT ausente");
check(pt.includes("Onde aparece"), "ondeAparece PT ausente");
check(en.includes("How I use"), "comoUso EN ausente");
check(en.includes("Where it appears"), "ondeAparece EN ausente");
check((pt.match(/skills-how/g) || []).length === 4, "esperados 4 blocos Como uso");
check((pt.match(/skills-kicker/g) || []).length === 4, "esperados 4 kickers");
check((pt.match(/skills-links/g) || []).length === 4, "esperados 4 blocos Onde aparece");
check(!pt.includes("stack-completa"), "faixa Stack completa ainda presente");
check(!pt.includes("Stack completa"), "label Stack completa ainda presente");
for (const selector of [".bento", ".timeline", ".cards", ".contato-shell", ".footer--item", ".filter-bar"]) {
  const pattern = new RegExp(`\\${selector}\\s*\\{[^}]*max-width:\\s*1500px`);
  check(pattern.test(css), `${selector} sem max-width 1500px`);
}
check(/#top\s*\{[^}]*padding:\s*96px 3%/.test(css), "hero sem padding 3%");
check((css.match(/padding:\s*88px 3% 88px/g) || []).length >= 5, "seções da home sem padding 3%");
check(pt.includes("/projetos/minhas-listas/"), "evidência com link de projeto ausente");
check(pt.includes("Copiar e-mail"), "copy email PT ausente");
check(pt.includes("Abrir no meu e-mail"), "mailto PT ausente");
check(en.includes("Copy email"), "copy email EN ausente");
check(en.includes("Open in email"), "mailto EN ausente");
for (const required of ["contato-shell", "contato-copy", "contato-mailto", "contato-canais"]) {
  check(pt.includes(required), `contato ausente: ${required}`);
}
check(fs.readFileSync("assets/js/app.js", "utf8").includes("clipboard"), "clipboard JS ausente");
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
