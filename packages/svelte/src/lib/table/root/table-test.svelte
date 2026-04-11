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
		hiddenColumns?: string[];
		defaultHiddenColumns?: string[];
		disabledKeys?: Iterable<TableSelectionKey>;
		initialSelectedKeys?: Iterable<TableSelectionKey>;
		initialSortDescriptor?: TableSortDescriptor;
		showSelectionModeToggle?: boolean;
		showSingleSelectionModeToggle?: boolean;
		showSortClearButton?: boolean;
		showHiddenColumnsToggle?: boolean;
	};

	let {
		rows = defaultRows,
		ariaLabel = 'Users table',
		ariaLabelledby,
		selectionMode = $bindable<TableSelectionMode>('multiple'),
		selectionBehavior = 'toggle',
		hiddenColumns = $bindable<string[] | undefined>(),
		defaultHiddenColumns,
		disabledKeys,
		initialSelectedKeys,
		initialSortDescriptor,
		showSelectionModeToggle = false,
		showSingleSelectionModeToggle = false,
		showSortClearButton = false,
		showHiddenColumnsToggle = false
	}: TableTestProps = $props();

	let currentSelectedKeys = $state<Set<TableSelectionKey>>(
		new Set((() => initialSelectedKeys ?? [])())
	);
	let currentSortDescriptor = $state<TableSortDescriptor | undefined>(
		(() => initialSortDescriptor)()
	);

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
	{selectionMode}
	{selectionBehavior}
	bind:hiddenColumns
	{defaultHiddenColumns}
	bind:selectedKeys={currentSelectedKeys}
	bind:sortDescriptor={currentSortDescriptor}
	{disabledKeys}
	class="table-root"
>
	<Table.Header>
		<Table.Row>
			<Table.Column id="email" isRowHeader textValue="Email">
				<Table.ColumnHeaderCell>Email</Table.ColumnHeaderCell>
			</Table.Column>
			<Table.Column id="group" allowsSorting textValue="Group">
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
		onclick={() => (selectionMode = 'none')}
	>
		Selection none
	</button>
{/if}

{#if showSingleSelectionModeToggle}
	<button
		type="button"
		data-testid="set-selection-mode-single"
		onclick={() => (selectionMode = 'single')}
	>
		Selection single
	</button>
{/if}

{#if showSortClearButton}
	<button
		type="button"
		data-testid="clear-sort"
		onclick={() => (currentSortDescriptor = undefined)}
	>
		Clear sort
	</button>
{/if}

{#if showHiddenColumnsToggle}
	<button type="button" data-testid="hide-group-column" onclick={() => (hiddenColumns = ['group'])}>
		Hide group
	</button>
	<button type="button" data-testid="show-all-columns" onclick={() => (hiddenColumns = [])}>
		Show all
	</button>
{/if}

<output data-testid="selected-keys">{JSON.stringify([...currentSelectedKeys])}</output>
<output data-testid="sort-descriptor"
	>{currentSortDescriptor
		? `${currentSortDescriptor.column}:${currentSortDescriptor.direction}`
		: ''}</output
>
<output data-testid="hidden-columns">{JSON.stringify(hiddenColumns ?? [])}</output>
