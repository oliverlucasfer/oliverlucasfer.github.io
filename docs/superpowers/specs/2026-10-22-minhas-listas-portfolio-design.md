# Design — Minhas Listas no portfólio, com demo web

**Data:** 2026-10-22
**Status:** aprovado e implementado; deploy pendente
**Repositórios envolvidos:**

- `oliverlucasfer.github.io` (site do portfólio)
- `ListaCompras` (app Flutter "Minhas Listas")

## 1. Intenção

Incluir o **Minhas Listas** no portfólio como um projeto de destaque, com página de case study em PT e EN, e oferecer uma **demo web jogável** publicada no GitHub Pages. O app ainda não foi publicado em loja; a demo é a única forma de um visitante experimentar o produto.

O site hoje é gerado a partir de `data/projects.json` e já possui nove projetos, cada um com card na home e página própria em `/projetos/<slug>/` e `/en/projects/<slug>/`. O app já tem CI, documentação extensa, capturas de tela, ícone, feature graphic e uma página de privacidade publicada em `oliverlucasfer.github.io/listacompras/privacidade.html`.

## 2. Objetivos

- Card e case study completos (PT/EN) do Minhas Listas no portfólio.
- Demo pública e funcional em `https://oliverlucasfer.github.io/listacompras/`, construída a partir da `main` do app.
- Manter a página de privacidade existente acessível na mesma URL.
- Ser honesto sobre o estado do produto: **completo, ainda não publicado em loja**.
- Preservar os budgets de Lighthouse do portfólio (Performance ≥ 90, Acessibilidade ≥ 95, SEO = 100).
- Registrar a decisão de publicar o demo, já que o `ADR-013` do app determinava Web apenas para uso local.

## 3. Não-objetivos

- Publicar o app na Play Store ou App Store.
- Alterar funcionalidades, banco ou interface do app (as exceções são a estratégia de URL e o flush de persistência, ambos restritos ao build de demo).
- Criar galeria de screenshots no template do portfólio (o template atual mostra apenas a capa).
- Adicionar analytics, cookies, conta ou qualquer backend ao demo.
- Traduzir a interface do app para inglês.
- Domínio próprio, deploy fora do GitHub Pages.

## 4. Anti-objetivos

- Quebrar a URL pública da política de privacidade.
- Publicar um demo que perde os dados ao recarregar a página.
- Copiar o build web para dentro do repositório do portfólio (acoplaria os dois projetos e inflaria o deploy do site).
- Exibir números, clientes ou resultados que não existem.
- Adicionar dependências de build ao portfólio (ele é Node puro, zero dependências).

## 5. Abordagens consideradas

### 5.1 Demo: onde hospedar

**A — GitHub Pages no repositório do app (escolhida).**
O repo já tem Pages configurado publicando `site/`. O workflow passa a montar um diretório de deploy com `site/` + `build/web/` e publica em `/listacompras/`. Um deploy, uma URL, zero custo. Trade-off: cada push que afete o app roda um build Flutter no CI (alguns minutos).

**B — Copiar o build para o `dist/` do portfólio.**
Rejeitada. Mistura responsabilidades, obriga a versionar ou baixar artefatos grandes no repo do site e faz o deploy do portfólio depender de um build Flutter.

**C — Serviço externo (Firebase Hosting, Netlify, Render).**
Rejeitada. Já foi tentado e revertido no app; adiciona conta, configuração e manutenção sem benefício sobre o Pages.

### 5.2 Case study: profundidade

**A — Case study completo (escolhida).**
Mesmo formato dos projetos existentes: contexto, desafio, papel, stack e arquitetura, destaques e aprendizados, em PT/EN.

**B — Card curto sem página.**
Rejeitada. O gerador sempre cria a página; um projeto pessoal deste porte merece o mesmo tratamento dos demais.

### 5.3 Demo: estratégia de URL

O app usa rotas por caminho (`usarPathUrlStrategy()`), e o GitHub Pages não reescreve URLs. Sem tratamento, recarregar `/listacompras/listas` retorna 404.

