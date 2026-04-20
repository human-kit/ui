<script lang="ts">
	import { Table } from '../index';
	import type { TableColumnWidth } from '../root/context';

	let currentColumnWidths = $state<Map<string, TableColumnWidth> | undefined>(undefined);
</script>

<div
	data-testid="padded-relative-container"
	style="width: 640px; box-sizing: border-box; overflow-x: auto; padding: 12px; border: 1px solid transparent;"
>
	<Table.Root
		aria-label="Padded relative resize table"
		bind:columnWidths={currentColumnWidths}
		class="min-w-full border-collapse text-left"
	>
		<Table.Header>
			<Table.Row>
				<Table.Column id="name" isRowHeader textValue="Name">
					<Table.ColumnHeaderCell data-testid="padded-name-header-cell">
						<div class="flex items-center justify-between gap-3">
							<span>Name</span>
							<Table.ColumnResizer
								data-testid="padded-name-resizer"
								class="inline-flex w-3 cursor-col-resize justify-center"
							/>
						</div>
					</Table.ColumnHeaderCell>
				</Table.Column>
				<Table.Column id="region" textValue="Region" defaultWidth={180} minWidth={140}>
					<Table.ColumnHeaderCell data-testid="padded-region-header-cell">
						<div class="flex items-center justify-between gap-3">
							<span>Region</span>
							<Table.ColumnResizer
								data-testid="padded-region-resizer"
								class="inline-flex w-3 cursor-col-resize justify-center"
							/>
						</div>
					</Table.ColumnHeaderCell>
				</Table.Column>
				<Table.Column id="plan" textValue="Plan">
					<Table.ColumnHeaderCell data-testid="padded-plan-header-cell">
						<div class="flex items-center justify-between gap-3">
							<span>Plan</span>
							<Table.ColumnResizer
								data-testid="padded-plan-resizer"
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

<output data-testid="padded-relative-widths"
	>{JSON.stringify(Object.fromEntries(currentColumnWidths ?? new Map()))}</output
>
