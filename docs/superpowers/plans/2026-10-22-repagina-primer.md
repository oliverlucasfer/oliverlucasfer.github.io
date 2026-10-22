# Repaginação Primer Azul — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Repaginar o portfólio com a estrutura visual do GitHub Primer, acento azul, temas claro/escuro e movimento contido, preservando conteúdo, URLs, SEO e a identidade do Lucas.

**Architecture:** Manter o gerador estático em `build.mjs` e o CSS/JS vanilla. Trocar os tokens e reescrever os componentes no `style.css`, ajustar o markup gerado apenas onde o spec exige (terminal, stack, meta, índices de seção) e remover as dependências visuais antigas (Lenis, grain, scroll-progress, tilt, magnético, aurora, PNG 3D). Nenhuma dependência nova de runtime.

**Tech Stack:** Node 18+, CSS puro, JS vanilla, fontes self-hosted Inter/JetBrains Mono, sprite SVG local, GitHub Pages.

**Spec:** `docs/superpowers/specs/2026-10-22-repagina-primer-design.md`

## Global Constraints

- Acento escuro: `--accent: #58A6FF` (texto/links), `--accent-strong: #1F6FEB` (ações sólidas), `--accent-hover: #388BFD`. Claro: `--accent: #0969DA`, `--accent-strong: #0969DA`, `--accent-hover: #0550AE`.
- Canvas escuro `#0D1117`; superfície `#161B22`; inset `#010409`; texto `#E6EDF3`; muted `#8B949E`; borda `#30363D`.
- Canvas claro `#FFFFFF`; superfície `#F6F8FA`; inset `#EAEEF2`; texto `#1F2328`; muted `#59636E`; borda `#D0D7DE`.
- Raio 6px em cards, botões e inputs; 999px em chips/badges; 4px em detalhes.
- Fonte principal Inter; JetBrains Mono só em micro-rótulos, metadados, código e índices. Títulos não são mono.
- Grid base 8px; seções com `padding` 88px desktop / 64px tablet / 48px mobile.
- Breakpoints: 768px e 1024px. Abaixo de 768px é mobile.
- Sem novas dependências de runtime. Sem importar `@primer/*`, Atlaskit, fontes ou assets do GitHub/Atlassian.
- Conteúdo atual preservado. Únicos textos novos: `hero.metaLocal`, `hero.metaStatus`, `sobre.stackLabel`, `sobre.stackValue` (PT/EN conforme spec §10).
- Terminal do hero é HTML real e decorativo (`aria-hidden="true"`): `$ node build.mjs`, `✓ dist/`, `$ git push origin master`, `✓ deploy`. Sem métricas inventadas.
- `prefers-reduced-motion: reduce` desliga reveal, typing, contadores e hovers de movimento. Conteúdo continua visível sem JS.
- Temas claro/escuro preservam `localStorage.theme`, `prefers-color-scheme` e `meta[name="theme-color"]`.
- Case pages mantêm `topbar-simple`; home mantém nav completa e sidebar mobile.
- URLs, slugs, títulos, descriptions, hreflang, JSON-LD, sitemap e robots não mudam.
- Lighthouse: Performance ≥ 90, Acessibilidade ≥ 95, SEO = 100.
- Não tocar no demo `listacompras/` nem na página de privacidade.

## Review Focus

1. **Tema salvo + sistema:** com `localStorage.theme=light` e SO escuro, a página abre clara sem flash; com `theme=dark` e SO claro, abre escura. `meta[name="theme-color"]` acompanha.
2. **Mobile a 390px:** menu abre/fecha, Escape fecha, links funcionam, body não rola atrás do sidebar e nenhuma seção tem overflow horizontal.
3. **Case study com título/tags longos:** `smartschool` e `catalogo-filmes` em PT/EN a 390/768/1280 não quebram o hero, a cover ou a navegação anterior/próximo.
4. **Reduced motion / no-JS:** com `prefers-reduced-motion` ou JS desabilitado, todo `[data-anime]` está visível; typing, contadores e reveal não escondem conteúdo.
5. **GitHub API indisponível:** card `.bento-github` fica oculto; o grid Sobre continua íntegro com bio/stats/stack, sem espaço vazio ou overflow.

---

### Task 1: Fundação — tokens, shell, nav e remoção do legado

