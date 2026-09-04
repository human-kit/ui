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

Thus `value` is exactly what a form submits, and `value` also gives the sequence of the right list. An item goes to the position where the user moved it, because the list obeys the sequence of `value` and not the sequence of `items`.

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
  accidental undo. The component removes from the selection only the items that are not at that side. It does not remove the full selection. Thus a parent that refuses a move keeps the selection of the user.
- **Double click moves a row.** The `Enter` key does not move an item. In a listbox with more than one selection, the `Enter` key and the `Space` key change the selection. A different behavior would break the contract of each other list in this library. `Ctrl`/`Cmd`+`Enter` is the shortcut instead — each list has one
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

- From a button, focus stays on the button, as it does for any button press. The buttons are
  `aria-disabled` rather than natively disabled, so one that has just run out of work can
  still hold it.
- After a double click or the keyboard shortcut, the row of the user is gone. The focus goes to the row that takes its position. If that row was the last row, the focus goes to the new last row. When the side
  empties, it follows the items to the destination list rather than falling to the `<body>`.

## Accessibility

- Give the **Root** an `aria-label` or `aria-labelledby`. It then renders `role="group"`, which
  is what tells assistive technology that the two lists and the buttons are one control rather
  than unrelated ones. Without a name the role is left off: an unlabelled group is skipped
  anyway, so claiming it would only add noise.
- Each list is a `role="listbox"` with `aria-multiselectable="true"`, named by `label` — or by
  `aria-labelledby` when there is a visible heading.
- The move buttons carry `aria-disabled` rather than the native attribute, so they stay in the
  tab order when they have nothing to do. These controls are unavailable more often than available. If the component disabled them natively, a keyboard user would not find half of the actions. The tab order would also change while the user works. Style them with `data-disabled` — `:disabled` will never match.
- The name of a move button says where the items go ("Move selected to Selected"), and not a direction. An arrow symbol alone says nothing, and "move right" is wrong when the layout is a mirror image. Override with `aria-label`.
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
