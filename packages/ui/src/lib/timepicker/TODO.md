# TimePicker TODO

## Goal

Track TimePicker work with a single mandatory TODO format.

## Backlog

- [x] [M][P0][Area: Parsing][Owner: Unassigned][Target: TBD] Make time parsing strict so invalid strings like "1.5:30" or ":30" are rejected. _(Already implemented via `isValidTimePickerValue` regex. `parseTimePickerValue` now returns `null` for invalid input.)_
- [x] [S][P0][Area: Validation][Owner: Unassigned][Target: TBD] Guard 12h draft conversion against invalid hour values outside 1-12. _(Already implemented in `buildTimePartsFromDraft`.)_
- [x] [M][P0][Area: Input][Owner: Unassigned][Target: TBD] Apply step clamping on typed values when segment edit is confirmed. _(Already implemented in `setSegmentValue` via `clampToStep`.)_
- [x] [S][P0][Area: Formatting][Owner: Unassigned][Target: TBD] Force "HH:00" output for hour granularity regardless of leftover minutes. _(Already implemented in `formatTimePickerValue`.)_
- [x] [S][P0][Area: Validation][Owner: Unassigned][Target: TBD] Treat missing dayPeriod as invalid in 12h draft-to-24h conversion. _(Already implemented in `buildTimePartsFromDraft`.)_
- [x] [M][P1][Area: Locale][Owner: Unassigned][Target: TBD] Build segment order and literals from Intl formatToParts instead of hardcoded templates. _(Already implemented in `buildTimePickerSegments`.)_
- [x] [S][P1][Area: Validation][Owner: Unassigned][Target: TBD] Compare min/max using the active granularity to avoid false out-of-range states. _(Fixed: `isTimeOutOfRange` now accepts `granularity` and truncates before comparison.)_
- [x] [S][P1][Area: Accessibility][Owner: Unassigned][Target: TBD] Ensure time picker columns and options expose complete listbox/option ARIA contract. _(Already implemented in column/column-cell components.)_
- [x] [S][P1][Area: Composition][Owner: Unassigned][Target: TBD] Wire selection-close behavior so `shouldCloseOnSelect` controls whether column selection closes popover when draft is complete. _(Implemented in `selectColumnOption`; default is `false`.)_
- [x] [S][P2][Area: Accessibility][Owner: Unassigned][Target: TBD] Verify dayPeriod segment uses 0-1 ARIA bounds and localized value text. _(Fixed: segment now uses `timePicker.hourCycle` for correct `aria-valuemin`/`aria-valuemax`.)_
- [x] [S][P2][Area: Testing][Owner: Unassigned][Target: TBD] Ensure segment data attributes are consistent for styling and test selectors. _(Already implemented: `data-time-picker-segment="true"`.)_
- [x] [M][P2][Area: Testing][Owner: Unassigned][Target: TBD] Expand unit coverage for parsing, format output, 12h conversion, clamping, and draft evaluation pipeline. _(Added 47 unit tests in `time-utils.test.ts`.)_
- [x] [S][P2][Area: Documentation][Owner: Unassigned][Target: TBD] Add TimePicker references to focus contract documentation. _(Added component coverage section to `FOCUS_STATE_CONTRACT.md`.)_

## Active

### Bugs

- [x] [M][P0][Area: State][Owner: Unassigned][Target: TBD] Permitir que el componente se limpie a undefined/null externamente. En `time-picker-root.svelte`, la observación de Svelte 5 ($effect sobre value) hace un early return con `if (value === undefined) return;`. Esto impide que se limpie la hora si el developer resetea el form manualmente enviando value = undefined. **Fix:** Quitar el early return por `undefined` y despachar la asignación nula para vaciar el TimePicker de forma controlada.

- [x] [S][P0][Area: State][Owner: Unassigned][Target: TBD] Arreglar deshidratación al vaciar todos los segmentos (`commitFromDraft`). Al borrar backspace tras backspace, si el usuario vacía el _último_ segmento, la variable `hasAnyRequiredValue` rompe el flujo dando `false` lo que dispara un early return ocultando el borrado de `publishCommittedValue`. **Fix:** Quitar o condicionar el early return condicionado de hasAnyRequiredValue para que el componente notifique a los bindings de que la hora quedó completamente `null`.

- [x] [M][P0][Area: Events][Owner: Unassigned][Target: TBD] Reparar Event Forwarding y omisiones en componentes internos. Actualmente los wrappers tragan eventos porque fallan en reingeniar el event payload natural de Svelte 5.
  1. `Input`: Extrae variables pero no usa `composeEventHandlers`. Los onkey/onfocus externos mueren ahogados.
  2. `Trigger`: Esparce `...restProps` **después** de sus eventos atados a Svelte 5, lo que cancela las rutinas internas si el usuario pasa `<Trigger onmousedown>`
     **Fix:** Extraer las declaraciones conflictivas de `$props()` y usar `composeEventHandlers` en línea para todas en vez de pisarlas u omitirlas.

