# Repaginação do portfólio — base Primer, acento azul

**Status:** proposta para aprovação
**Data:** 2026-10-22
**Repositório:** `oliverlucasfer.github.io`

## 1. Resumo

Repaginar o portfólio pessoal usando a **estrutura e a disciplina visual do GitHub Primer**, com **acento azul** (`#58A6FF` em texto/links e `#1F6FEB` em ações no escuro; `#0969DA` no claro), preservando os sinais de identidade que fazem o site parecer do Lucas: o terminal do hero, o logo monoespaçado, os micro-rótulos em mono, a voz do texto e as capas dos projetos.

Não é uma cópia do GitHub nem uma adoção do Primer como dependência. É um sistema próprio, inspirado em princípios públicos do Primer (superfícies chapadas, bordas no lugar de sombras, raio de 6px, tipografia Inter, grid de 8px), implementado em CSS puro sobre o gerador estático atual.

## 2. Contexto

- O site é gerado por `build.mjs` (Node puro, zero dependências) a partir de `data/*.json`.
- São dois templates principais: home PT/EN e case study PT/EN (20 páginas), mais 404.
- O CSS atual tem ~1.800 linhas, tokens próprios, temas claro/escuro via `[data-theme]`, fontes self-hosted (Inter e JetBrains Mono), animações de reveal/typing/contadores e um sprite SVG local.
- O visual atual é escuro, roxo, com títulos em mono, gradientes/glow e cards arredondados.
- A direção B foi escolhida em protótipo navegável, com comparação de seções completas e movimento. O azul foi escolhido em comparação controlada contra o roxo.

## 3. Objetivos

1. Dar ao site uma linguagem mais **sistemática, legível e profissional**, com cara de produto bem construído.
2. Manter a **personalidade**: terminal, logo mono, micro-rótulos mono, voz, capas e movimento com propósito.
3. Suportar **claro e escuro** com tokens semânticos e contraste AA.
4. Preservar conteúdo, URLs, SEO, i18n e os budgets de Lighthouse.
5. Reduzir efeitos decorativos (glow, tilt 3D, botão magnético) em favor de hierarquia, bordas e feedback.

## 4. Não-objetivos

- Trocar o gerador estático por framework (Next, Astro, React etc.).
- Adicionar dependências de UI ou importar `@primer/*` em runtime.
- Mudar textos, seções, ordem de conteúdo, slugs ou rotas.
- Criar blog, CMS, área administrativa ou novas features.
- Copiar assets, ícones, ilustrações ou marca do GitHub/Atlassian.
- Refazer as capas dos projetos (exceto o OG cover, ver §12).

## 5. Anti-objetivos

- O site parecer um clone de GitHub/Jira.
- Perder o tom pessoal e virar um template genérico.
- Ganhar complexidade de build/manutenção para ganhar estética.
- Passar nos budgets escondendo conteúdo ou removendo acessibilidade.

## 6. Abordagens consideradas

| Abordagem | O que era | Por que não |
|---|---|---|
| **A · Autoral tokenizado** (Radix Colors + Open Props) | Manter roxo/mono/glow, ganhar tokens e contraste | Preserva mais a identidade, mas mantém a estética “dark criativa” e não entrega a clareza de produto que o usuário buscava |
| **B · Primer** (escolhida) | Estrutura flat, azul, Inter, 6px, bordas, densidade de produto | Risco de associação com GitHub; mitigado por âncoras de identidade e ausência de assets/marca |
| **C · Geist** | Monocromático, tipografia apertada, minimalismo dev | Estética forte, mas fria e ainda mais genérica; pouca margem para a voz pessoal |

**Decisão de acento:** B com azul do Primer, escolhido pelo usuário em comparação visual contra o roxo. O azul é tratado como cor de sistema (links, foco, ações), não como marca. A marca continua no logo, no terminal e na tipografia mono.

**Sobre o ADS:** o Atlassian Design System foi descartado como camada visual por ser um sistema de UI de produto e por sua licença cobrir add-ons Atlassian, não sites pessoais. O Primer é MIT, mas será usado apenas como referência de princípios; nenhum pacote será importado.

## 7. Viabilidade

### Técnica — alta