**Files:**
- Modify: `assets/css/style.css` (`:root`, `:root[data-theme="light"]`, base, `.topbar`, `.hamburguer`, `.sidebar`, `.ButtonCustom`, `.ButtonSend`, `.theme-toggle`, `.lang-pill`, `.back-to-top`, `.skip-link`, `.container`)
- Modify: `build.mjs` (`head`, `themeScript`, `page`)
- Modify: `assets/js/app.js` (theme-color, remover Lenis/progress/card mousemove/magnético)
- Delete: `assets/vendor/lenis.min.js`
- Test: comandos Node + Playwright

**Interfaces:**
- Produces: tokens CSS `--bg`, `--bg-elev`, `--bg-inset`, `--text`, `--muted`, `--border`, `--border-strong`, `--accent`, `--accent-strong`, `--accent-hover`, `--accent-soft`, `--accent-border`, `--success`, `--warning`, `--danger`, `--radius-card`, `--radius-btn`, `--radius-input`.
- Produces: `page()` sem `.scroll-progress`, `.grain` e `<script src="/assets/vendor/lenis.min.js">`.
- Produces: `applyTheme()` atualiza `theme-color` para `#FFFFFF`/`#0D1117`.

- [ ] **Step 1: Escrever o check que falha**

```powershell
node -e "const fs=require('fs');const c=fs.readFileSync('assets/css/style.css','utf8');for(const t of ['--bg: #0D1117','--accent: #58A6FF','--accent-strong: #1F6FEB','--radius-card: 6px','--bg: #FFFFFF','--accent: #0969DA']) if(!c.includes(t)){console.error('FALTA '+t);process.exit(1)}"
```

Expected: FAIL com `FALTA --bg: #0D1117`.

- [ ] **Step 2: Substituir os tokens**

No `:root`, definir os valores escuros do spec §8.1; em `:root[data-theme="light"]`, os claros. Manter `--font-primary` e `--font-mono`. Adicionar `--radius-card: 6px`, `--radius-btn: 6px`, `--radius-input: 6px`, `--radius-pill: 999px`, `--shadow-card: none`, `--shadow-hover: 0 8px 24px rgba(1,4,9,.35)` e `color-scheme: dark`; no claro, `color-scheme: light` e `--shadow-hover: 0 8px 24px rgba(31,35,40,.08)`.

- [ ] **Step 3: Base, foco e tipografia**

`body` com Inter, `background: var(--bg)`, `color: var(--text)`, `line-height: 1.6`. `:focus-visible` com `outline: 2px solid var(--accent)`, `outline-offset: 2px`, `border-radius: calc(var(--radius-btn) + 2px)`. `::selection` com `background: var(--accent); color: #fff`. `html { scroll-padding-top: 88px; }`. Títulos com Inter e `letter-spacing` do spec §8.2.

- [ ] **Step 4: Nav, botões e chrome**

`.topbar`: 64px, sticky, `background: color-mix(in srgb, var(--bg) 84%, transparent)`, `backdrop-filter: blur(12px)`, borda inferior `var(--border)`. `.topbar-logo` permanece mono, `span` em `var(--accent)`. `.topbar-menu a` 12px Inter, ativo `var(--text)`. `.lang-pill`, `.theme-toggle`, `.hamburguer` e `.back-to-top` em 6px/28–32px, borda `var(--border)`, hover `var(--border-strong)`. `.ButtonCustom`/`.ButtonSend`: 6px, `background: var(--accent-strong)`, `color: #fff`, `box-shadow: none`; `.outline` transparente com borda. Sidebar mobile com superfície `--bg-elev`, borda e links Inter.

- [ ] **Step 5: Remover o legado do shell**

Em `build.mjs`:
- Remover `<div class="scroll-progress">` e `<div class="grain">` de `page()`.
- Remover `<script src="/assets/vendor/lenis.min.js" defer>`.
- Trocar o preload de `jetbrains-mono.woff2` por `inter.woff2`.
- Trocar `meta name="theme-color"` para `#0D1117`.

Em `app.js`:
- Remover o bloco `if (window.Lenis ...)`.
- Remover o bloco `const progressBar = ...` e o listener de scroll.
- Remover `document.querySelectorAll(".card").forEach(...)` que define `--mx/--my`.
- Remover o bloco `if (!prefersReducedMotion ...) { document.querySelectorAll(".ButtonCustom, .ButtonSend")... }`.
- No `backToTop`, trocar o branch `window.__lenis` por `window.scrollTo({ top: 0, behavior: prefersReducedMotion ? "auto" : "smooth" })`.
- `applyTheme()`: `theme === "light" ? "#FFFFFF" : "#0D1117"`.

