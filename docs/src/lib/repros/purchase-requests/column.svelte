<script
	lang="ts"
	generics="T extends Record<string, unknown> & { id: string | number } = Record<string, unknown> & { id: string | number }"
>
	import { Table } from '@human-kit/svelte-components/table';
	import { untrack } from 'svelte';

	import { useTableColumnRegistry } from './context';
	import { tableRecipe } from './recipe';
	import type { ColumnDefAlignment, ResolvedColumn, WrapperTableColumnProps } from './types';

	let {
		id,
		header,
		align = 'left',
		isRowHeader = false,
		allowsSorting = false,
		resizable = false,
		width,
		defaultWidth,
		minWidth,
		maxWidth,
		sort,
		cell
	}: WrapperTableColumnProps<T> = $props();

	const registry = useTableColumnRegistry();

	function cx(...values: Array<string | undefined>) {
		return values.filter(Boolean).join(' ');
	}

	function getToken() {
		return `table-column-${id}`;
	}

	function alignmentClass(nextAlign: ColumnDefAlignment = 'left') {
		if (nextAlign === 'center') return 'text-center';
		if (nextAlign === 'right') return 'text-right';
		return 'text-left';
	}

	const recipe = tableRecipe();

	function getColumn(): ResolvedColumn<T> {
		return {
			id,
			header,
			align,
			isRowHeader,
			allowsSorting,
			resizable,
			width,
			defaultWidth,
			minWidth,
			maxWidth,
			sort,
			cell
		};
	}

	$effect(() => {
		const token = getToken();

		untrack(() => {
			registry.upsertColumn(token, getColumn());
		});

		return () => {
			registry.removeColumn(token);
		};
	});
</script>

<Table.Column
	{id}
	textValue={header ?? id}
	{isRowHeader}
	{allowsSorting}
	{width}
	{defaultWidth}
	{minWidth}
	{maxWidth}
>
	<Table.ColumnHeaderCell
		class={cx(recipe.headerCell(), alignmentClass(align))}
		data-sortable={allowsSorting ? 'true' : undefined}
	>
		<div class="flex h-full min-w-0 items-center gap-2">
			<div class="min-w-0 flex-1 truncate">{header ?? id}</div>
			{#if resizable}
				<Table.ColumnResizer class={recipe.resizer()}>
					<span class="block h-5 w-0.5 rounded-full bg-current opacity-80"></span>
				</Table.ColumnResizer>
			{/if}
		</div>
	</Table.ColumnHeaderCell>
</Table.Column>
