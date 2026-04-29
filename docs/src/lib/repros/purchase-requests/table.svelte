<script
	lang="ts"
	generics="T extends Record<string, unknown> & { id: string | number } = Record<string, unknown> & { id: string | number }"
>
	import { Table } from '@human-kit/svelte-components/table';
	import type { Snippet } from 'svelte';
	import type {
		TableRootProps,
		TableSelectionMode,
		TableSortDescriptor
	} from '@human-kit/svelte-components/table';
	import TableColumnBridge from './column.svelte';
	import type {
		CellRenderContext,
		ColumnDefAlignment,
		ColumnDefValue,
		ResolvedColumn,
		TableColumnComponent,
		TableColumnsContext
	} from './types';
	import { setTableColumnRegistry } from './context';
	import { tableRecipe } from './recipe';

	type RootProps = Omit<TableRootProps, 'children' | 'class'>;

	type Props = RootProps & {
		items?: T[];
		emptyPlaceholder?: string;
		class?: string;
		columns?: Snippet<[TableColumnsContext<T>]>;
		children?: Snippet;
	};

	let {
		items = [],
		emptyPlaceholder = 'No rows found',
		class: className = '',
		selectedKeys = $bindable(),
		sortDescriptor = $bindable<TableSortDescriptor | undefined>(),
		columns,
		children,
		...rootProps
	}: Props = $props();

	let registeredColumns = $state<Array<{ token: string; column: ResolvedColumn<T> }>>([]);

	function cx(...values: Array<string | undefined>) {
		return values.filter(Boolean).join(' ');
	}

	setTableColumnRegistry({
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

	const recipe = tableRecipe();
	const Column = TableColumnBridge as TableColumnComponent<T>;
	const selectionMode = $derived((rootProps.selectionMode ?? 'none') as TableSelectionMode);
	const showSelection = $derived(selectionMode !== 'none');

	function getResolvedColumns(): ResolvedColumn<T>[] {
		return registeredColumns.map((entry) => entry.column);
	}

	function getColumnValue(item: T, column: ResolvedColumn<T>): ColumnDefValue {
		if (!(column.id in item)) {
			return undefined;
		}

		return item[column.id as keyof T] as ColumnDefValue;
	}

	function getSortValue(item: T, column: ResolvedColumn<T>) {
		if (column.sort) {
			return column.sort(item);
		}

		return getColumnValue(item, column);
	}

	function compareValues(
		a: string | number | boolean | Date | null | undefined,
		b: string | number | boolean | Date | null | undefined
	) {
		if (a == null && b == null) return 0;
		if (a == null) return 1;
		if (b == null) return -1;

		if (a instanceof Date && b instanceof Date) {
			return a.getTime() - b.getTime();
		}

		if (typeof a === 'number' && typeof b === 'number') {
			return a - b;
		}

		if (typeof a === 'boolean' && typeof b === 'boolean') {
			return Number(a) - Number(b);
		}

		return String(a).localeCompare(String(b), undefined, { numeric: true, sensitivity: 'base' });
	}

	function getSortedItems(columns: ResolvedColumn<T>[]) {
		const descriptor = sortDescriptor;
		if (!descriptor) return items;

		const column = columns.find((entry) => entry.id === descriptor.column);
		if (!column) return items;

		const direction = descriptor.direction === 'ascending' ? 1 : -1;
		return [...items].sort(
			(a, b) => compareValues(getSortValue(a, column), getSortValue(b, column)) * direction
		);
	}

	function getDefaultDisplayValue(value: ColumnDefValue) {
		if (value == null || value === '') return '-';
		if (value instanceof Date) return value.toLocaleDateString();
		if (typeof value === 'boolean') return value ? 'Yes' : 'No';
		return String(value);
	}

	function alignmentClass(align: ColumnDefAlignment = 'left') {
		if (align === 'center') return 'text-center';
		if (align === 'right') return 'text-right';
		return 'text-left';
	}
</script>

<div class={cx(recipe.container(), className)}>
	{#if columns}
		{@render columns({ Column })}
	{:else if children}
		{@render children()}
	{/if}

	<div class="h-full max-h-[inherit] min-h-0 max-w-full overflow-auto">
		<Table.Root
			bind:selectedKeys
			bind:sortDescriptor
			aria-label="Data table"
			class={recipe.root()}
			{...rootProps}
		>
			{@const resolvedColumns = getResolvedColumns()}
			{@const sortedItems = getSortedItems(resolvedColumns)}

			<Table.Header>
				<Table.Row class={recipe.headerRow()}>
					{#if showSelection}
						<Table.Column id="selection" textValue="Selection" width={44}>
							<Table.ColumnHeaderCell
								class={`${recipe.headerCell()} flex items-center justify-center p-0! text-center`}
							>
								<Table.Checkbox class={recipe.checkbox()}>
									<Table.CheckboxIndicator class={recipe.checkboxIndicator()}>
										<svg aria-hidden="true" viewBox="0 0 16 16" class="size-3.5">
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
					{/if}

					{#each resolvedColumns as column (column.id)}
						<Table.Column
							id={column.id}
							textValue={column.header ?? column.id}
							isRowHeader={column.isRowHeader}
							width={column.width}
							defaultWidth={column.defaultWidth}
							minWidth={column.minWidth}
							maxWidth={column.maxWidth}
						>
							<Table.ColumnHeaderCell
								class={cx(recipe.headerCell(), alignmentClass(column.align))}
								data-sortable="true"
							>
								<div class="flex h-full min-w-0 items-center gap-2">
									<Table.SortTrigger>
										<button
											type="button"
											class="min-w-0 flex-1 truncate text-left outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-500"
										>
											{column.header ?? column.id}
										</button>
									</Table.SortTrigger>
									{#if column.resizable}
										<Table.ColumnResizer class={recipe.resizer()}>
											<span class="block h-5 w-0.5 rounded-full bg-current opacity-80"></span>
										</Table.ColumnResizer>
									{/if}
								</div>
							</Table.ColumnHeaderCell>
						</Table.Column>
					{/each}
				</Table.Row>
			</Table.Header>

			<Table.Body>
				{#each sortedItems as item (item.id)}
					<Table.Row id={item.id} class={recipe.bodyRow()}>
						{#if showSelection}
							<Table.Cell class={recipe.selectionCell()}>
								<Table.Checkbox class={recipe.checkbox()}>
									<Table.CheckboxIndicator class={recipe.checkboxIndicator()}>
										<svg aria-hidden="true" viewBox="0 0 16 16" class="size-3.5">
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
						{/if}

						{#each resolvedColumns as column (column.id)}
							{@const value = getColumnValue(item, column)}
							{@const cellContext = { item, value, column } satisfies CellRenderContext<T>}
							<Table.Cell class={cx(recipe.bodyCell(), alignmentClass(column.align))}>
								<div class="min-w-0 truncate">
									{#if column.cell}
										{@render column.cell(cellContext)}
									{:else}
										{getDefaultDisplayValue(value)}
									{/if}
								</div>
							</Table.Cell>
						{/each}
					</Table.Row>
				{/each}

				<Table.EmptyState>
					<span class={recipe.emptyState()}>{emptyPlaceholder}</span>
				</Table.EmptyState>
			</Table.Body>
		</Table.Root>
	</div>
</div>
