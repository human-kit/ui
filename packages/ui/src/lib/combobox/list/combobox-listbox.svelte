<script lang="ts" generics="T extends object = object">
	import type { ComponentProps, Snippet } from 'svelte';
	import { dev } from '../../internal/environment';
	import { useComboBoxContext } from '../root/context';
	import { ListBoxRoot as ListBox, type ListBoxContext } from '../../listbox';

	/**
	 * ComboBox.ListBox - The list wrapper with selection management.
	 * Extends ListBox props, controlling selection internally.
	 * Supports both static children and dynamic items rendering.
	 */
	type ComboBoxListBoxProps = Omit<
		ComponentProps<typeof ListBox>,
		// Props controlled internally by ComboBox
		| 'selectionMode'
		| 'selectionBehavior'
		| 'value'
		| 'defaultValue'
		| 'onChange'
		| 'context'
		| 'element'
		| 'children'
		| 'items'
		| 'id'
	> & {
		/** Optional items for dynamic rendering - overrides items from ComboBox context */
		items?: Iterable<T>;
		/** Content of the listbox. Receives item in dynamic mode. */
		children?: Snippet<[T]> | Snippet;
		/**
		 * Renders only the options near the viewport. See `ListBox`'s own `virtualizer` for
		 * the constraints (uniform row height, the list is the scroller).
		 *
		 * With no `items` of its own it virtualizes the ComboBox's, already filtered: the
		 * per-item filtering an unvirtualized list relies on cannot work when most items were
		 * never rendered.
		 */
		virtualizer?: { rowHeight?: number; overscan?: number };
		/** Rows rendered above the options, inside the listbox (e.g. a "Create …" action). */
		header?: Snippet;
	};

	let {
		'aria-label': ariaLabel = 'Options',
		children,
		items,
		virtualizer,
		header,
		...props
	}: ComboBoxListBoxProps = $props();

	const ctx = useComboBoxContext();
	let listboxCtx: ListBoxContext | undefined = $state();
	let listboxElement: HTMLElement | undefined = $state();
	const listboxSelection = $derived(Array.from(ctx.selectedValue));

	// Virtualizing means slicing, and only the ComboBox knows which items survived the filter
	// and in what order — so a virtualized list always renders *its* items, not a copy passed
	// down here. Anything else would filter with a predicate applied to rows that were never
	// rendered.
	const virtualItems = $derived(virtualizer ? (ctx.filteredItems as T[]) : undefined);

	// The root navigates by DOM order unless told otherwise; only a virtualized list needs
	// the item array instead, and saying so here keeps every other list — including one with
	// an action row in its header — navigating exactly as before.
	$effect(() => {
		ctx.setVirtualized(Boolean(virtualizer));
		return () => ctx.setVirtualized(false);
	});
	const renderedItems = $derived(virtualItems ?? items);

	if (dev) {
		$effect(() => {
			if (virtualizer && ctx.items === undefined) {
				console.warn(
					'[ComboBox.List]: `virtualizer` needs the list on the ComboBox itself — ' +
						'<ComboBox.Root items={...}> — since filtering and navigation are resolved ' +
						'there. Without it nothing is rendered.'
				);
			}
		});
	}

	// Whether the list has been open since the last time this ran, to tell "the list just
	// opened on its selection" from "the user is walking it with the arrows". Not `$state`:
	// both are read and written inside the effect below and nothing renders from them.
	let wasOpen = false;
	// Latched until the *selected* row is the one being scrolled to. Opening moves the focus
	// more than once — it lands on the first row before it lands on the selection — so a flag
	// consumed by the first scroll spent the centring on row zero and left the selection
	// pinned to the bottom edge.
	let openPendingScroll = false;

	// Keyboard focus lives on the ComboBox's input (aria-activedescendant), so moving it can
	// land on a row the window hasn't rendered. Ask the listbox for that index before the
	// input points at it — otherwise `aria-activedescendant` names an element that isn't
	// there and nothing scrolls.
	$effect(() => {
		const focusedId = ctx.focusedItemId;

		if (ctx.isOpen && !wasOpen) {
			openPendingScroll = true;
		}
		wasOpen = ctx.isOpen;

		if (!virtualItems || focusedId === null || !listboxCtx) return;

		// Over the filtered list, not `ctx.itemIds`: that one is built from item *registration*,
		// so in a virtualized list it only knows the rows that happen to be mounted.
		const index = ctx.filteredItemIds.indexOf(focusedId);

		if (index >= 0) {
			// Centred when opening lands on the selection: the user has to *find* it, and a row
			// flush against an edge reads as the end of the list. Everything else is nearest, so
			// the arrows move the list as little as possible.
			const [selectedId] = ctx.selectedValue;
			const isSelectedRow = selectedId !== undefined && focusedId === selectedId;
			const centre = openPendingScroll && isSelectedRow;

			// The latch is released by the scroll *landing*, not by asking for it: the first
			// attempts happen while the list is still sizing itself and get clamped away, and
			// giving up on them left the selection wherever a later "nearest" put it.
			void listboxCtx
				.scrollIndexIntoView(index, { align: centre ? 'center' : 'nearest' })
				.then((applied) => {
					if (centre && applied) {
						openPendingScroll = false;
					}
				});
		}
	});

	// Wire listbox context to combobox context when available
	$effect(() => {
		if (listboxCtx) {
			ctx.setListboxCtx(listboxCtx);
		}
	});

	// Wire listbox element ref to combobox context
	$effect(() => {
		if (listboxElement) {
			ctx.setListboxRef(listboxElement);
		}
	});

	// Defensive path: ComboBox items intercept selection through `onItemSelect`
	// and call `ctx.select` directly, so the inner ListBox rarely emits changes
	// on its own (e.g. only a future select-all could). The previous
	// implementation took `[0]` of the emitted set, which in multiple mode
	// re-toggled an already-selected id instead of applying the new one. Diff
	// against the current selection so only the actually-changed ids are applied.
	function handleSelectionChange(selection: Set<string | number>) {
		const current = new Set(ctx.selectedValue);

		for (const id of selection) {
			if (!current.has(id)) {
				const label = ctx.itemLabels.get(id) ?? String(id);
				ctx.select(id, label);
			}
		}

		for (const id of current) {
			// Re-read the live selection: in single mode, `ctx.select` above
			// already replaced the previous id, so removing it again would emit
			// a duplicate onChange.
			if (!selection.has(id) && ctx.selectedValue.has(id)) {
				ctx.removeItem(id);
			}
		}
	}
</script>

<ListBox
	{...props}
	bind:context={listboxCtx}
	bind:element={listboxElement}
	id={`combobox-listbox-${ctx.instanceId}`}
	items={renderedItems}
	{virtualizer}
	{header}
	{children}
	selectionMode={ctx.selectionMode}
	value={listboxSelection}
	onChange={handleSelectionChange}
	aria-label={ariaLabel}
	disableFocusHandling={true}
/>
