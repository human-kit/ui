# Plan: Estandarización integral de focus-visible en overlays

Este plan corrige el bug actual (abrir Calendar/DatePicker con click y cerrar con outside click deja `data-focus-visible` activo) y define una política única reutilizable para toda la librería. La solución centraliza la lógica de modalidad de interacción (`keyboard`/`pointer`/`virtual`) y la supresión del siguiente `focus-visible` cuando el foco se restaura programáticamente tras cierres por pointer. Se mantiene la API pública estable y se modifican solo contratos internos/composición. `data-focused` y `data-focus-within` siguen representando foco real del DOM; la primitive gobierna solo visibilidad (`data-focus-visible`).

## Steps

1. Crear la primitive única de modalidad/focus-visible en `packages/svelte/src/lib/primitives` con API interna para: `trackInteractionModality`, `shouldShowFocusVisible`, `focusWithModality`; `focusWithModality(element, modality)` debe setear modalidad de forma síncrona justo antes de `element.focus()` para mantener una operación atómica y evitar ventanas de race condition.
2. Agregar tests unitarios de la primitive en `packages/svelte/src/lib/primitives/input-modality/input-modality.test.ts` cubriendo: transiciones `keyboard`↔`pointer`, exclusión de modifier keys, `focusWithModality` síncrono, modalidad virtual (focus sin evento previo), SSR safety y cleanup de listeners.
3. Formalizar contrato interno de cierre con metadata (`reason`, `nativeEvent`, `restoreTarget`) y aplicarlo en `packages/svelte/src/lib/popover/root/context.ts`, `packages/svelte/src/lib/popover/root/popover-root.svelte`, `packages/svelte/src/lib/popover/content/popover-content.svelte`, `packages/svelte/src/lib/dialog/root/dialog-root.svelte` y `packages/svelte/src/lib/dialog/content/dialog-content.svelte`.
4. Migrar Popover root para que la restauración de foco use solo la primitive y no heurísticas locales en `packages/svelte/src/lib/popover/root/focus-state.ts` y `packages/svelte/src/lib/popover/root/popover-root.svelte`.
5. Unificar Popover standalone con la misma resolución de estado para evitar divergencia root vs content en `packages/svelte/src/lib/popover/content/popover-content.svelte`.
6. Integrar DatePicker al contrato común de cierre/modality en `packages/svelte/src/lib/datepicker/popover/date-picker-popover.svelte`, `packages/svelte/src/lib/datepicker/root/date-picker-root.svelte` y `packages/svelte/src/lib/datepicker/trigger/date-picker-trigger.svelte`.
7. Alinear Calendar, ListBox y ComboBox para que cualquier escritura de visibilidad de foco delegue en la primitive en `packages/svelte/src/lib/calendar/body-cell/calendar-body-cell.svelte` y módulos equivalentes en `packages/svelte/src/lib/listbox` y `packages/svelte/src/lib/combobox`.
8. Ajustar Dialog para parity: cierre por outside pointer restaura foco sin visible; cierre por teclado conserva visible en `packages/svelte/src/lib/dialog/root/dialog-root.svelte` y `packages/svelte/src/lib/dialog/content/dialog-content.svelte`.
9. Ejecutar cleanup post-migración eliminando estado/lógica huérfana (por ejemplo `suppressNextTriggerFocusVisible`, `consumeTriggerFocusVisibleSuppression`, `triggerInteractionModality`, `calendarInteractionModality`, `data-implicitFocus` y handlers locales redundantes de modalidad).
10. Actualizar contrato funcional y ejemplos de comportamiento en `packages/svelte/src/lib/FOCUS_STATE_CONTRACT.md` para dejar explícitas reglas y evitar regresiones.
11. Si cambian archivos bajo `packages/svelte/src/**`, preparar changeset en `.changeset` según política del repo.

## Verification

- Cobertura de regresión en Popover root: `packages/svelte/src/lib/popover/root/popover.test.ts`.
- Cobertura de regresión en Popover standalone: `packages/svelte/src/lib/popover/content/popover-content.test.ts`.
- Caso crítico DatePicker (open click + outside click close): `packages/svelte/src/lib/datepicker/root/date-picker-root.test.ts` y `packages/svelte/src/lib/datepicker/popover/date-picker-popover.test.ts`.
- Cobertura en ComboBox/ListBox/Calendar de no regresión de focus-visible con interacción pointer/keyboard en sus suites correspondientes.
- Parity Dialog para outside click/Escape: `packages/svelte/src/lib/dialog/root/dialog.test.ts`.
- Cobertura de primitive: validar que `focusWithModality` aplica modalidad de forma atómica al `focus()` programático sin estado pendiente entre eventos.
- Comandos de validación: `bun run test -- --run src/lib/popover src/lib/datepicker src/lib/dialog src/lib/calendar src/lib/listbox`, `bun run typecheck`, `bun run lint`, `bun run test -- --run`.

