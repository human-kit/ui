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
- **Drawer** — trigger + overlay/content, shares the modal layer stack with Dialog. Restore also covers the `swipe` close reason (resolves to `pointer`), and retries the trigger focus after `ariaHideOutside` lifts `inert`.
- **Menu** — trigger + content, restore focus on close (`menu/root/focus-state.ts`). `Menu.ContextTrigger` is the same contract on a surface instead of a button: it registers as the trigger ref, so Escape and item selection restore focus to it. It is a tab stop by default so there is something to restore focus to.
- **DatePicker** — segment spinbuttons, trigger, popover (calendar).
- **TimePicker** — segment spinbuttons, trigger, popover (scrollable columns). Follows the same contract as DatePicker.
- **Calendar** — grid cells with roving tabindex.
- **ComboBox** — input + listbox with virtual focus.
- **ListBox** — items with roving tabindex.
- **TransferList** — two ListBoxes plus move buttons. Focus is placed explicitly after every move, because the rows the user was on stop existing: it stays on the button while that button still has work, and otherwise follows the items to the destination list; a double-clicked row hands focus to whichever row took its place.
- **NumberField** — spinbutton input, stepper buttons, wheel, and pointer scrub area.
