<script lang="ts">
	import { setTableSectionContext } from '../root/context.svelte';
	import type { TableHeaderProps } from '../types.js';

	let { children, class: className = '', ...restProps }: TableHeaderProps = $props();
	setTableSectionContext({ section: 'header' });
</script>

<thead class={className} data-table-header {...restProps}>
	{#if children}
		{@render children()}
	{/if}
</thead>