- O CSS é centralizado e tokenizado; a troca de valores + reescrita de componentes é localizada.
- O HTML é gerado; mudanças de classe ficam em `build.mjs`, sem tocar no conteúdo.
- Dois templates cobrem 22 páginas; o case study é compartilhado.
- O tema claro/escuro e a persistência já existem; falta remapear valores.
- Fontes e ícones já são locais; não há novas requisições.

### Performance — alta

- Sem novas dependências JS/CSS.
- Remover glow, tilt e magnético tende a reduzir custo de pintura/scroll.
- Imagens e formatos permanecem; o OG cover pode ser otimizado na mesma fase.
- Budgets atuais: Performance ≥ 90, Acessibilidade ≥ 95, SEO = 100.

### Acessibilidade — alta, com verificação

- Tokens de texto/fundo precisam passar AA nos dois temas.
- Foco visível: anel de 2px com offset de 2px, raio do elemento +2px.
- `prefers-reduced-motion` desliga reveal, typing, contadores e hovers de movimento.
- Nenhuma informação só por cor; badges e estados têm texto.
- Formulário mantém labels, status e fallback de e-mail.

### SEO e conteúdo — sem risco

- URLs, títulos, descriptions, hreflang, JSON-LD e sitemap não mudam.
- Nenhum texto é reescrito; apenas apresentação.

### Licença e marca — segura

- Primer é MIT; usamos princípios e valores públicos, sem copiar assets.
- Nada de Octocat, logo do GitHub, fontes proprietárias ou menção a “GitHub” como afiliação.
- Azul é cor genérica; a distinção vem do terminal, do logo e da composição.

### Esforço — 6 a 8 dias de trabalho

| Fase | Entrega | Estimativa |
|---|---|---|
| 1 | Tokens, base, tipografia, foco, nav, botões, temas | 1–1,5 dia |
| 2 | Home: hero, sobre, conhecimentos, experiência, projetos, contato | 2–2,5 dias |
| 3 | Case study + 404 + estados de formulário | 1–1,5 dia |
| 4 | Movimento, responsivo, claro/escuro, polimento | 1 dia |
| 5 | QA visual, contraste, Lighthouse, PR/deploy | 1 dia |

## 8. Sistema visual

### 8.1 Cores (tokens semânticos)

**Escuro**

| Token | Valor | Uso |
|---|---|---|
| `--bg` | `#0D1117` | canvas |
| `--bg-elev` | `#161B22` | cards, superfícies |
| `--bg-inset` | `#010409` | terminal, inputs, código |
| `--bg-elev-2` | `#1C2128` | hover/realce sutil |
| `--text` | `#E6EDF3` | texto principal |
| `--muted` | `#8B949E` | secundário |
| `--border` | `#30363D` | bordas padrão |
| `--border-strong` | `#484F58` | hover/foco estrutural |
| `--accent` | `#58A6FF` | links, ícones, labels |
| `--accent-strong` | `#1F6FEB` | botão primário |
| `--accent-hover` | `#388BFD` | hover do primário |
| `--accent-soft` | `rgba(56,139,253,.12)` | chips, fundos suaves |
| `--accent-border` | `rgba(56,139,253,.4)` | borda de chip |
| `--success` | `#3FB950` | status positivo |
| `--warning` | `#D29922` | atenção |
| `--danger` | `#F85149` | erro |
| `--focus` | `#58A6FF` | anel de foco |

**Claro**

| Token | Valor |
|---|---|
| `--bg` | `#FFFFFF` |
| `--bg-elev` | `#F6F8FA` |
| `--bg-inset` | `#EAEEF2` |
| `--bg-elev-2` | `#FFFFFF` |
| `--text` | `#1F2328` |
| `--muted` | `#59636E` |
| `--border` | `#D0D7DE` |
| `--border-strong` | `#AFB8C1` |
| `--accent` | `#0969DA` |
| `--accent-strong` | `#0969DA` |
| `--accent-hover` | `#0550AE` |
| `--accent-soft` | `#DDF4FF` |
| `--accent-border` | `#B6E3FF` |
| `--success` | `#1A7F37` |
| `--warning` | `#9A6700` |
| `--danger` | `#CF222E` |
| `--focus` | `#0969DA` |

