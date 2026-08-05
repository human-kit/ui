# ListBox

## Description

`ListBox` is a headless selectable list primitive with keyboard navigation, single and multiple selection, and controlled or uncontrolled state.

## Usage guidelines

- Use `ListBox.Root` as the container for selection state and keyboard interactions.
- Render each option with `ListBox.Item`.
- Use `value` and `onChange` for controlled selection.
- Use `defaultValue` for uncontrolled initial selection.
- Provide `aria-label` when there is no visible label, or `aria-labelledby` when there is one.

## Range selection

In `selectionMode="multiple"`, Shift selects a range and Ctrl/Cmd adds a single item:

- **Shift+click** selects everything between the anchor and the clicked option. The anchor is
  the last option selected without modifiers.
- **Shift+Arrow**, **Shift+Home** and **Shift+End** extend the same range with the keyboard.
- A range **replaces** the selection rather than adding to it, following the APG multi-select
  listbox pattern — that is what lets a range shrink again when you drag it back toward the
  anchor.
- **Ctrl/Cmd+click** toggles one option even under `selectionBehavior="replace"`, where a
  plain click would clear the rest.
- Disabled options are never included.

The range is measured over the options that exist in the DOM, so in a **virtualized** list it
cannot reach rows that were never rendered.

## Anatomy

Import the component and compose its parts:

```svelte
<ListBox.Root aria-label="Options">
	<ListBox.Item id="1">Option 1</ListBox.Item>
</ListBox.Root>
```

- `ListBox.Root`
- `ListBox.Item`
