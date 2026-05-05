<script lang="ts">
	import type { PurchaseRequest } from './model';
	import type { StaticCellComponentProps } from './static-types';

	let { row, value }: StaticCellComponentProps<PurchaseRequest> = $props();

	const formatter = new Intl.NumberFormat('en-US', {
		style: 'currency',
		currency: 'USD'
	});

	const amount = $derived(typeof value === 'number' ? value : row.original.total);
	const formatted = $derived(formatter.format(amount));
</script>

<div class="flex w-full justify-end">
	<span>{formatted}</span>
</div>
