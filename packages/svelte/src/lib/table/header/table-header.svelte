<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { setTableSectionContext } from '../root/context';

	type TableHeaderProps = Omit<HTMLAttributes<HTMLTableSectionElement>, 'children'> & {
		children?: Snippet;
		class?: string;
	};

	let { children, class: className = '', ...restProps }: TableHeaderProps = $props();
	setTableSectionContext({ section: 'header' });
</script>

<thead class={className} data-table-header {...restProps}>
	{#if children}
		{@render children()}
	{/if}
</thead>
