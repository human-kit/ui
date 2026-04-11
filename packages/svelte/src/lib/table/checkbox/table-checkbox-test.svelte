<script lang="ts">
	import { Table } from '../index';
	import type {
		TableSelectionBehavior,
		TableSelectionKey,
		TableSelectionMode
	} from '../root/context';

	type DemoRow = {
		id: string;
		email: string;
		group: string;
	};

	const defaultRows: DemoRow[] = [
		{ id: 'danilo', email: 'danilo@example.com', group: 'Developer' },
		{ id: 'zahra', email: 'zahra@example.com', group: 'Admin' },
		{ id: 'jasper', email: 'jasper@example.com', group: 'Developer' }
	];

	const checkboxStyle =
		'display:inline-flex;height:20px;width:20px;align-items:center;justify-content:center;border:1px solid currentColor;border-radius:4px;';
	const indicatorStyle =
		'display:inline-flex;height:14px;width:14px;align-items:center;justify-content:center;';

	type CheckboxTestProps = {
		rows?: DemoRow[];
		selectionMode?: TableSelectionMode;
		selectionBehavior?: TableSelectionBehavior;
		disabledKeys?: Iterable<TableSelectionKey>;
		initialSelectedKeys?: Iterable<TableSelectionKey>;
	};

	let {
		rows = defaultRows,
		selectionMode = 'multiple',
		selectionBehavior = 'toggle',
		disabledKeys,
		initialSelectedKeys
	}: CheckboxTestProps = $props();

	let currentSelectedKeys = $state<Set<TableSelectionKey>>(
		new Set((() => initialSelectedKeys ?? [])())
	);
</script>

<Table.Root
	aria-label="Users table"
	{selectionMode}
	{selectionBehavior}
	bind:selectedKeys={currentSelectedKeys}
	{disabledKeys}
>
	<Table.Header>
		<Table.Row>
			<Table.Column id="selection" textValue="Selection">
				<Table.ColumnHeaderCell data-testid="selection-header-cell">
					<Table.Checkbox style={checkboxStyle} data-testid="header-checkbox">
						<Table.CheckboxIndicator style={indicatorStyle}>
							<svg aria-hidden="true" viewBox="0 0 16 16" class="h-3.5 w-3.5">
								<path
									d="M3.75 8.5 6.75 11.5 12.25 5.5"
									fill="none"
									stroke="currentColor"
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
								/>
							</svg>
						</Table.CheckboxIndicator>
					</Table.Checkbox>
				</Table.ColumnHeaderCell>
			</Table.Column>
			<Table.Column id="email" isRowHeader textValue="Email">
				<Table.ColumnHeaderCell>Email</Table.ColumnHeaderCell>
			</Table.Column>
			<Table.Column id="group" textValue="Group">
				<Table.ColumnHeaderCell>Group</Table.ColumnHeaderCell>
			</Table.Column>
		</Table.Row>
	</Table.Header>

	<Table.Body>
		{#each rows as row (row.id)}
			<Table.Row
				id={row.id}
				isDisabled={disabledKeys ? Array.from(disabledKeys).includes(row.id) : false}
			>
				<Table.Cell data-testid={`selection-cell-${row.id}`}>
					<Table.Checkbox style={checkboxStyle} data-testid={`row-checkbox-${row.id}`}>
						<Table.CheckboxIndicator style={indicatorStyle}>
							<svg aria-hidden="true" viewBox="0 0 16 16" class="h-3.5 w-3.5">
								<path
									d="M3.75 8.5 6.75 11.5 12.25 5.5"
									fill="none"
									stroke="currentColor"
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
								/>
							</svg>
						</Table.CheckboxIndicator>
					</Table.Checkbox>
				</Table.Cell>
				<Table.Cell data-testid={`email-cell-${row.id}`}>{row.email}</Table.Cell>
				<Table.Cell data-testid={`group-cell-${row.id}`}>{row.group}</Table.Cell>
			</Table.Row>
		{/each}
		<Table.EmptyState>No users found.</Table.EmptyState>
	</Table.Body>

	<Table.Footer>
		<Table.Row>
			<Table.Cell />
			<Table.Cell>Total</Table.Cell>
			<Table.Cell>{rows.length} users</Table.Cell>
		</Table.Row>
	</Table.Footer>
</Table.Root>

<output data-testid="selected-keys">{JSON.stringify([...currentSelectedKeys])}</output>
