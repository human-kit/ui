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

Two selectable lists side by side, with buttons that move items between them: picking visible columns, granting permissions, building a shortlist. Both sides are `ListBox`es, so selection, arrow-key navigation, typeahead and virtualization come from there unchanged.

<Demo source={heroSource}><Hero /></Demo>

## State

There is one source of truth. `items` is the whole collection and `value` is the ordered list of keys on the right; the left is everything else.

That makes `value` exactly what a form submits, and it gives the right-hand list its order for free — items land in the sequence they were moved, and the list renders in `value` order rather than in `items` order.

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

`getKey` identifies an item and defaults to its `id` field. Layout is yours: `TransferList.Root` renders a plain element, so arrange the two lists and the buttons with your own grid or flex.

## Moving items

- **Select and press a button.** `TransferList.MoveSelected` moves the selection of the opposite list; `TransferList.MoveAll` moves everything movable. Both disable themselves when there is nothing to move.
- **Double click a row** to send it across on its own.
- **`Ctrl`/`Cmd`+`Enter`** sends the focused list's selection to the other one without leaving the keyboard. Each list has exactly one destination, so the shortcut needs no direction — which also keeps it correct when the layout is mirrored. Turn it off with `moveShortcut={false}` on the Root.
- **Shift+click** or **Shift+Arrow** selects a range, so moving twenty items is one gesture rather than twenty. See [ListBox](/docs/listbox) for the full range-selection contract.

Items that move arrive **deselected**, so the next click on the opposite button is never an accidental undo.

## Filtering

Give a side a `filter` predicate and it renders only the items it returns `true` for. The input that drives it is yours — the component only decides what the list shows.

<Demo source={filterSource}><Filter /></Demo>

With a filter applied, **"move all" means the rows on screen**, not the whole side. That is what the button appears to promise while a filter is on, and moving items the user cannot see would be invisible work.

## Ordering the result

The right-hand list is `value` in order, so ordering it is just editing that array. `TransferList.MoveUp` and `TransferList.MoveDown` shift the right-hand selection one position; a contiguous block travels together, and a selection already flush against an end disables the button rather than doing nothing quietly.

Reordering only exists on the right: the left-hand order is the order `items` were given in, while the right-hand one is state the user is building. It works on the whole `value` rather than on what a filter happens to be showing — the order being edited is the one that gets submitted.

<Demo source={reorderSource}><Reorder /></Demo>

## Submitting with a form

Pass a `name` to the Root and it renders one hidden input per key, in `value` order, so the field submits with no wiring at all. Nothing is rendered when the right-hand list is empty, which is how a multi-value field behaves natively.

```svelte
<TransferList.Root {items} bind:value name="columns">…</TransferList.Root>
```

## Long lists

Both sides take `ListBox`'s `virtualizer`, so only the rows near the viewport are in the DOM. Rows must all be the same height, and the list is the scroller.

<Demo source={virtualizedSource}><Virtualized /></Demo>

Range selection still spans rows that were never rendered: the component hands `ListBox` its `getKey`, which lets a range be measured over the whole collection instead of over the handful of options on the page.

## Pinned items

`disabledKeys` pins items to the side they are on: "move all" skips them, ranges leave them out, and double click does nothing.

<Demo source={disabledSource}><Disabled /></Demo>

## Focus after a move

The rows the user was working with disappear, so focus has to be placed deliberately or it falls to the `<body>`:

- From a button, focus stays on the button while it still has something to move. Since a move clears the selection, that button usually goes disabled — and then focus follows the items to the destination list.
- From a double click, focus lands on the row that took the moved one's place, or on the last row if it was the last. When the side empties, it follows the items instead.

## Usage guidelines

- Give each side a `label`. It names the list, the move buttons and the announcements — pass `aria-labelledby` as well when the list already has a visible heading.
- Add `TransferList.Status` so screen reader users hear what a move did. Without it a move is silent: items simply stop existing in one list and appear in another.
- `controlledValue` is opt-in. `bind:value={keys}` and `value={keys}` are indistinguishable at runtime, so controlled-ness is never inferred; with it on, nothing moves until the parent flows a new `value` back down.
- `onChange(value, details)` reports the new value along with which keys moved and in which direction.

## Styling hooks

Every part is unstyled and exposes its state as data attributes:

| Part               | Attributes                                                                                             |
| ------------------ | ------------------------------------------------------------------------------------------------------ |
| `Root`             | `data-transfer-list`                                                                                     |
| `Source` `Target`  | `data-side="source \| target"`, `data-empty` while the list has no items                                  |
| `Item`             | `data-selected`, `data-disabled`, `data-focused`, `data-focus-visible`, `data-hovered`, `data-pressed`    |
| `MoveSelected` `MoveAll` | `data-transfer-move="selected \| all"`, `data-direction="to-target \| to-source"`, `data-disabled`  |
| `MoveUp` `MoveDown` | `data-transfer-reorder="up \| down"`, `data-disabled`                                                   |
| `Status`           | `data-transfer-list-status`                                                                              |

`data-side` is what lets one class style both lists and still tell them apart.

## Accessibility

- Each list is a `role="listbox"` with `aria-multiselectable="true"`, named by its `label`.
- The move buttons are named after **where items go** ("Move selected to Selected"), not after a direction: an arrow glyph says nothing on its own, and "move right" is wrong the moment the layout is mirrored. Override with `aria-label`.
- **`Enter` does not move an item.** In a multi-select listbox Enter and Space toggle the selection, and overriding that would break the contract every other list here keeps. `Ctrl`/`Cmd`+`Enter` is the shortcut instead, and each list advertises it with `aria-keyshortcuts`.
- Every move, and every reorder, is announced through `TransferList.Status`. A reorder is otherwise completely silent: the rows are all still there, only their order changed.

## API reference

<ApiReference api={api} />
