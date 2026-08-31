# Portfólio — Lucas Oliveira

Portfólio pessoal estático (HTML/CSS/JS puro no final), com **build local que gera as versões PT-BR e EN a partir de arquivos de dados** — sem duplicação de conteúdo, sem framework no cliente.

**Site:** https://oliverlucasfer.github.io

## Estrutura

```
data/
  site.json          # textos da interface, nav, hero, experiência, contato (PT/EN)
  skills.json        # grupos de conhecimentos (chips, sem percentuais)
  projects.json      # 7 projetos + páginas de projeto completas (PT/EN)
assets/
  icons/             # SVGs de marca (base do sprite gerado no build)
  css/               # estilos (tema claro/escuro via [data-theme])
  vendor/lenis.min.js
build.mjs            # gerador do site (Node puro, zero dependências)
script.js            # JS do cliente (tema, filtros, contadores, GitHub, formulário)
scripts/
  check-lighthouse.mjs
.github/workflows/
  deploy.yml         # build + deploy no GitHub Pages
  lighthouse.yml     # auditoria de performance/acessibilidade/SEO
media/
  og-cover.png       # imagem 1200x630 usada em OG/Twitter
  thumbs/            # capturas dos projetos (webp)
dist/                # saída do build (não versionada)
```

## Editar conteúdo

**Não edite os HTML gerados.** Todo o conteúdo vem de `data/`:

- Textos gerais e experiência: `data/site.json` (chaves `pt` e `en`)
- Projetos e páginas de projeto: `data/projects.json`
- Skills: `data/skills.json`

Depois rode o build (abaixo). Ícones: adicione o SVG em `assets/icons/<nome>.svg` e use `"icon": "<nome>"` no dado.

## Build e preview local

Requisitos: Node 18+.

```bash
node build.mjs          # gera dist/
npx http-server dist    # http://localhost:8080
```

## Deploy

O workflow `.github/workflows/deploy.yml` faz build e publica `dist/` no GitHub Pages a cada push em `main`.

> **Configuração única necessária:** em *Settings → Pages*, mudar **Source** para **"GitHub Actions"** (em vez de "Deploy from a branch"). Sem isso o deploy novo não sobe.

## Lighthouse

`.github/workflows/lighthouse.yml` roda a cada PR/push em `main`, mede as páginas home e um case study e valida os budgets em `scripts/check-lighthouse.mjs` (Performance ≥ 90, Acessibilidade ≥ 95, SEO = 100). Está com `continue-on-error` — após estabilizar, remova a linha para bloquear merges abaixo do budget.

## Checklist antes de publicar

- [ ] **Revisar `data/projects.json`**: as páginas dos projetos da empresa estão anonimizadas (sem cliente, sem métricas internas) — confirme que nada fere confidencialidade.
- [ ] (Opcional) **Formulário de contato**: crie uma conta gratuita no [Formspree](https://formspree.io), copie o endpoint (`https://formspree.io/f/xxxx`) e preencha `"formspreeEndpoint"` no `data/site.json`. Sem endpoint, o site mostra o fallback por e-mail.
- [ ] Mudar o Source do GitHub Pages para "GitHub Actions".
- [ ] Conferir `data/site.json`: `careerStartYear`, e-mail e links sociais.

## Recursos

- Tema claro/escuro com preferência salva (`localStorage`) e respeito ao `prefers-color-scheme`
- Versão EN com URLs próprias (`/en/`) + `hreflang` + `sitemap.xml` + JSON-LD (schema.org Person/CreativeWork)
- Página de projeto em `/projetos/<slug>/` e `/en/projects/<slug>/`
- Ícones de tecnologia em sprite SVG local (zero requests externos de ícone)
- Scroll suave (Lenis local), reveal on scroll, tipografia animada — todos desativados com `prefers-reduced-motion`
- Card do GitHub com dados da API pública (some graciosamente offline)
- Página 404 e `robots.txt`

## Ajustes futuros (ideias)

- Service worker (PWA)
- Blog/seção de artigos
- Remover os arquivos legados da raiz (`index.html`, `en/`, `404.html`, `script.js` antigos) depois que o deploy via Actions estiver validado
