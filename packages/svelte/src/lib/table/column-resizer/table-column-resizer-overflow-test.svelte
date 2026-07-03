<script lang="ts">
	import { Table } from '../index';
	import type { TableColumnWidth } from '../root/context';

	let currentColumnWidths = $state<Map<string, TableColumnWidth> | undefined>(undefined);
</script>

<div style="width: 640px; overflow-x: auto;">
	<Table.Root
		aria-label="Resizable overflow table"
		bind:columnWidths={currentColumnWidths}
		class="min-w-full border-collapse text-left"
	>
		<Table.Header>
			<Table.Row>
				<Table.Column id="name" rowHeader textValue="Name" width={240}>
					<Table.ColumnHeaderCell data-testid="overflow-name-header-cell">
						<div class="flex items-center justify-between gap-3">
							<span>Name</span>
							<Table.ColumnResizer
								data-testid="overflow-name-resizer"
								class="inline-flex w-3 cursor-col-resize justify-center"
							/>
						</div>
					</Table.ColumnHeaderCell>
				</Table.Column>
				<Table.Column id="region" textValue="Region" defaultWidth={180} minWidth={140}>
					<Table.ColumnHeaderCell data-testid="overflow-region-header-cell">
						<div class="flex items-center justify-between gap-3">
							<span>Region</span>
							<Table.ColumnResizer
								data-testid="overflow-region-resizer"
								class="inline-flex w-3 cursor-col-resize justify-center"
							/>
						</div>
					</Table.ColumnHeaderCell>
				</Table.Column>
				<Table.Column id="plan" textValue="Plan">
					<Table.ColumnHeaderCell data-testid="overflow-plan-header-cell">
						<div class="flex items-center justify-between gap-3">
							<span>Plan</span>
							<Table.ColumnResizer
								data-testid="overflow-plan-resizer"
								class="inline-flex w-3 cursor-col-resize justify-center"
							/>
						</div>
					</Table.ColumnHeaderCell>
				</Table.Column>
			</Table.Row>
		</Table.Header>

		<Table.Body>
			<Table.Row id="danilo">
				<Table.Cell>Danilo Fernandez</Table.Cell>
				<Table.Cell>Buenos Aires</Table.Cell>
				<Table.Cell>Enterprise</Table.Cell>
			</Table.Row>
		</Table.Body>
	</Table.Root>
</div>

<output data-testid="overflow-column-widths"
	>{JSON.stringify(Object.fromEntries(currentColumnWidths ?? new Map()))}</output
>