Remover o arquivo com `git rm assets/vendor/lenis.min.js`.

- [ ] **Step 6: Build e check**

```powershell
node build.mjs
node -e "const fs=require('fs');const h=fs.readFileSync('dist/index.html','utf8');for(const s of ['scroll-progress','grain','lenis.min.js']) if(h.includes(s)){console.error('LEGADO '+s);process.exit(1)}; console.log('shell ok')"
```

Expected: `Build OK` e `shell ok`.

- [ ] **Step 7: Conferência visual**

Servir `dist/` e abrir a home em 1280px e 390px, claro e escuro. Nav, logo, botões e foco visíveis; sem overflow; menu mobile abre/fecha e Escape fecha.

- [ ] **Step 8: Commit**

```powershell
git add assets/css/style.css assets/js/app.js build.mjs
git add -u assets/vendor/lenis.min.js
git commit -m "refactor: aplica tokens e shell do novo design system"
```

---

### Task 2: Hero, terminal HTML e índices de seção

**Files:**
- Modify: `build.mjs` (`renderHome` hero; novo `sectionHeader`)
- Modify: `data/site.json` (`hero.metaLocal`, `hero.metaStatus` PT/EN)
- Modify: `assets/css/style.css` (`.aurora`, `.hero-logo`, `.banner`, `.hero-terminal`, `.hero-meta`, `.sessao-header`, `.section-kicker`)
- Test: comandos Node + Playwright

**Interfaces:**
- Consumes: tokens da Task 1.
- Produces: `sectionHeader(index: number, title: string): string` em `build.mjs`, usado pelas 5 seções da home.
- Produces: markup `.hero-terminal` com exatamente 4 linhas e `.hero-meta` com duas informações.

- [ ] **Step 1: Escrever o check que falha**

```powershell
node -e "const fs=require('fs');const h=fs.readFileSync('dist/index.html','utf8');for(const s of ['hero-terminal','hero-meta','section-kicker','node build.mjs']) if(!h.includes(s)){console.error('FALTA '+s);process.exit(1)};if(h.includes('hero-logo.png')){console.error('PNG antigo');process.exit(1)}"
```

Expected: FAIL com `FALTA hero-terminal`.

- [ ] **Step 2: Adicionar os dois textos**

Em `data/site.json`, em `locales.pt.hero`, adicionar `"metaLocal": "Barreiras, BA"` e `"metaStatus": "Disponível para conversar"`. Em `locales.en.hero`, `"metaLocal": "Barreiras, BA"` e `"metaStatus": "Open to a conversation"`.

- [ ] **Step 3: Trocar o hero**

Em `renderHome`, remover o `<div class="aurora">` e o `<img class="hero-logo" ...>`. Inserir, no lugar da imagem, dentro de `<header id="top">`:

```html
<div class="hero-terminal" aria-hidden="true">
  <div class="hero-terminal-bar"><span></span><span></span><span></span><em>lucas@portfolio: ~</em></div>
  <div class="hero-terminal-body">
    <p><b>$</b> node build.mjs</p>
    <p class="ok">✓ dist/</p>
    <p><b>$</b> git push origin master</p>
    <p class="ok">✓ deploy</p>
  </div>
</div>
```

Depois do bloco `.banner-ctas`, adicionar:

```html
<p class="hero-meta"><span>${esc(locale.hero.metaLocal)}</span><i>·</i><span>${esc(locale.hero.metaStatus)}</span></p>
```

- [ ] **Step 4: Criar `sectionHeader` e usar nas 5 seções**

Adicionar antes de `renderHome`:

```js
function sectionHeader(index, title) {
  return `        <div class="sessao-header" data-anime="up">
          <span class="section-kicker" aria-hidden="true">${String(index).padStart(2, "0")}</span>
          <h2>${esc(title)}</h2>
        </div>`;
}
```

Substituir os cinco blocos `.sessao-header` por `sectionHeader(1, locale.sobre.titulo)`, `2` conhecimentos, `3` experiência, `4` projetos, `5` contato. O contato usa `renderContact`, então ajustar lá também.

- [ ] **Step 5: CSS do hero e dos headers**

