<script lang="ts">
	import { Table } from '../index';
	import type { TableColumnWidth } from '../root/context.svelte';

	let currentColumnWidths = $state<Map<string, TableColumnWidth> | undefined>(undefined);
</script>

<div data-testid="narrow-min-width-container" style="width: 240px; overflow-x: auto;">
	<Table.Root
		aria-label="Narrow min width table"
		bind:columnWidths={currentColumnWidths}
		class="min-w-full border-collapse text-left"
	>
		<Table.Header>
			<Table.Row>
				<Table.Column id="request" rowHeader textValue="Request" minWidth={75}>
					<Table.ColumnHeaderCell data-testid="narrow-request-header-cell">
						<div class="flex items-center justify-between gap-3">
							<span>Request</span>
							<Table.ColumnResizer
								data-testid="narrow-request-resizer"
								class="inline-flex w-3 cursor-col-resize justify-center"
							/>
						</div>
					</Table.ColumnHeaderCell>
				</Table.Column>
				<Table.Column id="requester" textValue="Requester" minWidth={140}>
					<Table.ColumnHeaderCell data-testid="narrow-requester-header-cell">
						<div class="flex items-center justify-between gap-3">
							<span>Requester</span>
							<Table.ColumnResizer class="inline-flex w-3 cursor-col-resize justify-center" />
						</div>
					</Table.ColumnHeaderCell>
				</Table.Column>
				<Table.Column id="area" textValue="Area">
					<Table.ColumnHeaderCell data-testid="narrow-area-header-cell">
						<div class="flex items-center justify-between gap-3">
							<span>Area</span>
							<Table.ColumnResizer class="inline-flex w-3 cursor-col-resize justify-center" />
						</div>
					</Table.ColumnHeaderCell>
				</Table.Column>
				<Table.Column id="status" textValue="Status">
					<Table.ColumnHeaderCell data-testid="narrow-status-header-cell">
						<div class="flex items-center justify-between gap-3">
							<span>Status</span>
							<Table.ColumnResizer class="inline-flex w-3 cursor-col-resize justify-center" />
						</div>
					</Table.ColumnHeaderCell>
				</Table.Column>
				<Table.Column id="total" textValue="Total">
					<Table.ColumnHeaderCell data-testid="narrow-total-header-cell">
						<div class="flex items-center justify-between gap-3">
							<span>Total</span>
							<Table.ColumnResizer class="inline-flex w-3 cursor-col-resize justify-center" />
						</div>
					</Table.ColumnHeaderCell>
				</Table.Column>
			</Table.Row>
		</Table.Header>

		<Table.Body>
			<Table.Row id="pr-001">
				<Table.Cell>PR-001</Table.Cell>
				<Table.Cell>Ana Gomez</Table.Cell>
				<Table.Cell>Ops</Table.Cell>
				<Table.Cell>Pending</Table.Cell>
				<Table.Cell>$1,520</Table.Cell>
			</Table.Row>
		</Table.Body>
	</Table.Root>
</div>

<output data-testid="narrow-min-width-widths"
	>{JSON.stringify(Object.fromEntries(currentColumnWidths ?? new Map()))}</output
>
