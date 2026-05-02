<script lang="ts">
	import { useTableContext, useTableSectionContext } from '../root/context';
	import type { TableEmptyStateProps } from '../types.js';

	let { children, class: className = '' }: TableEmptyStateProps = $props();

	const table = useTableContext();
	const section = useTableSectionContext();
	if (section.section !== 'body') {
		throw new Error('`Table.EmptyState` must be used inside `Table.Body`.');
	}

	const layoutVersion = table.layoutVersion;
	const isVisible = $derived.by(() => {
		void $layoutVersion;
		return table.getLogicalBodyRowCount() === 0;
	});
	const columnCount = $derived.by(() => {
		void $layoutVersion;
		return Math.max(table.getVisibleColumnCount(), 1);
	});
</script>

{#if isVisible}
	<!-- svelte-ignore a11y_no_redundant_roles -->
	<tr role="row" data-empty class={className}>
		<td role="gridcell" colspan={columnCount} aria-disabled="true">
			{#if children}
				{@render children()}
			{/if}
		</td>
	</tr>
{/if}
