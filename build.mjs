import {
  readFileSync,
  writeFileSync,
  rmSync,
  mkdirSync,
  cpSync,
  readdirSync
} from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(fileURLToPath(import.meta.url));
const dist = join(root, "dist");

const site = JSON.parse(readFileSync(join(root, "data", "site.json"), "utf8"));
const skillsData = JSON.parse(readFileSync(join(root, "data", "skills.json"), "utf8"));
const projectsData = JSON.parse(readFileSync(join(root, "data", "projects.json"), "utf8"));

const projects = projectsData.projetos;
const locales = site.locales;

/* ---------------- helpers ---------------- */

const esc = (s) =>
  String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const t = (value, locale) => value[locale === locales.pt ? "pt" : "en"];

const yearsExp = Math.max(1, new Date().getFullYear() - site.careerStartYear);

/* ---------------- icon sprite ---------------- */

function extractSvg(file) {
  const svg = readFileSync(file, "utf8");
  const viewBox = svg.match(/viewBox="([^"]+)"/)?.[1] ?? "0 0 24 24";
  const inner = svg
    .replace(/^[\s\S]*?<svg[^>]*>/, "")
    .replace(/<\/svg>\s*$/, "")
    .replace(/<title>[\s\S]*?<\/title>/g, "")
    .trim();
  return { viewBox, inner };
}

const brandIcons = {};
for (const file of readdirSync(join(root, "assets", "icons"))) {
  if (file.endsWith(".svg")) {
    const name = file.replace(/\.svg$/, "");
    brandIcons[name] = extractSvg(join(root, "assets", "icons", file));
  }
}

const lineIcons = {
  code: '<polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>',
  database:
    '<ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>',
  shield:
    '<path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/>',
  check: '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>',
  flame:
    '<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>',
  search: '<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>',
  waves:
    '<path d="M2 6c.6.5 1.2 1 2.5 1C7 7 7 5 9.5 5c2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/><path d="M2 12c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/><path d="M2 18c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/>',
  "arrow-up-right": '<path d="M7 17L17 7"/><path d="M7 7h10v10"/>',
  "arrow-left": '<path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/>',
  "chevron-left": '<polyline points="15 18 9 12 15 6"/>',
  "chevron-right": '<polyline points="9 18 15 12 9 6"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32 1.41 1.41M2 12h2m16 0h2M4.93 19.07l1.41-1.41m11.32-11.32 1.41-1.41"/>',
  moon: '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>',
  lock: '<rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>'
};

const socialIcons = {
  github: {
    viewBox: "0 0 496 512",
    inner: '<path d="M165.9 397.4c0 2-2.3 3.6-5.2 3.6-3.3.3-5.6-1.3-5.6-3.6 0-2 2.3-3.6 5.2-3.6 3-.3 5.6 1.3 5.6 3.6zm-31.1-4.5c-.7 2 1.3 4.3 4.3 4.9 2.6 1 5.6 0 6.2-2s-1.3-4.3-4.3-5.2c-2.6-.7-5.5.3-6.2 2.3zm44.2-1.7c-2.9.7-4.9 2.6-4.6 4.9.3 2 2.9 3.3 5.9 2.6 2.9-.7 4.9-2.6 4.6-4.6-.3-1.9-3-3.2-5.9-2.9zM244.8 8C106.1 8 0 113.3 0 252c0 110.9 69.8 205.8 169.5 239.2 12.8 2.3 17.3-5.6 17.3-12.1 0-6.2-.3-40.4-.3-61.4 0 0-70 15-84.7-29.8 0 0-11.4-29.1-27.8-36.6 0 0-22.9-15.7 1.6-15.4 0 0 24.9 2 38.6 25.8 21.9 38.6 58.6 27.5 72.9 20.9 2.3-16 8.8-27.1 16-33.7-55.9-6.2-112.3-14.3-112.3-110.5 0-27.5 7.6-41.3 23.6-58.9-2.6-6.5-11.1-33.3 2.6-67.9 20.9-6.5 69 27 69 27 20-5.6 41.5-8.5 62.8-8.5s42.8 2.9 62.8 8.5c0 0 48.1-33.6 69-27 13.7 34.7 5.2 61.4 2.6 67.9 16 17.7 25.8 31.5 25.8 58.9 0 96.5-58.9 104.2-114.8 110.5 9.2 7.9 17 22.9 17 46.4 0 33.7-.3 75.4-.3 83.6 0 6.5 4.6 14.4 17.3 12.1C428.2 457.8 496 362.9 496 252 496 113.3 383.5 8 244.8 8zM97.2 352.9c-1.3 1-1 3.3.7 5.2 1.6 1.6 3.9 2.3 5.2 1 1.3-1 1-3.3-.7-5.2-1.6-1.6-3.9-2.3-5.2-1zm-10.8-8.1c-.7 1.3.3 2.9 2.3 3.9 1.6 1 3.6.7 4.3-.7.7-1.3-.3-2.9-2.3-3.9-2-.6-3.6-.3-4.3.7zm32.4 35.6c-1.6 1.3-1 4.3 1.3 6.2 2.3 2.3 5.2 2.6 6.5 1 1.3-1.3.7-4.3-1.3-6.2-2.2-2.3-5.2-2.6-6.5-1zm-11.4-14.7c-1.6 1-1.6 3.6 0 5.9 1.6 2.3 4.3 3.3 5.6 2.3 1.6-1.3 1.6-3.9 0-6.2-1.4-2.3-4-3.3-5.6-2z"/>'
  },
  linkedin: {
    viewBox: "0 0 448 512",
    inner: '<path d="M100.28 448H7.4V148.9h92.88zM53.79 108.1C24.09 108.1 0 83.5 0 53.8a53.79 53.79 0 0 1 107.58 0c0 29.7-24.1 54.3-53.79 54.3zM447.9 448h-92.68V302.4c0-34.7-.7-79.2-48.29-79.2-48.29 0-55.69 37.7-55.69 76.7V448h-92.78V148.9h89.08v40.8h1.3c12.4-23.5 42.69-48.3 87.88-48.3 94 0 111.28 61.9 111.28 142.3V448z"/>'
  },
  email: {
    viewBox: "0 0 512 512",
    inner: '<path d="M48 64C21.5 64 0 85.5 0 112c0 15.1 7.1 29.3 19.2 38.4L236.8 313.6c11.4 8.5 27 8.5 38.4 0L492.8 150.4c12.1-9.1 19.2-23.3 19.2-38.4c0-26.5-21.5-48-48-48L48 64zM0 176L0 384c0 35.3 28.7 64 64 64l384 0c35.3 0 64-28.7 64-64l0-208L294.4 339.2c-22.8 17.1-54 17.1-76.8 0L0 176z"/>'
  }
};