`.hero`/`header#top`: grid 1.08fr/0.92fr, padding 74px 56px 78px, sem aurora. `h1` Inter `clamp(2.75rem, 5.2vw, 3.875rem)`, `letter-spacing: -0.04em`, sem `text-transform`. `.banner-typing` 16px, `b`/typewriter em `var(--accent)`. `.hero-terminal`: fundo `var(--bg-inset)`, borda, raio 6, barra de 32px com dots, corpo mono 11px/1.9, `.ok` em `var(--success)`. `.hero-meta`: mono 10px, muted, gap 8px, `i` em `var(--accent)`. `.sessao-header`: flex, gap 12px, baseline; `.section-kicker` mono 10px, `var(--accent)`, `letter-spacing: .16em`; `h2` Inter. Remover regras de `.aurora`, `.aurora-blob` e `.hero-logo`.

- [ ] **Step 6: Build, check e screenshot**

```powershell
node build.mjs
node -e "const fs=require('fs');const pt=fs.readFileSync('dist/index.html','utf8');const en=fs.readFileSync('dist/en/index.html','utf8');if(!pt.includes('Barreiras, BA')||!pt.includes('Disponível para conversar'))process.exit(1);if(!en.includes('Open to a conversation'))process.exit(1);console.log('hero ok')"
```

Conferir hero em 1280/390 e ambos os temas. O terminal não pode overflow; em mobile ele empilha abaixo do texto.

- [ ] **Step 7: Commit**

```powershell
git add build.mjs data/site.json assets/css/style.css
git commit -m "feat: substitui o hero pelo terminal e adiciona indices de secao"
```

---

### Task 3: Sobre, GitHub e Conhecimentos

**Files:**
- Modify: `build.mjs` (`renderHome` Sobre; `renderSkills`)
- Modify: `data/site.json` (`sobre.stackLabel`, `sobre.stackValue` PT/EN)
- Modify: `assets/css/style.css` (`.bento`, `.bento-bio`, `.bento-stats`, `.bento-github`, `.bento-stack`, `.conhecimentos`, `.skills-group`, `.skills-chips`, `.chip`)
- Test: comandos Node + Playwright offline

**Interfaces:**
- Consumes: `sectionHeader`, tokens.
- Produces: `.bento-stack` com `h3` e `.stack-value`.
- Produces: `.bento-github` continua `hidden` por padrão e é revelado por `app.js` quando a API responde.

- [ ] **Step 1: Escrever o check que falha**

```powershell
node -e "const fs=require('fs');const pt=fs.readFileSync('dist/index.html','utf8');for(const s of ['bento-stack','Stack atual','.NET · Angular · Flutter · PostgreSQL','bento-github']) if(!pt.includes(s)){console.error('FALTA '+s);process.exit(1)}"
```

Expected: FAIL com `FALTA bento-stack`.

- [ ] **Step 2: Adicionar os textos**

Em `data/site.json`, em `locales.pt.sobre`: `"stackLabel": "Stack atual"`, `"stackValue": ".NET · Angular · Flutter · PostgreSQL"`. Em `locales.en.sobre`: `"stackLabel": "Current stack"`, mesmo `stackValue`.

- [ ] **Step 3: Adicionar o card Stack**

Em `renderHome`, depois do `.bento-github`, adicionar:

```html
<div class="bento-item bento-stack" data-anime="up">
  <h3>${esc(locale.sobre.stackLabel)}</h3>
  <p class="stack-value">${esc(locale.sobre.stackValue)}</p>
</div>
```

- [ ] **Step 4: CSS do Sobre**

`.bento`: grid 12 colunas, gap 16px; `.bento-bio` span 7, `.bento-stats` span 5, `.bento-github` span 7, `.bento-stack` span 5 (ajustar para 2 colunas em 768px). Cards com `background: var(--bg-elev)`, borda, raio 6, padding 24–32px, sem glow. `.bento-bio h3` Inter 22px; `p` 14px/1.7; `strong` `var(--text)`. `.stat-num` Inter 32px azul; labels mono 10px. `.gh-avatar` 20px, `.gh-stat` 28px. `.stack-value` mono 13px, `line-height: 1.6`.

- [ ] **Step 5: CSS de Conhecimentos**

`.conhecimentos`: grid 2×2 gap 16px. `.skills-group`: card `--bg-elev`, borda, raio 6, padding 24. `h3` Inter 16px; `.skills-desc` 12px muted; `.skills-chips` gap 6. `.chip`: pill 999, `background: var(--accent-soft)`, `color: var(--accent)`, borda `var(--accent-border)`, 9px mono, altura 24px. Ícones 16px.

- [ ] **Step 6: Testar API indisponível**

Servir `dist/`, bloquear `api.github.com` no DevTools (ou abrir offline). Esperado: `.bento-github` oculto, sem buraco no grid; bio/stats/stack ocupam o espaço. Com a API disponível, o card aparece com o número real.

