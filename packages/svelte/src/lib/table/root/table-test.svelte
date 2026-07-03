<script lang="ts">
	import { Table } from '../index';
	import type {
		TableDisabledBehavior,
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
		disabledBehavior?: TableDisabledBehavior;
		disallowEmptySelection?: boolean;
		hiddenColumns?: string[];
		defaultHiddenColumns?: string[];
		disabledKeys?: Iterable<TableSelectionKey>;
		initialSelectedKeys?: Iterable<TableSelectionKey>;
		initialSortDescriptor?: TableSortDescriptor;
		onRowAction?: (id: TableSelectionKey) => void;
		onSelectionChange?: (keys: Set<TableSelectionKey>) => void;
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
		disabledBehavior = 'all',
		disallowEmptySelection = false,
		hiddenColumns = $bindable<string[] | undefined>(),
		defaultHiddenColumns,
		disabledKeys,
		initialSelectedKeys,
		initialSortDescriptor,
		onRowAction,
		onSelectionChange,
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
	let rowActionLog = $state<string[]>([]);
	let eventLog = $state<string[]>([]);

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

	function handleSelectionChange(keys: Set<TableSelectionKey>) {
		currentSelectedKeys = new Set(keys);
		eventLog = [...eventLog, `selection:${JSON.stringify([...keys])}`];
		onSelectionChange?.(new Set(keys));
	}

	function handleRowAction(id: TableSelectionKey) {
		rowActionLog = [...rowActionLog, String(id)];
		eventLog = [...eventLog, `action:${String(id)}`];
		onRowAction?.(id);
	}
</script>

<Table.Root
	aria-label={ariaLabel}
	aria-labelledby={ariaLabelledby}
	{selectionMode}
	{selectionBehavior}
	{disabledBehavior}
	{disallowEmptySelection}
	bind:hiddenColumns
	{defaultHiddenColumns}
	bind:selectedKeys={currentSelectedKeys}
	bind:sortDescriptor={currentSortDescriptor}
	{disabledKeys}
	onRowAction={handleRowAction}
	onSelectionChange={handleSelectionChange}
	class="table-root"
>
	<Table.Header>
		<Table.Row>
			<Table.Column id="email" rowHeader textValue="Email">
				<Table.ColumnHeaderCell>Email</Table.ColumnHeaderCell>
			</Table.Column>
			<Table.Column id="group" textValue="Group">
				<Table.ColumnHeaderCell>
					<Table.SortTrigger
						data-testid="group-sort-trigger"
						data-sort-direction-state={currentSortDescriptor?.direction ?? 'none'}
					>
						{#snippet children({ sortDirection })}
							Group
							<span data-testid="group-sort-state">{sortDirection ?? 'none'}</span>
						{/snippet}
					</Table.SortTrigger>
				</Table.ColumnHeaderCell>
			</Table.Column>
		</Table.Row>
	</Table.Header>

	<Table.Body>
		{#each renderedRows as row (row.id)}
			<Table.Row
				id={row.id}
				disabled={disabledKeys ? Array.from(disabledKeys).includes(row.id) : false}
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
<output data-testid="row-action-log">{JSON.stringify(rowActionLog)}</output>
<output data-testid="event-log">{JSON.stringify(eventLog)}</output>
<output data-testid="sort-descriptor"
	>{currentSortDescriptor
		? `${currentSortDescriptor.column}:${currentSortDescriptor.direction}`
		: ''}</output
>
<output data-testid="hidden-columns">{JSON.stringify(hiddenColumns ?? [])}</output>
