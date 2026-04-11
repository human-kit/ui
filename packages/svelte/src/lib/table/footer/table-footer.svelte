<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { setTableSectionContext } from '../root/context';

	type TableFooterProps = Omit<HTMLAttributes<HTMLTableSectionElement>, 'children'> & {
		children?: Snippet;
		class?: string;
	};

	let { children, class: className = '', ...restProps }: TableFooterProps = $props();
	setTableSectionContext({ section: 'footer' });
</script>

<tfoot role="none" class={className} data-table-footer {...restProps}>
	{#if children}
		{@render children()}
	{/if}
</tfoot>
