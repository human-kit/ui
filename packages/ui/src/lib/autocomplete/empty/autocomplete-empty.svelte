<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { useAutocompleteContext } from '../root/context';

	/**
	 * Autocomplete.Empty - Rendered when no items match the current query.
	 */
	type AutocompleteEmptyProps = {
		/** Content to show when empty (defaults to "No results"). */
		children?: Snippet;
		class?: string;
	} & Omit<HTMLAttributes<HTMLDivElement>, 'class' | 'children'>;

	let { children, ...restProps }: AutocompleteEmptyProps = $props();

	const ctx = useAutocompleteContext();
	const isEmpty = $derived(ctx.visibleCount === 0);
</script>

{#if isEmpty}
	<!-- Rendered inside the List's role="listbox", where a bare div is invalid content:
	     mirror the listbox's own empty placeholder (a disabled, unselected option). A
	     consumer-provided role (via restProps) overrides these defaults. -->
	<div
		data-empty
		role="option"
		aria-selected={restProps.role === undefined ? 'false' : undefined}
		aria-disabled={restProps.role === undefined ? 'true' : undefined}
		{...restProps}
	>
		{#if children}
			{@render children()}
		{:else}
			No results
		{/if}
	</div>
{/if}
