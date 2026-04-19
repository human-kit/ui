<script lang="ts">
	import { setTableSectionContext, useTableContext } from '../root/context';
	import type { TableBodyProps } from '../types.js';

	let { children, class: className = '', ...restProps }: TableBodyProps = $props();
	setTableSectionContext({ section: 'body' });
	const table = useTableContext();
	const layoutVersion = table.layoutVersion;
	const isEmpty = $derived.by(() => {
		void $layoutVersion;
		return table.getBodyRowCount() === 0;
	});
</script>

<tbody class={className} data-table-body data-empty={isEmpty || undefined} {...restProps}>
	{#if children}
		{@render children()}
	{/if}
</tbody>
