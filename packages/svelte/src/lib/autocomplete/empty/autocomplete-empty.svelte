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
	<div data-empty {...restProps}>
		{#if children}
			{@render children()}
		{:else}
			No results
		{/if}
	</div>
{/if}
