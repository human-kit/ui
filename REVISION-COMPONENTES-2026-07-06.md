# Revisión exhaustiva de componentes — @human-kit/ui

**Fecha:** 2026-07-06 · **Alcance:** los 28 componentes + infraestructura compartida de `packages/ui/src/lib` (~35.000 líneas), revisados por 17 agentes independientes (uno por componente grande, agrupando los chicos). Cada hallazgo fue verificado contra el código antes de reportarse.

**Totales:** 6 críticos · ~35 altos · ~70 medios · ~120 bajos.

---

## Estado de resolución (actualizado 2026-07-10)

Ejecutado en 4 olas (Fase 1 manual + 3 olas de agentes), validado con la suite completa: **1344 tests browser + 21 SSR en verde, svelte-check 0 errores (833 archivos)**. ~90 tests nuevos de regresión.

- **Críticos C1–C6: resueltos.** Layer-stack unificado (`primitives/layer-stack.ts`) para dialog/popover/menu; focus-trap consciente de capas; trampas Shift+Tab eliminadas (grupos no tabulables con foco adentro + guards de `relatedTarget`).
- **Altos: resueltos.** Incluye: corrupción de datos en numberfield/timepicker/clock; "hoy" local y sync controlado de calendar; robo de foco (calendar, tree, listbox-hover, popover focus-out, menu sibling-open); `bind:value`/modo controlado en listbox/toggle-group/checkbox/switch/accordion/collapsible/dialog/popover; callbacks de table (`onHiddenColumnsChange`, `onSortChange`) y perf O(células²); combobox (filtro al abrir tecleando, reopen, blur flag); segmentos con `preventDefault` selectivo + `beforeinput` (Android/IME); overflow-row (scroll fantasma, IDs duplicados); `aria-rowindex` en virtualización.
- **Patrones sistémicos: resueltos** los nº 1–9 y 11–13 (controlado, trampas de foco, ButtonRoot id reactivo, orden DOM, IME, composición de handlers en los casos reportados, i18n vía `internal/localized-strings.ts`, `role="group"`, cleanups de refs, consolidación de `strict-props`/`composeEventHandlers`/stepper, weekInfo Firefox). RTL agregado (`internal/rtl.ts` + flechas/pinning lógicos).
- **Tests tested-wrong: invertidos** (calendar readonly/hover-preview, popover focus-steal, datepicker outside-press, numberfield PageDown, table suppress-click, clock disabled, timepicker padding consagrado se mantuvo por decisión).

**Pendiente (seguimiento recomendado, no bloqueante):**
1. Refactors de alto riesgo omitidos deliberadamente: unificar la máquina presence/motion (×4), extraer el motor de segmentos (datepicker↔daterangepicker, ~800 líneas) y el estado compartido clock↔timepicker, migrar los contextos de stores-de-versión (`void $version`) a runas (patrón sistémico nº 10), unificar dialog-trigger/popover-trigger (evaluado y descartado por ganancia marginal).
2. Cola larga de bajos: ver secciones por componente (p. ej. landmark `region` por panel de accordion, semántica radiogroup opcional de toggle-group single, scroll-lock táctil iOS, tab-stops de resizers de table, live region del button dentro del nombre accesible, `aria-label` de tags del combobox para AT).

---

## 1. Hallazgos CRÍTICOS

| # | Dónde | Hallazgo |
|---|-------|----------|
| C1 | `primitives/focus-trap.ts:83-129` + `dialog/content/dialog-content.svelte:143` | **Focus traps apiladas se rompen mutuamente.** Cada trampa escucha `keydown` en `document` sin noción de capas. Con un dialog abierto y otro dialog/popover modal encima, la trampa del padre hace `preventDefault` e intenta enfocar un elemento `inert` (no-op): **Tab queda muerto en el modal superior** salvo en los extremos de la lista. Sin tests de Tab en `nested-dialog.test.ts`. |
| C2 | `dialog-content.svelte:73-81` + `popover-content.svelte:194-202` + `menu-content.svelte:101-108` | **Escape cierra el diálogo Y el popover/menú abierto dentro de él a la vez.** Tres stacks independientes (`dialog-stack`, `popover-stack`, `menu-stack`), cada uno con su `keydown` en `document`, sin mirar `event.defaultPrevented`. Abrir un combobox/datepicker en un modal + Escape = se pierde el modal con su formulario. |
| C3 | `datepicker/input/date-picker-input.svelte:146` + `segment:309` | **Trampa de teclado Shift+Tab.** El `div role="group"` es tabulable y su `onfocus` redirige el foco a un segmento; desde el primer segmento nunca se puede salir hacia atrás (WCAG 2.1.2). |
| C4 | `timepicker/input/time-picker-input.svelte:51-60,88` | **Misma trampa Shift+Tab que C3** (copia del patrón). El check `closest('[data-time-picker-segment]')` es código muerto porque `focus` no burbujea. |
| C5 | `listbox/root/listbox.svelte:172` + `keyboard-navigation.ts:406-418` | **Variante de trampa Shift+Tab en ListBox**: contenedor `tabindex=0` permanente + `handleContainerFocus` que re-enfoca un ítem; el foco no puede salir hacia atrás. |
| C6 | `tree/root/tree-root.svelte:454` | **Doble tab-stop en Tree** (variante menor del mismo patrón: exige pulsación extra para salir hacia atrás; el contenedor no redirige, así que no es trampa completa). |

> C1–C2 son los más urgentes: los overlays son la base de composición de media librería (dialog→popover→menu→combobox/datepicker).

---

## 2. Patrones sistémicos (transversales)

Estos aparecen en 5+ componentes; conviene arreglarlos como decisión de librería, no caso por caso:

