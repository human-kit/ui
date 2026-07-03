<script lang="ts">
	import { Table } from '../index';

	type DemoRow = {
		id: string;
		email: string;
		group: string;
	};

	type ColumnDefinition = {
		id: 'email' | 'group';
		label: string;
		isRowHeader?: boolean;
	};

	const rows: DemoRow[] = [
		{ id: 'danilo', email: 'danilo@example.com', group: 'Developer' },
		{ id: 'zahra', email: 'zahra@example.com', group: 'Admin' }
	];

	const baseColumns: ColumnDefinition[] = [
		{ id: 'email', label: 'Email', isRowHeader: true },
		{ id: 'group', label: 'Group' }
	];

	let reversed = $state(false);
	const orderedColumns = $derived.by(() =>
		reversed ? [baseColumns[1], baseColumns[0]] : baseColumns
	);

	function getCellContent(row: DemoRow, columnId: ColumnDefinition['id']) {
		return row[columnId];
	}
</script>

<Table.Root aria-label="Reorder table">
	<Table.Header>
		<Table.Row>
			{#each orderedColumns as column (column.id)}
				<Table.Column id={column.id} rowHeader={column.isRowHeader} textValue={column.label}>
					<Table.ColumnHeaderCell data-testid={`${column.id}-header`}>
						{column.label}
					</Table.ColumnHeaderCell>
				</Table.Column>
			{/each}
		</Table.Row>
	</Table.Header>

	<Table.Body>
		{#each rows as row (row.id)}
			<Table.Row id={row.id}>
				{#each orderedColumns as column (column.id)}
					<Table.Cell data-testid={`${column.id}-cell-${row.id}`}>
						{getCellContent(row, column.id)}
					</Table.Cell>
				{/each}
			</Table.Row>
		{/each}
	</Table.Body>
</Table.Root>

<button type="button" data-testid="toggle-order" onclick={() => (reversed = !reversed)}>
	Toggle order
</button>
