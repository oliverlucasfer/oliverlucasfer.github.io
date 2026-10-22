# Minhas Listas no Portfólio — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publicar o app Minhas Listas como demo web jogável em `/listacompras/` e adicioná-lo como projeto completo (PT/EN) ao portfólio.

**Architecture:** O build web do Flutter passa a usar roteamento por hash apenas no artefato de demo (`--dart-define=DEMO=true`), é montado junto com a página de privacidade e publicado pelo GitHub Pages. O portfólio ganha uma entrada em `data/projects.json`, um rótulo novo de link, uma capa WebP e documentação atualizada.

**Tech Stack:** Flutter 3.44.5 / Dart 3.12, Drift 2.34 (WASM no navegador), GitHub Actions e GitHub Pages; gerador estático em Node puro com JSON; Pillow para a capa.

**Spec:** `docs/superpowers/specs/2026-10-22-minhas-listas-portfolio-design.md` (repositório `oliverlucasfer.github.io`)

## Global Constraints

- Flutter **3.44.5**, canal stable; Dart **3.12**.
- Portfólio: Node 18+, **zero dependências** novas; conteúdo só em `data/`; build com `node build.mjs`.
- App: **sem bump de versão** e sem alterar `web/version.json`.
- App: mudanças de comportamento exigem doc dono atualizado no mesmo PR; **sem segredos** no código, commit ou log.
- URLs exatas: demo `https://oliverlucasfer.github.io/listacompras/`, privacidade `https://oliverlucasfer.github.io/listacompras/privacidade.html`, código `https://github.com/oliverlucasfer/listacompras`.
- Portfólio publica a partir de `master`; app publica a partir de `main`.
- Lighthouse do portfólio: Performance ≥ 90, Acessibilidade ≥ 95, SEO = 100.
- Textos em pt-BR; case study também em inglês.
- O app **não** foi publicado em loja; nenhum texto pode sugerir o contrário.

## Review Focus

1. **Recarregar a demo em uma rota de shell** (`#/listas`, `#/historico`) deve reabrir a mesma tela, sem 404; URL fria com `#/lista/<id>` abre a lista. Abrir lista pelo app não altera a URL (push imperativo do go_router, pré-existente) — Task 1 (steps 5–6) e Task 2 (steps 3 e 10).
2. **Persistência do Drift sem COOP/COEP** no Pages: criar lista, recarregar e os dados continuam (fallback IndexedDB) — Task 2 (steps 3 e 10).
3. **CSP não pode quebrar o Flutter**: bootstrap, CanvasKit e service worker carregam sem erro de console — Task 2 (steps 3 e 10).
4. **Build local/produto não pode herdar o hash**: sem `DEMO`, as rotas continuam por caminho — Task 1 (step 6).
5. **Integridade do portfólio**: rótulo novo renderiza, card conta 10, sitemap e hreflang incluem as duas páginas — Task 3 (step 6).

---

## Task 1: Hash routing opcional no build web

**Files:**
- Modify: `ListaCompras/lib/core/web/url_strategy_web.dart`
- Modify: `ListaCompras/lib/drift/conexao/conexao_web.dart`

**Interfaces:**
- Consumes: `usePathUrlStrategy()`/`setUrlStrategy(HashUrlStrategy())` de `package:flutter_web_plugins/url_strategy.dart`; `QueryExecutor.runCustom` do Drift.
- Produces: `void usarPathUrlStrategy()` com assinatura inalterada; comportamento definido pela constante de ambiente `DEMO`; flush periódico do VFS apenas no build de demo.

- [ ] **Step 1: Implementar a condicional de URL**

Substitua o corpo de `lib/core/web/url_strategy_web.dart` por:

```dart
import 'package:flutter_web_plugins/url_strategy.dart';

/// URLs limpas no web (doc 05 §2, ADR-012); hash apenas no build de demo
/// publicado no GitHub Pages (`--dart-define=DEMO=true`), onde não há rewrite.
void usarPathUrlStrategy() {
  if (const bool.fromEnvironment('DEMO')) {
    setUrlStrategy(HashUrlStrategy());
    return;
  }
  usePathUrlStrategy();
}
```

