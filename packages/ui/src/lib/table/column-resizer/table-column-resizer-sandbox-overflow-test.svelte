<script lang="ts">
	import { Table } from '../index';
	import type { TableColumnWidth } from '../root/context.svelte';

	let currentColumnWidths = $state<Map<string, TableColumnWidth> | undefined>(undefined);
	const rows = Array.from({ length: 24 }, (_, index) => ({
		id: `row-${index + 1}`,
		request: `PR-${String(index + 1).padStart(4, '0')}`,
		requester: ['Ana Gomez', 'Lucas Perez', 'Mara Silva', 'Juan Torres'][index % 4],
		area: ['Production', 'Logistics', 'Maintenance', 'Quality'][index % 4],
		status: ['Pending', 'Review', 'Approved'][index % 3],
		priority: ['Low', 'Medium', 'High'][index % 3],
		total: 850 + index * 137
	}));
</script>

<div
	data-testid="sandbox-overflow-container"
	style="width: 920px; max-height: 320px; overflow: auto;"
>
	<Table.Root
		aria-label="Sandbox overflow table"
		selectionMode="multiple"
		bind:columnWidths={currentColumnWidths}
		class="min-w-full border-collapse text-left"
	>
		<Table.Header>
			<Table.Row>
				<Table.Column id="selection" textValue="Selection" width={44}>
					<Table.ColumnHeaderCell data-testid="sandbox-selection-header-cell">
						<Table.Checkbox />
					</Table.ColumnHeaderCell>
				</Table.Column>
				<Table.Column id="request" textValue="Request" rowHeader defaultWidth={350}>
					<Table.ColumnHeaderCell data-testid="sandbox-request-header-cell">
						<div class="flex items-center justify-between gap-3">
							<span>Request</span>
							<Table.ColumnResizer
								data-testid="sandbox-request-resizer"
								class="inline-flex w-3 cursor-col-resize justify-center"
							/>
						</div>
					</Table.ColumnHeaderCell>
				</Table.Column>
				<Table.Column id="requester" textValue="Requester">
					<Table.ColumnHeaderCell>Requester</Table.ColumnHeaderCell>
				</Table.Column>
				<Table.Column id="area" textValue="Area">
					<Table.ColumnHeaderCell>Area</Table.ColumnHeaderCell>
				</Table.Column>
				<Table.Column id="status" textValue="Status">
					<Table.ColumnHeaderCell>Status</Table.ColumnHeaderCell>
				</Table.Column>
				<Table.Column id="priority" textValue="Priority">
					<Table.ColumnHeaderCell>Priority</Table.ColumnHeaderCell>
				</Table.Column>
				<Table.Column id="total" textValue="Total">
					<Table.ColumnHeaderCell data-testid="sandbox-total-header-cell">
						<div class="flex w-full justify-end">Total</div>
					</Table.ColumnHeaderCell>
				</Table.Column>
			</Table.Row>
		</Table.Header>

		<Table.Body>
			{#each rows as row (row.id)}
				<Table.Row id={row.id}>
					<Table.Cell>
						<Table.Checkbox />
					</Table.Cell>
					<Table.Cell>{row.request}</Table.Cell>
					<Table.Cell>{row.requester}</Table.Cell>
					<Table.Cell>{row.area}</Table.Cell>
					<Table.Cell>{row.status}</Table.Cell>
					<Table.Cell>{row.priority}</Table.Cell>
					<Table.Cell>
						<div class="flex w-full justify-end">${row.total.toLocaleString()}</div>
					</Table.Cell>
				</Table.Row>
			{/each}
		</Table.Body>
	</Table.Root>
</div>

<output data-testid="sandbox-overflow-widths"
	>{JSON.stringify(Object.fromEntries(currentColumnWidths ?? new Map()))}</output
>
