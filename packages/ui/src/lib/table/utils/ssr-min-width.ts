import { DEFAULT_TABLE_COLUMN_MIN_WIDTH, type TableColumnWidth } from '../root/context.svelte';

/**
 * The width-bearing fields of a column that contribute to the reserved table
 * width. Kept structural (rather than the full column type) so any caller can
 * pass its own column descriptors.
 */
export type TableColumnWidthSpec = {
	/** Used only to skip the column when listed in `hiddenColumns`. */
	id?: string;
	width?: TableColumnWidth;
	defaultWidth?: TableColumnWidth;
	minWidth?: number;
};

export type GetTableSsrMinWidthOptions = {
	/** Column ids to exclude from the sum (e.g. currently hidden columns). */
	hiddenColumns?: Iterable<string>;
	/** Floor for a column with no authored px width and no `minWidth`. */
	defaultColumnMinWidth?: number;
	/**
	 * Combined px width of framework columns the caller renders outside
	 * `columns` (selection / row-index / actions). Added to the total as-is.
	 */
	extraFixedWidth?: number;
};

function toFixedPx(width: TableColumnWidth | undefined): number | undefined {
	if (typeof width === 'number') return Number.isFinite(width) ? width : undefined;
	if (typeof width === 'string') {
		const match = width.trim().match(/^(\d+(?:\.\d+)?)px$/i);
		if (match) return Number(match[1]);
	}
	return undefined;
}

/** The px width a column settles at once horizontal space is tight. */
function columnFloorWidth(column: TableColumnWidthSpec, defaultMinWidth: number): number {
	return (
		toFixedPx(column.width) ?? toFixedPx(column.defaultWidth) ?? column.minWidth ?? defaultMinWidth
	);
}

/**
 * Sums the width a table settles at when every column is at its floor — an
 * authored px width, else its `minWidth`, else `defaultColumnMinWidth`. Relative
 * (`%`/`fr`) widths contribute nothing fixed, so they fall back to the min-width.
 *
 * Pass the result to `Table.Root`'s `ssrMinTableWidth`. A table's columns only
 * register after its `<table>` serializes, so on the server it can't derive its
 * own minimum width. Its header cells do carry these same floors as px widths,
 * which is where the browser settles a table wider than its box; reserving their
 * sum here makes the table that wide too, so hydration doesn't move a column.
 */
export function getTableSsrMinWidth(
	columns: Iterable<TableColumnWidthSpec>,
	options: GetTableSsrMinWidthOptions = {}
): number {
	const {
		hiddenColumns,
		defaultColumnMinWidth = DEFAULT_TABLE_COLUMN_MIN_WIDTH,
		extraFixedWidth = 0
	} = options;
	const hidden = new Set(hiddenColumns ?? []);

	let total = extraFixedWidth;
	for (const column of columns) {
		if (column.id !== undefined && hidden.has(column.id)) continue;
		total += columnFloorWidth(column, defaultColumnMinWidth);
	}
	return total;
}