`useHashUrlStrategy()` não existe no SDK 3.44; `HashUrlStrategy` é a classe exportada pelo mesmo pacote.

- [ ] **Step 1b: Forçar o flush do VFS no build de demo**

Substitua `lib/drift/conexao/conexao_web.dart` por:

```dart
import 'dart:async';

import 'package:drift/drift.dart';
import 'package:drift/wasm.dart';

/// Banco local no navegador via Drift/WASM (OPFS quando disponível;
/// IndexedDB como fallback) — doc 05 §2, ADR-012.
QueryExecutor abrirBancoLocal() {
  return LazyDatabase(() async {
    final result = await WasmDatabase.open(
      databaseName: 'lista_compras',
      sqlite3Uri: Uri.parse('sqlite3.wasm'),
      driftWorkerUri: Uri.parse('drift_worker.js'),
    );
    final executor = result.resolvedExecutor;
    if (const bool.fromEnvironment('DEMO')) {
      _agendarFlushPeriodico(executor);
    }
    return executor;
  });
}

/// O VFS IndexedDB do sqlite3 grava de forma assíncrona e, sem COOP/COEP não
/// há OPFS; escritas dentro de transações só chegam ao IndexedDB quando outra
/// escrita fora de transação acontece. Um `SELECT 1` periódico força o flush
/// no build de demo, evitando perder dados ao recarregar a página.
void _agendarFlushPeriodico(QueryExecutor executor) {
  Timer.periodic(const Duration(seconds: 1), (_) async {
    try {
      await executor.runCustom('SELECT 1');
    } catch (_) {
      // Banco já fechado durante o encerramento da página.
    }
  });
}
```

- [ ] **Step 2: Formatar e analisar**

Run: `dart format lib/core/web/url_strategy_web.dart` e `flutter analyze`
Expected: arquivo formatado; `No issues found!`

- [ ] **Step 3: Rodar a suíte**

Run: `flutter test`
Expected: todos os testes passam.

- [ ] **Step 4: Gerar o build de demo**

Run: `flutter build web --release --base-href /listacompras/ --dart-define=DEMO=true`
Expected: `✓ Built build\web`.

- [ ] **Step 5: Validar hash e reload no build de demo**

Em PowerShell, na raiz do app:

```powershell
Remove-Item -Recurse -Force _preview -ErrorAction SilentlyContinue
New-Item -ItemType Directory -Force _preview\listacompras | Out-Null
Copy-Item -Recurse -Force build\web\* _preview\listacompras
python -m http.server 8099 --directory _preview
```

Abra `http://localhost:8099/listacompras/`, crie uma lista, adicione um item e navegue até a lista.
Expected: a URL passa a conter `#/listas`; após pelo menos 2 segundos, recarregar volta ao índice (o push da lista não muda a URL) e o item continua lá. Feche o servidor e apague `_preview`.

- [ ] **Step 6: Validar que o build normal continua com rotas por caminho**

Run: `flutter build web --release` e sirva `build/web` na raiz (`python -m http.server 8098 --directory build\web`).
Expected: ao navegar, a URL não contém `#` e o app funciona como antes.

- [ ] **Step 7: Commit**

```powershell
git add lib/core/web/url_strategy_web.dart lib/drift/conexao/conexao_web.dart
git commit -m "feat(demo): roteamento por hash e flush de persistência no build publicado"
```

---

## Task 2: Pages publica a demo, com CSP e documentação

