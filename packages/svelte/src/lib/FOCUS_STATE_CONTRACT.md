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
