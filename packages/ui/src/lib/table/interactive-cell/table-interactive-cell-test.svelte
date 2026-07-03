<script lang="ts">
	import { Table } from '../index';
	import type { TableSelectionKey } from '../root/context';

	type DemoRow = {
		id: string;
		email: string;
		group: string;
	};

	const rows: DemoRow[] = [
		{ id: 'danilo', email: 'danilo@example.com', group: 'Developer' },
		{ id: 'zahra', email: 'zahra@example.com', group: 'Admin' }
	];

	let rowActionLog = $state<string[]>([]);

	function handleRowAction(id: TableSelectionKey) {
		rowActionLog = [...rowActionLog, String(id)];
	}
</script>

<Table.Root aria-label="Interactive users table" onRowAction={handleRowAction}>
	<Table.Header>
		<Table.Row>
			<Table.Column id="email" rowHeader textValue="Email">
				<Table.ColumnHeaderCell>Email</Table.ColumnHeaderCell>
			</Table.Column>
			<Table.Column id="group" textValue="Group">
				<Table.ColumnHeaderCell>Group</Table.ColumnHeaderCell>
			</Table.Column>
		</Table.Row>
	</Table.Header>

	<Table.Body>
		{#each rows as row (row.id)}
			<Table.Row id={row.id}>
				<Table.Cell>{row.email}</Table.Cell>
				<Table.InteractiveCell data-testid={`interactive-cell-${row.id}`}>
					<input
						data-testid={`group-input-${row.id}`}
						aria-label={`Group ${row.id}`}
						value={row.group}
					/>
					<button type="button" data-testid={`group-button-${row.id}`}>Open group menu</button>
				</Table.InteractiveCell>
			</Table.Row>
		{/each}
	</Table.Body>
</Table.Root>

<output data-testid="row-action-log">{JSON.stringify(rowActionLog)}</output>