1. **Modo controlado que no controla.** Las props `$bindable` se auto-escriben incondicionalmente: el padre nunca puede rechazar un cambio. Confirmado en: checkbox, switch, accordion, collapsible, dialog, popover, combobox, listbox (`bind:value` directamente roto — nunca se escribe de vuelta), toggle-group (además des-selecciona y notifica por su cuenta al deshabilitar un toggle), datepicker (`bind:open` en primer render), tabs (`bind:value` sin sync inicial).
2. **Trampas/redirecciones de foco con Tab/Shift+Tab** (C1–C6). Decisión de librería: los grupos con roving tabindex no deben ser tabulables ellos mismos, o deben inspeccionar `relatedTarget`.
3. **`untrack(() => id)` congela ids.** Cambiar la prop `id` (o `value` en tabs/accordion vía ButtonRoot) rompe silenciosamente los enlaces ARIA (`aria-controls`/`aria-labelledby` apuntando a ids inexistentes). Presente en prácticamente todos los componentes; el caso grave es `button-root.svelte:93` porque tabs/accordion sí soportan `value` dinámico.
4. **Orden de navegación = orden de registro, no orden del DOM.** Insertar/reordenar ítems dinámicamente rompe flechas, Home/End y fallbacks. En: accordion (`itemOrder.push`), tabs, toggle-group, tree (reordenación imposible: comparación circular), listbox (`getNext/PreviousItemId`, muerto).
5. **Sin manejo de IME** (`event.isComposing`/`keyCode 229`). Enter de confirmación de composición selecciona ítems o comete valores. En: combobox, autocomplete, numberfield (muta `input.value` durante composición), datepicker/daterangepicker/timepicker (contenteditable sin `beforeinput`; en Android los dígitos no funcionan).
6. **`restProps` esparcido después de los handlers internos.** Pasar `onclick`/`onkeydown`/`style` legales según el tipo mata silenciosamente selección/navegación/posicionamiento. En: table (cell/row), tree (root e items), menu-content, clock wheel-column, checkbox/switch (`onkeyup`/`onblur` descartados), overflow-row (style no replicado al espejo).
7. **Tres+ convenciones de composición de handlers externos** (externo-primero cancelable / interno-primero / `skipExternalOnDefaultPrevented`) conviviendo en checkbox, switch, button, toggle, accordion, tabs, dropzone. Fijar una y aplicarla en todos.
8. **Strings hardcodeadas en inglés** en una librería localizada: calendar triggers ("Next page"), popover "Calendar", tree checkbox ("Select X"), table (anuncios de sort/resize/selección), numberfield (mensajes de validación — con labels sí localizados; y "Erhoehen" → "Erhöhen"), clock (`aria-roledescription` solo es/pt/en), timepicker (AM/PM crudos con placeholder localizado), combobox trigger ("menu").
9. **`aria-label` sobre `div` sin role** (prohibido en role `generic`, los AT lo ignoran): datepicker, daterangepicker, timepicker, calendar, autocomplete. Fix: `role="group"`.
10. **Antipatrón de reactividad "stores de versión + `void $version`"** en contextos `.ts` planos: accordion, tabs, toggle-group, calendar, table, tree. Causa raíz directa de ~10 bugs de staleness reportados (tabindex de fila no reactivo, trigger de tree congelado, celdas de calendar stale, etc.). Migrar a `.svelte.ts` con `$state`/`$derived`.
11. **Efectos de registro sin cleanup** (`setTriggerRef`/`setInputRef`/`setListboxCtx` sin `return () => set(null)`): datepicker, daterangepicker, timepicker, menu, dialog, popover, combobox, autocomplete, input/textarea/dropzone (`element` bindable). Nodos desconectados retenidos + anclas de posicionamiento muertas.
12. **Duplicación copy-paste con drift ya observable:** datepicker↔daterangepicker (~800 líneas), clock↔timepicker (~150 líneas de estado), combobox↔autocomplete, toggle↔button (~200 líneas), increment↔decrement (numberfield), dialog-trigger↔popover-trigger (byte a byte), `strict-props.ts` ×3 (la versión de timepicker ya evolucionó), `composeEventHandlers` ×3 en input/textarea/dropzone, 4 copias de la máquina presence/motion.
13. **SSR/locale:** sin `LocaleProvider`, el fallback `Intl.DateTimeFormat().resolvedOptions().locale` usa el locale del **servidor** → mismatch de hidratación (orden de segmentos, número de columnas del clock, formato de numberfield). Documentar LocaleProvider como requisito en SSR.

---

## 3. Infraestructura compartida (`primitives`, `hooks`, `utils`)

Un bug acá afecta a todos los componentes.

