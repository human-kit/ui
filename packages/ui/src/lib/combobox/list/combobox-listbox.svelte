<script lang="ts" generics="T extends object = object">
	import type { ComponentProps, Snippet } from 'svelte';
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
	};

	let {
		'aria-label': ariaLabel = 'Options',
		children,
		items,
		...props
	}: ComboBoxListBoxProps = $props();

	const ctx = useComboBoxContext();
	let listboxCtx: ListBoxContext | undefined = $state();
	let listboxElement: HTMLElement | undefined = $state();
	const listboxSelection = $derived(Array.from(ctx.selectedValue));

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
	{items}
	{children}
	selectionMode={ctx.selectionMode}
	value={listboxSelection}
	onChange={handleSelectionChange}
	aria-label={ariaLabel}
	disableFocusHandling={true}
/>