**Files:**
- Modify: `ListaCompras/.github/workflows/pages.yml`
- Modify: `ListaCompras/docs/00-visao-geral.md` (tabela de ADRs e linha de escopo)
- Modify: `ListaCompras/docs/05-app-flutter.md` (§2.1)
- Modify: `ListaCompras/docs/06-mvp-entregas.md` (§3.4.1 e §4)
- Modify: `ListaCompras/docs/09-runbook-operacoes.md` (nova seção de demo)
- Modify: `ListaCompras/docs/13-premodelo-tecnico.md` (tabela de ADRs)

**Interfaces:**
- Consumes: build de Task 1 (`DEMO=true` → hash).
- Produces: demo em `https://oliverlucasfer.github.io/listacompras/` e privacidade em `.../privacidade.html`, publicadas a cada push em `main` que toque os caminhos do gatilho.

- [ ] **Step 1: Substituir o workflow**

Conteúdo completo de `.github/workflows/pages.yml`:

```yaml
name: pages
on:
  push:
    branches: [main]
    paths:
      - 'site/**'
      - 'lib/**'
      - 'assets/**'
      - 'web/**'
      - 'pubspec.yaml'
      - 'pubspec.lock'
      - '.github/workflows/pages.yml'
  workflow_dispatch:
permissions:
  contents: read
  pages: write
  id-token: write
concurrency:
  group: pages
  cancel-in-progress: true
jobs:
  publicar:
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deploy.outputs.page_url }}
    steps:
      - uses: actions/checkout@v7
      - uses: subosito/flutter-action@v2
        with:
          channel: stable
          flutter-version: 3.44.5
          cache: true
      - run: flutter pub get
      - run: flutter build web --release --base-href /listacompras/ --dart-define=DEMO=true
      - name: Montar diretório de deploy
        run: |
          mkdir -p _deploy
          cp -R site/. _deploy/
          cp -R build/web/. _deploy/
      - name: Injetar CSP no HTML publicado
        run: |
          python3 - <<'PY'
          from pathlib import Path

          csp = (
              "default-src 'self'; "
              "script-src 'self' 'wasm-unsafe-eval' https://www.gstatic.com; "
              "style-src 'self' 'unsafe-inline'; "
              "img-src 'self' data: blob:; "
              "font-src 'self' data: https://fonts.gstatic.com; "
              "connect-src 'self' https://www.gstatic.com; "
              "worker-src 'self' blob:; "
              "object-src 'none'; base-uri 'self'; form-action 'self'"
          )
          caminho = Path("_deploy/index.html")
          html = caminho.read_text(encoding="utf-8")
          assert "</head>" in html, "index.html sem </head>"
          meta = f'    <meta http-equiv="Content-Security-Policy" content="{csp}">\n'
          caminho.write_text(html.replace("</head>", meta + "</head>", 1), encoding="utf-8")
          PY
      - uses: actions/configure-pages@v5
        with:
          enablement: true
      - uses: actions/upload-pages-artifact@v3
        with:
          path: _deploy
      - id: deploy
        uses: actions/deploy-pages@v4
```

`frame-ancestors` fica de fora porque é ignorado em `<meta>` (docs/06 §3.4.1).

- [ ] **Step 2: Validar o YAML**

Run: `python -c "import yaml, pathlib; yaml.safe_load(pathlib.Path('.github/workflows/pages.yml').read_text(encoding='utf-8')); print('ok')"`
Expected: `ok`.

- [ ] **Step 3: Simular o deploy localmente**

Na raiz do app, com o build da Task 1 já gerado:

```powershell
Remove-Item -Recurse -Force _deploy, _preview -ErrorAction SilentlyContinue
New-Item -ItemType Directory -Force _deploy | Out-Null
Copy-Item -Recurse -Force site\* _deploy
Copy-Item -Recurse -Force build\web\* _deploy
New-Item -ItemType Directory -Force _preview\listacompras | Out-Null
Copy-Item -Recurse -Force _deploy\* _preview\listacompras
```