- [ ] **Step 7: Build, check e commit**

```powershell
node build.mjs
node -e "const fs=require('fs');const pt=fs.readFileSync('dist/index.html','utf8');const en=fs.readFileSync('dist/en/index.html','utf8');if(!pt.includes('Stack atual')||!en.includes('Current stack'))process.exit(1);console.log('sobre ok')"
git add build.mjs data/site.json assets/css/style.css
git commit -m "feat: reestiliza sobre e conhecimentos"
```

---

### Task 4: Experiência e marquee

**Files:**
- Modify: `assets/css/style.css` (`.timeline`, `.timeline-item`, `.timeline-dot`, `.timeline-card`, `.timeline-periodo`, `.timeline-empresa`, `.marquee`, `.marquee-track`, `.marquee-item`, `.marquee-dot`)
- Modify: `build.mjs` (apenas se precisar de `scroll-margin`; sem mudança de conteúdo)
- Test: comandos Node + screenshot

**Interfaces:**
- Consumes: tokens.
- Produces: timeline com linha e dots azuis; marquee como faixa fina.

- [ ] **Step 1: Check que falha**

```powershell
node -e "const fs=require('fs');const c=fs.readFileSync('assets/css/style.css','utf8');if(!c.includes('animation: marquee 42s linear infinite')){console.error('FALTA marquee 42s');process.exit(1)};console.log('marquee ok')"
```

Expected: FAIL com `FALTA marquee 42s`.

- [ ] **Step 2: CSS da timeline**

`.timeline` com `border-left: 1px solid var(--border)`, padding-left 24px, gap 0. `.timeline-item` grid 160px/1fr, padding-bottom 32px, dot absoluto 9px `var(--accent)` com halo `color-mix`. `.timeline-periodo` mono 10px muted; `.timeline-card h3` Inter 18px; `.timeline-empresa` 11px `var(--accent)`; `p`/`li` 12.5px/1.65 muted; `strong` texto. Mobile: uma coluna.

- [ ] **Step 3: CSS do marquee**

Faixa entre hero e Sobre: `background: var(--bg-elev)`, `border-block: 1px solid var(--border)`, padding 12px 0, máscara lateral. `.marquee-item` mono 10px muted; `.marquee-dot` 4px `var(--accent)`; animação 42s linear. Em `prefers-reduced-motion`, `animation: none`.

- [ ] **Step 4: Build, screenshot e commit**

```powershell
node build.mjs
git add assets/css/style.css
git commit -m "feat: reestiliza experiencia e marquee"
```

Conferir 390/768/1280; a timeline não pode overflow; o marquee não pode causar scroll horizontal.

---

### Task 5: Projetos, contato e footer

**Files:**
- Modify: `build.mjs` (`renderCards`, `renderContact`, `footer`)
- Modify: `assets/css/style.css` (`.cards`, `.card`, `.card--destaque`, `.card-img-wrapper`, `.card-body`, `.card-badge`, `.tags`, `.tag`, `.filter-bar`, `.filter-chip`, `.sessao-contato`, `.contato-conteudo`, `.contato-email`, `.contato-form`, `.form-row`, `.form-status`, `footer`)
- Test: comandos Node + Playwright

**Interfaces:**
- Consumes: tokens.
- Produces: `.card-period` mono; mantém `data-category`, `.filter-chip[data-filter]` e `.card--destaque`.
- Produces: formulário continua condicional a `formspreeEndpoint`; sem endpoint, o fallback é o e-mail + links sociais.

- [ ] **Step 1: Check que falha**

```powershell
node -e "const fs=require('fs');const h=fs.readFileSync('dist/index.html','utf8');const cards=(h.match(/class=\"card(?:\s|\")/g)||[]).length;if(cards!==10){console.error('cards '+cards);process.exit(1)};if(!h.includes('card-period')){console.error('FALTA card-period');process.exit(1)};console.log('ok')"
```

Expected: FAIL com `FALTA card-period`.

- [ ] **Step 2: Adicionar o período ao card**

Em `renderCards`, no `.card-body`, antes do `<h3>`:

```html
<span class="card-period">${esc(t(p.caseStudy.periodo, locale))}</span>
```

- [ ] **Step 3: CSS dos projetos**

