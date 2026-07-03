<script lang="ts">
	import type { Snippet } from 'svelte';
	import { getContext } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import {
		AUTOCOMPLETE_ITEM_CONTEXT_KEY,
		type AutocompleteItemContext
	} from '../item/autocomplete-item.svelte';
	import { useAutocompleteContext } from '../root/context';

	/**
	 * Autocomplete.ItemIndicator - Visual indicator shown when an item is selected.
	 * Must be used inside Autocomplete.Item. Only renders when the item is selected.
	 */
	type AutocompleteItemIndicatorProps = {
		/** Content to render when selected (defaults to a checkmark icon). */
		children?: Snippet;
		/** Force the indicator to render regardless of selection state. */
		forceMount?: boolean;
		class?: string;
	} & Omit<HTMLAttributes<HTMLSpanElement>, 'class' | 'children'>;

	let { children, forceMount = false, ...restProps }: AutocompleteItemIndicatorProps = $props();

	const ctx = useAutocompleteContext();
	const itemCtx = getContext<AutocompleteItemContext>(AUTOCOMPLETE_ITEM_CONTEXT_KEY);

	// Selection lives in the inner ListBox; subscribe for reactive updates.
	let isSelected = $state(false);
	$effect(() => {
		const listboxCtx = ctx.listboxCtx;
		if (!listboxCtx) return;
		return listboxCtx.subscribeToItem(itemCtx.id, (selected) => {
			isSelected = selected;
		});
	});

	const shouldRender = $derived(forceMount || isSelected);
</script>

{#if shouldRender}
	<span aria-hidden="true" data-state={isSelected ? 'checked' : 'unchecked'} {...restProps}>
		{#if children}
			{@render children()}
		{:else}
			<svg
				xmlns="http://www.w3.org/2000/svg"
				viewBox="0 0 16 16"
				fill="currentColor"
				class="h-4 w-4"
			>
				<path
					fill-rule="evenodd"
					d="M12.416 3.376a.75.75 0 0 1 .208 1.04l-5 7.5a.75.75 0 0 1-1.154.114l-3-3a.75.75 0 0 1 1.06-1.06l2.353 2.353 4.493-6.74a.75.75 0 0 1 1.04-.207Z"
					clip-rule="evenodd"
				/>
			</svg>
		{/if}
	</span>
{/if}
