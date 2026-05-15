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

	function handleSelectionChange(selection: Set<string | number>) {
		const selectedId = Array.from(selection)[0];
		if (selectedId !== undefined) {
			const label = ctx.itemLabels.get(selectedId) ?? String(selectedId);
			ctx.select(selectedId, label);
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
	value={ctx.selectedValue}
	onChange={handleSelectionChange}
	aria-label={ariaLabel}
	disableFocusHandling={true}
/>
