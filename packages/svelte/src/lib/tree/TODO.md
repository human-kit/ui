# Tree TODO

## Goal

Ship a stable `Tree` v1 with accessible hierarchical navigation, expansion, selection, docs, and demos.

## Backlog

### Accessibility

- [ ] [M][P1][Area: Accessibility][Owner: Unassigned][Target: TBD] Validate `Tree` screen reader announcements for nested sections, collapsed branches, and `disabledBehavior` across NVDA and VoiceOver.

### Performance

- [ ] [M][P1][Area: Performance][Owner: Unassigned][Target: TBD] Replace store-backed version counters in `TreeContext` with rune-native state once the v1 API is stable.
- [ ] [M][P1][Area: Performance][Owner: Unassigned][Target: v1] Split structural cache invalidation from focus/selection updates so `visibleNodesCache` and focusable navigation do not rebuild the full visible tree on every arrow-key or selection change in large datasets.
- [ ] [S][P2][Area: Performance][Owner: Unassigned][Target: TBD] Evaluate virtualization primitives for very large trees without breaking roving focus or descendant selection.

### Features

- [ ] [S][P2][Area: Features][Owner: Unassigned][Target: TBD] Add dedicated visual subparts such as `Tree.ItemTrigger`, `Tree.ItemContent`, and selection indicators once the structural contract is proven.
- [ ] [C][P2][Area: Features][Owner: Unassigned][Target: TBD] Evaluate async child loading and load-more patterns for large remote trees.

### Docs

- [ ] [S][P2][Area: Docs][Owner: Unassigned][Target: TBD] Add screen-reader-focused examples and styling recipes for indentation, branch affordances, and selection visuals.

---

## Mejoras recomendadas (detalle)

### Lógica / corrección de comportamiento

- [ ] [S][P0][Area: Logic][Owner: Unassigned][Target: v1] **Hojas vs `hasChildItems`:** Hoy `hasNestedChildren = Boolean(children)` hace que ítems sin hijos en el árbol sigan viendo `hasChildItems === true` si el snippet por defecto existe (p. ej. cuerpo con `{#if node.children}` vacío). Unificar la semántica de “tiene ramas” con hijos registrados (`getFirstChildId` / `childIdsByParent`), actualizar `renderState.hasChildItems`, contexto `hasChildren` del ítem, `aria-expanded` en `treeitem`, `data-has-child-items` y visibilidad del `role="group"` (`hidden` / `aria-hidden`) para que no dependan del mero hecho de tener slot.

- [ ] [S][P1][Area: Logic][Owner: Unassigned][Target: v1] **Una sola fuente de verdad para “tiene hijos”:** Alinear `ctx.hasChildren(id)`, registro `hasChildren` en `registerNode` y lo que usa `Tree.Item` / `Tree.ItemTrigger` para evitar desfases en el primer frame o entre expand por teclado y UI.

- [ ] [S][P2][Area: Logic][Owner: Unassigned][Target: TBD] **`empty` en `Tree.Root`:** Revisar si `itemsArray.length === 0` junto con `getVisibleNodes().length === 0` cubre todos los modos (solo `children`, `items` vacío, secciones sin nodos) sin falsos positivos/negativos en `renderEmptyState`.

### Accesibilidad

- [ ] [S][P1][Area: Accessibility][Owner: Unassigned][Target: v1] **`Tree.ItemTrigger` en hojas:** Si un consumidor renderiza el trigger siempre, hoy puede quedar un `button` deshabilitado con `aria-expanded` y `aria-controls` hacia un grupo vacío. Valorar no renderizar el trigger (o un slot neutro sin rol expandible) cuando no hay hijos reales, alineado con APG.

- [ ] [S][P2][Area: Accessibility][Owner: Unassigned][Target: TBD] **`aria-expanded` en el botón:** Confirmar si `String(isExpanded)` vs omitir el atributo en estados no expandibles satisface el mismo criterio en las combinaciones SR + navegador objetivo.

### Rendimiento

- [ ] [S][P2][Area: Performance][Owner: Unassigned][Target: TBD] **`getDescendantIds`:** Sustituir `queue.shift()` en el BFS por cola con índice o `pop`/`push` en el mismo extremo para evitar coste O(n) por nivel en árboles anchos.

- [ ] [M][P2][Area: Performance][Owner: Unassigned][Target: TBD] **Invalidación de `visibleNodesCache`:** Cualquier `bump` de estructura recompone todo el árbol visible; documentar el límite práctico o explorar invalidación por subárbol si aparece necesidad real.

### API / documentación

- [ ] [M][P1][Area: API][Owner: Unassigned][Target: v1] Define the structural contract explicitly: decide whether `Tree` v1 supports runtime reparenting, section moves, and local `Tree.Item` prop changes without remount, or document stable ids/structure as a required invariant.
- [ ] [S][P1][Area: Docs][Owner: Unassigned][Target: v1] **`onAction` vs selección:** Documentar que, si existe `onAction`, `pressNode` prioriza la acción y no ejecuta `pressSelection` ni expansión; aclarar cómo combinar acción + selección si el producto lo necesita.

### Tests

- [ ] [S][P1][Area: Tests][Owner: Unassigned][Target: v1] **SSR:** Añadir aserción negativa (p. ej. que no exista `data-testid` de trigger en un id de hoja conocido) para evitar regresiones de `hasChildItems` en servidor.

- [ ] [M][P2][Area: Tests][Owner: Unassigned][Target: TBD] **Teclado integrado:** Tests para Enter/Space en fila con y sin hijos, con checkbox y con `ItemTrigger`, para cubrir el reparto entre `tree-root` y `tree-item`.