`.cards` grid 2 colunas, gap 16px; `.card` `background: var(--bg-elev)`, borda, raio 6, overflow hidden, `box-shadow: none`; hover `translateY(-3px)`, borda forte, 180ms. `.card--destaque` grid-column 1/-1, flex row, min-height 300px; `.card-link` 52%, `.card-img-wrapper` 100%, imagem `object-fit: cover; object-position: left center`. `.card-badge` pill, `background: var(--accent-strong)`, branco, 8px mono; `.card--destaque` badge “Destaque” em `var(--accent)`. `.card-body` padding 22–28; `.card-period` mono 9px azul; `h3` Inter 22/30; `p` 12px muted; `.tag` pill accent-soft; `.card-actions` gap 8. Filtros: `.filter-chip` 30px pill, ativo `var(--text)`/`var(--bg)`.

- [ ] **Step 4: CSS do contato e footer**

`.sessao-contato` com grid 1fr/1fr; `.contato-conteudo` em card `--bg-elev`, borda, raio 6, padding 28; `.contato-email` azul, 14px; `.contato-form` grid gap 12; inputs `--bg-inset`, borda, raio 6, foco azul; `.form-row` 2 colunas em desktop, 1 em mobile. Sem endpoint, o card mostra intro + e-mail + social links, sem espaço reservado para form. Footer: borda superior, 24px padding, 10px mono muted, links azuis.

- [ ] **Step 5: Testar filtros e contato**

Servir `dist/`; clicar Web/Mobile/Estudos e confirmar que os 10 cards são filtrados e o destaque continua primeiro em “Todos”. Sem endpoint, confirmar que não há form vazio e que o e-mail é o CTA. Com endpoint fake, confirmar labels e status.

- [ ] **Step 6: Build, check e commit**

```powershell
node build.mjs
node -e "const fs=require('fs');const h=fs.readFileSync('dist/index.html','utf8');if(!h.includes('card--destaque')||!h.includes('Minhas Listas'))process.exit(1);console.log('projetos ok')"
git add build.mjs assets/css/style.css
git commit -m "feat: reestiliza projetos contato e footer"
```

---

### Task 6: Case study e 404

**Files:**
- Modify: `assets/css/style.css` (`.case-page`, `.case`, `.case-breadcrumb`, `.case-voltar`, `.case-hero`, `.case-badge`, `.case-subtitle`, `.case-meta`, `.case-anon`, `.case-cover`, `.case-body`, `.case-section`, `.case-list`, `.case-highlights`, `.case-aprendizado`, `.case-links`, `.case-nav`, `.pagina-404`, `.codigo-404`, `.acoes-404`)
- Modify: `build.mjs` only if a classe auxiliar for necessária; sem mudança de conteúdo
- Test: comandos Node + screenshots PT/EN

**Interfaces:**
- Consumes: tokens, `.topbar-simple`, `.ButtonSend`.
- Produces: todas as 20 páginas de case com o mesmo template visual; nenhuma rota nova.

- [ ] **Step 1: Check que falha**

```powershell
node -e "const fs=require('fs');const pt=fs.readdirSync('dist/projetos');const en=fs.readdirSync('dist/en/projects');if(pt.length!==10||en.length!==10){console.error('cases',pt.length,en.length);process.exit(1)};const h=fs.readFileSync('dist/projetos/smartschool/index.html','utf8');for(const s of ['case-badge','case-meta','case-cover','case-section']) if(!h.includes(s)){console.error('FALTA '+s);process.exit(1)};console.log('cases ok')"
```

Expected: `cases ok`; se falhar, corrigir o build antes do CSS.

- [ ] **Step 2: CSS do case**

`.case` max-width 860px, padding 40px 24px 64px. `.case-voltar` mono 10px muted → azul no hover. `.case-badge` pill accent-soft/azul, 8px mono. `.case-hero h1` Inter `clamp(2rem,4vw,3rem)`, sem uppercase; subtítulo 15px muted; `.case-meta` flex gap 32, labels mono 9px, values 12px. `.case-anon` borda tracejada, raio 6, 11px. `.case-cover` raio 8, borda, sem sombra. `.case-body` gap 40; `.case-section h2` Inter 20px, sem uppercase, azul? usar `var(--text)` com kicker azul; `p` 14px/1.75 muted; `.case-list` markers azuis; checks 14px. `.case-links` flex gap 8. `.case-nav` grid 1fr auto 1fr, borda, 12px; títulos 14px.

- [ ] **Step 3: CSS do 404**

`.pagina-404` centralizado, `.codigo-404` Inter grande em `var(--accent)`, `h1` Inter, texto mono muted, `.acoes-404` com botão primário azul. Sem alterar o conteúdo.

