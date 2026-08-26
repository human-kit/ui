---
title: TransferList
description: Two selectable lists with buttons that move items between them — one ordered value, keyboard and screen reader support included.
---

<script>
	import { Demo, ApiReference } from '$lib/docs/components/index.js';
	import Hero from './demos/hero.svelte';
	import heroSource from './demos/hero.svelte?highlight';
	import Disabled from './demos/disabled.svelte';
	import disabledSource from './demos/disabled.svelte?highlight';
	import Filter from './demos/filter.svelte';
	import filterSource from './demos/filter.svelte?highlight';
	import Reorder from './demos/reorder.svelte';
	import reorderSource from './demos/reorder.svelte?highlight';
	import Virtualized from './demos/virtualized.svelte';
	import virtualizedSource from './demos/virtualized.svelte?highlight';
	import api from './api.json';
</script>

# TransferList

This component has two lists, one at each side, and buttons that move the items from one list to the other list. Use it to select the columns that a table shows, to give permissions, or to make a short list. Each side is a `ListBox`. Thus the selection, the arrow keys, the typeahead, and the virtualization come from `ListBox`, and they do not change.

<Demo source={heroSource}><Hero /></Demo>

## State

There is one source of truth. The `items` prop is the full collection. The `value` prop is the ordered list of the keys at the right side. The left side has all of the other items.

Thus `value` is exactly what a form submits, and `value` also gives the sequence of the right list. An item goes to the position where the user moved it, because the list obeys the sequence of `value` and not the sequence of `items`.

```svelte
<script>
	import { TransferList } from '@human-kit/ui';

	const columns = [
		{ id: 'name', name: 'Name' },
		{ id: 'email', name: 'Email' }
	];

	let value = $state(['name']);
</script>

<TransferList.Root items={columns} bind:value>
	<TransferList.Source label="Available">
		{#snippet children(column)}
			<TransferList.Item item={column}>{column.name}</TransferList.Item>
		{/snippet}
	</TransferList.Source>

	<TransferList.MoveSelected to="target">→</TransferList.MoveSelected>
	<TransferList.MoveAll to="target">⇥</TransferList.MoveAll>
	<TransferList.MoveAll to="source">⇤</TransferList.MoveAll>
	<TransferList.MoveSelected to="source">←</TransferList.MoveSelected>

	<TransferList.Target label="Selected">
		{#snippet children(column)}
			<TransferList.Item item={column}>{column.name}</TransferList.Item>
		{/snippet}
	</TransferList.Target>

	<TransferList.Status />
</TransferList.Root>
```

The `getKey` prop identifies an item. Its default is the `id` field. The layout is yours: `TransferList.Root` makes a plain element, thus you put the two lists and the buttons in your own grid or flex container.

## How to move an item

- **Select the items and push a button.** `TransferList.MoveSelected` moves the selection of the opposite list. `TransferList.MoveAll` moves each item that can move. If there is nothing to move, each button disables itself.
- **Double click a row** to move that row alone.
- **Push `Ctrl`+`Enter` or `Cmd`+`Enter`** to move the selection of the list with the focus to the other list, with the keyboard only. Each list has one destination, thus the shortcut needs no direction. This also keeps the shortcut correct when the layout is a mirror image. To stop the shortcut, set `moveShortcut={false}` on the Root.
- **Push `Shift` and click, or push `Shift` and an arrow key**, to select a range. Thus the user moves twenty items with one action, not with twenty actions. The [ListBox](/docs/listbox) page has the full contract for a range selection.

An item that moves arrives **without a selection**. Thus the next click on the opposite button never moves the item back by accident.

## Filters

Give a side a `filter` function. The side then shows only the items for which the function returns `true`. The input that controls the filter is yours. The component decides only which items the list shows.

<Demo source={filterSource}><Filter /></Demo>

While a filter is on, **"move all" means the rows that the user sees**, not all of the items at that side. This is what the button appears to promise while a filter is on. If the component moved the items that the user cannot see, that work would be invisible.

## Sequence of the result

The right list is `value` in its sequence. Thus you change the sequence when you change that array. `TransferList.MoveUp` and `TransferList.MoveDown` move the selection of the right list by one position. A group of adjoining items moves together. If the selection is already at an end, the button becomes disabled and does nothing without a signal.

Only the right list has this function. The sequence of the left list is the sequence of `items`. The sequence of the right list is state that the user makes. The buttons change the full `value`, not only the items that a filter shows, because the sequence that the user edits is the sequence that the form submits.

<Demo source={reorderSource}><Reorder /></Demo>

## Submit with a form

Give the Root a `name`. The component then makes one hidden input for each key, in the sequence of `value`. Thus the field submits with no other code. If the right list is empty, the component makes no input. This is the behavior of a native field with more than one value.

