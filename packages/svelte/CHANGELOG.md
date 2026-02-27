# @human-kit/svelte-components

## Unreleased

### Breaking Changes

- DatePicker now uses a null-first empty value contract.
  - `DatePicker.Root` initializes empty `value` as `null` (instead of `undefined`) when uncontrolled.
  - `bind:value` receives `null` as the default empty state without firing `onChange` on mount.

### Improvements

- DatePicker now exposes invalid draft state publicly:
  - `DatePicker.Input` sets `aria-invalid` and `data-invalid` when draft segments are not committable.
  - `DatePicker.Root` sets `data-invalid` for container-level styling.
- DatePicker now enforces strict internal invariants for composed parts:
  - `DatePicker.Calendar` ignores internal-control props (`selectionMode`, `value`, `defaultValue`, `onChange`, `isDisabled`, `isReadOnly`, `isDateUnavailable`) and warns in development.
  - `DatePicker.Popover` ignores internal-control props (`open`, `triggerRef`, `onOpenChange`, `id`) and warns in development.
- DatePicker now composes Popover content handlers (`onmousedown`, `onkeydowncapture`) so internal modality tracking cannot be overridden accidentally.
- DatePicker open/close cancellation now propagates correctly across Popover and DatePicker (`details.cancel()` is honored end-to-end).
- DatePicker root orchestration was modularized (`draft-evaluation`, `value-commit`, `open-controller`, `focus-controller`, `segment-controller`).
- DatePicker tests were expanded and stabilized to remove order-dependent flakes.

## 1.0.0-alpha.1

### Major Changes

- [#1](https://github.com/Agustin-Delgado/svelte-components/pull/1) [`635fdc1`](https://github.com/Agustin-Delgado/svelte-components/commit/635fdc15efc0349df8d89d4079dda5ba28ff3586) Thanks [@Agustin-Delgado](https://github.com/Agustin-Delgado)! - Initial release of @human-kit/svelte-components
  - ComboBox (single & multi-select with tags, virtual focus, filtering)
  - Dialog (modal with portal, overlay, nested dialogs, focus trap)
  - ListBox (keyboard navigation, single selection)
  - Popover (floating UI positioning, click outside, trigger)
  - Input, Label, Portal primitives
  - Utility primitives (aria-hide-outside, scroll-lock, focus-trap, keyboard-navigation)
