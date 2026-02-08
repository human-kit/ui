<script lang="ts" generics="T extends object = object">
	import type { Snippet } from 'svelte';
	import { createListBoxContext, type ListBoxContext } from './context';

	/**
	 * Props for the ListBox component.
	 * @template T - The type of items when using dynamic rendering with the `items` prop.
	 */
	type ListBoxProps = {
		/** How selection behaves: 'toggle' allows deselection, 'replace' always selects. */
		selectionBehavior?: 'toggle' | 'replace';
		/** Content shown when the list is empty. Can be a string or a Snippet. */
		emptyPlaceholder?: string | Snippet;
		/** Iterable of items for dynamic rendering. Used with a snippet that receives each item. */
		items?: Iterable<T>;
		/** IDs of items that should be disabled and non-selectable. */
		disabledIds?: Iterable<string | number>;
		/** Selection mode: 'single' allows one selection, 'multiple' allows many. */
		selectionMode?: 'single' | 'multiple';
		/** Controlled value. When provided, the component is in controlled mode. */
		value?: Iterable<string | number>;
		/** Initial selection for uncontrolled mode. */
		defaultValue?: Iterable<string | number>;
		/** Content of the listbox. Can be static children or a snippet receiving items. */
		children?: Snippet | Snippet<[T]>;
		/** CSS class to apply to the listbox container. */
		class?: string;
		/** HTML id attribute for the listbox element. */
		id?: string;
		/** Accessible label for the listbox. Announced by screen readers. */
		'aria-label'?: string;
		/** Callback fired when the selection changes. */
		onChange?: (value: Set<string | number>) => void;
	};

	let {
		selectionBehavior = 'toggle',
		emptyPlaceholder = 'No items selected',
		items,
		disabledIds,
		selectionMode = 'single',
		value = $bindable(),
		defaultValue,
		children,
		class: className = '',
		id,
		'aria-label': ariaLabel,
		onChange,
		context = $bindable(),
		element = $bindable()
	}: ListBoxProps & { context?: ListBoxContext; element?: HTMLElement } = $props();

	let listboxElement: HTMLElement;

	// Expose element via bindable prop
	$effect(() => {
		element = listboxElement;
	});

	function parseSelection(val: Iterable<string | number> | undefined): Set<string | number> {
		if (val === undefined) return new Set();
		return new Set(val);
	}

	const isControlled = $derived(value !== undefined);

	const ctx = createListBoxContext({
		get selectionMode() {
			return selectionMode;
		},
		get selectionBehavior() {
			return selectionBehavior;
		},
		get disabledIds() {
			return disabledIds;
		},
		// Use function to capture initial value only (not reactive)
		initialSelection: (() => parseSelection(defaultValue))(),
		onSelectionChange: (newSelection) => {
			onChange?.(newSelection);
		}
	});

	// Expose context via bindable prop
	context = ctx;

	const { action: keyboardAction } = ctx.keyboardNav;

	$effect(() => {
		if (isControlled && value !== undefined) {
			const newSelection = parseSelection(value);
			ctx.setSelection(newSelection);
		}
	});

	$effect(() => {
		ctx.disabledIds.clear();
		if (disabledIds) {
			for (const id of disabledIds) {
				ctx.disabledIds.add(id);
			}
		}
	});

	let itemCount = $state(0);

	// Subscribe to item count changes for reactive empty state
	$effect(() => {
		const unsubscribe = ctx.subscribeToItemCount((count) => {
			itemCount = count;
		});
		return unsubscribe;
	});

	const itemsArray = $derived(items ? Array.from(items) : []);
	const hasItems = $derived(itemsArray.length > 0 || itemCount > 0);
</script>

<div
	bind:this={listboxElement}
	role="listbox"
	{id}
	aria-multiselectable={selectionMode === 'multiple'}
	aria-label={ariaLabel}
	class={className}
	tabindex="0"
	use:keyboardAction
>
	{#if items && children}
		{#each itemsArray as item (item)}
			{@render (children as Snippet<[T]>)(item)}
		{/each}
	{:else if children}
		{@render (children as Snippet)()}
	{/if}

	{#if !hasItems && itemCount === 0}
		{#if typeof emptyPlaceholder === 'string'}
			<div role="option" aria-selected="false" aria-disabled="true" data-empty-placeholder>
				{emptyPlaceholder}
			</div>
		{:else if emptyPlaceholder}
			{@render emptyPlaceholder()}
		{/if}
	{/if}
</div>
