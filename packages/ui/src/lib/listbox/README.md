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
- A range replaces the selection, and does not add to it. This is the APG pattern for a listbox with more than one selection. It is also what lets a range become smaller when the user drags back toward the anchor.
- **Ctrl/Cmd+click** toggles one option even under `selectionBehavior="replace"`, where a
  plain click would clear the rest.
- Disabled options are never included.

The range is measured over the options that exist in the DOM. In a virtualized list, those are only the rows near the viewport. Give `getItemKey` with `virtualizer`, and the component measures the range over the full collection. A range then includes the rows that are not in the DOM, and the anchor stays correct when the user scrolls it away.

## Virtualized lists and assistive technology

A virtualized list holds few options. Thus the position and the count that a browser calculates from the DOM describe that window, and not the collection. For a list of two thousand items, a screen reader would announce "1 of 8". `ListBox` writes `aria-setsize` and `aria-posinset` onto the rendered
rows with the real numbers.

## Anatomy

Import the component and compose its parts:

```svelte
<ListBox.Root aria-label="Options">
	<ListBox.Item id="1">Option 1</ListBox.Item>
</ListBox.Root>
```

- `ListBox.Root`
- `ListBox.Item`
