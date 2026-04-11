<script lang="ts">
	import { DemoSection, DemoState } from '$lib/demo';
	import { Table } from '@human-kit/svelte-components/table';
	import { invoiceRows } from './table-demo-data';

	let invoicePage = $state(1);
	let invoicePageSize = $state(5);

	const invoicePageCount = $derived(Math.max(1, Math.ceil(invoiceRows.length / invoicePageSize)));
	const paginatedInvoices = $derived.by(() => {
		const startIndex = (invoicePage - 1) * invoicePageSize;
		return invoiceRows.slice(startIndex, startIndex + invoicePageSize);
	});
	const invoiceRangeStart = $derived(
		invoiceRows.length === 0 ? 0 : (invoicePage - 1) * invoicePageSize + 1
	);
	const invoiceRangeEnd = $derived(Math.min(invoicePage * invoicePageSize, invoiceRows.length));

	function goToInvoicePage(nextPage: number) {
		invoicePage = Math.max(1, Math.min(invoicePageCount, nextPage));
	}

	$effect(() => {
		if (invoicePage > invoicePageCount) {
			invoicePage = invoicePageCount;
		}
	});
</script>

<DemoSection
	title="Pagination"
	description="Pagination also stays consumer-owned: slice the dataset before rendering, then drive the current page from external controls or app state."
>
	<div
		class="w-full space-y-4 rounded-2xl border border-gray-300 bg-white p-3 dark:border-gray-700 dark:bg-gray-900"
	>
		<Table.Root
			aria-label="Paginated invoices table"
			selectionMode="none"
			class="min-w-full border-collapse text-left"
		>
			<Table.Header>
				<Table.Row class="border-b border-gray-200 dark:border-gray-700">
					{#each [{ id: 'customer', label: 'Customer', isRowHeader: true }, { id: 'issuedAt', label: 'Issued' }, { id: 'total', label: 'Total' }, { id: 'status', label: 'Status' }] as column (column.id)}
						<Table.Column id={column.id} isRowHeader={column.isRowHeader} textValue={column.label}>
							<Table.ColumnHeaderCell
								class="px-4 py-3 text-xs font-semibold uppercase tracking-[0.24em] text-gray-500 dark:text-gray-300"
								>{column.label}</Table.ColumnHeaderCell
							>
						</Table.Column>
					{/each}
				</Table.Row>
			</Table.Header>
			<Table.Body>
				{#each paginatedInvoices as invoice (invoice.id)}
					<Table.Row class="border-b border-gray-100 dark:border-gray-800">
						<Table.Cell class="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white"
							>{invoice.customer}</Table.Cell
						>
						<Table.Cell class="px-4 py-3 text-sm text-gray-500 dark:text-gray-400"
							>{invoice.issuedAt}</Table.Cell
						>
						<Table.Cell class="px-4 py-3 text-sm text-gray-600 dark:text-gray-300"
							>{invoice.total}</Table.Cell
						>
						<Table.Cell class="px-4 py-3 text-sm text-gray-600 dark:text-gray-300"
							>{invoice.status}</Table.Cell
						>
					</Table.Row>
				{/each}
			</Table.Body>
			<Table.Footer>
				<Table.Row>
					<Table.Cell class="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white"
						>Showing</Table.Cell
					>
					<Table.Cell class="px-4 py-3 text-sm text-gray-500 dark:text-gray-400"
						>{invoiceRangeStart}-{invoiceRangeEnd}</Table.Cell
					>
					<Table.Cell class="px-4 py-3 text-sm text-gray-500 dark:text-gray-400"
						>of {invoiceRows.length}</Table.Cell
					>
					<Table.Cell class="px-4 py-3 text-sm text-gray-500 dark:text-gray-400"
						>Page {invoicePage}/{invoicePageCount}</Table.Cell
					>
				</Table.Row>
			</Table.Footer>
		</Table.Root>

		<div
			class="flex flex-col gap-3 border-t border-gray-200 pt-3 dark:border-gray-800 sm:flex-row sm:items-center sm:justify-between"
		>
			<p class="text-sm text-gray-500 dark:text-gray-400">
				Rows {invoiceRangeStart}-{invoiceRangeEnd} of {invoiceRows.length}
			</p>
			<div class="flex items-center gap-2">
				<button
					type="button"
					class="rounded-lg border px-3 py-2 text-sm disabled:opacity-40 dark:border-gray-700 dark:text-gray-200"
					disabled={invoicePage === 1}
					onclick={() => goToInvoicePage(invoicePage - 1)}>Previous</button
				>
				<div
					class="rounded-lg bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 dark:bg-gray-800 dark:text-gray-200"
				>
					Page {invoicePage}
				</div>
				<button
					type="button"
					class="rounded-lg border px-3 py-2 text-sm disabled:opacity-40 dark:border-gray-700 dark:text-gray-200"
					disabled={invoicePage === invoicePageCount}
					onclick={() => goToInvoicePage(invoicePage + 1)}>Next</button
				>
			</div>
		</div>
	</div>

	{#snippet controls()}
		<div class="space-y-4">
			<label class="block space-y-2 text-sm text-gray-700 dark:text-gray-300">
				<span>Page size</span>
				<select
					bind:value={invoicePageSize}
					class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-blue-500 dark:border-gray-700 dark:bg-gray-950 dark:text-white"
				>
					<option value={5}>5 rows</option>
					<option value={6}>6 rows</option>
					<option value={9}>9 rows</option>
				</select>
			</label>
			<DemoState label="page" value={invoicePage} />
			<DemoState label="pageSize" value={invoicePageSize} />
			<DemoState label="pageCount" value={invoicePageCount} />
		</div>
	{/snippet}
</DemoSection>