- **[CRÍTICO]** `focus-trap.ts:83-129` — trampas apiladas sin noción de capa (ver C1). Además: filtro `offsetParent !== null` incluye elementos inert/`visibility:hidden` y excluye `position:fixed` (`:48-52`); rAF de `activate()` sin cancelar (`:112-127`); `update()` desactiva con `restoreFocus` viejo (`:149-157`); `FOCUSABLE_SELECTOR` incompleto (audio/video/iframe/summary/contenteditable="").
- **[ALTO]** `motion.ts:82-85` — `trackMotionEnd` termina en el **primer** `transitionend`: con `transition: opacity 150ms, transform 300ms` los overlays se desmontan a mitad de la animación de salida.
- **[ALTO]** `floating.ts:255-290` — `update()` con closures obsoletos: cambiar `placement`/`offset`/`boundary` o re-vincular el trigger no tiene efecto (posiciona contra el anchor original). `:228` — anchor null al montar → la acción no devuelve `update`/`destroy`: muerta para siempre. `createFloating` (`:142-209`) es API pública muerta, duplicada y sin `strategy:'fixed'`.
- **[ALTO]** `click-outside.ts:30` — la heurística top-layer solo reconoce `[role="dialog"]`: **un Menu abierto dentro de un Popover cierra el popover al clickear sus items**. `:68` — solo `mousedown` (táctil frágil); usar `pointerdown`.
- **[ALTO]** `aria-hide-outside.ts:145-165` — rAF sin cancelar: toggle rápido (doble click en trigger) sobrescribe `result` y **deja toda la página `inert`/`aria-hidden` permanentemente**. Sin MutationObserver (toasts portaleados después quedan visibles a AT; live regions se silencian).
- **[MEDIO]** `keyboard-navigation.ts:199-210` — el store de foco tiene prioridad sobre `document.activeElement` y no se sincroniza con `focusin`: flechas navegan desde el ítem equivocado. `:347-350` — `preventDefault` de `event.repeat` para toda tecla no-flecha bloquea Tab mantenido (mini-trampa). `:299-307` — typeahead no cicla desde el ítem enfocado y Espacio se consume antes. `:465` — `rovingTabindex.update` ignora opciones nuevas.
- **[MEDIO]** `hooks/use-virtual-focus.svelte.ts:197-204` — `pendingFocusDirection: 'last'` nunca se limpia: cada re-registro (filtrado por tecleo) roba el foco virtual. `'first'` asume orden de registro = DOM. Registro O(n²) (`itemIds = [...itemIds, id]`). `unregister` del ítem enfocado resetea a null (pierde posición).
- **[BAJO]** `collapse-transition.svelte.ts` — `forceMount` true→false con panel cerrado deja `mounted=true` para siempre; tras cerrar sin forceMount se observa el panel oculto y las medidas se pisan a 0. `scroll-lock.ts:33` — `overflow:hidden` no bloquea scroll táctil iOS; se libera al inicio de la animación de salida (layout shift). `input-modality.ts:35-38` — detección `virtual` muerta tras la primera interacción (SR pueden perder el focus ring). `cn.ts:18` — `cn(0)` produce `class="0"` contradiciendo su propio contrato. `date-only.ts:56-62` — comparador devuelve 0 ante entradas inválidas (orden no transitivo). Exports de `primitives/index.ts` inconsistentes.

---

## 4. Hallazgos por componente

### table (sin críticos; 5 altos, 12 medios, 14 bajos)

- **[ALTO]** `root/context.ts:1516-1538` — `onHiddenColumnsChange` **no se invoca nunca** (verificado por grep). Cambios vía `context.setHiddenColumns()` no notifican y el `$effect` de sincronización los **revierte**.
- **[ALTO]** `root/table-root.svelte:409-418` — `sortDescriptor` sin guard: `onSortChange` se dispara **en el mount** (controlado) y **dos veces** por cada toggle; live region re-anuncia si el padre re-crea el objeto.
- **[ALTO, perf]** `context.ts:888-1009` — cachés de orden de columnas solo activas en SSR (`!IS_BROWSER`): en browser cada celda reconstruye el mapa con `compareDocumentPosition` → O(células²). Agravado por `table-cell.svelte:73-77`: el derived `column` depende de `$focusVersion` sin necesitarlo → cada flecha recalcula todas las celdas.
- **[ALTO, a11y]** virtualización sin `aria-rowindex` en ninguna fila con `aria-rowcount` total (`table-root.svelte:517`): posiciones incorrectas para lectores de pantalla.
- **[MEDIO]** `context.ts:1742-47` — fuga: `unregisterRow` no limpia `cellOrder` (crece sin límite con paginación/virtualización). · `flushSync` alcanzable dentro de `$effect` (`context.ts:529`, `table-body.svelte:119-127` en cada scroll) — error `flush_sync_in_effect` bajo async mode. · `minimumTableWidth` puede quedar obsoleto para siempre (guard temprana sin leer versiones, `table-root.svelte:216-228`). · `tabindex` del `<tr>` no reactivo a foco (`table-row.svelte:301-307`). · RTL: flechas, pinning (`style:left/right` físicos) y handle del resizer en el borde equivocado. · `restProps` pisa handlers de cell/row. · i18n hardcodeada. · Cada resizer es tab stop permanente (APG: un solo tab stop). · `Table.SortTrigger` sin children lanza TypeError (tipo lo permite). · `selectAllRows` emite sin dedupe. · Desmontar el resizer de B aborta el drag de A.
- **[BAJO]** mecanismo `suppressHeaderClickOnce` inoperante (valor devuelto ignorado, y el test que lo cubre pasa trivialmente); `table-checkbox-body-root.svelte` es código muerto (137 líneas); `disabledKeys` expuesto como Set mutable; doble `onColumnWidthsChange` al soltar drag; ids de columna duplicados sin warning; ternario muerto en `formatCssLength`; sort trigger sin registro SSR (`aria-sort` ausente en HTML servido); empty-state fuera de la contabilidad ARIA; `visibleRange` ignora offset del thead.

### tree (3 altos, ~12 medios)