Contraste mínimo: 4,5:1 para texto <24px; 3:1 para texto grande e UI. Verificar com script/axe na fase 5.

### 8.2 Tipografia

- **Inter** (já self-hosted) para títulos e corpo.
- **JetBrains Mono** (já self-hosted) para micro-rótulos, índices de seção, metadados, código e números de destaque.
- Escala:
  - `h1`: `clamp(2.75rem, 5.2vw, 3.875rem)` / 1.02 / 700 / `-0.04em`
  - `h2`: `clamp(1.75rem, 3.2vw, 2.375rem)` / 1.08 / 700 / `-0.03em`
  - `h3`: `1.375rem` / 1.2 / 650
  - corpo: `0.9375rem` / 1.65
  - pequeno: `0.8125rem` / 1.55
  - micro: `0.625rem` mono / uppercase / `0.16em`
  - código: `0.75rem` mono
- Títulos deixam de ser mono. Mono vira **assinatura**, não voz principal.

### 8.3 Espaçamento, raio e elevação

- Base 8px; tokens: 4, 8, 12, 16, 24, 32, 48, 64, 88, 112.
- Raio: 6px em botões, cards, inputs e covers; 999px em chips/badges; 4px em detalhes.
- Elevação por borda. Sombra só no terminal do hero e no hover de card.
- Dark: sombra de hover `0 8px 24px rgba(1,4,9,.35)`.
- Light: sombra de repouso `0 1px 0 rgba(31,35,40,.04)`; hover `0 8px 24px rgba(31,35,40,.08)`.

### 8.4 Foco e ícones

- Foco: `outline: 2px solid var(--focus); outline-offset: 2px; border-radius: calc(var(--radius) + 2px)`.
- Ícones: sprite SVG atual, 20px, traço 1.75; ícones de marca em `currentColor`.
- Nenhum ícone novo de dependência.

## 9. Identidade preservada

Estes elementos são intocáveis nesta repaginação:

1. **Terminal no hero** — substitui o PNG 3D por um terminal HTML real, com comandos do repo; é o sinal mais forte de “desenvolvedor”.
2. **Logo monoespaçado** `LucasOliveira` — mantido; “Oliveira” recebe o azul.
3. **Micro-rótulos mono** — seções, períodos, metadados, stack.
4. **Voz do texto** — nenhuma reescrita de conteúdo.
5. **Capas dos projetos** — preservadas; são parte do portfólio.
6. **Movimento com propósito** — reveal, hover, typing e contadores; sem tilt/magnético/glow.

O que muda de forma assumida: roxo → azul; títulos mono → Inter; botões pill/16px → 6px; cartões com glow → superfícies chapadas com borda.

## 10. Especificação por página/componente

### Política de conteúdo

- Nenhum texto de marketing novo. Índices de seção são numéricos e não exigem tradução.
- Metadados de projeto usam o `periodo` já existente em `caseStudy`; a timeline usa `empresa`, que já inclui a localização.
- Foram autorizados apenas os textos mínimos da tabela abaixo.

| Chave | PT | EN |
|---|---|---|
| `hero.metaLocal` | `Barreiras, BA` | `Barreiras, BA` |
| `hero.metaStatus` | `Disponível para conversar` | `Open to a conversation` |
| `sobre.stackLabel` | `Stack atual` | `Current stack` |
| `sobre.stackValue` | `.NET · Angular · Flutter · PostgreSQL` | `.NET · Angular · Flutter · PostgreSQL` |

Terminal (decorativo, `aria-hidden`): `$ node build.mjs`, `✓ dist/`, `$ git push origin master`, `✓ deploy`. Sem números ou métricas inventadas.

### Nav

- 64px, sticky, fundo `color-mix` do canvas com blur leve, borda inferior.
- Logo mono à esquerda; links Inter 12px; ações EN e tema em pills de 28px.
- Mobile: menu atual (hambúrguer/sidebar) mantido, reestilizado.
- Case pages mantêm o topbar mínimo atual (logo + EN + tema), sem nav completa; links de retorno continuam.

### Hero