**A — Hash routing apenas no build de demo (escolhida).**
Uma condicional ativada por `--dart-define=DEMO=true` faz o build publicado usar `setUrlStrategy(HashUrlStrategy())`. As rotas viram `/listacompras/#/listas`, recarregar e compartilhar funcionam nativamente, sem página de erro e sem status 404. O build local e o produto mantêm as rotas normais. Trade-off: `#` na URL e uma pequena mudança em `lib/core/web/url_strategy_web.dart`.

**B — `404.html` com o app.**
Rejeitada. URLs limpas e zero mudança no app, mas todo deep link responde HTTP 404, prejudicando prévia de link e compartilhamento.

**C — Hospedagem com rewrites (Netlify/Cloudflare Pages).**
Rejeitada. Resolveria sem `#`, mas adiciona conta e serviço externo, contrariando a decisão de usar o Pages que já existe.

## 6. Decisões

### 6.1 Entrada no portfólio

Arquivo: `data/projects.json`, entrada acrescentada ao final da lista (padrão usado em SmartSchool e ProDocs).

| Campo | Valor |
| --- | --- |
| `slug` | `minhas-listas` |
| `category` | `mobile` |
| `title` | `Minhas Listas` |
| `thumb` | `/media/thumbs/proj10.webp` (760×360) |
| `periodo` | `2026` |
| `papel` | Desenvolvimento individual / Solo project |
| `links` | `demo` → `https://oliverlucasfer.github.io/listacompras/`; `codigo` → `https://github.com/oliverlucasfer/listacompras`; `privacidade` → `https://oliverlucasfer.github.io/listacompras/privacidade.html` |

O link `privacidade` é novo e exige o rótulo correspondente em `data/site.json` (`projetos.privacidade`, PT/EN), já que o gerador usa os rótulos de `site.json` para os botões. O card da home continua usando o primeiro link (`demo`) como ação principal.

**Tags:** Flutter, Dart, Drift + SQLite, Material 3, GitHub Actions. Os ícones existentes cobrem todos (`flutter`, `dart`, `database`, `materialdesign`, `githubactions`).

**Resumo (PT):** app de lista de compras 100% local e offline-first, sem conta, nuvem ou rastreamento; categorização automática, importação por texto, voz, modo mercado e histórico de preços por mercado.

**Resumo (EN):** equivalente direto, sem prometer publicação em loja.

**Case study:** mesmas chaves dos demais (`anon: false`, `subtitle`, `periodo`, `papel`, `contexto`, `desafio`, `papelItens`, `stack`, `destaques`, `aprendizados`). Conteúdo cobre:

- contexto: nasceu como exercício de arquitetura local-first e virou um app único, multiplataforma, com documentação de produto;
- desafio: manter os dados no aparelho com o mesmo modelo em Android, iOS, desktop e Web (WASM), incluindo migrações, backup fiel e privacidade;
- papel: arquitetura offline-first com Drift como fonte da verdade; categorização local em camadas; parser determinístico de importação; banco WASM/OPFS-IndexedDB no navegador; histórico de compras e preços por mercado; CI, testes e documentação;
- destaques: privacidade radical, mesmo banco em todas as plataformas, categorização sem serviço externo, acessibilidade (alvos ≥ 48dp, contraste AA) e backup completo;
- aprendizados: local-first simplifica a infraestrutura, mas exige disciplina de migração, backup e UX;
- estado: app completo, **ainda não publicado nas lojas** (declarado no texto, sem eufemismo).

**Capa:** composição 760×360 em WebP, gerada com Pillow a partir de `store/screenshots/04-lista-itens.png` e `05-modo-mercado.png` sobre fundo índigo `#4F46E5`, no espírito do feature graphic. Meta de peso ≤ 30 KB. Alt textual em PT/EN.

**README do portfólio:** atualizar a contagem de projetos de 9 para 10. O contador da home já é calculado a partir de `projects.length`, então se ajusta sozinho.

### 6.2 Demo web no app

Alterações em `ListaCompras`:

1. `lib/core/web/url_strategy_web.dart`: a função `usarPathUrlStrategy()` já é o ponto único de configuração no Web. Ela passa a checar `bool.fromEnvironment('DEMO')` e chamar `setUrlStrategy(HashUrlStrategy())` quando verdadeiro; caso contrário, mantém `usePathUrlStrategy()`. `url_strategy_nativa.dart`, `bootstrap.dart` e o restante do app ficam intocados.