- **[ALTO]** `tree-root.svelte:204-219` — el `$effect` de reubicación **roba el foco global**: llama `element.focus()` + `scrollIntoView` aunque el foco del documento esté en un input externo (basta cambiar `disabledKeys`).
- **[ALTO]** `tree-item-renderer.svelte:38-40` — `node.disabled`/`level` capturados con `untrack` una vez: `disabled` dinámico deja la fila sin `aria-disabled` y clickeable (el teclado sí la salta).
- **[ALTO]** `context.ts:550-564` — `unregisterNode` muta selección/expansión sin emitir cambios ni bumpear versiones: `bind:selectedKeys` desincronizado y `aria-checked="mixed"` obsoleto en ancestros.
- **[MEDIO]** mezclar `Tree.Section` + ítems sueltos hace desaparecer los sueltos (`context.ts:462-484`); identidad de claves inconsistente (`idsEqual(1,'1')` true, los Set no); falta `aria-selected` en multiple **con test que lo consagra** (`tree.test.ts:192`); IDs DOM colisionables entre dos árboles; `bind:expandedKeys` + callback = cambios que "rebotan"; flag `suppressNext*Change` puede quedar colgado; fast-path de registro roto (siempre bumpea estructura tras el mount); reordenación dinámica imposible (comparación circular); O(n²) en selección propagada/BFS/navegación; doble tab-stop; `restProps` pisa handlers; `Tree.Trigger.isDisabled` es `$derived` sin dependencias (congelado); `hasChildItems` write-once (branch fantasma al vaciar hijos).
- **[BAJO]** typeahead timeout sin cleanup; `void $configVersion` en handler (muerto); estado vacío no renderiza en SSR; label de checkbox en inglés; doble render (registro oculto) duplica instancias.

### dialog / popover / portal (2 críticos arriba; 4 altos, ~8 medios)

- **[ALTO]** click en backdrop cierra popover Y diálogo en el mismo mousedown (stacks separados).
- **[ALTO]** `popover-root.svelte:107-114` + `focus-state.ts` — el popover **roba el foco de vuelta al trigger** en `focus-out` y `outside-press` (contra APG/React Aria/Radix). **Tested-wrong**: `popover-content.test.ts:295` lo consagra.
- **[ALTO]** `popover-content.svelte:369-377` — `preventDefault()` en el mousedown exterior: el primer click en un input externo cierra el popover pero el input no recibe foco ni caret.
- **[ALTO]** `aria-hide-outside` rAF (ver §3): página inert permanente con toggle rápido.
- **[MEDIO]** doble restauración de foco al cerrar dialog (trap + root compiten; pasar `restoreFocus:false` al trap como popover); `dialog-portal.svelte:65-89` — sin `motionTarget` el portal nunca desmonta (overlay `fixed inset-0` eterno); modo controlado auto-sobrescrito (`openProp = value`) en dialog y popover; `releaseFocusedDescendant` corre antes de que el cierre pueda cancelarse y el flag queda pegado; scroll externo cierra el popover con reason `'outside-press'` falso; 3 listeners de `document` (incl. scroll en captura) vivos por instancia aunque esté cerrado.
- **[BAJO]** `DialogStateHelpers.close` tipado `() => void` pero el snippet pasa el MouseEvent como `reason` (degrada modalidad a `'virtual'`); `triggerRef` sin cleanup al desmontar (dialog y popover, byte a byte); niveles de stack duplicados con hermanos; `aria-hidden` + `inert` en salida (dialog ya lo corrigió, popover/menu no); portal: `target` solo string, no reactivo, SSR renderiza inline (flash); 4 copias de presence/motion; Popover.Root no expone helpers en snippet (Dialog sí).

### menu (2 altos, ~7 medios)

- **[ALTO]** `menu-content.svelte:299-307` — el `clickOutside` del submenú trata el menú padre como "fuera": click en el padre cierra toda la cadena; **click en el trigger raíz con submenú abierto reabre el menú**.
- **[ALTO]** `menu-state.svelte.ts:146-237` — cierres internos de submenú usan razón `'imperative-action'` (en `TRIGGER_REFOCUS_REASONS`): un rAF devuelve el foco al trigger del submenú cerrado → **Enter activa el ítem equivocado** (estado partido entre highlight y activeElement).
- **[MEDIO]** Tab cierra pero el foco escapa al final del documento (no al sucesor del trigger); listeners de `document` permanentes por instancia; `restProps` pisa `style`/`onpointerenter` (rompe fixed positioning y safe-triangle); `onOpenChange` duplicado (sin guard no-op; Enter en submenu trigger lo abre **dos veces**); `details.cancel()` de un cierre borra igualmente el highlight; `textValue` es API muerta para typeahead (**cero tests de typeahead**); trigger ref sin cleanup.
- **[BAJO]** ArrowLeft reporta razón `escape-key` falsa; `toggle` no resetea `closeReason`; `ctx.isHighlighted` no reactivo; 2 listeners de window por ítem; hover-out no des-resalta; `onclick` externo no se llama en activación por teclado; apertura de submenú sin delay de intención; stack global bloquea menús concurrentes.

### combobox (6 altos, ~8 medios)

- **[ALTO]** abrir tecleando con selección previa desactiva el filtro y deja el foco en el ítem viejo (escribir "B"+Enter re-selecciona "Apple") — `combobox.svelte:441-453`.
- **[ALTO]** reabrir durante la animación de cierre deja la navegación muerta (`navigation.reset()` + ítems aún montados nunca se re-registran) — `:457-461`.
- **[ALTO]** `popoverPointerDownPending` obsoleto se traga el siguiente blur real (input muestra "xyz" con otro valor seleccionado) — `:124,550-566`.
- **[ALTO]** sin manejo de IME (Enter de composición selecciona ítems) — aplica también a autocomplete.
- **[ALTO]** foco virtual de tags invisible para AT (sin `aria-activedescendant` a tags, sin anuncios; Delete borra sin confirmación audible).
- **[ALTO]** `use-virtual-focus` `pendingFocusDirection:'last'` roba el foco en cada registro (ver §3).
- **[MEDIO]** contrato controlado roto (props auto-escritas; ramas if/else idénticas = código muerto de un intento de modo controlado); `selectedLabels` es `Map` plano en `$state` (mutaciones no reactivas — funciona de casualidad); Escape dispara `onOpenChange(false)` **dos veces**; rAF de focus del input sin verificar que siga enfocado ni cancelarse; Trigger/Button duplicados byte a byte y solo operables por ratón (`onmousedown`, sin `onclick` — con `tabindex=0` no responden a Enter/Space) con `aria-label` "menu" incorrecto; `handleSelectionChange` toma `[0]` del set (bomba latente en multiple); sin live region de resultados del filtrado (autocomplete sí la tiene).
- **[BAJO]** `renderItem` API muerta; `defaultValue` sin `items` = input vacío que luego cambia solo; refs sin cleanup; `aria-controls` a id inexistente cerrado; `getContext` sin guard en subcomponentes; `textValue` dinámico no actualiza labels de navegación.

