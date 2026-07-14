<script lang="ts">
	import { Table } from '../index';
	import type { TableColumnWidth, TableSortDescriptor } from '../root/context.svelte';

	let currentColumnWidths = $state<Map<string, TableColumnWidth>>(
		new Map([
			['email', 200],
			['group', 160]
		])
	);
	let currentSortDescriptor = $state<TableSortDescriptor | undefined>(undefined);
	let resizeStartColumnId = $state('');
	let resizeEndWidths = $state<Record<string, TableColumnWidth>>({});
</script>

<Table.Root
	aria-label="Resizable users table"
	bind:columnWidths={currentColumnWidths}
	bind:sortDescriptor={currentSortDescriptor}
	onColumnResizeStart={(columnId) => {
		resizeStartColumnId = columnId;
	}}
	onColumnResizeEnd={(widths) => {
		resizeEndWidths = Object.fromEntries(widths);
	}}
>
	<Table.Header>
		<Table.Row>
			<Table.Column id="email" rowHeader textValue="Email" minWidth={120}>
				<Table.ColumnHeaderCell data-testid="email-header-cell">
					<div class="flex items-center justify-between gap-3">
						<span>Email</span>
						<Table.ColumnResizer
							data-testid="email-resizer"
							class="inline-flex w-3 cursor-col-resize justify-center"
						/>
					</div>
				</Table.ColumnHeaderCell>
			</Table.Column>
			<Table.Column id="group" textValue="Group" minWidth={100} maxWidth={260}>
				<Table.ColumnHeaderCell data-testid="group-header-cell">
					<div class="flex items-center justify-between gap-3">
						<Table.SortTrigger data-testid="group-sort-trigger">Group</Table.SortTrigger>
						<Table.ColumnResizer
							data-testid="group-resizer"
							class="inline-flex w-3 cursor-col-resize justify-center"
						/>
					</div>
				</Table.ColumnHeaderCell>
			</Table.Column>
		</Table.Row>
	</Table.Header>

	<Table.Body>
		<Table.Row id="danilo">
			<Table.Cell>danilo.fernandez+workspace-owner@example.com</Table.Cell>
			<Table.Cell>Developer</Table.Cell>
		</Table.Row>
		<Table.Row id="zahra">
			<Table.Cell>zahra@example.com</Table.Cell>
			<Table.Cell>Admin</Table.Cell>
		</Table.Row>
	</Table.Body>
</Table.Root>

<output data-testid="column-widths"
	>{JSON.stringify(Object.fromEntries(currentColumnWidths))}</output
>
<output data-testid="sort-descriptor"
	>{currentSortDescriptor
		? `${currentSortDescriptor.column}:${currentSortDescriptor.direction}`
		: ''}</output
>
<output data-testid="resize-start-column">{resizeStartColumnId}</output>
<output data-testid="resize-end-widths">{JSON.stringify(resizeEndWidths)}</output>