- [x] [M][P0][Area: Input][Owner: Unassigned][Target: TBD] Guard segment `contenteditable` against paste, IME composition, and drag-drop. The `<span contenteditable>` in `time-picker-segment.svelte` has no `onbeforeinput`, `onpaste`, or `oncompositionend` handler. Ctrl+V, IME input, or drag-drop can modify the DOM directly without going through `typeSegmentDigit` / `setSegmentValue`, creating drift between the visible text and the internal `segmentDraft`. **Fix:** Add `onbeforeinput={(e) => e.preventDefault()}` to block all non-keyboard mutations. Alternatively, add an `oninput` handler that immediately restores the span's `textContent` to the current draft value as a safety net.

- [x] [M][P0][Area: Wheel][Owner: Unassigned][Target: TBD] Increase scroll debounce timeout in `use-wheel-scroll.svelte.ts` from 64ms to ~120-150ms. On touch devices with momentum scrolling (especially iOS Safari), gaps between `scroll` events during deceleration can exceed 64ms, causing premature snap that interrupts the user's inertia. Since browsers that support `scrollend` use it as the primary settle signal and the debounce only acts as a safety net, a higher value does not affect perceived latency. **File:** `hooks/use-wheel-scroll.svelte.ts` line ~215.

- [x] [M][P0][Area: Wheel][Owner: Unassigned][Target: TBD] Sync `lastCenteredIndex` when value changes externally while popover is open. `lastCenteredIndex` in `time-picker-wheel-column.svelte` is a plain `let` used as anchor for `moveBy()`. If the root value changes via `bind:value` while the popover is open, `lastCenteredIndex` still points to the old index. A subsequent `ArrowDown` jumps from the stale position instead of the current one. **Fix:** Add a `$effect` that observes `selectedValue` + `timePicker.open`: when both are truthy and `selectedIndex` changes, update `lastCenteredIndex = selectedIndex` and optionally scroll to it.

- [x] [S][P1][Area: Wheel][Owner: Unassigned][Target: TBD] Suppress unnecessary re-snap chain after `scrollToIndex('smooth')` when value is already committed. When `handleCenterRequest` (click on WheelItem) eagerly commits the value then calls `scrollToIndex(i, 'smooth')`, the ensuing scroll events trigger debounce → `snapToCenter` → `animateSnapTo` for micro-alignment → more scroll events. The chain is usually idempotent but can cause micro-jitter. **Fix:** Add a `silent` parameter to `scrollToIndex` that suppresses `snapToCenter` for the duration of that smooth scroll. Use it only for clicks where the commit already happened, NOT for corrective disabled-skip (which must snap and commit).

### Accesibilidad

- [x] [S][P1][Area: Accessibility][Owner: Unassigned][Target: TBD] Add `aria-live` region to announce wheel value changes for screen readers. When the user scrolls a `WheelColumn`, `aria-valuenow` / `aria-valuetext` update, but screen readers don't automatically announce `aria-valuenow` changes on a `spinbutton`. **Fix:** Add a visually-hidden `<span role="status" aria-live="polite" class="sr-only">{valueText}</span>` inside each `WheelColumn` that updates when the selected value changes. This announces the new value after each snap.

- [x] [S][P1][Area: Accessibility][Owner: Unassigned][Target: TBD] Fix `Home`/`End` in segment to use correct boundary values for 12h mode. In `time-picker-segment.svelte`, `Home` sends `setSegmentValue('hour', '0')` and `End` sends `'23'` regardless of `hourCycle`. In 12h mode the valid range is 1-12. This currently works by accident (clamping corrects it), but the intent is wrong and fragile. **Fix:** Use `timePicker.hourCycle` to determine boundaries: `Home` → `hourCycle === 12 ? '1' : '0'`, `End` → `hourCycle === 12 ? '12' : '23'`.

- [x] [S][P2][Area: Accessibility][Owner: Unassigned][Target: TBD] Add `aria-roledescription` to `WheelColumn`. A generic `role="spinbutton"` doesn't communicate that the widget is a wheel/picker. Adding `aria-roledescription="wheel picker"` (or a localized equivalent) would improve the experience for screen reader users. Apply to the root `<div role="spinbutton">` in `time-picker-wheel-column.svelte`.

- [x] [S][P2][Area: Accessibility][Owner: Unassigned][Target: TBD] Add `isRequired` prop to Root and propagate `aria-required` to the Input group. There's currently no way to indicate the field is required for form validation. The prop should flow from Root → context → `time-picker-input.svelte` as `aria-required` on the `role="group"` element.

### Performance

- [x] [M][P1][Area: Performance][Owner: Unassigned][Target: TBD] Cache `Intl.DateTimeFormat` instance across segment draft changes. `buildTimePickerSegments` in `time-utils.ts` creates a `new Intl.DateTimeFormat(locale, formatOptions)` on every call. This function is invoked from a `$derived` that depends on `segmentDraft`, so every keystroke recreates the formatter. The formatter only depends on `locale`, `hourCycle`, and `granularity`. **Fix:** In `time-picker-root.svelte`, derive the formatter once from those 3 variables and pass it to `buildTimePickerSegments` as a parameter.