### autocomplete / listbox (3 altos, ~8 medios)

- **[ALTO]** `listbox.svelte:56` — **`bind:value` roto**: nunca se escribe de vuelta; modo controlado inexistente (`select()` muta interno directo).
- **[ALTO]** `listbox-item.svelte:341-379` — **hover roba el foco DOM real** (con rAF que lo re-roba): pasar el mouse sobre un listbox mientras tipeás en otro input te saca el foco.
- **[ALTO]** `autocomplete-item.svelte:73-86` — efecto de registro sin `untrack` (su gemelo combobox sí lo tiene): O(N²) en montaje/filtrado, riesgo de `effect_update_depth_exceeded`.
- **[MEDIO]** `selectionMode`/`selectionBehavior`/`disabledKeys` pasados como getters pero destructurados una vez (congelados; `aria-multiselectable` queda contradictorio); `disabledKeys` como `Set` plano (ítems muertos que parecen habilitados); sin typeahead/loop configurables; `readonly` no bloquea selección en autocomplete (Enter/click cambian el valor); estado de foco obsoleto tras blur (ring fantasma + `aria-activedescendant` colgado + input que suprime su propio `data-focused`); Escape sin `stopPropagation` (cierra el Dialog contenedor al limpiar la query); `Empty`/`Status` anuncian "No results" con opciones deshabilitadas visibles; `aria-label` en div sin role.
- **[BAJO]** código muerto `getNext/PreviousItemId`; colisión ids `"1"` vs `1`; `onChange` shape inconsistente (Set vs valor); 3 listeners de window por ítem; selectores sin `CSS.escape` / ids DOM inválidos con espacios; `Autocomplete.Empty` como div sin role dentro de `role="listbox"`; `setListboxCtx` sin cleanup (compartido con combobox).

### datepicker (1 crítico C3; 3 altos, ~7 medios)

- **[ALTO]** `segment:272` — `preventDefault()` incondicional: bloquea Ctrl+C, Ctrl+A, F5, Escape, Enter (no se puede enviar el form ni copiar); Ctrl+1/Alt+2 se interpretan como dígitos.
- **[ALTO]** `contenteditable` sin `beforeinput`/`paste`: pegar, drag-drop, IME y teclados Android desincronizan el DOM del estado (edición inservible en móvil).
- **[ALTO]** `calendar/date-picker-calendar.svelte:54` — `value ?? undefined`: limpiar el valor no deselecciona el día en el calendario (Calendar interpreta `undefined` como no controlado).
- **[MEDIO]** prop controlada `open` ignorada en primer render (flicker + mismatch SSR); `value` externo inválido deja el binding del padre con basura; primera flecha en segmento vacío salta el valor base; `bind:open` abre el popover con el picker `disabled`; `strict-props.ts` triplicado con drift; `aria-valuetext` de vacío anuncia "dd"/"yyyy" en inglés.
- **[BAJO]** `aria-valuemax` día=31 fijo; segundo dígito imposible clampa a 31 silenciosamente; commit progresivo de fechas intermedias (colaterales con minValue y popover abierto); `aria-label` en div sin role; `formatSegment` con ramas muertas; placeholders sin localizar; año base con `getUTCFullYear` (difiere del año local en bordes); zero-padding inconsistente; trigger sin cleanup; autofill del proxy no sincroniza.
- **Positivo:** aritmética de fechas 100% UTC sin pitfalls DST; Feb 30/bisiestos validados; ciclo de commit bien testeado; sin leaks.

### daterangepicker (3 altos, ~5 medios)

- **[ALTO]** Escape cancela la selección pendiente Y cierra el popover a la vez (el listener del popover no mira `defaultPrevented`) — cancelar-sin-cerrar es imposible.
- **[ALTO]** `isInvalidDraft` global: terminar de teclear un start válido marca **ambos** inputs `aria-invalid` mientras el end sigue vacío (contradice el README; drift vs datepicker).
- **[ALTO]** mismo `null→undefined` que datepicker: limpiar no limpia el calendario montado.
- **[MEDIO]** rango tecleado no valida días no disponibles interiores (el calendario sí — contrato inconsistente); preview de hover nunca se limpia al salir el mouse y **Enter confirma contra un hover rancio**; cambios de min/max no invalidan la caché de disponibilidad; `aria-invalid` sobre `role="group"` no llega a AT (debería ir en los spinbuttons); sin `beforeinput` (compartido).
- **[BAJO]** normalización asimétrica del rango invertido init/update; ~800 líneas copiadas de datepicker con drift; RTL sin espejar; roving target duplicado con outsideDays+multi-mes; "Calendar" sin localizar; trigger sin cleanup.
- **Positivo:** máquina de estados de rango correcta y bien testeada; ARIA del grid en rango correcto.

### calendar (5 altos, ~9 medios)

