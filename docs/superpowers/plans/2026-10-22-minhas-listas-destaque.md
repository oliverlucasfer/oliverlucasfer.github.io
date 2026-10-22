# Destaque do Minhas Listas no portfólio — plano curto

**Objetivo:** fazer o Minhas Listas ser o primeiro card da seção de projetos e ter um card de largura total, com selo “Destaque”.

**Design aprovado (mudança pequena):** mover a entrada para o topo de `data/projects.json`, marcar `"destaque": true`, renderizar `card--destaque` + selo, e aplicar layout horizontal no desktop (capa à esquerda, conteúdo à direita) que empilha abaixo de 820px. Sem dependências novas. O filtro Mobile mantém o projeto em primeiro; a navegação anterior/próximo dos case studies passa a refletir a nova ordem.

**Arquivos:** `data/projects.json`, `data/site.json`, `build.mjs`, `assets/css/style.css`.

---

### Task 1: Card em destaque

**Interfaces:**
- Consumes: `projects`/`locale.projetos` já carregados em `build.mjs`; rótulos PT/EN em `data/site.json`.
- Produces: classe `card--destaque` no primeiro card e rótulo `labels.destaque`; nenhuma outra página muda.

- [ ] **Step 1: Rótulos**

Em `data/site.json`, adicionar `"destaque": "Destaque",` em `locales.pt.projetos` e `"destaque": "Featured",` em `locales.en.projetos` (junto de `codigo`/`privacidade`).

- [ ] **Step 2: Ordem e flag**

Em `data/projects.json`, mover o objeto de `minhas-listas` para a primeira posição do array e adicionar `"destaque": true,` logo após `"category": "mobile",`.

- [ ] **Step 3: Renderer**

Em `build.mjs`, em `renderCards`, calcular o selo e a classe:

```js
const selo = p.destaque
  ? `\n            <span class="card-badge card-badge--destaque">${esc(labels.destaque)}</span>`
  : "";
```

Usar `<article class="card${p.destaque ? " card--destaque" : ""}" ...>` e inserir `${selo}` depois do badge de categoria dentro de `.card-img-wrapper`.

- [ ] **Step 4: CSS**

Depois de `.card-actions`, adicionar:

```css
.card--destaque {
  grid-column: 1 / -1;
  flex-direction: row;
}
.card--destaque .card-link {
  width: 55%;
  height: auto;
  min-height: 300px;
  flex-shrink: 0;
}
.card--destaque .card-img-wrapper {
  height: 100%;
}
.card--destaque .card-img-wrapper img {
  object-position: left center;
}
.card--destaque .card-body {
  padding: 2.2rem 2.4rem;
  justify-content: center;
}
.card--destaque .card-body h3 {
  font-size: 1.8rem;
}
.card--destaque .card-body p {
  font-size: 1rem;
  max-width: 48ch;
}
.card-badge--destaque {
  left: auto;
  right: 0.8rem;
  background-color: rgba(124, 92, 255, 0.9);
  border-color: transparent;
}
@media (max-width: 820px) {
  .card--destaque {
    flex-direction: column;
  }
  .card--destaque .card-link {
    width: 100%;
    min-height: 0;
    height: 200px;
  }
  .card--destaque .card-body {
    padding: 1.4rem;
  }
  .card--destaque .card-body h3 {
    font-size: 1.4rem;
  }
}
```

- [ ] **Step 5: Build e asserts**

Run: `node build.mjs`

Depois, com Node, verificar: `projects[0].slug === "minhas-listas"`, o HTML da home contém `card--destaque` uma vez, `Destaque` no card PT e `Featured` no EN, e continuam 10 cards.

- [ ] **Step 6: Conferência visual**

Servir `dist/` e abrir a home em 1280px e 390px. Esperado: card horizontal no desktop, empilhado no mobile, selo legível, sem overflow; filtros continuam funcionando.

- [ ] **Step 7: Commit**

```powershell
git add data/projects.json data/site.json build.mjs assets/css/style.css
git commit -m "improvement: destaca o Minhas Listas como primeiro projeto"
```
