<script lang="ts">
	import { Table } from '../index';

	type DemoRow = {
		id: string;
		a: string;
		b: string;
		c: string;
		d: string;
	};

	const rows: DemoRow[] = [
		{ id: 'r1', a: 'a1', b: 'b1', c: 'c1', d: 'd1' },
		{ id: 'r2', a: 'a2', b: 'b2', c: 'c2', d: 'd2' }
	];
</script>

<div style="width: 240px; overflow: auto;">
	<Table.Root aria-label="Pinned columns table">
		<Table.Header>
			<Table.Row>
				<Table.Column id="a" width={60} pin="left">
					<Table.ColumnHeaderCell data-testid="header-a">A</Table.ColumnHeaderCell>
				</Table.Column>
				<Table.Column id="b" width={80} pin="left">
					<Table.ColumnHeaderCell data-testid="header-b">B</Table.ColumnHeaderCell>
				</Table.Column>
				<Table.Column id="c" width={400}>
					<Table.ColumnHeaderCell data-testid="header-c">C</Table.ColumnHeaderCell>
				</Table.Column>
				<Table.Column id="d" width={34} pin="right">
					<Table.ColumnHeaderCell data-testid="header-d">D</Table.ColumnHeaderCell>
				</Table.Column>
			</Table.Row>
		</Table.Header>

		<Table.Body>
			{#each rows as row (row.id)}
				<Table.Row id={row.id}>
					<Table.Cell data-testid={`cell-a-${row.id}`}>{row.a}</Table.Cell>
					<Table.Cell data-testid={`cell-b-${row.id}`}>{row.b}</Table.Cell>
					<Table.Cell data-testid={`cell-c-${row.id}`}>{row.c}</Table.Cell>
					<Table.Cell data-testid={`cell-d-${row.id}`}>{row.d}</Table.Cell>
				</Table.Row>
			{/each}
		</Table.Body>
	</Table.Root>
</div>
