<script lang="ts">
	import { getContext } from 'svelte';
	import { SELECT_ITEM_CONTEXT_KEY, type SelectItemContext } from '../item/select-item.svelte';
	import { useSelectContext } from '../root/context';
	import type { SelectItemIndicatorProps } from '../types';

	/**
	 * Select.ItemIndicator — the mark of a selected option. It is in the DOM only while its
	 * option is selected, unless `forceMount` keeps it.
	 */
	let {
		children,
		forceMount = false,
		class: className = '',
		...restProps
	}: SelectItemIndicatorProps = $props();

	const ctx = useSelectContext('Select.ItemIndicator');
	const itemCtx = getContext<SelectItemContext | undefined>(SELECT_ITEM_CONTEXT_KEY);

	if (!itemCtx) {
		throw new Error('Select.ItemIndicator must be used inside a Select.Item');
	}

	const item = itemCtx;
	const isSelected = $derived(ctx.selectedKeys.has(item.id));
	const shouldRender = $derived(forceMount || isSelected);
</script>

{#if shouldRender}
	<span
		{...restProps}
		aria-hidden="true"
		class={className}
		data-select-item-indicator="true"
		data-state={isSelected ? 'checked' : 'unchecked'}
	>
		{#if children}
			{@render children()}
		{:else}
			<svg
				xmlns="http://www.w3.org/2000/svg"
				viewBox="0 0 16 16"
				fill="currentColor"
				style="width:1rem;height:1rem"
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
