<script lang="ts">
	import { Table } from '../index';

	type DemoRow = { id: string; email: string; group: string; role: string };
	type ColumnId = 'email' | 'group' | 'role';

	const rows: DemoRow[] = [
		{ id: 'danilo', email: 'danilo@example.com', group: 'Developer', role: 'Owner' },
		{ id: 'zahra', email: 'zahra@example.com', group: 'Admin', role: 'Viewer' }
	];

	let withGroup = $state(true);
	const columns = $derived<ColumnId[]>(withGroup ? ['email', 'group', 'role'] : ['email', 'role']);
</script>

<Table.Root aria-label="Drop column table">
	<Table.Header>
		<Table.Row>
			{#each columns as column (column)}
				<Table.Column id={column} rowHeader={column === 'email'} textValue={column}>
					<Table.ColumnHeaderCell data-testid={`${column}-header`}>{column}</Table.ColumnHeaderCell>
				</Table.Column>
			{/each}
		</Table.Row>
	</Table.Header>

	<Table.Body>
		{#each rows as row (row.id)}
			<Table.Row id={row.id}>
				{#each columns as column (column)}
					<Table.Cell data-testid={`${column}-cell-${row.id}`}>{row[column]}</Table.Cell>
				{/each}
			</Table.Row>
		{/each}
	</Table.Body>
</Table.Root>

<button type="button" data-testid="drop-group" onclick={() => (withGroup = false)}
	>Drop group</button
>
