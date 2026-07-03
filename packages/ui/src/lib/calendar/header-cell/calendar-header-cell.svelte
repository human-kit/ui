<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	type CalendarHeaderCellProps = Omit<HTMLAttributes<HTMLTableCellElement>, 'children'> & {
		children?: Snippet;
	};

	let { children, class: className = '', ...restProps }: CalendarHeaderCellProps = $props();
</script>

<th role="columnheader" class={className} {...restProps}>
	{#if children}
		{@render children()}
	{/if}
</th>
