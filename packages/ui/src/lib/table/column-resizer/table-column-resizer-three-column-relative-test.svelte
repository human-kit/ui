<script lang="ts">
	import { Table } from '../index';
	import type { TableColumnWidth } from '../root/context';

	let currentColumnWidths = $state<Map<string, TableColumnWidth> | undefined>(undefined);
</script>

<div data-testid="three-column-relative-container" style="width: 640px; overflow-x: auto;">
	<Table.Root
		aria-label="Three column relative resize table"
		bind:columnWidths={currentColumnWidths}
		class="min-w-full border-collapse text-left"
	>
		<Table.Header>
			<Table.Row>
				<Table.Column id="name" rowHeader textValue="Name">
					<Table.ColumnHeaderCell data-testid="three-column-name-header-cell">
						<div class="flex items-center justify-between gap-3">
							<span>Name</span>
							<Table.ColumnResizer
								data-testid="three-column-name-resizer"
								class="inline-flex w-3 cursor-col-resize justify-center"
							/>
						</div>
					</Table.ColumnHeaderCell>
				</Table.Column>
				<Table.Column id="region" textValue="Region" defaultWidth={180} minWidth={140}>
					<Table.ColumnHeaderCell data-testid="three-column-region-header-cell">
						<div class="flex items-center justify-between gap-3">
							<span>Region</span>
							<Table.ColumnResizer
								data-testid="three-column-region-resizer"
								class="inline-flex w-3 cursor-col-resize justify-center"
							/>
						</div>
					</Table.ColumnHeaderCell>
				</Table.Column>
				<Table.Column id="plan" textValue="Plan">
					<Table.ColumnHeaderCell data-testid="three-column-plan-header-cell">
						<div class="flex items-center justify-between gap-3">
							<span>Plan</span>
							<Table.ColumnResizer
								data-testid="three-column-plan-resizer"
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

<output data-testid="three-column-relative-widths"
	>{JSON.stringify(Object.fromEntries(currentColumnWidths ?? new Map()))}</output
>
