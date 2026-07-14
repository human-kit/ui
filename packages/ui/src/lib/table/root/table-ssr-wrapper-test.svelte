<script lang="ts">
	import TableSsrWrapperColumn from './table-ssr-wrapper-column.svelte';
	import {
		setTableSsrWrapperRegistry,
		type TableSsrWrapperColumn as RegisteredColumn
	} from './table-ssr-wrapper-context';

	type DemoRow = {
		id: string;
		email: string;
		group: string;
	};

	const rows: DemoRow[] = [{ id: 'danilo', email: 'danilo@example.com', group: 'Developer' }];
	let registeredColumns = $state<Array<{ token: string; column: RegisteredColumn }>>([]);

	setTableSsrWrapperRegistry({
		upsertColumn(token, column) {
			const index = registeredColumns.findIndex((entry) => entry.token === token);

			if (index === -1) {
				registeredColumns = [...registeredColumns, { token, column }];
				return;
			}

			registeredColumns = registeredColumns.map((entry) =>
				entry.token === token ? { token, column } : entry
			);
		},
		removeColumn(token) {
			registeredColumns = registeredColumns.filter((entry) => entry.token !== token);
		}
	});

	function getResolvedColumns() {
		return registeredColumns.map((entry) => entry.column);
	}
</script>

<TableSsrWrapperColumn id="email" header="Email" />
<TableSsrWrapperColumn id="group" header="Group" />

<div data-testid="ssr-column-count">{(() => getResolvedColumns().length)()}</div>

<div data-testid="ssr-headers">
	{#each (() => getResolvedColumns())() as column (column.id)}
		<span>{column.header}</span>
	{/each}
</div>

<div data-testid="ssr-body-cells">
	{#each rows as row (row.id)}
		{#each (() => getResolvedColumns())() as column (column.id)}
			<span>{row[column.id as keyof DemoRow]}</span>
		{/each}
	{/each}
</div>