2. `.github/workflows/pages.yml`:
   - instalar Flutter 3.44.5 (mesma versão do badge e do CI) via action oficial de setup;
   - `flutter pub get` + `flutter build web --release --base-href /listacompras/ --dart-define=DEMO=true`;
   - **CSP no artefato, não no template:** injetar a `<meta http-equiv="Content-Security-Policy">` recomendada em `docs/06 §3.4.1` dentro do `index.html` **depois** do build, no diretório de deploy. O `web/index.html` do app permanece intocado, preservando `flutter run -d chrome` e o fluxo de desenvolvimento local, que usa `eval` e não deve ser restringido pela política de produção;
   - montar um diretório de deploy com o conteúdo de `site/` e depois o de `build/web/` (a privacidade continua em `/listacompras/privacidade.html`);
   - publicar esse diretório no Pages;
   - ampliar os `paths` do gatilho para `site/**`, `lib/**`, `assets/**`, `web/**`, `pubspec.yaml`, `pubspec.lock` e o próprio workflow.

3. Nenhuma mudança no banco, nas telas ou na versão do app. Sem bump de versão, portanto sem alteração em `web/version.json`. Rodar `flutter analyze` e `flutter test` antes do merge.

**Roteamento:** com hash, a URL inicial continua `/listacompras/` e as rotas de shell ficam `/listacompras/#/listas`, `/listacompras/#/historico`, `/listacompras/#/configuracoes`. Abrir uma lista usa `context.push('/lista/<uuid>')` (go_router), que não altera a URL — comportamento pré-existente, idêntico ao path strategy; recarregar a partir daí volta ao índice. Uma URL fria com `#/lista/<uuid>` abre a lista correta. O navegador nunca pede essas rotas ao servidor, então nada retorna 404. O `base href` absoluto continua necessário para os assets.

**Persistência:** o GitHub Pages não permite cabeçalhos COOP/COEP, então o caminho OPFS do Drift não estará disponível. O app já usa `WasmDatabase.open`, que cai para IndexedDB nesse cenário. Porém o VFS IndexedDB do sqlite3 não dá garantia de durabilidade e não persiste escritas feitas dentro de transações até que outra escrita fora de transação ocorra — na prática, itens sumiam após recarregar. Para o build de demo, `lib/drift/conexao/conexao_web.dart` passa a rodar um `SELECT 1` por segundo fora de transação, o que força o flush do VFS. O timer é ativado apenas com `DEMO=true`, portanto o app local e o produto não mudam. A demo precisa ser validada criando lista e item, recarregando e conferindo que ambos continuam.

**Descoberta da privacidade:** a página pública não será linkada dentro do canvas do app; o link fica no case study do portfólio e na documentação. Isso evita sobrepor elementos ao app em tela cheia.

**Primeiro carregamento:** build padrão (CanvasKit via CDN do gstatic, coberto pela CSP). Aceitamos o peso inicial de alguns MB; o demo não entra nos budgets de Lighthouse do portfólio.

### 6.3 Documentação do app (doc dono)

- `docs/00-visao-geral.md`: novo **ADR-016 — demo web público como vitrine** (revisa o ADR-013 apenas no que diz respeito a publicar o Web; o Web continua fora dos canais de distribuição do produto). Atualizar a linha de escopo.
- `docs/05-app-flutter.md`: registrar que o build de demo usa hash e flush periódico, e que o comportamento local/produto não muda.
- `docs/06-mvp-entregas.md`: atualizar a tabela de publicação para incluir o demo e a nota de cabeçalhos, explicando o fallback IndexedDB e o flush no Pages.
- `docs/09-runbook-operacoes.md`: registrar a URL do demo, o gatilho do workflow, a estratégia de hash (`--dart-define=DEMO=true`) e como diagnosticar falha de deploy.
- `docs/13-premodelo-tecnico.md`: atualizar a linha-resumo dos ADRs para citar o ADR-016.

### 6.4 Ordem de implementação