- Grid 1.08fr / 0.92fr; texto à esquerda, terminal à direita.
- Eyebrow mono azul; H1 Inter; role com typing em azul; lead; dois botões; meta row.
- Terminal HTML real: barra com dots, corpo mono, linhas `node build.mjs` / `git push` e confirmações de build/deploy. Sem métricas inventadas. O PNG `hero-logo.png` deixa de ser usado.
- Sem glow/gradiente de fundo; no máximo um radial muito sutil no escuro (opcional, decidir no polimento).

### Sobre

- Grid 1.45fr / 0.9fr.
- Card de bio com dois parágrafos e stats (5 / 10 / 2) com contadores.
- Card GitHub: a contagem continua vindo da API pública; o card permanece oculto se a API falhar. Sem número hardcoded e sem novo request além do atual.
- Cards com borda, raio 6, sem glow.

### Conhecimentos

- Grid 2×2; cada card com ícone, título, descrição e chips.
- Chips pill com `accent-soft` e borda `accent-border`.
- Hover: elevação de 3px + borda forte.

### Experiência

- Timeline vertical com linha `--border` e dots azuis.
- Período em mono; cargo em Inter; empresa em azul; bullets com `<strong>`.
- Sem animação específica além do reveal.

### Projetos

- Filtros em pills; “Todos” ativo em `--text`/`--bg`.
- Dois cards em destaque full-width, empilhados: **Minhas Listas** e **ProDocs**, nessa ordem; capa à esquerda (52%) e conteúdo à direita; badge "Destaque" em azul.
- Demais cards em grid 2 colunas; capa 16:8.4; hover eleva 3px.
- Badge de categoria e tags com tokens de acento.

### Contato

- Grid 1fr/1fr: texto + links à esquerda, formulário à direita.
- Inputs com `bg-inset`, borda, foco azul; labels mono.
- Status de sucesso/erro com `success`/`danger`, sem depender só de cor.

### Case study

- Largura de leitura 760–860px; breadcrumb mono; badge; H1 Inter; subtítulo; meta (período/papel) em mono.
- Cover com raio 8 e borda; corpo com seções H2 Inter, parágrafos, listas com check azul, callouts.
- Bloco de anonimização mantém borda tracejada e ícone de lock.
- Navegação anterior/próximo e footer reestilizados.

### 404

- Mesmo shell; mensagem mono curta; botão primário azul.

## 11. Movimento

| Efeito | Especificação | Mantém? |
|---|---|---|
| Reveal on scroll | opacity 0→1, translateY 16px, 450ms, stagger 60ms | Sim |
| Hover de card | translateY(-3px), borda forte, 180ms | Sim |
| Typing do role | 90ms/char, pausa 1,2s, loop | Sim |
| Contadores | 900ms ease-out, uma vez | Sim |
| Tilt 3D | rotação por mouse | Não |
| Botão magnético | translate por mouse | Não |
| Glow/gradiente animado | — | Não |

`prefers-reduced-motion: reduce` desliga tudo. Não haverá toggle manual de movimento nesta entrega; o controle visto no protótipo era da demo.

### 11.1 Mobiliário existente

- **Marquee de stack:** mantido, reestilizado como faixa fina entre hero e Sobre; pausa com reduced motion.
- **Grain e scroll-progress:** removidos; contradizem superfícies chapadas.
- **Lenis:** removido; scroll nativo, com `scroll-behavior: smooth` apenas para âncoras. Reduz JS e melhora acessibilidade.
- **Aurora/glow do hero:** removido.

## 12. Assets

- Capas dos 10 projetos: manter.
- OG cover `media/og-cover.png`: está roxo; **atualizar para a nova linguagem azul** na fase 5, mantendo 1200×630 e peso baixo. Gerar do zero com wordmark + motivo `>_`, sem copy nova.
- Favicon/manifest: manter.
- Fontes: manter Inter/JetBrains Mono.
- Nenhum asset do GitHub/Primer será copiado.

## 13. Arquivos afetados