Rode o script Python do Step 1 sobre `_preview/listacompras/index.html`, sirva `_preview` em `http://localhost:8099` e abra `http://localhost:8099/listacompras/`.
Expected: app carrega; `Invoke-WebRequest -Method Head http://localhost:8099/listacompras/privacidade.html` retorna 200; navegar gera `#/`; recarregar mantém a tela; criar item e recarregar mantém os dados; console sem violação de CSP. Confirme que `Select-String web\index.html -Pattern "Content-Security-Policy"` não retorna nada (template intocado). Apague `_deploy` e `_preview`.

- [ ] **Step 4: Registrar o ADR-016**

Em `docs/00-visao-geral.md`:

1. Na linha de escopo, troque `O Web é o **Lite** (uso local, ADR-013).` por `O Web é o **Lite** (uso local; demo pública de vitrine desde o ADR-016).`
2. Na tabela de ADRs, após a linha do ADR-015, adicione:

```markdown
| ADR-016 | 22/10/2026 | **Demo web público como vitrine.** O build Web passa a ser publicado no GitHub Pages em `https://oliverlucasfer.github.io/listacompras/` como demonstração de portfólio, com roteamento por hash (`--dart-define=DEMO=true`) e CSP injetada no artefato. O Web continua fora dos canais de distribuição do produto. | Não publicar (ADR-013) | O app ainda não está nas lojas e a demo permite experimentar o produto; a hospedagem é gratuita e o Pages já era usado pela política de privacidade. |
```

- [ ] **Step 5: Atualizar o doc dono de entregas**

Em `docs/06-mvp-entregas.md`:

1. Em §3.4.1, acrescente ao fim da seção:

```markdown
* **Demo público (ADR-016):** o workflow `.github/workflows/pages.yml` compila com
  `--dart-define=DEMO=true` (rotas com hash) e injeta a CSP acima em `<meta>` no `index.html`
  do artefato. O Pages não aplica COOP/COEP, então o Drift usa o fallback IndexedDB; o build
  local permanece sem CSP e com rotas por caminho.
```

2. Na tabela de §4, substitua a linha `| Web - **uso local** | ... |` por:

```markdown
| Web - **demo público** | Build `flutter build web --release --base-href /listacompras/ --dart-define=DEMO=true` no GitHub Pages | Vitrine de portfólio (ADR-016), sem suporte a conta, OPFS ou cabeçalhos COOP/COEP; persistência em IndexedDB |
```

- [ ] **Step 6: Atualizar o runbook**

Em `docs/09-runbook-operacoes.md`, adicione uma seção `## Demo web (GitHub Pages)` com:

- URL da demo e da política de privacidade;
- gatilho: push em `main` tocando `site/`, `lib/`, `assets/`, `web/`, `pubspec.*` ou o próprio workflow, além de execução manual;
- build: Flutter 3.44.5 + `--base-href /listacompras/ --dart-define=DEMO=true`;
- montagem: `site/` + `build/web/` em `_deploy`, com CSP injetada em `index.html`;
- diagnóstico: rodar `gh run list --workflow=pages.yml`, conferir o job `publicar`, validar 200 na demo e na privacidade e confirmar `#/` na URL após navegar.

- [ ] **Step 7: Revalidar o app**

Run: `dart format --set-exit-if-changed .`, `flutter analyze` e `flutter test`
Expected: sem alterações de formatação, sem issues, testes verdes.

- [ ] **Step 8: Commit**

```powershell
git add .github/workflows/pages.yml docs/00-visao-geral.md docs/06-mvp-entregas.md docs/09-runbook-operacoes.md
git commit -m "ci(demo): publica build web no Pages com CSP e registra ADR-016"
```

- [ ] **Step 9: Publicar**

Abra PR e faça merge em `main` (ou push direto, conforme o fluxo do repositório), com o CI verde. O deploy só roda em `main`.
Run: `gh run list --workflow=pages.yml --limit 1`
Expected: execução `completed` / `success`.

- [ ] **Step 10: Verificar em produção**

