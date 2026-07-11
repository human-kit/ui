<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLThAttributes } from 'svelte/elements';

	// `HTMLThAttributes` so callers (e.g. Calendar.GridHeader) can expose the
	// long weekday name through `abbr`/`aria-label` on the `th` element.
	type CalendarHeaderCellProps = Omit<HTMLThAttributes, 'children'> & {
		children?: Snippet;
	};

	let { children, class: className = '', ...restProps }: CalendarHeaderCellProps = $props();
</script>

<th role="columnheader" class={className} {...restProps}>
	{#if children}
		{@render children()}
	{/if}
</th>
