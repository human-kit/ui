<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { setTableSectionContext, useTableContext } from '../root/context';

	type TableBodyProps = Omit<HTMLAttributes<HTMLTableSectionElement>, 'children'> & {
		children?: Snippet;
		class?: string;
	};

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