Run: `Invoke-WebRequest -Method Head https://oliverlucasfer.github.io/listacompras/` e o mesmo para `.../privacidade.html`
Expected: ambos 200. No navegador: criar lista, navegar até ela, recarregar e confirmar que a URL contém `#/` e os dados persistem; console sem erro de CSP.

---

## Task 3: Entrada do projeto no portfólio

**Files:**
- Create: `oliverlucasfer.github.io/media/thumbs/proj10.webp`
- Modify: `oliverlucasfer.github.io/data/site.json`
- Modify: `oliverlucasfer.github.io/data/projects.json`
- Modify: `oliverlucasfer.github.io/README.md`

**Interfaces:**
- Consumes: URLs publicadas na Task 2.
- Produces: card e páginas `/projetos/minhas-listas/` e `/en/projects/minhas-listas/`; contador da home em 10.

- [ ] **Step 1: Gerar a capa**

Use Pillow sobre `C:\Repositorios\ListaCompras\store\screenshots\04-lista-itens.png` e `05-modo-mercado.png`, fundo índigo `#4F46E5`, no espírito do feature graphic. Salve em `media/thumbs/proj10.webp` com 760×360.
Run: `python -c "from PIL import Image; from pathlib import Path; p=Path('media/thumbs/proj10.webp'); print(Image.open(p).size, p.stat().st_size)"`
Expected: `(760, 360)` e tamanho ≤ 30720 bytes.

- [ ] **Step 2: Adicionar o rótulo do link**

Em `data/site.json`, no objeto `locales.pt.projetos`, adicione `"privacidade": "Privacidade",` depois de `"codigo"`. No `locales.en.projetos`, adicione `"privacidade": "Privacy",` no mesmo lugar.

- [ ] **Step 3: Adicionar a entrada no fim de `projetos`**

Acrescente ao array `projetos` de `data/projects.json`, após `prodocs`:

