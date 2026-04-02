<script lang="ts">
	import type { Snippet } from 'svelte';
	import { useTableContext, useTableSectionContext } from '../root/context';

	type TableEmptyStateProps = {
		children?: Snippet;
		class?: string;
	};

	let { children, class: className = '' }: TableEmptyStateProps = $props();

	const table = useTableContext();
	const section = useTableSectionContext();
	if (section.section !== 'body') {
		throw new Error('`Table.EmptyState` must be used inside `Table.Body`.');
	}

	const layoutVersion = table.layoutVersion;
	const isVisible = $derived.by(() => {
		void $layoutVersion;
		return table.getBodyRowCount() === 0;
	});
	const columnCount = $derived.by(() => {
		void $layoutVersion;
		return Math.max(table.getColumnCount(), 1);
	});
</script>

{#if isVisible}
	<tr data-empty class={className}>
		<td role="gridcell" colspan={columnCount} aria-disabled="true">
			{#if children}
				{@render children()}
			{/if}
		</td>
	</tr>
{/if}
