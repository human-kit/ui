<script lang="ts">
	import { setTableSectionContext } from '../root/context';
	import type { TableFooterProps } from '../types.js';

	let { children, class: className = '', ...restProps }: TableFooterProps = $props();
	setTableSectionContext({ section: 'footer' });
</script>

<tfoot role="none" class={className} data-table-footer {...restProps}>
	{#if children}
		{@render children()}
	{/if}
</tfoot>