```json
{
  "slug": "minhas-listas",
  "category": "mobile",
  "title": "Minhas Listas",
  "thumb": "/media/thumbs/proj10.webp",
  "thumbWidth": 760,
  "thumbHeight": 360,
  "thumbAlt": {
    "pt": "Telas do Minhas Listas, app de lista de compras com itens organizados por categoria e modo mercado",
    "en": "Minhas Listas screens, shopping list app with items grouped by category and store mode"
  },
  "tags": [
    { "nome": "Flutter", "icon": "flutter" },
    { "nome": "Dart", "icon": "dart" },
    { "nome": "Drift + SQLite", "icon": "database" },
    { "nome": "Material 3", "icon": "materialdesign" },
    { "nome": "GitHub Actions", "icon": "githubactions" }
  ],
  "summary": {
    "pt": "App de lista de compras 100% local e offline-first: sem conta, nuvem ou rastreamento. Categorização automática, importação por texto, voz, modo mercado e histórico de preços por mercado, em Android, iOS, Web e desktop.",
    "en": "A 100% local, offline-first shopping list app: no account, cloud or tracking. Automatic categorization, text import, voice input, store mode and price history by store, on Android, iOS, Web and desktop."
  },
  "links": [
    { "key": "demo", "href": "https://oliverlucasfer.github.io/listacompras/" },
    { "key": "codigo", "href": "https://github.com/oliverlucasfer/listacompras" },
    { "key": "privacidade", "href": "https://oliverlucasfer.github.io/listacompras/privacidade.html" }
  ],
  "caseStudy": {
    "anon": false,
    "subtitle": {
      "pt": "Lista de compras offline-first em Flutter + Drift: sem conta, sem nuvem e com os dados 100% no aparelho.",
      "en": "Offline-first shopping list built with Flutter + Drift: no account, no cloud, and all data on the device."
    },
    "periodo": { "pt": "2026", "en": "2026" },
    "papel": { "pt": "Desenvolvimento individual", "en": "Solo project" },
    "contexto": {
      "pt": "Começou como exercício de arquitetura local-first: um app que resolvesse a lista de compras sem conta e sem servidor. Virou um produto único e multiplataforma (Android, iOS, Web e desktop), com documentação de produto, design system, testes e CI. O app está completo, mas ainda não foi publicado nas lojas.",
      "en": "It started as an exercise in local-first architecture: a shopping list app that worked without an account or a server. It became a single, multiplatform product (Android, iOS, Web and desktop) with product documentation, a design system, tests and CI. The app is complete but has not been published to any store yet."
    },
    "desafio": {
      "pt": "Manter o mesmo modelo de dados e a mesma experiência em quatro plataformas, com o banco local como única fonte da verdade — incluindo migrações, backup fiel, categorização automática sem serviço externo e privacidade por padrão. No navegador, isso significa rodar SQLite via WASM e persistir sem backend.",
      "en": "Keep the same data model and experience across four platforms, with the local database as the single source of truth — including migrations, faithful backups, automatic categorization without an external service and privacy by default. In the browser, that means running SQLite through WASM and persisting without a backend."
    },
    "papelItens": {
      "pt": [
        "Arquitetura offline-first com Drift/SQLite como fonte da verdade; escrita sempre local e IDs UUID gerados no cliente",
        "Modelo de domínio com quantidades fracionárias, enum fechado de unidades, categorias e ordenação personalizável",
        "Categorização local em camadas (memória por nome → dicionário estático → 'outros'), sem chamadas de rede",
        "Importação por texto com parser determinístico e pré-visualização editável; adição por voz com o reconhecedor do sistema",
        "Histórico de compras com snapshot por ida, estatísticas de gasto e comparação de preços por mercado",
        "O mesmo banco em Android, iOS, desktop e Web (WASM com OPFS/IndexedDB), além de backup e restauração em JSON"
      ],
      "en": [
        "Offline-first architecture with Drift/SQLite as the source of truth; writes always local and UUIDs generated on the client",
        "Domain model with fractional quantities, a closed unit enum, categories and custom ordering",
        "Layered local categorization (name memory → static dictionary → 'others'), with no network calls",
        "Text import with a deterministic parser and editable preview; voice input through the system recognizer",
        "Purchase history with a snapshot per trip, spending statistics and price comparison by store",
        "The same database on Android, iOS, desktop and Web (WASM with OPFS/IndexedDB), plus JSON backup and restore"
      ]
    },
    "stack": {
      "pt": "Flutter 3.44 + Dart 3.12 no app; Drift 2.34 sobre SQLite no armazenamento local (WASM no navegador); Material 3; speech_to_text, share_plus e qr_flutter nos recursos de voz e compartilhamento; GitHub Actions para CI.",
      "en": "Flutter 3.44 + Dart 3.12 in the app; Drift 2.34 over SQLite for local storage (WASM in the browser); Material 3; speech_to_text, share_plus and qr_flutter for voice and sharing; GitHub Actions for CI."
    },
    "destaques": {
      "pt": [
        "Privacidade radical: sem conta, analytics, anúncios ou chamadas de rede — os dados não saem do aparelho",
        "Um único modelo de dados rodando em mobile, desktop e navegador, com o mesmo Drift e fallback de persistência",
        "Categorização e importação resolvidas localmente, sem IA ou serviço externo",
        "Produto tratado como produto: design system, onboarding com tour, alvos de 48dp, contraste AA e documentação normativa"
      ],
      "en": [
        "Radical privacy: no account, analytics or ads, and no network calls — data never leaves the device",
        "One data model running on mobile, desktop and browser, with the same Drift stack and persistence fallback",
        "Categorization and import handled locally, without AI or an external service",
        "Treated as a product: design system, onboarding tour, 48dp targets, AA contrast and normative documentation"
      ]
    },
    "aprendizados": {
      "pt": "Local-first simplifica a infraestrutura — não há backend para operar — mas desloca a complexidade para migrações, backup e experiência de recuperação. Aprendi que privacidade por padrão é uma decisão de arquitetura, não uma tela de configurações.",
      "en": "Local-first simplifies infrastructure — there is no backend to operate — but moves the complexity into migrations, backups and recovery UX. I learned that privacy by default is an architecture decision, not a settings screen."
    }
  }
}
```

