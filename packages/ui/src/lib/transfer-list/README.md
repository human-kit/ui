# TransferList

## Description

`TransferList` is two selectable lists side by side with buttons that move items between
them — picking visible columns, granting permissions, building a shortlist. Both lists are
`ListBox`es, so selection, keyboard navigation, typeahead and virtualization come from there
unchanged.

## Usage guidelines

- Use `TransferList.Root` to hold the collection and the split between the two sides.
- Give each side a `label`: it names the list, the move buttons and the announcements.
- Render each row with `TransferList.Item`, from the snippet the list hands you.
- Use `TransferList.MoveSelected` and `TransferList.MoveAll` with `to="source" | "target"`.
- Use `TransferList.MoveUp` / `TransferList.MoveDown` to order the right-hand list.
- Give a side a `filter` predicate to show only part of it; the input driving it is yours.
- Pass `name` on the Root to submit `value` through hidden inputs.
- Add `TransferList.Status` so screen reader users hear what a move did.
- Layout is yours: `TransferList.Root` renders a plain element, so arrange the two lists and
  the buttons with your own grid or flex.

## State

There is one source of truth. `items` is the whole collection; `value` is the ordered list of
keys that sit on the right. The left is everything else.

That makes `value` exactly what a form submits, and it gives the right-hand list an order for
free — items land in the sequence they were moved, and the list renders in `value` order
rather than in `items` order.

- `getKey` identifies an item. Defaults to its `id` field.
- `value` / `defaultValue` / `onChange` behave like every other component here.
  `controlledValue` is **opt-in**: `bind:value={keys}` and `value={keys}` are
  indistinguishable at runtime, so controlled-ness is never inferred.
- `disabledKeys` pins items to the side they are on. They are skipped by "move all", left out
  of range selections, and ignored by double click.

## Behaviour

- A move takes the keys off one side and appends them to the other, in the order the
  originating list showed them.
- Items that move arrive **deselected**, so the next click on the opposite button is never an
  accidental undo. The selection is pruned against what is actually on each side rather than
  cleared outright, so a controlled parent that rejects a move leaves the user's selection
  intact.
- **Double click moves a row.** `Enter` deliberately does not: in a multi-select listbox Enter
  and Space toggle the selection, and overriding that would break the contract every other
  list in the library keeps. `Ctrl`/`Cmd`+`Enter` is the shortcut instead — each list has one
  destination, so it needs no direction and survives a mirrored layout. Disable it with
  `moveShortcut={false}`.
- Shift+click and Shift+Arrow select a range — see `ListBox`. With `virtualizer`, the range
  still spans rows that were never rendered: the component hands `ListBox` its `getKey`.
- A **filter** on a side changes what "move all" means: the rows on screen, not the whole
  side. Moving items the user cannot see would be invisible work.
- **Reordering** exists only on the right, where the order is state the user is building; the
  left is the order `items` were given in. It edits the whole `value`, not what a filter is
  showing.

## Focus after a move

The rows the user was working with disappear, so focus has to be placed deliberately or it
falls to the `<body>`:

- From a button, focus stays on the button while it still has something to move. Since a move
  clears the selection, that button usually goes disabled — and then focus follows the items
  to the destination list.
- From a double click, focus lands on the row that took the moved one's place (or the last
  row, if it was the last). When the side empties, it follows the items instead.

## Accessibility

- Each list is a `role="listbox"` with `aria-multiselectable="true"`, named by `label` — or by
  `aria-labelledby` when there is a visible heading.
- The move buttons are named after where items go ("Move selected to Selected"), not after a
  direction: an arrow glyph says nothing on its own, and "move right" is wrong the moment the
  layout is mirrored. Override with `aria-label`.
- `TransferList.Status` announces each move in a polite live region.

## Anatomy

```svelte
<TransferList.Root {items} bind:value class="grid grid-cols-[1fr_auto_1fr] gap-4">
	<TransferList.Source label="Available">
		{#snippet children(item)}
			<TransferList.Item {item}>{item.name}</TransferList.Item>
		{/snippet}
	</TransferList.Source>

	<div>
		<TransferList.MoveSelected to="target">→</TransferList.MoveSelected>
		<TransferList.MoveAll to="target">⇒</TransferList.MoveAll>
		<TransferList.MoveAll to="source">⇐</TransferList.MoveAll>
		<TransferList.MoveSelected to="source">←</TransferList.MoveSelected>
	</div>

	<TransferList.Target label="Selected">
		{#snippet children(item)}
			<TransferList.Item {item}>{item.name}</TransferList.Item>
		{/snippet}
	</TransferList.Target>

	<TransferList.Status />
</TransferList.Root>
```

- `TransferList.Root`
- `TransferList.Source`
- `TransferList.Target`
- `TransferList.Item`
- `TransferList.MoveSelected`
- `TransferList.MoveAll`
- `TransferList.MoveUp`
- `TransferList.MoveDown`
- `TransferList.Status`