function buildSprite() {
  let symbols = "";
  for (const [name, icon] of Object.entries(brandIcons)) {
    symbols += `<symbol id="icon-${name}" viewBox="${icon.viewBox}">${icon.inner}</symbol>`;
  }
  for (const [name, inner] of Object.entries(lineIcons)) {
    symbols += `<symbol id="icon-${name}" viewBox="0 0 24 24">${inner}</symbol>`;
  }
  for (const [name, icon] of Object.entries(socialIcons)) {
    symbols += `<symbol id="icon-${name}" viewBox="${icon.viewBox}">${icon.inner}</symbol>`;
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" style="position:absolute;width:0;height:0;overflow:hidden" aria-hidden="true" focusable="false">${symbols}</svg>`;
}

const sprite = buildSprite();

function icon(name, cls = "") {
  const kind = brandIcons[name] || socialIcons[name] ? "ic-brand" : "ic-line";
  return `<svg class="ic ${kind} ${cls}" aria-hidden="true" focusable="false"><use href="#icon-${name}"/></svg>`;
}

/* ---------------- page shell ---------------- */

const themeScript = `<script>(function(){var t=null;try{t=localStorage.getItem("theme")}catch(e){}if(t!=="light"&&t!=="dark"){t=window.matchMedia&&window.matchMedia("(prefers-color-scheme: light)").matches?"light":"dark"}document.documentElement.dataset.theme=t})();<\/script>`;

function head({
  locale,
  ptPath,
  enPath,
  title,
  description,
  ogType = "website",
  jsonLd = ""
}) {
  const url = `${site.siteUrl}/${ptPath}`;
  const enUrl = `${site.siteUrl}/${enPath}`;
  const ogImage = `${site.siteUrl}/media/og-cover.png`;
  return `  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${esc(title)}</title>
    <meta name="description" content="${esc(description)}" />
    <link rel="canonical" href="${url}" />
    <link rel="alternate" hreflang="pt-BR" href="${site.siteUrl}/${ptPath}" />
    <link rel="alternate" hreflang="en" href="${enUrl}" />
    <link rel="alternate" hreflang="x-default" href="${site.siteUrl}/${ptPath}" />
    <meta name="theme-color" content="#0e0e14" />
    ${themeScript}
    <meta property="og:type" content="${ogType}" />
    <meta property="og:url" content="${url}" />
    <meta property="og:title" content="${esc(title)}" />
    <meta property="og:description" content="${esc(description)}" />
    <meta property="og:image" content="${ogImage}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:locale" content="${locale.ogLocale}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${esc(title)}" />
    <meta name="twitter:description" content="${esc(description)}" />
    <meta name="twitter:image" content="${ogImage}" />
    <link rel="apple-touch-icon" sizes="180x180" href="/assets/images/apple-touch-icon.png" />
    <link rel="icon" type="image/png" sizes="32x32" href="/assets/images/favicon-32x32.png" />
    <link rel="icon" type="image/png" sizes="16x16" href="/assets/images/favicon-16x16.png" />
    <link rel="manifest" href="/assets/images/site.webmanifest" />
    <link rel="stylesheet" href="/assets/css/style.css" />
${jsonLd ? `    <script type="application/ld+json">${jsonLd}<\/script>\n` : ""}  </head>`;
}

function configScript(locale) {
  const cfg = {
    careerStartYear: site.careerStartYear,
    typedWords: locale.hero.typedWords,
    githubUser: site.githubUser,
    email: site.email,
    sendingLabel: locale.contato.form.enviando,
    sentLabel: locale.contato.form.sucesso,
    errorLabel: locale.contato.form.erro
  };
  return `    <script>window.__SITE__ = ${JSON.stringify(cfg)};<\/script>`;
}

function socialLinks(locale, cls = "") {
  return `        <div class="social-media ${cls}">
          <a href="${site.github}" target="_blank" rel="noopener noreferrer" aria-label="${esc(locale.aria.github)}">
            <svg viewBox="0 0 496 512" fill="currentColor" aria-hidden="true" focusable="false"><use href="#icon-github"/></svg>
          </a>
          <a href="${site.linkedin}" target="_blank" rel="noopener noreferrer" aria-label="${esc(locale.aria.linkedin)}">
            <svg viewBox="0 0 448 512" fill="currentColor" aria-hidden="true" focusable="false"><use href="#icon-linkedin"/></svg>
          </a>
          <a href="mailto:${site.email}" aria-label="${esc(locale.aria.email)}">
            <svg viewBox="0 0 512 512" fill="currentColor" aria-hidden="true" focusable="false"><use href="#icon-email"/></svg>
          </a>
        </div>`;
}

function themeToggle(locale, fixed = false) {
  return `      <button
        class="theme-toggle${fixed ? " theme-toggle-fixed" : ""}"
        type="button"
        data-label-dark="${esc(locale.aria.temaClaro)}"
        data-label-light="${esc(locale.aria.temaEscuro)}"
        aria-label="${esc(locale.aria.temaEscuro)}"
      >
        <svg class="icon-sun" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><use href="#icon-sun"/></svg>
        <svg class="icon-moon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><use href="#icon-moon"/></svg>
      </button>`;
}

function langSwitch(locale, href) {
  return `      <a class="lang-pill" href="${href}" hreflang="${locale.langHreflang}" lang="${locale.langHreflang}">${locale.langLabel}</a>`;
}

function footer(locale) {
  return `      <footer>
        <div class="footer--item">
          <p>${esc(locale.footer.texto)}</p>
          <div class="footer-links">
            <a href="${site.linkedin}" target="_blank" rel="noopener noreferrer" aria-label="${esc(locale.aria.linkedin)}">
              ${icon("linkedin")} LinkedIn
            </a>
            <a href="${site.github}" target="_blank" rel="noopener noreferrer" aria-label="${esc(locale.aria.github)}">
              ${icon("github")} GitHub
            </a>
            <a href="mailto:${site.email}" aria-label="${esc(locale.aria.email)}">
              ${icon("email")} E-mail
            </a>
          </div>
        </div>
      </footer>`;
}

function page({ locale, ptPath, enPath, title, description, jsonLd, body, withConfig = true, ogType = "website" }) {
  return `<!DOCTYPE html>
<html lang="${locale.code}">
${head({ locale, ptPath, enPath, title, description, ogType, jsonLd })}
  <body>
    <a class="skip-link" href="#conteudo">${esc(locale.aria.pular)}</a>
    ${sprite}
    <div class="scroll-progress" aria-hidden="true"></div>
    <div class="grain" aria-hidden="true"></div>
    <div class="container">
${body}
    </div>
${withConfig ? configScript(locale) + "\n" : ""}    <script src="/assets/vendor/lenis.min.js" defer><\/script>
    <script src="/assets/js/app.js" defer><\/script>
  </body>
</html>
`;
}

/* ---------------- home sections ---------------- */

function renderMarquee(items) {
  const group = (items
    .map((item) => `            <span class="marquee-item">${esc(item)}</span>\n            <span class="marquee-dot"></span>`)
    .join("\n") + "\n");
  return `      <div class="marquee" aria-hidden="true">
        <div class="marquee-track">
          <div class="marquee-group">
${group}          </div>
          <div class="marquee-group">
${group}          </div>
        </div>
      </div>`;
}

function renderSkills(locale) {
  const dirs = ["left", "up", "right", "up"];
  return skillsData.grupos
    .map((group, i) => {
      const chips = group.itens
        .map(
          (item) =>
            `              <span class="chip">${icon(item.icon ?? "check")}${esc(item.nome)}</span>`
        )
        .join("\n");
      return `        <div class="skills-group" data-anime="${dirs[i % dirs.length]}">
          <h3 class="skills-title">${esc(t(group.nome, locale))}</h3>
          <p class="skills-desc">${esc(t(group.descricao, locale))}</p>
          <div class="skills-chips">
${chips}
          </div>
        </div>`;
    })
    .join("\n\n");
}

function renderTimeline(locale) {
  const dirs = ["left", "right", "left"];
  return locale.experiencia.itens
    .map((item, i) => {
      const list = item.itens.length
        ? `              <ul>
${item.itens.map((li) => `                <li>${li}</li>`).join("\n")}
              </ul>`
        : "";
      const desc = item.desc ? `              <p>${item.desc}</p>\n` : "";
      return `        <div class="timeline-item" data-anime="${dirs[i % dirs.length]}">
          <div class="timeline-dot"></div>
          <div class="timeline-card">
            <span class="timeline-periodo">${esc(item.periodo)}</span>
            <h3>${esc(item.cargo)}</h3>
            <p class="timeline-empresa">${esc(item.empresa)}</p>
${desc}${list}
          </div>
        </div>`;
    })
    .join("\n");
}

function cardLinkButton(label, href, outline = false, icon2 = "arrow-up-right") {
  return `                <a
                  class="ButtonSend${outline ? " outline" : ""}"
                  href="${href}"
                  target="_blank"
                  rel="noopener noreferrer"
                  >${esc(label)}
                  ${icon(icon2, "btn-icon")}
                </a>`;
}

function renderCards(locale) {
  const labels = locale.projetos;
  return projects
    .map((p) => {
      const projectUrl = locale.prefix === "/en/"
        ? `/en/projects/${p.slug}/`
        : `/projetos/${p.slug}/`;
      const tags = p.tags
        .map((tag) => {
          const ic = tag.icon ? icon(tag.icon) : "";
          return `                <span class="tag">${ic}${esc(tag.nome)}</span>`;
        })
        .join("\n");
      const external = p.links.length
        ? cardLinkButton(
            labels[p.links[0].key] ?? p.links[0].key,
            p.links[0].href,
            false
          )
        : "";
      return `        <article class="card" data-anime="up" data-category="${p.category}">
          <a class="card-link" href="${projectUrl}" aria-label="${esc(t(p.thumbAlt, locale))}">
          <div class="card-img-wrapper">
            <img
              src="${p.thumb}"
              alt="${esc(t(p.thumbAlt, locale))}"
              width="${p.thumbWidth}"
              height="${p.thumbHeight}"
              loading="lazy"
              decoding="async"
            />
            <span class="card-badge">${esc(labels.badges[p.category])}</span>
          </div>
          </a>
          <div class="card-body">
            <h3><a class="card-title-link" href="${projectUrl}">${esc(p.title)}</a></h3>
            <div class="tags">
${tags}
            </div>
            <p>${esc(t(p.summary, locale))}</p>
            <div class="card-actions">
              <a class="ButtonSend" href="${projectUrl}">${esc(labels.verProjeto)}
                ${icon("arrow-up-right", "btn-icon")}
              </a>
${external}
            </div>
          </div>
        </article>`;
    })
    .join("\n\n");
}

function renderContact(locale) {
  const endpoint = site.formspreeEndpoint ?? "";
  const f = locale.contato.form;
  const id = locale.prefix === "/en/" ? "contact" : "contato";
  const form = endpoint
    ? `          <form class="contato-form" data-endpoint="${esc(endpoint)}" aria-label="${esc(f.aria)}">
            <div class="form-row">
              <input type="text" name="nome" aria-label="${esc(f.nome)}" placeholder="${esc(f.nome)}" autocomplete="name" required />
              <input type="email" name="email" aria-label="${esc(f.email)}" placeholder="${esc(f.email)}" autocomplete="email" required />
            </div>
            <textarea name="mensagem" rows="5" aria-label="${esc(f.mensagem)}" placeholder="${esc(f.mensagem)}" required></textarea>
            <button class="ButtonSend" type="submit">${esc(f.enviar)}</button>
            <p class="form-status" role="status" aria-live="polite"></p>
          </form>`
    : `          <p class="form-fallback-note">${esc(f.erro)}</p>`;
  return `      <section class="sessao-contato" id="${id}">
        <div class="sessao-header" data-anime="up">
          <h2>${esc(locale.contato.titulo)}</h2>
        </div>
        <div class="contato-conteudo" data-anime="up">
          <p>${esc(locale.contato.intro)}</p>
          <a class="contato-email" href="mailto:${site.email}">${site.email}</a>
${form}
${socialLinks(locale)}
        </div>
      </section>`;
}

function renderHome(localeKey) {
  const locale = locales[localeKey];
  const isEn = localeKey === "en";
  const ptPath = isEn ? "" : "";
  const enPath = isEn ? "en/" : "en/";
  const ids = {
    top: "top",
    sobre: isEn ? "about" : "sobre",
    conhecimentos: isEn ? "skills" : "conhecimentos",
    experiencia: isEn ? "experience" : "experiencia",
    projetos: isEn ? "projects" : "projetos",
    contato: isEn ? "contact" : "contato"
  };
  const casePathBase = isEn ? "/en/projects/" : "/projetos/";

  const navLinks = locale.nav
    .map(
      (item) =>
        `          <li><a class="nav-link" href="#${item.id}">${esc(item.label)}</a></li>`
    )
    .join("\n");

  const menuLinks = locale.nav
    .map(
      (item, i) =>
        `          <li id="menu-${i + 1}" class="menu-item">
            <a class="menu-link nav-link" href="#${item.id}">${esc(item.label)}</a>
          </li>`
    )
    .join("\n");

  const stats = locale.sobre.stats
    .map((stat) => {
      const target =
        stat.target === "anos"
          ? yearsExp
          : stat.target === "projetos"
            ? projects.length
            : stat.target;
      const dataStat = stat.target === "anos" ? ' data-stat="anos"' : "";
      return `            <div class="stat">
              <span class="stat-num"${dataStat} data-target="${target}">0</span>
              <span class="stat-label">${esc(stat.label)}</span>
            </div>`;
    })
    .join("\n");

  const filtros = locale.projetos.filtros
    .map(
      (f, i) =>
        `          <button class="filter-chip${i === 0 ? " active" : ""}" data-filter="${f.id}" type="button">${esc(f.label)}</button>`
    )
    .join("\n");

  const jsonLd = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Lucas Oliveira",
    url: `${site.siteUrl}/${isEn ? "en/" : ""}`,
    email: `mailto:${site.email}`,
    jobTitle: locale.sobre.cargo,
    sameAs: [site.github, site.linkedin],
    knowsAbout: locale.marquee
  }).replace(/</g, "\\u003c");

  const body = `      <!-- Topbar (desktop) -->
      <nav class="topbar" aria-label="${esc(locale.aria.nav)}">
        <a href="#top" class="topbar-logo">Lucas<span>Oliveira</span></a>
        <ul class="topbar-menu">
${navLinks}
        </ul>
        <div class="topbar-actions">
${langSwitch(locale, locale.otherPrefix).trim().replace(/^      /, "          ")}
${themeToggle(locale).trim().replace(/^      /, "          ")}
        </div>
      </nav>

      <!-- Hamburguer (mobile) -->
      <button
        class="hamburguer js-menu-toggle"
        aria-label="${esc(locale.aria.menuAbrir)}"
        aria-expanded="false"
        aria-controls="site-menu"
        data-label-open="${esc(locale.aria.menuAbrir)}"
        data-label-close="${esc(locale.aria.menuFechar)}"
      >
        <span class="line" id="line1"></span>
        <span class="line" id="line2"></span>
        <span class="line" id="line3"></span>
        <span class="hamburguer-label">${isEn ? "Close" : "Fechar"}</span>
      </button>

${themeToggle(locale, true)}

      <a class="lang-fixed" href="${locale.otherPrefix}" hreflang="${locale.langHreflang}" lang="${locale.langHreflang}">${locale.langLabel}</a>

      <main id="conteudo">
      <header id="top">
        <div class="aurora" aria-hidden="true">
          <span class="aurora-blob aurora-1"></span>
          <span class="aurora-blob aurora-2"></span>
          <span class="aurora-blob aurora-3"></span>
        </div>
        <div class="banner">
          <p class="banner-ola">${esc(locale.hero.ola)}</p>
          <h1>Lucas Oliveira</h1>
          <p class="banner-typing">
            ${esc(locale.hero.typedPrefix)}
            <span class="typewriter" id="typewriter">${esc(locale.hero.typedWords[0])}</span><span
              class="typing-cursor"
              aria-hidden="true"
            ></span>
          </p>
          <p class="banner-desc">
            <span id="anos-exp">${yearsExp}</span> ${locale.hero.desc}
          </p>
          <div class="banner-ctas" id="button-banner">
            <a class="ButtonCustom" href="#${ids.sobre}">${esc(locale.hero.ctaPrimario)}</a>
            <a class="ButtonSend outline banner-cta-secondary" href="#${ids.contato}">${esc(locale.hero.ctaSecundario)}</a>
          </div>
        </div>
      </header>

${renderMarquee(locale.marquee)}

      <!-- Sobre -->
      <section class="sessao-sobre" id="${ids.sobre}">
        <div class="sessao-header" data-anime="up">
          <h2>${esc(locale.sobre.titulo)}</h2>
        </div>
        <div class="bento">
          <div class="bento-item bento-foto" data-anime="left">
            <img
              src="/media/foto.jpg"
              alt="${isEn ? "Photo of Lucas Oliveira" : "Foto de Lucas Oliveira"}"
              width="640"
              height="800"
              loading="eager"
              decoding="async"
            />
          </div>
          <div class="bento-item bento-bio" data-anime="up">
            <h3>${esc(locale.sobre.cargo)}</h3>
            <p>${locale.sobre.bioP1}</p>
            <p>${locale.sobre.bioP2}</p>
          </div>
          <div class="bento-item bento-stats" data-anime="up">
${stats}
          </div>
          <div class="bento-item bento-cv" data-anime="right">
            <h3>${esc(locale.sobre.cv.titulo)}</h3>
            <p>${esc(locale.sobre.cv.texto)}</p>
            <a
              class="ButtonSend"
              href="/media/Curriculo.pdf"
              target="_blank"
              rel="noopener noreferrer"
              >${esc(locale.sobre.cv.botao)}</a
            >
          </div>
          <div class="bento-item bento-github" data-anime="up" hidden>
            <div class="gh-identity">
              <span class="gh-avatar-wrap">${icon("github", "gh-avatar")}</span>
              <div>
                <h3>${esc(locale.sobre.github.titulo)}</h3>
                <p>${esc(locale.sobre.github.texto)}</p>
              </div>
            </div>
            <div class="gh-stats">
              <div class="gh-stat">
                <span class="stat-num" data-gh="repos">–</span>
                <span class="stat-label">${esc(locale.sobre.github.repos)}</span>
              </div>
            </div>
            <a
              class="ButtonSend outline"
              href="${site.github}"
              target="_blank"
              rel="noopener noreferrer"
              >${esc(locale.sobre.github.botao)}
              ${icon("arrow-up-right", "btn-icon")}</a
            >
          </div>
        </div>
      </section>

      <!-- Conhecimentos -->
      <section class="sessao-conhecimentos" id="${ids.conhecimentos}">
        <div class="sessao-header" data-anime="up">
          <h2>${esc(locale.conhecimentos.titulo)}</h2>
        </div>
        <div class="conhecimentos">
${renderSkills(locale)}
        </div>
      </section>

      <!-- Experiência -->
      <section class="sessao-experiencia" id="${ids.experiencia}">
        <div class="sessao-header" data-anime="up">
          <h2>${esc(locale.experiencia.titulo)}</h2>
        </div>
        <div class="timeline">
${renderTimeline(locale)}
        </div>
      </section>

      <!-- Projetos -->
      <section class="sessao-projetos" id="${ids.projetos}">
        <div class="sessao-header" data-anime="up">
          <h2>${esc(locale.projetos.titulo)}</h2>
        </div>
        <div class="filter-bar" role="group" aria-label="${esc(locale.aria.filtro)}">
${filtros}
        </div>
        <div class="cards" data-less="${esc(locale.projetos.menos)}">
${renderCards(locale)}
        </div>
      </section>

${renderContact(locale)}
      </main>

${footer(locale)}

      <!-- Sidebar (mobile) -->
      <aside class="sidebar" id="site-menu">
        <nav>
          <ul class="menu">
${menuLinks}
          </ul>
        </nav>
${socialLinks(locale)}
      </aside>`;

  return page({
    locale,
    ptPath,
    enPath,
    title: locale.meta.title,
    description: locale.meta.description,
    jsonLd,
    body
  });
}