- [ ] **Step 4: Screenshots de casos longos**

Abrir `/projetos/smartschool/`, `/en/projects/catalogo-filmes/`, `/projetos/minhas-listas/` em 390/768/1280. Conferir: título não estoura, cover não distorce, meta quebra em mobile, nav anterior/próximo não sobrepõe.

- [ ] **Step 5: Build e commit**

```powershell
node build.mjs
git add assets/css/style.css build.mjs
git commit -m "feat: reestiliza paginas de case study e 404"
```

---

### Task 7: Movimento, responsivo e temas

**Files:**
- Modify: `assets/css/style.css` (`[data-anime]`, `.animate`, `@media` 768/1024, `@media (prefers-reduced-motion: reduce)`, `.caret`/typing)
- Modify: `assets/js/app.js` (typing, contadores, reveal, remover resquícios de tilt)
- Test: Playwright 390/768/1280, reduced motion, no-JS

**Interfaces:**
- Consumes: tokens e classes das tasks anteriores.
- Produces: `html.js [data-anime]` só esconde quando JS está ativo; sem JS, tudo visível.
- Produces: reveal 450ms/16px; hover 180ms; contadores 900ms; typing 90ms/char com pausa de 1200ms.

- [ ] **Step 1: Check que falha**

```powershell
node -e "const fs=require('fs');const c=fs.readFileSync('assets/css/style.css','utf8');if(!c.includes('html.js [data-anime]')){console.error('FALTA fallback no-js');process.exit(1)};const j=fs.readFileSync('assets/js/app.js','utf8');if(j.includes('mousemove')&&j.includes('ButtonCustom')){console.error('magnetico ainda presente');process.exit(1)};console.log('motion ok')"
```

Expected: FAIL com `FALTA fallback no-js`.

- [ ] **Step 2: Fallback no-JS e reveal**

Adicionar `document.documentElement.classList.add("js")` no `themeScript` de `build.mjs` (antes do tema). No CSS, trocar `[data-anime] { opacity: 0; ... }` por `html.js [data-anime] { opacity: 0; transform: translateY(16px); transition: opacity .45s, transform .45s; }` e `.animate`/`html.js [data-anime].animate` para estado final. `@media (prefers-reduced-motion: reduce) { html.js [data-anime] { opacity: 1; transform: none; transition: none; } }`.

- [ ] **Step 3: Ajustar o JS**

- Typing: manter o loop; pausa de 1200ms ao completar a palavra; 90ms/char; 45ms ao apagar.
- Contadores: duração 900ms, threshold 0.6, uma vez.
- Reveal: threshold 0.15, rootMargin `0 0 -8% 0`, uma vez.
- Remover qualquer `mousemove` restante em `.card`/botões; manter apenas o tilt do protótipo fora do site.
- `back-to-top`: usar `window.scrollTo({ top: 0, behavior: prefersReducedMotion ? "auto" : "smooth" })`, sem Lenis.
- Tema: manter `localStorage` e `matchMedia`; atualizar `theme-color`.

- [ ] **Step 4: Breakpoints**

Substituir 991/820 por 1024/768: desktop ≥1024, tablet 768–1023, mobile <768. Ajustar `.topbar-menu` (esconde <768), `.hero` (1 coluna <1024), `.bento`/`.conhecimentos`/`.cards`/`.case-nav` (1 coluna <768). `scroll-padding-top: 88px`. Nenhuma seção pode ter `overflow-x` visível.

- [ ] **Step 5: Testar reduced motion**

Com a emulação `prefers-reduced-motion: reduce` no navegador, recarregar a home e um case. Esperado: todo `[data-anime]` com `opacity: 1`; sem typing animado; contadores mostram o valor final; hover não desloca. Testar também com JS desabilitado: conteúdo visível e navegável.

- [ ] **Step 6: Testar mobile**

390px: menu abre/fecha, Escape fecha, links navegam, sidebar não deixa o body rolar, formulário/fallback sem overflow. 768px: grids 2 colunas sem sobreposição. 1280px: layout completo.

- [ ] **Step 7: Build e commit**

```powershell
node build.mjs
git add assets/css/style.css assets/js/app.js build.mjs
git commit -m "feat: ajusta movimento responsivo e temas"
```

---

### Task 8: QA, OG cover, PR e deploy

**Files:**
- Create: `scripts/check-ui.mjs`
- Create: `scripts/make-og.py`
- Modify: `README.md` (estrutura, remoção do Lenis, comando de check)
- Modify: `media/og-cover.png`
- Test: `node build.mjs && node scripts/check-ui.mjs`; Lighthouse; Playwright

