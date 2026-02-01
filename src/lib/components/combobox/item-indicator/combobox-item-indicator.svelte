<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { getContext } from 'svelte';
	import { cn } from '$lib/utils/cn';
	import { useComboBoxContext } from '../root/context';
	import {
		COMBOBOX_ITEM_CONTEXT_KEY,
		type ComboBoxItemContext
	} from '../item/combobox-listboxitem.svelte';

	/**
	 * ComboBox.ItemIndicator - Visual indicator shown when an item is selected.
	 * Must be used inside ComboBox.Item.
	 * Only renders when the parent item is selected.
	 */
	type ComboBoxItemIndicatorProps = {
		/** Content to render when selected (defaults to checkmark icon) */
		children?: Snippet;
		/** Force show the indicator regardless of selection state */
		forceMount?: boolean;
		class?: string;
	} & Omit<HTMLAttributes<HTMLSpanElement>, 'class' | 'children'>;

	let {
		children,
		forceMount = false,
		class: className,
		...restProps
	}: ComboBoxItemIndicatorProps = $props();

	const comboboxCtx = useComboBoxContext();
	const itemCtx = getContext<ComboBoxItemContext>(COMBOBOX_ITEM_CONTEXT_KEY);

	const isSelected = $derived(comboboxCtx.selectedValue.has(itemCtx.id));
	const shouldRender = $derived(forceMount || isSelected);
</script>

{#if shouldRender}
	<span
		aria-hidden="true"
		data-state={isSelected ? 'checked' : 'unchecked'}
		class={cn('inline-flex items-center justify-center', className)}
		{...restProps}
	>
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