/* ---------------- case study page ---------------- */

function caseUrlFor(p, localeKey) {
  return localeKey === "en"
    ? `/en/projects/${p.slug}/`
    : `/projetos/${p.slug}/`;
}

function renderCaseStudy(p, localeKey) {
  const locale = locales[localeKey];
  const cs = p.caseStudy;
  const isEn = localeKey === "en";
  const ptPath = isEn ? `projetos/${p.slug}/` : `projetos/${p.slug}/`;
  const enPath = isEn ? `en/projects/${p.slug}/` : `en/projects/${p.slug}/`;
  const idx = projects.indexOf(p);
  const prev = projects[(idx - 1 + projects.length) % projects.length];
  const next = projects[(idx + 1) % projects.length];
  const homeUrl = isEn ? "/en/" : "/";
  const projectsUrl = isEn ? "/en/#projects" : "/#projetos";
  const sec = locale.case.secoes;

  const links = p.links
    .map(
      (link) =>
        `            <a
              class="ButtonSend${link.key === "codigo" ? " outline" : ""}"
              href="${link.href}"
              target="_blank"
              rel="noopener noreferrer"
              >${esc(locale.projetos[link.key] ?? link.key)}
              ${icon("arrow-up-right", "btn-icon")}</a
            >`
    )
    .join("\n");

  const tags = p.tags
    .map((tag) => {
      const ic = tag.icon ? icon(tag.icon) : "";
      return `              <span class="tag">${ic}${esc(tag.nome)}</span>`;
    })
    .join("\n");

  const papelItens = cs.papelItens[localeKey]
    .map((li) => `            <li>${li}</li>`)
    .join("\n");
  const destaques = cs.destaques[localeKey]
    .map((li) => `            <li>${icon("check", "case-check")}${esc(li)}</li>`)
    .join("\n");

  const jsonLd = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: p.title,
    headline: t(cs.subtitle, locale),
    description: t(p.summary, locale),
    inLanguage: locale.code,
    author: {
      "@type": "Person",
      name: "Lucas Oliveira",
      url: site.siteUrl
    },
    url: `${site.siteUrl}/${isEn ? enPath : ptPath}`
  }).replace(/</g, "\\u003c");

  const body = `      <nav class="topbar topbar-simple" aria-label="${esc(locale.aria.nav)}">
        <a href="${homeUrl}" class="topbar-logo">Lucas<span>Oliveira</span></a>
        <div class="topbar-actions">
${langSwitch(locale, caseUrlFor(p, isEn ? "pt" : "en")).trim().replace(/^      /, "          ")}
${themeToggle(locale).trim().replace(/^      /, "          ")}
        </div>
      </nav>

${themeToggle(locale, true)}

      <a class="lang-fixed" href="${caseUrlFor(p, isEn ? "pt" : "en")}" hreflang="${locale.langHreflang}" lang="${locale.langHreflang}">${locale.langLabel}</a>

      <main id="conteudo" class="case-page">
        <article class="case">
          <nav class="case-breadcrumb" data-anime="up">
            <a class="case-voltar" href="${projectsUrl}">${icon("arrow-left", "btn-icon")} ${esc(locale.case.voltar)}</a>
          </nav>

          <header class="case-hero" data-anime="up">
            <span class="case-badge">${esc(locale.projetos.badges[p.category])}</span>
            <h1>${esc(p.title)}</h1>
            <p class="case-subtitle">${esc(t(cs.subtitle, locale))}</p>
            <div class="case-meta">
              <div class="case-meta-item">
                <span class="case-meta-label">${esc(locale.case.periodo)}</span>
                <span class="case-meta-value">${esc(t(cs.periodo, locale))}</span>
              </div>
              <div class="case-meta-item">
                <span class="case-meta-label">${esc(locale.case.papel)}</span>
                <span class="case-meta-value">${esc(t(cs.papel, locale))}</span>
              </div>
            </div>
            ${cs.anon ? `<p class="case-anon">${icon("lock", "btn-icon")} ${esc(locale.case.anon)}</p>` : ""}
          </header>

          <div class="case-cover" data-anime="up">
            <img
              src="${p.thumb}"
              alt="${esc(t(p.thumbAlt, locale))}"
              width="${p.thumbWidth}"
              height="${p.thumbHeight}"
              loading="eager"
              decoding="async"
            />
          </div>

          <div class="case-body">
            <section class="case-section" data-anime="up">
              <h2>${esc(sec.contexto)}</h2>
              <p>${esc(t(cs.contexto, locale))}</p>
            </section>
            <section class="case-section" data-anime="up">
              <h2>${esc(sec.desafio)}</h2>
              <p>${esc(t(cs.desafio, locale))}</p>
            </section>
            <section class="case-section" data-anime="up">
              <h2>${esc(sec.papel)}</h2>
              <ul class="case-list">
${papelItens}
              </ul>
            </section>
            <section class="case-section" data-anime="up">
              <h2>${esc(sec.stack)}</h2>
              <p>${esc(t(cs.stack, locale))}</p>
              <div class="tags">
${tags}
              </div>
            </section>
            <section class="case-section" data-anime="up">
              <h2>${esc(locale.case.destaques)}</h2>
              <ul class="case-list case-highlights">
${destaques}
              </ul>
            </section>
            <section class="case-section" data-anime="up">
              <h2>${esc(sec.aprendizados)}</h2>
              <p class="case-aprendizado">${esc(t(cs.aprendizados, locale))}</p>
            </section>
${links ? `            <div class="case-links" data-anime="up">
${links}
            </div>` : ""}
          </div>

          <nav class="case-nav" aria-label="${isEn ? "Projects" : "Projetos"}" data-anime="up">
            <a class="case-nav-item case-nav-prev" href="${caseUrlFor(prev, localeKey)}">
              <span class="case-nav-label">${icon("chevron-left", "btn-icon")} ${esc(locale.case.anterior)}</span>
              <span class="case-nav-title">${esc(prev.title)}</span>
            </a>
            <a class="case-nav-item case-nav-all" href="${projectsUrl}">${esc(locale.case.maisProjetos)}</a>
            <a class="case-nav-item case-nav-next" href="${caseUrlFor(next, localeKey)}">
              <span class="case-nav-label">${esc(locale.case.proximo)} ${icon("chevron-right", "btn-icon")}</span>
              <span class="case-nav-title">${esc(next.title)}</span>
            </a>
          </nav>
        </article>
      </main>

${footer(locale)}`;

  return page({
    locale,
    ptPath,
    enPath,
    title: `${p.title} - Projeto | Lucas Oliveira`,
    description: t(cs.subtitle, locale),
    ogType: "article",
    jsonLd,
    body,
    withConfig: false
  });
}