**Interfaces:**
- Consumes: tudo das tasks anteriores.
- Produces: check reproduzível `scripts/check-ui.mjs`; OG 1200×630; PR.

- [ ] **Step 1: Criar o check de integração**

`scripts/check-ui.mjs` (Node puro) deve falhar com mensagem clara e verificar:
- `assets/css/style.css` contém `--bg: #0D1117`, `--accent: #58A6FF`, `--accent-strong: #1F6FEB`, `--radius-card: 6px`, tokens claros.
- CSS não contém `#7c5cff` nem `#8b5cf6`.
- `dist/index.html` e `dist/en/index.html` não contêm `hero-logo.png`, `scroll-progress`, `grain`, `lenis.min.js`.
- Home contém `hero-terminal`, `hero-meta`, 5 `section-kicker`, `bento-stack`, 10 cards, 1 `card--destaque`.
- PT contém `Barreiras, BA`, `Disponível para conversar`, `Stack atual`; EN contém `Open to a conversation`, `Current stack`.
- `dist/projetos` e `dist/en/projects` têm 10 diretórios cada; um case contém `case-badge`, `case-meta`, `case-cover`, `case-section`.
- `dist/404.html` existe e contém `pagina-404`.
- `assets/vendor/lenis.min.js` não existe.

- [ ] **Step 2: Rodar o check**

```powershell
node build.mjs
node scripts/check-ui.mjs
```

Expected: `UI OK` e exit 0.

- [ ] **Step 3: Gerar o OG cover**

Criar `scripts/make-og.py` com Pillow: 1200×630, fundo `#0D1117`, grade/terminal sutil em `#161B22`/`#30363D`, wordmark “Lucas Oliveira” em Inter (ou fallback Segoe UI), “Oliveira” em `#58A6FF`, motivo `>_` em `#1F6FEB`, sem copy nova. Salvar `media/og-cover.png` com qualidade alta e peso ≤ 150 KB. Rodar:

```powershell
python scripts/make-og.py
python -c "from PIL import Image; im=Image.open('media/og-cover.png'); print(im.size)"
```

Expected: `(1200, 630)`.

- [ ] **Step 4: Screenshots finais**

Servir `dist/` e capturar, em claro e escuro: home 1280, home 390, `/projetos/minhas-listas/` 1280 e 390, `/en/projects/smartschool/` 768. Conferir visualmente: sem overflow, terminal legível, contraste, badges, foco.

- [ ] **Step 5: Lighthouse**

Abrir PR e deixar o workflow `lighthouse.yml` rodar. Expected: Performance ≥ 90, Acessibilidade ≥ 95, SEO = 100. Se falhar, corrigir antes do merge (não relaxar budgets).

- [ ] **Step 6: Commit, push e PR**

```powershell
git add scripts/check-ui.mjs scripts/make-og.py README.md media/og-cover.png
git commit -m "chore: adiciona check de UI e atualiza og cover"
git push -u origin feat/repagina-primer
gh pr create --base master --head feat/repagina-primer --title "improvement: repagina o portfolio com base no Primer" --body "Aplica a direcao B com acento azul, temas claro/escuro, terminal HTML e movimento contido. Conteudo e URLs preservados."
```

- [ ] **Step 7: Merge e deploy (somente após confirmação do humano)**

Após Lighthouse verde e revisão visual, `gh pr merge --merge`, disparar `deploy.yml` se o merge não disparar, e validar a home e um case em produção. Se o merge não disparar o deploy (já aconteceu antes), rodar `gh workflow run deploy.yml --ref master`.

---

## Self-Review

- **Spec coverage:** tokens/temas (Task 1), hero/terminal (2), Sobre/skills (3), timeline/marquee (4), projetos/contato/footer (5), case/404 (6), motion/responsivo (7), QA/OG/PR (8). Critérios de aceite cobertos pelo check e pelos screenshots.
- **Step scan:** cada passo tem comando/arquivo/seletor ou valor exato; nenhum “handle edge cases” genérico.
- **Type consistency:** `sectionHeader(index, title)` definido na Task 2 e usado nas 5 seções; `card-period` definido e checado; tokens com os mesmos nomes em todas as tasks.
- **Review Focus:** tema (1/7), mobile (1/7), case longo (6), reduced/no-JS (7), GitHub offline (3).
- **Proportion:** o plano descreve decisões e checks; o CSS fica como seletores/valores, não como transcrição.
