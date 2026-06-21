<script lang="ts">
	import type { Snippet } from 'svelte';
	import { cn } from '../../utils/cn.js';
	import OverflowRow, { type OverflowRowState } from '../../overflow-row/overflow-row.svelte';
	import { useComboBoxContext } from '../root/context.js';
	import TagContextProvider from '../tag/tag-context-provider.svelte';

	export type TagItem = {
		value: string | number;
		label: string;
	};

	// Re-exported for consumers that type their overflow snippet against it.
	export type TagsOverflow = OverflowRowState;

	/**
	 * ComboBox.Tags - Container for selected value tags in multiple mode.
	 * Renders each selected value as a tag using the provided snippet.
	 * Sets context for each tag so ComboBox.Tag can access id, label, and remove.
	 *
	 * Measurement/overflow is delegated to the generic `OverflowRow` primitive; this
	 * component only adapts it to the combobox (selection -> items, per-tag context).
	 */
	type ComboBoxTagsProps = {
		/** Snippet to render each tag. Receives { item: { value, label } } */
		children: Snippet<[{ item: TagItem }]>;
		/**
		 * Optional overflow indicator. When provided, the tag row is constrained to
		 * a single line: tags that don't fit are not rendered, and this snippet
		 * renders at the end with how many are hidden (plus `visible`/`total`, so the
		 * consumer can e.g. show a summary when nothing fits). Expected to render a
		 * single element. Without `overflow`, every tag renders and wrapping is left
		 * to the consumer's styles (the previous behaviour).
		 */
		overflow?: Snippet<[TagsOverflow]>;
		/**
		 * Horizontal space (px) to keep free inside the parent for siblings such as
		 * the search input, so the overflow calc doesn't claim the whole row. Only
		 * used in overflow mode.
		 */
		reserve?: number;
		class?: string;
	};

	// Renamed locally: the snippet we hand to `OverflowRow` must itself be named
	// `children`, so the consumer's tag snippet needs a distinct name to avoid
	// shadowing it (which would make `{@render children(...)}` recurse).
	let {
		children: renderTag,
		overflow,
		reserve = 0,
		class: className = ''
	}: ComboBoxTagsProps = $props();

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
	<OverflowRow
		items={selectedItems}
		getKey={(selected) => selected.id}
		{overflow}
		{reserve}
		class={cn(className)}
		role="list"
		aria-label="Selected values"
	>
		{#snippet children({ item: selected })}
			<TagContextProvider
				id={selected.id}
				label={selected.label}
				remove={selected.remove}
				disabled={ctx.isDisabled}
			>
				{@render renderTag({ item: { value: selected.id, label: selected.label } })}
			</TagContextProvider>
		{/snippet}
	</OverflowRow>
{/if}
