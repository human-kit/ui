<script lang="ts">
	import type { Snippet } from 'svelte';
	import { useComboBoxContext } from '../root/context';
	import TagContextProvider from '../tag/tag-context-provider.svelte';

	export type TagItem = {
		value: string | number;
		label: string;
	};

	/**
	 * ComboBox.Tags - Container for selected value tags in multiple mode.
	 * Renders each selected value as a tag using the provided snippet.
	 * Sets context for each tag so ComboBox.Tag can access id, label, and remove.
	 */
	type ComboBoxTagsProps = {
		/** Snippet to render each tag. Receives { item: { value, label } } */
		children: Snippet<[{ item: TagItem }]>;
		class?: string;
	};

	let { children, class: className = '' }: ComboBoxTagsProps = $props();

	const ctx = useComboBoxContext();

	// Get selected items with their labels from persistent selectedLabels map
	const selectedItems = $derived(
		Array.from(ctx.selectedValue).map((id) => ({
			id,
			// Use selectedLabels (persistent) first, fallback to itemLabels (may be cleared on filter)
			label: ctx.selectedLabels.get(id) ?? ctx.itemLabels.get(id) ?? String(id),
			remove: () => ctx.removeItem(id)
		}))
	);
</script>

{#if ctx.selectionMode === 'multiple' && selectedItems.length > 0}
	<div class={className} role="list" aria-label="Selected values">
		{#each selectedItems as selected (selected.id)}
			<TagContextProvider
				id={selected.id}
				label={selected.label}
				remove={selected.remove}
				disabled={ctx.isDisabled}
			>
				{@render children({ item: { value: selected.id, label: selected.label } })}
			</TagContextProvider>
		{/each}
	</div>
{/if}
