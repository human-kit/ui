<script lang="ts">
	import { channelName } from '../internal/channel.js';
	import { useChartContext, type ChartPoint } from '../root/context.js';
	import type { ChartDataTableProps } from '../types.js';

	let {
		visibility = 'screen-reader',
		caption,
		rowHeader,
		class: className = '',
		...restProps
	}: ChartDataTableProps = $props();

	const ctx = useChartContext('Chart.DataTable');

	// The rows follow the axis of the categories: x, or y for a mark with horizontal bars.
	const horizontal = $derived(ctx.marks[0]?.horizontal?.() ?? false);

	type Cell = [text: string, point?: ChartPoint];
	type Row = { header?: string; cells: Cell[]; point?: ChartPoint };

	const formatX = (p: ChartPoint) => ctx.formatX(ctx.toX(p.x));
	const formatY = (p: ChartPoint) => ctx.formatY(ctx.toY(p.y));

	const table = $derived.by(() => {
		const xName = ctx.xLabel ?? channelName(ctx.x, 'x');
		const yName = ctx.yLabel ?? channelName(ctx.y, 'y');

		// A mark of single points, as the dot mark, makes one row per point, in the order of the
		// keyboard. No column identifies a row, thus the rows have no header cell.
		if (ctx.marks[0]?.list) {
			const points = ctx.entries.flatMap((entry) => entry.points);
			const series = points.some((p) => p.series);
			return {
				head: [...(series ? [rowHeader ?? channelName(ctx.series, 'series')] : []), xName, yName],
				rows: points.map((p): Row => ({
					point: p,
					cells: [...(series ? [[p.series] as Cell] : []), [formatX(p)], [formatY(p)]]
				}))
			};
		}

		// A row per key value and a column per series. Two marks with one series name make one column.
		const keyOf = (p: ChartPoint) => (horizontal ? ctx.toY(p.y) : ctx.toX(p.x));
		// eslint-disable-next-line svelte/prefer-svelte-reactivity -- a scratch map for one pass.
		const columns = new Map<string, Map<number, ChartPoint>>();
		// eslint-disable-next-line svelte/prefer-svelte-reactivity -- a scratch set for one pass.
		const keys = new Set<number>();
		for (const mark of ctx.marks) {
			for (const s of mark.read()) {
				if (columns.has(s.name)) continue;
				const cells = new Map(s.points.map((p) => [keyOf(p), p]));
				columns.set(s.name, cells);
				for (const key of cells.keys()) keys.add(key);
			}
		}
		// One series without a name has the name of the value channel as its column header.
		const valueName = horizontal ? xName : yName;
		// A mark of parts of a whole has one series, and a column with the share of each part. Its
		// row holds the selection, as a row of one point does.
		const share = ctx.marks[0]?.share;
		return {
			head: [
				rowHeader ?? (horizontal ? yName : xName),
				...[...columns.keys()].map((name) => name || valueName),
				...(share ? ['%'] : [])
			],
			rows: [...keys]
				.sort((a, b) => a - b)
				.map((key): Row => {
					const points = [...columns.values()].map((cells) => cells.get(key));
					const cells = points.map((p): Cell => [
						p ? (horizontal ? formatX(p) : formatY(p)) : '',
						p
					]);
					const header = horizontal ? ctx.formatY(key) : ctx.formatX(key);
					if (!share) return { header, cells };
					return {
						header,
						point: points[0],
						cells: [...cells, [points[0] ? share(points[0]) : '']]
					};
				})
		};
	});

	const current = (point: ChartPoint | undefined) =>
		point && ctx.isSelected(point) ? 'true' : undefined;

	// Without a caption, the title of the chart names the table.
	const labelledBy = $derived(caption ? undefined : (ctx.titleId ?? undefined));

	// The styles remove the table from the screen, but not from the accessibility tree.
	const HIDDEN =
		'position:absolute;width:1px;height:1px;margin:-1px;padding:0;overflow:hidden;clip-path:inset(50%);white-space:nowrap;border:0';
</script>

<table
	class={className}
	data-data-table=""
	data-visibility={visibility}
	aria-labelledby={labelledBy}
	style={visibility === 'screen-reader' ? HIDDEN : undefined}
	{...restProps}
>
	{#if caption}<caption>{caption}</caption>{/if}
	<thead>
		<tr>
			{#each table.head as header, i (i)}
				<th scope="col">{header}</th>
			{/each}
		</tr>
	</thead>
	<tbody>
		<!-- A row of one point holds the selection; in a row of values, each cell holds its own. -->
		{#each table.rows as row, r (r)}
			<tr aria-current={current(row.point)} data-selected={current(row.point)}>
				{#if row.header !== undefined}<th scope="row">{row.header}</th>{/if}
				{#each row.cells as [text, point], i (i)}
					{@const cell = row.point ? undefined : current(point)}
					<td aria-current={cell} data-selected={cell}>{text}</td>
				{/each}
			</tr>
		{/each}
	</tbody>
</table>
