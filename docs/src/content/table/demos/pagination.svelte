<script lang="ts">
	import { Table } from '@human-kit/svelte-components';

	const customers = ['Northwind', 'Comet', 'Atlas', 'Delta', 'Hearth', 'River', 'Lumen', 'Vertex'];
	const invoices = customers.map((customer, index) => ({
		id: `inv-${1000 + index}`,
		customer,
		issuedAt: `2026-04-0${index + 1}`,
		total: `$${(index + 4) * 320}`,
		status: ['Paid', 'Pending', 'Review'][index % 3]
	}));

	const pageSize = 4;
	let page = $state(1);

	const pageCount = $derived(Math.max(1, Math.ceil(invoices.length / pageSize)));
	const paginated = $derived(invoices.slice((page - 1) * pageSize, page * pageSize));

	const columns = [
		{ id: 'customer', label: 'Customer', rowHeader: true },
		{ id: 'issuedAt', label: 'Issued' },
		{ id: 'total', label: 'Total' },
		{ id: 'status', label: 'Status' }
	];

	const cellClass =
		'px-4 py-3 text-sm text-neutral-600 outline-none data-[focus-visible=true]:ring-2 data-[focus-visible=true]:ring-inset data-[focus-visible=true]:ring-blue-500 dark:text-neutral-300';
	const buttonClass =
		'rounded-lg border border-neutral-300 px-3 py-2 text-sm text-neutral-700 disabled:opacity-40 dark:border-neutral-700 dark:text-neutral-200';
</script>

<div
	class="w-full space-y-3 rounded-xl border border-neutral-200 bg-white p-3 dark:border-neutral-700 dark:bg-neutral-900"
>
	<Table.Root aria-label="Paginated invoices table" class="min-w-full border-collapse text-left">
		<Table.Header>
			<Table.Row class="border-b border-neutral-200 dark:border-neutral-700">
				{#each columns as column (column.id)}
					<Table.Column id={column.id} rowHeader={column.rowHeader} textValue={column.label}>
						<Table.ColumnHeaderCell
							class="px-4 py-3 text-xs font-semibold tracking-widest text-neutral-500 uppercase outline-none data-[focus-visible=true]:ring-2 data-[focus-visible=true]:ring-inset data-[focus-visible=true]:ring-blue-500 dark:text-neutral-300"
						>
							{column.label}
						</Table.ColumnHeaderCell>
					</Table.Column>
				{/each}
			</Table.Row>
		</Table.Header>
		<Table.Body>
			{#each paginated as invoice (invoice.id)}
				<Table.Row class="border-b border-neutral-100 dark:border-neutral-800">
					<Table.Cell
						class="px-4 py-3 text-sm font-medium text-neutral-900 outline-none data-[focus-visible=true]:ring-2 data-[focus-visible=true]:ring-inset data-[focus-visible=true]:ring-blue-500 dark:text-white"
					>
						{invoice.customer}
					</Table.Cell>
					<Table.Cell class={cellClass}>{invoice.issuedAt}</Table.Cell>
					<Table.Cell class={cellClass}>{invoice.total}</Table.Cell>
					<Table.Cell class={cellClass}>{invoice.status}</Table.Cell>
				</Table.Row>
			{/each}
		</Table.Body>
	</Table.Root>

	<div
		class="flex items-center justify-between border-t border-neutral-200 pt-3 dark:border-neutral-800"
	>
		<p class="text-sm text-neutral-500 dark:text-neutral-400">
			Page {page} of {pageCount}
		</p>
		<div class="flex items-center gap-2">
			<button type="button" class={buttonClass} disabled={page === 1} onclick={() => (page -= 1)}>
				Previous
			</button>
			<button
				type="button"
				class={buttonClass}
				disabled={page === pageCount}
				onclick={() => (page += 1)}
			>
				Next
			</button>
		</div>
	</div>
</div>