- **[ALTO]** `date-utils.ts:63-66` — **"hoy" usa fecha UTC, no local**: en UTC-3 a las 22:00, `data-today`/`aria-current` marcan mañana y el calendario sin valor abre en la fecha (o mes) equivocado durante horas cada día. El test se autovalida contra la misma función defectuosa.
- **[ALTO]** `context.ts:342-409` — `syncExternal` resetea foco/mes visible incondicionalmente con `value` controlado (cualquier re-render del padre); en modo range **destruye el draft en curso**.
- **[ALTO]** `value === undefined` no limpia la selección (raíz del bug de integración con datepicker/daterangepicker).
- **[ALTO]** `body-cell:149-164` — robo de foco tras navegar de mes: `handledFocusRequestVersion` arranca en 0 por instancia vs store global creciente → tras usar una flecha, cada click en "Next" roba el foco al grid.
- **[ALTO]** `readonly`/`disabled` ocultan la selección (`aria-selected="false"` en la fecha elegida) — **tests lo consagran** (`calendar-body-cell.test.ts:74-94`).
- **[MEDIO]** `visibleMonths={0}` crashea en primer render/SSR (clamp solo en sync); sin `minValue`/`maxValue` de primera clase (triggers nunca se deshabilitan); antipatrón stores de versión (causa de staleness múltiple); deriveds de cell leen `isDisabled`/`isReadOnly` sin suscripción; `todayDate` calculado una vez (cruce de medianoche); `aria-label` en div sin role; `inert` con `disabled` borra el calendario del árbol de accesibilidad; `Intl.weekInfo` no funciona en **Firefox** (getter vs `getWeekInfo()` → semana siempre domingo-primero); triggers "Next/Prev" en inglés.
- **[BAJO]** keying por fecha destruye/recrea 42×N celdas por navegación (precondición del robo de foco); `setHoveredValue(undefined)` no limpia; `isRangePathSelectable` O(días) con caché que se vacía por mes; headers `narrow` sin nombre completo ("M" duplicada); `'Spacebar'` legacy inconsistente; test de focus-search vacuo.

### clock (1 alto, ~8 medios) — es una rueda estilo iOS, no un reloj analógico

- **[ALTO]** `wheel-options.ts:78` vs `clampToStep` (`time-utils.ts:242-248`): grilla anclada en min=1 vs redondeo anclado en 0 — en 12h con `hourStep=2`, seleccionar "3" comete "4" (valor que no existe en la rueda) y rompe selección/ARIA. **Ningún test ejercita steps ≠ 1.**
- **[MEDIO]** cambio dinámico de `hourCycle`/locale deja el draft obsoleto (early-return antes de leer la dependencia → valor anulado o rueda desincronizada); min/max sobre-restringe por columna (con `min=09:30`, la hora 9 se deshabilita entera); commit fuera de rango publica `null` sin señal (timepicker sí expone `isInvalidDraft`); valor controlado no se valida contra min/max (asimetría); ~150 líneas de estado duplicadas con timepicker (drift ya presente); `disabled` no bloquea scroll/click/teclado de la rueda (test incompleto lo enmascara); snap en `pointer-release` mata la inercia táctil de los flicks; mismatch SSR de `hourCycle` (columna AM/PM aparece/desaparece al hidratar).
- **[BAJO]** `restProps` pisa handlers de la columna; doble invocación de center por click; `aria-roledescription` solo es/pt/en; live region duplicada + `sr-only` externo (sin Tailwind se pinta dentro de la rueda); valor fuera de grilla = rueda alineada a ítem no seleccionado; regex estricta (`"9:30"` → null con normalización asimétrica); `id` congelado; carrera `scrollend` en scroll silencioso; clases Tailwind (`h-55`) en librería headless.
- **Positivo:** sin leaks (listeners/rAF/timers limpios); conversión 12h↔24h correcta en bordes.

### timepicker (1 crítico C4; 4 altos, ~6 medios)

- **[ALTO]** `segment:70-79` — `aria-valuenow="0"` en segmentos vacíos (`Number('')===0`; datepicker tiene la guarda, esta copia la perdió).
- **[ALTO]** `root:155-163` — cambio de `hourCycle`/locale no reconstruye el draft: con `value="14:30"` en 12h, pasar a 24h muestra "2:30" y la siguiente edición **comete 02:30** (corrupción silenciosa).
- **[ALTO]** `root:364-417` — buffer de tipeo no se limpia tras Backspace/flechas: borrar y teclear "5" comete "35".
- **[ALTO]** `hourStep>1` en 12h: tres implementaciones de step desalineadas (rueda/flechas/clamp) — mismo hallazgo que clock, confirmado independientemente.
- **[MEDIO]** Enter/Espacio en segmento re-enfoca otro segmento (el grupo no mira `defaultPrevented`); `beforeinput` bloqueado incondicional → **dígitos rotos en teclados Android**; reset DOM con `{#key}` destruye el elemento enfocado (foco a `<body>` en mitad de edición IME); trigger sin cleanup; AM/PM crudos con placeholder localizado; sin proxy `<input>` para formularios (datepicker sí lo tiene — drift de API).
- **[BAJO]** `"9:00"` (H:mm) se coerce a `null` **mutando el binding del padre en el mount**; commits intermedios espurios al tipear; min/max inválidos ignorados sin warning; hora 24h sin padding ("5:05", test lo consagra); formatters Intl sin cache; `strict-props` duplicado; atajos a/p solo ingleses; clock inline nunca alinea las ruedas; `aria-label` en div sin role.

### numberfield (2 altos, ~7 medios)

