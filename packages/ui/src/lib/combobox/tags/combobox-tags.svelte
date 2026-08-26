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
		/** The snippet that makes each tag. It receives { item: { value, label } }. */
		children: Snippet<[{ item: TagItem }]>;
		/**
		 * An optional indicator for the tags that do not fit. With it, the tag row stays on one line.
		 * The component makes no tag that does not fit, and it puts this snippet at the end with the
		 * number of the hidden tags. The snippet also receives `visible` and `total`, thus you can show
		 * a summary when no tag fits. Make one element in it.
		 *
		 * Without `overflow`, the component makes each tag, and your styles decide how the row wraps.
		 */
		overflow?: Snippet<[TagsOverflow]>;
		/**
		 * The horizontal space to keep free in the parent, in px, for an element beside the tags such as
		 * the search input. Thus the calculation does not take the full row. The component uses it only
		 * with `overflow`.
		 */
		reserve?: number;
		class?: string;
		/** The accessible name of the tag row. The default is `Selected values`. */
		'aria-label'?: string;
	};

	// Renamed locally: the snippet we hand to `OverflowRow` must itself be named
	// `children`, so the consumer's tag snippet needs a distinct name to avoid
	// shadowing it (which would make `{@render children(...)}` recurse).
	let {
		children: renderTag,
		overflow,
		reserve = 0,
		class: className = '',
		'aria-label': ariaLabel = 'Selected values'
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
		aria-label={ariaLabel}
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
