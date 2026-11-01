<script lang="ts">
	import { getTableSsrMinWidth, Table, type TableColumnWidth } from '../index';

	type Column = {
		id: string;
		label: string;
		width?: TableColumnWidth;
		defaultWidth?: TableColumnWidth;
		minWidth?: number;
		resizable?: boolean;
	};

	// A list wider than its box: px columns, one that takes a share in `%`, and the last one
	// flexible, with no width of its own.
	const columns: Column[] = [
		{ id: 'name', label: 'Name', defaultWidth: 160, minWidth: 120, resizable: true },
		{ id: 'email', label: 'Email', defaultWidth: '30%', minWidth: 180, resizable: true },
		{ id: 'role', label: 'Role', defaultWidth: 180, minWidth: 140, resizable: true },
		{ id: 'created', label: 'Created', minWidth: 200 },
		{ id: 'actions', label: 'Actions', width: 32 }
	];
</script>

<div data-testid="box" style="width: 640px; overflow: auto;">
	<Table.Root aria-label="Widths" ssrMinTableWidth={getTableSsrMinWidth(columns)}>
		<Table.Header>
			<Table.Row>
				{#each columns as column (column.id)}
					<Table.Column
						id={column.id}
						textValue={column.label}
						width={column.width}
						defaultWidth={column.defaultWidth}
						minWidth={column.minWidth}
					>
						<Table.ColumnHeaderCell data-column={column.id}>
							{column.label}
							{#if column.resizable}<Table.ColumnResizer />{/if}
						</Table.ColumnHeaderCell>
					</Table.Column>
				{/each}
			</Table.Row>
		</Table.Header>
		<Table.Body>
			<Table.Row id="row-1">
				{#each columns as column (column.id)}
					<Table.Cell>{column.label} value</Table.Cell>
				{/each}
			</Table.Row>
		</Table.Body>
	</Table.Root>
</div>