/* ---------------- 404 ---------------- */

function render404() {
  const locale = locales.pt;
  const body = `      <main class="pagina-404" id="conteudo">
        <p class="codigo-404">404</p>
        <h1>${esc(locale.erro404.titulo)}</h1>
        <p>${esc(locale.erro404.texto)}</p>
        <div class="acoes-404">
          <a class="ButtonCustom" href="/">${esc(locale.erro404.voltar)}</a>
          <a class="ButtonSend outline" href="/#projetos">${esc(locale.erro404.projetos)}</a>
        </div>
      </main>`;
  return page({
    locale,
    ptPath: "",
    enPath: "en/",
    title: `${locale.erro404.titulo} - Lucas Oliveira`,
    description: locale.erro404.texto,
    body,
    withConfig: false
  });
}

/* ---------------- sitemap & robots ---------------- */

function renderSitemap() {
  const entries = [
    { pt: "", en: "en/" },
    ...projects.map((p) => ({
      pt: `projetos/${p.slug}/`,
      en: `en/projects/${p.slug}/`
    }))
  ];
  const urls = entries
    .map(({ pt, en }) => {
      const ptUrl = `${site.siteUrl}/${pt}`;
      const enUrl = `${site.siteUrl}/${en}`;
      return `  <url>
    <loc>${ptUrl}</loc>
    <xhtml:link rel="alternate" hreflang="pt-BR" href="${ptUrl}" />
    <xhtml:link rel="alternate" hreflang="en" href="${enUrl}" />
    <xhtml:link rel="alternate" hreflang="x-default" href="${ptUrl}" />
  </url>
  <url>
    <loc>${enUrl}</loc>
    <xhtml:link rel="alternate" hreflang="pt-BR" href="${ptUrl}" />
    <xhtml:link rel="alternate" hreflang="en" href="${enUrl}" />
    <xhtml:link rel="alternate" hreflang="x-default" href="${ptUrl}" />
  </url>`;
    })
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls}
</urlset>
`;
}

/* ---------------- main ---------------- */

function main() {
  rmSync(dist, { recursive: true, force: true });
  mkdirSync(dist, { recursive: true });

  cpSync(join(root, "assets"), join(dist, "assets"), { recursive: true });
  cpSync(join(root, "media"), join(dist, "media"), { recursive: true });
  cpSync(join(root, ".nojekyll"), join(dist, ".nojekyll"));

  writeFileSync(join(dist, "index.html"), renderHome("pt"));
  mkdirSync(join(dist, "en"), { recursive: true });
  writeFileSync(join(dist, "en", "index.html"), renderHome("en"));

  for (const p of projects) {
    mkdirSync(join(dist, "projetos", p.slug), { recursive: true });
    writeFileSync(join(dist, "projetos", p.slug, "index.html"), renderCaseStudy(p, "pt"));
    mkdirSync(join(dist, "en", "projects", p.slug), { recursive: true });
    writeFileSync(join(dist, "en", "projects", p.slug, "index.html"), renderCaseStudy(p, "en"));
  }

  writeFileSync(join(dist, "404.html"), render404());
  writeFileSync(join(dist, "sitemap.xml"), renderSitemap());
  writeFileSync(
    join(dist, "robots.txt"),
    `User-agent: *\nAllow: /\n\nSitemap: ${site.siteUrl}/sitemap.xml\n`
  );

  console.log("Build OK -> dist/");
  console.log(`  Páginas: 2 home + ${projects.length * 2} case studies + 404`);
}

main();
