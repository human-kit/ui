---
title: ListBox
description: A headless selectable list primitive with keyboard navigation, single and multiple selection, and controlled or uncontrolled state.
---

<script>
	import { Demo, ApiReference } from '$lib/docs/components/index.js';
	import Hero from './demos/hero.svelte';
	import heroSource from './demos/hero.svelte?highlight';
	import Multiple from './demos/multiple.svelte';
	import multipleSource from './demos/multiple.svelte?highlight';
	import api from './api.json';
</script>

# ListBox

This is a headless list of items that the user can select. The keyboard operates the list. The list permits one selection or more than one selection. You can control the state, or you can let the component control it.

<Demo source={heroSource}><Hero /></Demo>

## Anatomy

`ListBox.Root` is the container. It holds the selection state and it controls the keyboard operation. Each option is a `ListBox.Item` with a unique `id`.

```svelte
<script>
	import { ListBox } from '@human-kit/ui';
</script>

<ListBox.Root aria-label="Options">
	<ListBox.Item id="1">Option 1</ListBox.Item>
</ListBox.Root>
```

## More than one selection

Set `selectionMode="multiple"` to let the user select more than one item. The `selectionBehavior` prop controls the result when the user selects the same item again. The default is `"toggle"`, and it removes the selection. With `"replace"`, the new item always replaces the selection. Push `Ctrl+A` to select all of the items.

<Demo source={multipleSource}><Multiple /></Demo>

## Disabled items

Use `disabled` on a `ListBox.Item`, or `disabledKeys` on the root, to stop the operation of an option. The keyboard focus does not stop on a disabled item, and the item shows `data-disabled` for the styles.

## Usage guidelines

- Use `ListBox.Root` as the container for the selection state and the keyboard operation. Make each option with `ListBox.Item`.
- Use `value` and `onChange` when your own code controls the selection. Use `defaultValue` for the initial selection when the component controls it. Each value is a set of item ids.
- Use `selectionBehavior="replace"` when a new option must always replace the selection.
- Use `disabled` on an item, or `disabledKeys` on the root, to stop the selection of an option.
- If there is no label that the user sees, give the root an `aria-label` attribute.

## Accessibility

- `ListBox.Root` has `role="listbox"`. In the multiple mode, it also has `aria-multiselectable`. Each `ListBox.Item` has `role="option"` with `aria-selected`.
- The arrow keys move the focus between the items. The `Home` key and the `End` key move the focus to the first item and to the last item.
- The `Space` key and the `Enter` key select the item with the focus. In the multiple mode, `Ctrl+A` selects all of the items.
- The component shows each visual state in a data attribute for the styles: `data-selected`, `data-focused`, `data-focus-visible`, `data-hovered`, `data-pressed`, and `data-disabled`.

## API reference

<ApiReference api={api} />