- **[ALTO]** `input:169-181` — **Home/End cometen un valor incorrecto en locales con punto de miles**: `String(0.5)` → se elimina el `.` como separador de grupo → comete **5** en es-AR/de-DE (y `1e-7` → inválido). Corrupción silenciosa con `onChange` y estado `synced`.
- **[ALTO]** `number-utils:228-241` — `"1."`/`"1,"` a medio escribir se clasifica `invalid`: `aria-invalid` + `setCustomValidity` en **cada** entrada decimal de cualquier usuario; blur en ese estado descarta el draft.
- **[MEDIO]** steppers: interval de repetición huérfano al deshabilitarse en pleno hold (Safari suprime pointer events en disabled) — puede **reanudarse solo** cuando el valor baja de max; PageUp/PageDown ignoran `largeStep` (**test lo consagra**, contra APG); `snapOnStep` convierte Ctrl+Arrow (smallStep) en no-op; sin guardas IME (muta `input.value` durante composición); pegar `"1e5"` → **15** silencioso; `teleportDistance` es código muerto y `ScrubAreaCursor` no implementa nada (API engañosa vs Base UI); mensajes de validación en inglés (labels sí localizados).
- **[BAJO]** `pointerup` ajeno (click derecho) comete el draft; redondeo asimétrico en negativos (−0.025→−0.02, 0.025→0.03); redondeo silencioso a 3 decimales sin `formatOptions`; modificadores fuerzan focus-visible; `"12.5"` en percent sin decimales → 125; dígitos full-width rechazados; `inputState` obsoleto al cambiar min/max; increment/decrement duplicados (~150 líneas); scrub sin `touch-action` (roto en móvil); "Erhoehen"→"Erhöhen"; `'input-clear'` y params `event`/`reason` muertos.

### tabs / toggle / toggle-group (2 altos, ~8 medios)

- **[ALTO]** toggle-group `context.ts:208-297` — **reconciliación ignora `isControlled`**: deshabilitar un toggle seleccionado vacía la selección, sobrescribe el `value` bindable del padre y dispara `onChange([])` sin interacción. Tabs hace lo contrario deliberadamente (con test); toggle-group no tiene test de ese caso.
- **[ALTO]** tabs `tabs-tab.svelte:133` + `button-root.svelte:93` — id del botón congelado por ButtonRoot: cambiar `value` dinámico (soportado explícitamente) deja `aria-labelledby` del panel apuntando a un id inexistente.
- **[MEDIO]** tabs: `onChange` disparado en montaje/SSR con `defaultValue` deshabilitado (toggle-group ya lo arregló — drift); `Tabs.List` traga el `onkeydown` externo (contrato opuesto a toggle-group); navegación por orden de registro; sin RTL; `bind:value` sin sync de la autoselección inicial; duplicados de `value` silenciosos (toggle-group lanza error); `onChange` espurio en teardown del árbol. toggle: deshabilitar un toggle agrupado apaga el focus-visible de **todo el grupo**; ~200 líneas duplicadas de ButtonRoot con `composeEventHandlers` divergente. toggle-group: `single` sin semántica de exclusividad para AT (ni radiogroup ni documentación).
- **[BAJO]** stores de versión (invalidación gruesa); Indicator recrea observer/listeners en cada cambio de foco; live region de ButtonRoot dentro de `role="tab"` (children presentational); round-trip de value por dataset con edge NaN; IIFEs noop; `setDisabledKeys` bumpea sin comparar; Set mutable expuesto; mapa `panels` muerto; `ToggleRootProps` definido dos veces; README de toggle desactualizado.

### accordion / collapsible (1 alto, ~6 medios)

- **[ALTO]** `context.ts:260-262` — orden de navegación = orden de montaje: insertar/reordenar ítems dinámicos rompe flechas/Home/End y el fallback de `disallowEmptySelection`.
- **[MEDIO]** mutaciones silenciosas (`notify:false`) desincronizan `bind:value`/`onChange` (cambiar `selectionMode` en runtime, deshabilitar un ítem abierto; en controlado se filtra el disabled sin avisar); modo controlado no puede rechazar cambios (accordion y collapsible); id congelado de ButtonRoot rompe ARIA con `value` dinámico (mismo que tabs); handlers externos sin veto y `onkeydown` omitido en teclas de navegación; sin RTL horizontal; antipatrón stores de versión con `void $stateVersion` en 11 deriveds (vs collapsible que es reactivo natural — drift estructural).
- **[BAJO]** `===` vs `valuesMatch` inconsistente; valores duplicados sin warning; IIFEs noop; JSDoc de `context` engañoso; `data-focused`/`data-focus-visible` del trigger pisados por ButtonRoot (código muerto); focus programático frágil (existe `focusWithModality` y no se usa); `disabled` nativo saca del tab order (documentar); `role="region"` incondicional (landmark por panel); `forceMount` no reactivo; medición sobre panel oculto pisa alturas a 0; `aria-expanded` boolean vs string entre hermanos; `onOpenChange` vs `onChange` inconsistente para el mismo shape.

### checkbox / switch / button (3 altos, ~7 medios)