## TODO (post code-review)

### P0 — Bugs / Correctness

- [x] Cachear resultado de `resolveCloseFocusModality` en variable local dentro de `applyTriggerCloseFocusState` (`focus-state.ts`). Actualmente se llama dos veces con los mismos argumentos; si en el futuro tuviera side-effects seria un bug.
- [x] Eliminar `calendarInteractionModality` del DatePicker. El plan (step 9) dice eliminarlo, pero sigue vivo en `date-picker-root.svelte`, `context.ts` y `date-picker-popover.svelte`. Reemplazar por `getInteractionModality()` del singleton en el momento del `setValue`.
- [x] Refactorizar `applyTriggerSelectionCloseState` en `datepicker/root/focus-controller.ts` para que use `focusWithModality` en lugar de mutar el DOM manualmente (`dataset.focused`, `dataset.focusVisible`).

### P1 — Design

- [x] Agregar comentario en `focusWithModality` explicando el pattern de `forcedFocusTarget`/`forcedFocusModality` y su relacion con el fallback a `currentModality`. El microtask cleanup puede correr antes de que `shouldShowFocusVisible` se llame (ej: si hay un `requestAnimationFrame` de por medio como en `scheduleTriggerCloseFocus`), pero funciona porque `currentModality` ya fue seteado sincronicamente. El forced target es un safety net para consumo sincrono; documentar para evitar confusion futura.
- [x] Evaluar separar el side-effect de registro de listeners (`ensureWindowListeners`) fuera de `shouldShowFocusVisible`. Una funcion que suena como query pura no deberia registrar event listeners como efecto secundario. Opciones: (a) inicializar en un `$effect` al montar el componente, (b) exponer un `initModality()` explicito, (c) documentar que `shouldShowFocusVisible` tiene side-effect de lazy-init.
- [x] Extraer `resolveCloseFocusModality` (Popover `focus-state.ts`) y `resolveDialogCloseModality` (Dialog `dialog-root.svelte`) a una utilidad compartida en `primitives/input-modality.ts`. La logica es identica — violar DRY es un vector de divergencia futura.
- [x] Evaluar si las llamadas explícitas a `trackInteractionModality` en los handlers de teclado/mouse de los componentes (ej. `date-picker-trigger.svelte`) son necesarias, dado que los listeners globales ya deberían estar capturando estos eventos en la fase de captura.

### P2 — Minor / Style

- [x] Quitar `return currentModality` de `trackInteractionModality`. Ningun call site usa el valor de retorno; dejarlo como `void` para claridad de API.
- [x] Revisar logica de click con `detail === 0` en `inferModalityFromEvent`. Un click con `detail === 0` indica keyboard-triggered click (Enter/Space en button). El codigo retorna `'virtual'` si `currentModality` era `'pointer'`, pero deberia ser `'keyboard'`. Corregir o documentar justificacion.
- [x] Agregar comentario en ComboBox `handleKeydown` Escape branch explicando por que `focusVisible = true` esta hardcodeado sin consultar la primitive (Escape siempre es keyboard -> siempre visible).
- [x] Expandir tests de la primitive (`input-modality.test.ts`). Actualmente hay 3 tests. Agregar: transicion `pointer -> keyboard -> pointer`, `focusWithModality` con `'virtual'`, `shouldShowFocusVisible` despues de `trackInteractionModality` con keyboard event, `Ctrl+C` no cambia modalidad, dedup de window listeners (WeakSet).
- [x] Actualizar `FOCUS_STATE_CONTRACT.md` (step 10 del plan). Actualmente dice "centralize minimal synchronization utilities" sin mencionar `input-modality.ts` ni `focusWithModality`. Agregar seccion documentando la primitive como fuente canonica de modalidad.
- [x] Crear changeset en `.changeset/` (step 11 del plan). No existe actualmente.

## Decisions

- Se elige fix global único (no parches por componente).
- La primitive decide únicamente visibilidad de foco; los componentes siguen siendo responsables de aplicar/remover `data-focus-visible` en su DOM y la primitive no escribe atributos directamente.
- La primitive no redefine `data-focused` ni `data-focus-within`.
- Se aceptan cambios internos de contrato para transportar metadata de cierre.
- Se prioriza consistencia de comportamiento con patrón de librerías de referencia (modality global + focus restore contextual).
