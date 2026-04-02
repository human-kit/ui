<script lang="ts">
	import { Table } from '../index';
	import type {
		TableSelectionBehavior,
		TableSelectionKey,
		TableSelectionMode,
		TableSortDescriptor
	} from './context';

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

	type TableTestProps = {
		rows?: DemoRow[];
		ariaLabel?: string;
		ariaLabelledby?: string;
		selectionMode?: TableSelectionMode;
		selectionBehavior?: TableSelectionBehavior;
		disabledKeys?: Iterable<TableSelectionKey>;
		initialSelectedKeys?: Iterable<TableSelectionKey>;
		initialSortDescriptor?: TableSortDescriptor;
		showSelectionModeToggle?: boolean;
		showSingleSelectionModeToggle?: boolean;
	};

	let {
		rows = defaultRows,
		ariaLabel = 'Users table',
		ariaLabelledby,
		selectionMode = 'multiple',
		selectionBehavior = 'toggle',
		disabledKeys,
		initialSelectedKeys,
		initialSortDescriptor,
		showSelectionModeToggle = false,
		showSingleSelectionModeToggle = false
	}: TableTestProps = $props();

	let currentSelectionMode = $state((() => selectionMode)());
	let currentSelectedKeys = $state<Set<TableSelectionKey>>(
		new Set((() => initialSelectedKeys ?? [])())
	);
	let currentSortDescriptor = $state<TableSortDescriptor | undefined>(
		(() => initialSortDescriptor)()
	);

	$effect(() => {
		currentSelectionMode = selectionMode;
	});

	const renderedRows = $derived.by(() => {
		const nextRows = [...rows];
		const descriptor = currentSortDescriptor;
		if (!descriptor) return nextRows;
		const direction = descriptor.direction === 'ascending' ? 1 : -1;
		return nextRows.sort((a, b) => {
			const left = a[descriptor.column as keyof DemoRow];
			const right = b[descriptor.column as keyof DemoRow];
			return String(left).localeCompare(String(right)) * direction;
		});
	});
</script>

<Table.Root
	aria-label={ariaLabel}
	aria-labelledby={ariaLabelledby}
	selectionMode={currentSelectionMode}
	{selectionBehavior}
	bind:selectedKeys={currentSelectedKeys}
	bind:sortDescriptor={currentSortDescriptor}
	{disabledKeys}
	class="table-root"
>
	<Table.Header>
		<Table.Row>
			<Table.Column id="email" isRowHeader>
				<Table.ColumnHeaderCell>Email</Table.ColumnHeaderCell>
			</Table.Column>
			<Table.Column id="group" allowsSorting>
				<Table.ColumnHeaderCell>Group</Table.ColumnHeaderCell>
			</Table.Column>
		</Table.Row>
	</Table.Header>

	<Table.Body>
		{#each renderedRows as row (row.id)}
			<Table.Row
				id={row.id}
				isDisabled={disabledKeys ? Array.from(disabledKeys).includes(row.id) : false}
			>
				<Table.Cell>{row.email}</Table.Cell>
				<Table.Cell>{row.group}</Table.Cell>
			</Table.Row>
		{/each}
		<Table.EmptyState>No users found.</Table.EmptyState>
	</Table.Body>

	<Table.Footer>
		<Table.Row>
			<Table.Cell>Total</Table.Cell>
			<Table.Cell>{renderedRows.length} users</Table.Cell>
		</Table.Row>
	</Table.Footer>
</Table.Root>

{#if showSelectionModeToggle}
	<button
		type="button"
		data-testid="set-selection-mode-none"
		onclick={() => (currentSelectionMode = 'none')}
	>
		Selection none
	</button>
{/if}

{#if showSingleSelectionModeToggle}
	<button
		type="button"
		data-testid="set-selection-mode-single"
		onclick={() => (currentSelectionMode = 'single')}
	>
		Selection single
	</button>
{/if}

<output data-testid="selected-keys">{JSON.stringify([...currentSelectedKeys])}</output>
<output data-testid="sort-descriptor"
	>{currentSortDescriptor
		? `${currentSortDescriptor.column}:${currentSortDescriptor.direction}`
		: ''}</output
>