- **[ALTO]** `readonly` bypasseado por click en `<label>` asociado (checkbox y switch): el click llega al input oculto (donde `readonly` no aplica) y `handleInputChange` publica sin validar. El README de switch recomienda justamente envolver en label.
- **[ALTO]** modo controlado inaplicable: `checked` se auto-asigna en init (`isCheckedControlled` siempre true, `checkedInternal` muerto) y `publishState` sobreescribe la prop incondicionalmente.
- **[ALTO]** `form.reset()` desincroniza: el navegador restaura el input oculto sin `change` y el componente sigue mostrando el estado anterior (checkbox tiene TODO; switch ni eso, y promociona "form support").
- **[MEDIO]** `checked+indeterminate` no envía nada al form (modelo ternario no documentado); Enter togglea el checkbox y bloquea el submit implícito (ARIA: solo Space); `onkeyup`/`onblur` del consumidor descartados; orden de composición de handlers inconsistente; el `<label for>` nombra al input `aria-hidden`, no al `role="checkbox"` (los fixtures duplican con `aria-label` — WCAG 4.1.2 sin eso); checkbox sin prop `form` (switch la tiene). button: live region dentro del `<button>` contamina el nombre accesible; `pendingAnnouncement` lee el DOM en un `$derived` (anuncio obsoleto); falta `aria-busy`; `pressed` documentado como override pero es OR (no puede forzar false).
- **[BAJO]** `readonly` renderizado en input checkbox (inválido); `element` sin anular al desmontar; `style:position` pisa el del consumidor; validación `required` con globo anclado al input invisible; monkey-patch de `event.preventDefault`; `data-pressed-when-expanded` + MutationObserver indocumentado; `cn(className)` noop; JSDoc solo en switch.

### input / textarea / label / dropzone / overflow-row / locale-provider (0 críticos; 2 altos)

- **[ALTO]** overflow-row: el espejo de medición (`position:absolute; width:max-content; visibility:hidden`) **genera scroll horizontal fantasma** en la página justo en el caso de uso principal. Fix: wrapper `width:0;height:0;overflow:hidden`.
- **[ALTO]** overflow-row: el espejo duplica el render completo del snippet — **IDs duplicados** (rompen ARIA/labels) y `$effect`s de los ítems corriendo dos veces.
- **[MEDIO]** overflow-row: medición asume un nodo raíz por ítem; sin re-medición ante webfonts/contenido async. dropzone: **cero feedback cuando todos los archivos se rechazan por `accept`** (falta `onFilesRejected`); flicker de `data-drop-target` en Safari (usar contador, no `relatedTarget`); el consumidor no puede cancelar la apertura del picker. textarea: sin la corrección de `autofocus` que Input sí tiene (roto en dialogs); no exporta `TextAreaProps`.
- **[BAJO]** dropzone: directorios emitidos como Files inválidos; `type:''` nunca matchea MIME; sin paste; `hovered` no expuesto; input oculto sin `disabled`. input/textarea/dropzone: `id` no reactivo; `element` bindable sin cleanup; `aria-readonly`/`aria-required` redundantes; focus-visible con modificadores sueltos; `composeEventHandlers` triplicado; doble resize por tecla (textarea); salto de scroll por `height:auto` transitorio. label: sin `element`/`data-label-root`/prevención de selección por doble click. locale-provider: store en librería de runas; `useLocaleContextOptional` alias exacto de `getLocaleContext`; documentar LocaleProvider como obligatorio en SSR.

---

## 5. Tests que consagran comportamiento incorrecto ("tested-wrong")

1. `calendar-body-cell.test.ts:74-94` — readonly/disabled ocultan `aria-selected`.
2. `popover-content.test.ts:295` — robo de foco al trigger tras enfocar un botón externo.
3. `tree.test.ts:192` — `aria-selected` ausente en modo multiple.
4. `number-field.test.ts:528-529` — PageDown = step normal (ignora `largeStep`).
5. `timepicker` `segment.test.ts:61-68` — hora 24h sin padding.
6. `table-column-resizer.test.ts:368` — test de supresión de click que pasa trivialmente (no verifica el feature).
7. `context.test.ts:5-16` (calendar) — test vacuo de focus-search sobre implementación que ya no existe.
8. Tests de `disabled` en clock (`clock-root.test.ts:124-135`) y de hold-at-max en numberfield que enmascaran los bugs por usar eventos sintéticos / asertar solo el valor.

**Huecos de cobertura recurrentes:** Shift+Tab (ningún componente lo testea), modo controlado rechazando cambios, IME, RTL, ítems dinámicos (insertar/reordenar/deshabilitar), `form.reset()`, steps ≠ 1, overlays anidados (Escape/click-outside/Tab), locales con punto de miles.

---

## 6. Priorización sugerida

**Fase 1 — plataforma de overlays y foco (desbloquea todo lo demás):**

1. Layer-stack unificado dialog/popover/menu (C2, click-outside en cadena, `isInTopLayer` con selector compartido).
2. `focus-trap` consciente de capas + filtro de focusables real (C1).
3. `aria-hide-outside`: cancelar rAF (página inert permanente).
4. `floating.update()` sin closures obsoletos + anchor tardío.
5. Eliminar las trampas Shift+Tab (C3–C5): decisión única de librería sobre grupos tabulables.
6. `motion.ts`: no terminar en el primer `transitionend`.

**Fase 2 — contratos de estado:**
7. Semántica de modo controlado única para toda la librería (afecta ~12 componentes; hoy cada uno la viola distinto).
8. `resolvedId` reactivo en ButtonRoot (arregla tabs+accordion de una vez) y política para `untrack(() => id)`.
9. Orden de navegación por DOM, no por registro (accordion/tabs/toggle-group/tree).
10. Corrupciones de datos puntuales: numberfield Home/End y `"1."`, timepicker hourCycle/buffer, clock/timepicker steps, calendar "hoy" local, tree unregister.

**Fase 3 — consolidación:**
11. Extraer módulos compartidos: motor de segmentos (datepicker/daterange/timepicker), estado de tiempo (clock/timepicker), `strict-props`, `composeEventHandlers` (con una sola convención), presence/motion, stepper del numberfield, trigger de dialog/popover.
12. Migrar contextos de stores de versión a runas (`.svelte.ts`).
13. i18n: enrutar todas las strings hardcodeadas por locale-provider.
14. IME transversal + RTL transversal.
15. Corregir los tests tested-wrong y añadir la cobertura de los huecos listados.