- [ ] **Step 4: Atualizar o README**

Em `README.md`, troque `# 9 projetos + páginas de projeto completas (PT/EN)` por `# 10 projetos + páginas de projeto completas (PT/EN)`.

- [ ] **Step 5: Gerar o site**

Run: `node build.mjs`
Expected: build conclui e informa `Páginas: 2 home + 20 case studies + 404` (10 projetos × 2).

- [ ] **Step 6: Verificar o resultado**

```powershell
Test-Path dist\projetos\minhas-listas\index.html
Test-Path dist\en\projects\minhas-listas\index.html
Select-String dist\projetos\minhas-listas\index.html -Pattern "Privacidade","listacompras/privacidade.html","Minhas Listas","en/projects/minhas-listas"
Select-String dist\sitemap.xml -Pattern "minhas-listas"
(Select-String dist\index.html -Pattern 'card-title-link' | Measure-Object).Count
```

Expected: ambos os `Test-Path` verdadeiros; os quatro padrões encontrados na página PT (incluindo o `hreflang` EN); slug no sitemap; contador de cards = 10 (a home tem um card por projeto). Confira também a versão EN contendo `Privacy`.

- [ ] **Step 7: Conferir visualmente**

Run: `npx http-server dist -p 8080` (ou equivalente) e abra `http://localhost:8080/#projetos`.
Expected: card novo no filtro Mobile, capa nítida, texto e tags corretos, página do projeto com três botões.

- [ ] **Step 8: Commit**

```powershell
git add data/site.json data/projects.json media/thumbs/proj10.webp README.md
git commit -m "improvement: adiciona projeto Minhas Listas com demo web e case study PT/EN"
```

---

## Task 4: Verificação integrada e publicação

**Files:**
- Modify (se necessário): textos em `data/projects.json` ou `data/site.json`

**Interfaces:**
- Consumes: demo da Task 2 e páginas da Task 3.
- Produces: site publicado com links funcionando e checklist do spec atendido.

- [ ] **Step 1: Checar as URLs externas**

```powershell
(Invoke-WebRequest -Method Head https://oliverlucasfer.github.io/listacompras/).StatusCode
(Invoke-WebRequest -Method Head https://oliverlucasfer.github.io/listacompras/privacidade.html).StatusCode
(Invoke-WebRequest -Method Head https://github.com/oliverlucasfer/listacompras).StatusCode
```

Expected: 200, 200, 200.

- [ ] **Step 2: Publicar o portfólio**

Faça merge em `master` (PR ou push, conforme o fluxo).
Run: `gh run list --workflow=deploy.yml --limit 1`
Expected: execução concluída com sucesso.

- [ ] **Step 3: Verificar o site publicado**

Abra `https://oliverlucasfer.github.io/#projetos` e `https://oliverlucasfer.github.io/en/#projects`.
Expected: 10 cards, filtro Mobile com o novo projeto, contador 10. Abra as duas páginas de case study e confirme os links Demo, Código e Privacidade/Privacy, além de Anterior/Próximo.

- [ ] **Step 4: Verificar Lighthouse**

Run: `gh run list --workflow=lighthouse.yml --limit 1`
Expected: execução verde, budgets atendidos.

- [ ] **Step 5: Rodar o checklist do spec**

Confirme, um a um, os itens de `## 9. Verificação` do spec nas seções Portfólio e App. Se algo falhar, corrija no arquivo indicado, rode `node build.mjs`, refaça o commit e republique.

- [ ] **Step 6: Commit de correções (se houver)**

```powershell
git add data/projects.json data/site.json
git commit -m "fix: ajusta textos do projeto Minhas Listas após revisão"
```