- `assets/css/style.css` — reescrita/ajuste dos tokens e componentes.
- `build.mjs` — classes/estrutura de nav, hero, terminal, cards, case study e 404; sem mudança de conteúdo além dos textos mínimos.
- `assets/js/app.js` — remover tilt/magnético; ajustar reveal, typing, contadores e tema; respeitar reduced motion.
- `data/site.json` — adicionar as 4 chaves de texto mínimo (PT/EN) e labels de tema; sem reescrita do restante.
- `media/og-cover.png` — novo cover azul.
- `assets/images/hero-logo.png` — deixa de ser referenciado; remover se não houver outro uso.
- `docs/` — este spec e o plano de implementação.

## 14. Fases de implementação

1. **Fundação:** tokens claro/escuro, tipografia, espaçamento, foco, reset, botões, nav.
2. **Home:** hero + sobre + conhecimentos + experiência.
3. **Home:** projetos + contato + footer.
4. **Case study + 404:** template compartilhado e estados.
5. **Movimento + responsivo + temas:** reveal, hover, typing, contadores, breakpoints.
6. **QA:** contraste, axe, teclado, Playwright em 390/768/1280, Lighthouse, OG cover, PR.

Cada fase tem build verde e screenshot de referência antes de avançar.

## 15. Riscos e mitigação

| Risco | Prob. | Impacto | Mitigação |
|---|---|---|---|
| Parecer clone do GitHub | Média | Alto | Terminal, logo mono, micro-labels, composição própria; nenhum asset/marca GitHub |
| Perder personalidade | Média | Alto | Âncoras da §9; revisão visual lado a lado com o site atual |
| Contraste no claro/escuro | Média | Alto | Tokens pareados + script de contraste + axe |
| Regressão nas 20 case pages | Média | Médio | Template único + snapshots de 3 cases representativos |
| Lighthouse cair | Baixa | Médio | Sem novas deps; remover efeitos pesados; medir antes/depois |
| Escopo crescer (conteúdo/OG) | Média | Médio | Fases fechadas; OG só na fase 5 |

## 16. Critérios de aceite

- Home e 20 case pages renderizam em PT/EN, claro/escuro, sem overflow em 390/768/1280.
- Conteúdo, URLs, metadados e i18n inalterados.
- Nenhum texto abaixo de 4,5:1; UI/foco ≥3:1.
- Navegação por teclado e skip link funcionando.
- `prefers-reduced-motion` desliga todo movimento.
- Build sem erros; Lighthouse Performance ≥90, Acessibilidade ≥95, SEO=100.
- Terminal, logo mono, micro-labels e capas presentes.
- Nenhum asset/marca GitHub ou Atlassian.

## 17. Decisões deixadas ao builder

- Breakpoints finais: propor 768/1024, substituindo 820/991, se os testes mostrarem ganho.
- Uso de `color-mix` com fallback em `rgba` para navegadores antigos.
- Raio de chips (999) vs. 6px: manter 999 por legibilidade.
- Intensidade do radial sutil no hero escuro: preferir nenhum; validar visualmente.
- Estrutura exata do menu mobile: manter a atual, só reestilizar.

### 17.1 Decisões já tomadas (builder calls)

- Acento canônico: `#58A6FF` para texto/links, `#1F6FEB` para ações sólidas no escuro; `#0969DA` no claro.
- Logo permanece mono, com “Oliveira” no azul.
- Hero usa terminal HTML real; `hero-logo.png` sai.
- Movimento fica em reveal + hover + typing + contadores; sem tilt, magnético ou glow.
- Sem toggle manual de movimento; apenas `prefers-reduced-motion`.
- Card GitHub continua API-gated, sem número hardcoded.
- Case pages mantêm topbar mínimo.
- Grain, scroll-progress e Lenis saem; marquee fica reestilizado.
- OG cover será refeito em azul com wordmark + `>_`.
- Conteúdo: atual + os 4 textos mínimos da §10.

## 18. Status

Todas as questões do builder check foram resolvidas. O spec aguarda aprovação do humano antes de qualquer implementação.
## 19. Atualização 2026-10-23 — segundo destaque

O humano pediu destaque para **ProDocs** junto com **Minhas Listas**. Decisão: dois cards card--destaque full-width empilhados, Minhas Listas primeiro e ProDocs em segundo, ambos com selo “Destaque”. O ProDocs foi movido para a segunda posição em data/projects.json; nenhum outro conteúdo mudou.
