<script
	lang="ts"
	generics="T extends Record<string, unknown> & { id: string | number } = Record<string, unknown> & { id: string | number }"
>
	import { Table } from '@human-kit/svelte-components/table';
	import type { Snippet } from 'svelte';
	import type {
		TableBodyVirtualizer,
		TableRootProps,
		TableSelectionMode,
		TableSortDescriptor
	} from '@human-kit/svelte-components/table';
	import type { ColumnDefAlignment, ColumnDefValue } from './types';
	import type { StaticResolvedColumn, StaticRow } from './static-types';
	import { tableRecipe } from './recipe';

	type RootProps = Omit<TableRootProps, 'children' | 'class'>;

	type Props = RootProps & {
		items?: T[];
		columns: StaticResolvedColumn<T>[];
		emptyPlaceholder?: string;
		virtualizer?: TableBodyVirtualizer;
		class?: string;
		rowProbe?: Snippet<[T]>;
	};

	let {
		items = [],
		columns,
		emptyPlaceholder = 'No rows found',
		virtualizer,
		class: className = '',
		rowProbe,
		selectedKeys = $bindable(),
		sortDescriptor = $bindable<TableSortDescriptor | undefined>(),
		...rootProps
	}: Props = $props();

	const recipe = tableRecipe();
	const selectionMode = $derived((rootProps.selectionMode ?? 'none') as TableSelectionMode);
	const showSelection = $derived(selectionMode !== 'none');

	function cx(...values: Array<string | undefined>) {
		return values.filter(Boolean).join(' ');
	}

	function getColumnValue(item: T, column: StaticResolvedColumn<T>): ColumnDefValue {
		if (!(column.id in item)) {
			return undefined;
		}

		return item[column.id as keyof T] as ColumnDefValue;
	}

	function getSortValue(item: T, column: StaticResolvedColumn<T>) {
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

	function getSortedItems() {
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
	<div
		class="h-full max-h-[inherit] min-h-0 max-w-full overflow-auto"
		data-purchase-request-scroll-container
	>
		<Table.Root
			bind:selectedKeys
			bind:sortDescriptor
			aria-label="Data table"
			class={recipe.root()}
			{...rootProps}
		>
			{@const sortedItems = getSortedItems()}
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

					{#each columns as column (column.id)}
						<Table.Column
							id={column.id}
							textValue={column.header ?? column.id}
							rowHeader={column.rowHeader}
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
									<Table.SortTrigger
										class="min-w-0 flex-1 truncate text-left outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-500"
									>
										{column.header ?? column.id}
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

			<Table.Body items={sortedItems} {virtualizer}>
				{#snippet children(item)}
					{@const row = { id: item.id, original: item } satisfies StaticRow<T>}
					<Table.Row id={item.id} class={recipe.bodyRow()} data-purchase-request-row={item.id}>
						{#if showSelection}
							<Table.Cell class={recipe.selectionCell()}>
								{#if rowProbe}
									{@render rowProbe(item)}
								{/if}
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

						{#each columns as column, columnIndex (column.id)}
							{@const value = getColumnValue(item, column)}
							<Table.Cell class={cx(recipe.bodyCell(), alignmentClass(column.align))}>
								{#if rowProbe && !showSelection && columnIndex === 0}
									{@render rowProbe(item)}
								{/if}
								{#if column.cell}
									{@const CellComponent = column.cell}
									<CellComponent {row} {value} {column} />
								{:else}
									<div class="min-w-0 truncate">{getDefaultDisplayValue(value)}</div>
								{/if}
							</Table.Cell>
						{/each}
					</Table.Row>
				{/snippet}
				{#snippet empty()}
					<Table.EmptyState>
						<span class={recipe.emptyState()}>{emptyPlaceholder}</span>
					</Table.EmptyState>
				{/snippet}
			</Table.Body>
		</Table.Root>
	</div>
</div>