1. Conteúdo e capa do portfólio; rodar `node build.mjs` e conferir PT/EN localmente.
2. Workflow, CSP e condicional de hash no app; validar o build local normal (rotas por caminho) e o build de demo (`base-href` + `DEMO=true`, rotas com `#`).
3. Publicar o demo; validar URL, privacidade e persistência.
4. Atualizar o link `demo` do portfólio e revisar a página final.
5. Atualizar a documentação do app no mesmo PR das mudanças de deploy.

## 7. Restrições

- GitHub Pages é hospedagem estática: sem backend, sem cabeçalhos customizados, sem autenticação.
- O portfólio é Node puro, sem dependências; nada de framework ou pacote novo.
- O app exige CI verde e segue o `AGENTS.md` (doc dono atualizado no mesmo PR, sem segredos, offline-first).
- O portfólio publica a partir de `master`; o app, a partir de `main`.
- Lighthouse do portfólio roda em PR/push e bloqueia budgets.
- A demo herda o conteúdo da `main` do app; não há versionamento de demo.

## 8. Riscos e mitigações

| Risco | Mitigação |
| --- | --- |
| Drift não inicializa sem COOP/COEP no Pages | Validar localmente servindo `build/web` sem esses cabeçalhos; o fallback IndexedDB inicializa |
| Escritas em transação não chegam ao IndexedDB | Flush periódico (`SELECT 1`/s) ativado só no build de demo; validar item sobrevivendo ao reload |
| Build Flutter quebra e impede o deploy da privacidade | O conteúdo de `site/` não muda; a URL antiga continua no ar. Investigar e corrigir antes de novo deploy |
| Peso do primeiro carregamento | Aceito; a demo é opcional e o portfólio não a embute |
| Service worker servir build antigo | Testar em janela anônima após deploy; se necessário, ajustar estratégia de cache |
| `DEMO=true` não aplicado e URL cair no roteamento por caminho | Verificar na URL publicada que, após navegar, ela contém `#/`; o build de demo é sempre feito com o define |
| CSP injetada bloquear o build de release | Validar o artefato publicado no navegador; ajustar a diretiva bloqueada, mantendo a política. O template local fica intacto |
| Voz e compartilhamento não funcionarem no navegador | Não anunciar esses recursos como disponíveis na demo; o case study descreve o app, não a demo |
| Duplicação de conteúdo SEO entre demo e portfólio | Aceitável; o demo não é página do site e não compete com os cases |
| `base-href` errado se o repo for renomeado | Verificação pós-deploy da URL e dos assets |

## 9. Verificação

**Portfólio**

- `node build.mjs` sem erro; JSON válido.
- `dist/projetos/minhas-listas/index.html` e `dist/en/projects/minhas-listas/index.html` renderizam conteúdo, tags, links (demo, código, privacidade) e navegação anterior/próximo.
- Card aparece no filtro Mobile da home, contador mostra 10, capa com proporção e alt corretos.
- Link da demo abre a URL publicada; link de código abre o repositório.
- `sitemap.xml` e `hreflang` incluem as duas páginas.
- Budgets de Lighthouse continuam verdes.

**App**

- `flutter build web --release --base-href /listacompras/ --dart-define=DEMO=true` conclui.
- Build servido localmente sem COOP/COEP: cria lista, adiciona item, recarrega e os dados continuam.
- Após navegar, a URL contém `#/`; recarregar uma rota interna (`#/listas` ou `#/lista/<id>`) reabre o app na mesma tela.
- Build sem `DEMO` continua usando rotas por caminho, e `flutter run -d chrome` funciona como antes.
- CSP presente no `index.html` publicado e ausente no template.
- CSP não gera erros no console; CanvasKit e service worker carregam.
- `/listacompras/` responde 200; `/listacompras/privacidade.html` responde 200.
- CI e workflow de Pages verdes após o merge.

## 10. O que fica a cargo de quem implementar

- Redação final do case study em PT/EN, dentro dos fatos listados na seção 6.1.
- Composição exata da capa (posição das telas, sombras, texto), respeitando 760×360 e o teto de peso.
- Injeção e diretivas finais da CSP no artefato publicado, desde que cubram o build de release e mantenham o app funcionando.
- Estrutura interna do workflow (nomes de jobs, cache), desde que o resultado publicado seja `site/` + `build/web/` em `/listacompras/`.
- Textos de commit e agrupamento dos PRs.