```svelte
<TransferList.Root {items} bind:value name="columns">…</TransferList.Root>
```

## Long lists

Each side accepts the `virtualizer` prop of `ListBox`. Thus only the rows near the viewport are in the DOM. All of the rows must have the same height, and the list is the element that scrolls.

<Demo source={virtualizedSource}><Virtualized /></Demo>

A range selection still includes the rows that are not in the DOM. The component gives its `getKey` function to `ListBox`. Thus `ListBox` measures the range over the full collection, and not over the small number of options on the page.

## Items that cannot move

The `disabledKeys` prop keeps an item at its side. The "move all" button does not move it, a range does not include it, and a double click does nothing.

<Demo source={disabledSource}><Disabled /></Demo>

## Focus after a move

The rows that the user worked with go away. Thus the component must put the focus at a specified position, or the focus goes to the `<body>` element:

- After the user pushes a button, the focus stays on the button while the button still has something to move. A move removes the selection, thus that button usually becomes disabled. Then the focus goes with the items to the destination list.
- After a double click, the focus goes to the row that takes the position of the moved row. If the moved row was the last row, the focus goes to the new last row. If the side becomes empty, the focus goes with the items.

## Usage guidelines

- Give each side a `label`. The label names the list, the move buttons, and the announcements. If the list already has a heading that the user sees, also give the side an `aria-labelledby` attribute.
- Add a `TransferList.Status` part. Thus a screen reader user hears the result of a move. Without it, a move is silent: the items stop to exist in one list and appear in the other list.
- The `controlledValue` prop is an option that you must set. At run time, `bind:value={keys}` and `value={keys}` are the same, thus the component cannot know which one you wrote. With `controlledValue`, nothing moves until the parent sends a new `value` down.
- The `onChange(value, details)` function reports the new value, the keys that moved, and their direction.

## Data attributes for the styles

Each part has no styles, and each part shows its state in data attributes:

| Part                     | Attributes                                                                                            |
| ------------------------ | ----------------------------------------------------------------------------------------------------- |
| `Root`                   | `data-transfer-list`                                                                                  |
| `Source` `Target`        | `data-side="source \| target"`, and `data-empty` while the list has no items                           |
| `Item`                   | `data-selected`, `data-disabled`, `data-focused`, `data-focus-visible`, `data-hovered`, `data-pressed` |
| `MoveSelected` `MoveAll` | `data-transfer-move="selected \| all"`, `data-direction="to-target \| to-source"`, `data-disabled`     |
| `MoveUp` `MoveDown`      | `data-transfer-reorder="up \| down"`, `data-disabled`                                                  |
| `Status`                 | `data-transfer-list-status`                                                                           |

The move buttons have `aria-disabled`. They do not have the native `disabled` attribute. Thus write their styles with `data-disabled` or with `aria-disabled:`, and not with `:disabled`. A `disabled:opacity-40` class never applies.

The `data-side` attribute lets one class style both lists and still make a difference between them.

## Accessibility

- **The move buttons stay in the tab order, also when they have nothing to do.** They have `aria-disabled`, not the native attribute. These controls are unavailable more often than available. If the component disabled them natively, a keyboard user would not find half of the actions, and the tab order would change while the user works. The component still stops the activation, and the focus stays on the button after a press, like on any button.
- **Give the Root a name.** Give it an `aria-label` or an `aria-labelledby` attribute. The Root then has `role="group"`, which tells assistive technology that the two lists and the buttons are one control. Without a name, the component does not set the role. Assistive technology ignores a group with no name, thus the role would only add noise.
- Each list has `role="listbox"` with `aria-multiselectable="true"`, and its `label` gives it its name.
- With `virtualizer`, each row has `aria-setsize` and `aria-posinset` for the full collection. Only a window of the rows is in the DOM. Without these attributes, a screen reader announces the size of that window — for example "1 of 8" in a list of two thousand items.
- The name of a move button says **where the items go** ("Move selected to Selected"). The name does not say a direction. An arrow symbol alone says nothing, and "move right" is wrong when the layout is a mirror image. To change a name, give the button an `aria-label` attribute.
- **The `Enter` key does not move an item.** In a listbox with more than one selection, the `Enter` key and the `Space` key change the selection. A different behavior would break the contract of each other list in this library. The shortcut is `Ctrl`+`Enter` or `Cmd`+`Enter`, and each list gives it in `aria-keyshortcuts`.
- `TransferList.Status` announces each move and each change of the sequence. Without it, a change of the sequence is fully silent, because all of the rows are still there and only their sequence is different.

## API reference

<ApiReference api={api} />
