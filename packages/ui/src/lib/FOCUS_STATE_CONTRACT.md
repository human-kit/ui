# Focus State Contract

## Scope

Focus-state contract for composed and interactive library components.

## Canonical Attributes

- `data-focused`: focused interactive element (real focus or logical focus for active item).
- `data-focus-visible`: visible focus based on keyboard/screen-reader modality.
- `data-focus-within`: any descendant inside the composed container has focus.

## Serialization Rules

1. Attributes are serialized as presence (`"true"`) or absence.
2. Never serialize `"false"`.

## Invariants

1. On containers, `data-focus-visible` implies `data-focus-within`.
2. On items, `data-focus-visible` implies `data-focused`.
3. On external blur (focus leaves scope), clear container `data-focus-within` and `data-focus-visible`.

## Modality

- Keyboard/SR: may activate `data-focus-visible`.
- Pointer: should not activate `data-focus-visible` by default.

Canonical implementation lives in `primitives/input-modality.ts`:

- `trackInteractionModality(event, target)` records input modality transitions.
- `shouldShowFocusVisible(target)` resolves whether `data-focus-visible` should be shown.
- `focusWithModality(target, modality)` atomically sets modality + programmatic focus restore.
- Keep explicit `trackInteractionModality` calls in component keyboard/pointer handlers to guarantee deterministic modality updates before local focus-state logic runs.

## Restore focus

On overlay/popover close, transient trigger state is allowed:

- `escape-key` => `data-focused=true` and `data-focus-visible=true`.
- `outside-press` => `data-focused=true` and `data-focus-visible` absent.

## Recommended Implementation

- Native visual baseline: `:focus`, `:focus-visible`, `:focus-within`.
- Use `data-*` for composed state and restore semantics.
- Avoid overengineering: centralize minimal synchronization utilities and validate with contract tests.

## Operational Template

- Use `FOCUS_STATE_REVIEW_TEMPLATE.md` for PR/release reviews (modality matrix + component status + checklist).

## Component Coverage

The following components implement this contract:

- **Popover** — trigger + content, restore focus on close.
- **Dialog** — trigger + overlay/content, nested stack support.
- **DatePicker** — segment spinbuttons, trigger, popover (calendar).
- **TimePicker** — segment spinbuttons, trigger, popover (scrollable columns). Follows the same contract as DatePicker.
- **Calendar** — grid cells with roving tabindex.
- **ComboBox** — input + listbox with virtual focus.
- **ListBox** — items with roving tabindex.
- **NumberField** — spinbutton input, stepper buttons, wheel, and pointer scrub area.