- [x] [S][P2][Area: Performance][Owner: Unassigned][Target: TBD] Short-circuit disabled computation in `getWheelOptions` when no min/max range is set. `getWheelOptions` runs `buildTimePartsFromDraft` + `isTimeOutOfRange` for every option in every column (~122 iterations for minute granularity). When `normalizedMinValue` and `normalizedMaxValue` are both `undefined`, all options are always enabled. **Fix:** Add an early check: `if (!normalizedMinValue && !normalizedMaxValue)` → skip disabled computation and return `disabled: false` for all.

- [x] [S][P2][Area: Performance][Owner: Unassigned][Target: TBD] Cache system locale so `Intl.DateTimeFormat().resolvedOptions().locale` isn't called on every `$derived` reevaluation. In `time-picker-root.svelte`, `resolvedLocale` falls back to `Intl.DateTimeFormat().resolvedOptions().locale` when no context locale is provided. This creates a new formatter on each reevaluation. The system locale doesn't change during the component's lifetime. **Fix:** Capture it once with `untrack` at initialization and store in a constant.

### Arquitectura / Robustez

- [x] [S][P2][Area: Wheel][Owner: Unassigned][Target: TBD] Batch `ResizeObserver` callbacks with `requestAnimationFrame` to avoid layout thrashing. The `ResizeObserver` in `time-picker-wheel-column.svelte` calls `syncMeasurements()` which updates `$state` variables (`itemHeight`, `spacerHeight`). This triggers Svelte re-render → layout shift → observer fires again, producing `ResizeObserver loop completed with undelivered notifications` warnings in tests. **Fix:** Wrap the observer callback: `resizeObserver = new ResizeObserver(() => { requestAnimationFrame(() => syncMeasurements()); });`

- [x] [S][P2][Area: Wheel][Owner: Unassigned][Target: TBD] Make `WheelItem` default visual style consistent with headless pattern. `time-picker-wheel-item.svelte` applies inline styles (opacity, cursor, font-weight, etc.) by default but drops ALL of them if the consumer passes `class`. This all-or-nothing behavior is inconsistent with the rest of the library (fully headless). **Fix:** Either remove default visual styles entirely (consumer styles via `data-selected`, `data-disabled` attributes — headless), or separate structural styles (always applied) from decorative styles (opt-out via prop). Preferred: go fully headless for consistency.

- [x] [S][P3][Area: Code Quality][Owner: Unassigned][Target: TBD] Remove dead code in `isTimeOutOfRange`. The `if (minValue && maxValue) { ... if (min > max) return true }` block at the end is unreachable — if `min > max`, any value `v` is already rejected by the individual `v < min` or `v > max` checks above. Remove to reduce reader confusion. **File:** `root/time-utils.ts` lines ~219-228.

- [x] [S][P3][Area: Code Quality][Owner: Unassigned][Target: TBD] Fix meaningless ternary in `setSegmentValue`. `const maxDigits = type === 'hour' ? 2 : 2;` — both branches are `2`. Was likely a draft for differentiating types. Replace with `const maxDigits = 2;`. **File:** `root/time-picker-root.svelte` line ~280.

### Testing

- [x] [C][P1][Area: Testing][Owner: Unassigned][Target: TBD] Expand `WheelColumn` test coverage. Current: 4 tests (render, aria values, cross-column nav, spacers). Missing critical scenarios: (a) ArrowUp/Down keyboard changes value, (b) disabled item skip on scroll, (c) PageUp/PageDown/Home/End navigation, (d) scroll-to-selected on popover open, (e) external value change syncs wheel position, (f) full focus contract (`data-focus-within`, `data-focus-visible`), (g) behavior with `minValue`/`maxValue` producing disabled options.

- [x] [M][P1][Area: Testing][Owner: Unassigned][Target: TBD] Add integration test for wheel → root → segment sync. No test verifies the full flow: user scrolls wheel → snap detects centered item → `selectWheelValue` called → `commitFromDraft` runs → segment text updates → `bind:value` reflects new time. This is the core happy-path of the wheel and should be covered.

- [x] [S][P2][Area: Testing][Owner: Unassigned][Target: TBD] Add test for contenteditable paste/IME resilience in segment. Verify that pasting text into a segment does not corrupt `segmentDraft` and that the visible text is restored to the draft value. Important because `contenteditable` is inherently fragile.

## Notes

TimePicker locale is sourced from LocaleProvider, not from a root locale prop.

### Review context (2026-03-02)

The wheel architecture (`WheelColumn` / `WheelItem` / `use-wheel-scroll`) replaced the original column-based `listbox`/`option` architecture. The wheel uses JS-driven snapping (no CSS `scroll-snap-type`) with a 120ms ease-out animation. Selection occurs when scroll settles and the centered item is committed. Disabled items are auto-skipped. `shouldCloseOnSelect` was removed — popover closes only via Escape, click outside, or programmatically.
