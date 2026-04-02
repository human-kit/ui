import { getContext, setContext } from 'svelte';
import { writable, type Readable } from 'svelte/store';

const TABLE_KEY = Symbol('table');
const TABLE_SECTION_KEY = Symbol('table-section');
const TABLE_ROW_KEY = Symbol('table-row');
const TABLE_COLUMN_KEY = Symbol('table-column');

export type TableSelectionKey = string | number;
export type TableSelectionMode = 'none' | 'single' | 'multiple';
export type TableSelectionBehavior = 'toggle' | 'replace';
export type TableSortDirection = 'ascending' | 'descending';
export type TableSectionKind = 'header' | 'body' | 'footer';

type TableSelectionInteraction = {
	shiftKey?: boolean;
	ctrlKey?: boolean;
	metaKey?: boolean;
	altKey?: boolean;
};

export type TableSortDescriptor = {
	column: string;
	direction: TableSortDirection;
};

export type TableGridCoord = {
	row: number;
	col: number;
};

export type TableColumnRegistration = {
	token: string;
	id: string;
	allowsSorting: boolean;
	isRowHeader: boolean;
	textValue?: string;
};

type TableRowRegistration = {
	token: string;
	section: TableSectionKind;
	id?: TableSelectionKey;
	disabled: boolean;
	element?: HTMLTableRowElement;
};

type TableCellRegistration = {
	key: string;
	rowToken: string;
	section: Extract<TableSectionKind, 'header' | 'body'>;
	columnIndex?: number;
	columnToken?: string;
	element?: HTMLElement;
};

export type CreateTableContextOptions = {
	selectionMode?: TableSelectionMode;
	selectionBehavior?: TableSelectionBehavior;
	initialSelectedKeys?: Iterable<TableSelectionKey>;
	initialSortDescriptor?: TableSortDescriptor;
	disabledKeys?: Iterable<TableSelectionKey>;
	onSelectionChange?: (keys: Set<TableSelectionKey>) => void;
	onSortChange?: (descriptor: TableSortDescriptor | undefined) => void;
};

export type TableContext = {
	layoutVersion: Readable<number>;
	selectionVersion: Readable<number>;
	focusVersion: Readable<number>;
	sortVersion: Readable<number>;
	selectionMode: TableSelectionMode;
	selectionBehavior: TableSelectionBehavior;
	disabledKeys: Set<TableSelectionKey>;
	focusedCellKey: string | null;
	focusVisible: boolean;
	sortDescriptor: TableSortDescriptor | undefined;
	registerColumn: (column: TableColumnRegistration) => void;
	unregisterColumn: (token: string) => void;
	getColumnCount: () => number;
	getColumnAt: (index: number) => TableColumnRegistration | undefined;
	getColumnIndexByToken: (token: string) => number;
	registerRow: (row: TableRowRegistration) => void;
	unregisterRow: (token: string) => void;
	getBodyRowCount: () => number;
	isRowSelected: (id: TableSelectionKey | undefined) => boolean;
	isRowFocused: (token: string) => boolean;
	isRowDisabled: (id: TableSelectionKey | undefined, localDisabled?: boolean) => boolean;
	registerCell: (cell: TableCellRegistration) => void;
	unregisterCell: (key: string) => void;
	isCellFocused: (key: string) => boolean;
	isCellTabStop: (key: string) => boolean;
	focusCellByKey: (key: string | null) => void;
	pressRow: (id: TableSelectionKey | undefined, interaction?: TableSelectionInteraction) => void;
	setFocusedCell: (key: string | null) => void;
	setFocusVisible: (visible: boolean) => void;
	moveFocus: (
		direction: 'up' | 'down' | 'left' | 'right',
		interaction?: TableSelectionInteraction
	) => void;
	moveToRowStart: () => void;
	moveToRowEnd: () => void;
	moveToGridStart: () => void;
	moveToGridEnd: () => void;
	toggleRowSelection: (id: TableSelectionKey | undefined) => void;
	selectAllRows: () => void;
	setSelection: (keys: Iterable<TableSelectionKey>) => void;
	setSelectionMode: (mode: TableSelectionMode) => void;
	setSelectionBehavior: (behavior: TableSelectionBehavior) => void;
	setDisabledKeys: (keys?: Iterable<TableSelectionKey>) => void;
	setSortDescriptor: (descriptor: TableSortDescriptor | undefined) => void;
	toggleSort: (columnId: string) => void;
	isColumnSortable: (columnId: string) => boolean;
	getSortDirection: (columnId: string) => TableSortDirection | undefined;
};

export type TableSectionContext = {
	section: TableSectionKind;
};

export type TableRowContext = {
	rowToken: string;
	section: TableSectionKind;
	rowId?: TableSelectionKey;
	isDisabled: boolean;
	registerCellToken: (token: string) => number;
	unregisterCellToken: (token: string) => void;
};

export type TableColumnContext = {
	token: string;
	id: string;
	allowsSorting: boolean;
	isRowHeader: boolean;
	textValue?: string;
};

export function createTableContext(options: CreateTableContextOptions = {}): TableContext {
	let selectionMode = options.selectionMode ?? 'none';
	let selectionBehavior = options.selectionBehavior ?? 'toggle';
	let sortDescriptor = options.initialSortDescriptor;
	let focusedCellKey: string | null = null;
	let focusVisible = false;
	let selectedKeys = new Set<TableSelectionKey>(options.initialSelectedKeys ?? []);
	let selectionAnchorKey = selectedKeys.values().next().value ?? null;
	const disabledKeys = new Set<TableSelectionKey>(options.disabledKeys ?? []);

	const columns = new Map<string, TableColumnRegistration>();
	const columnOrder: string[] = [];
	const rows = new Map<string, TableRowRegistration>();
	const headerRowOrder: string[] = [];
	const bodyRowOrder: string[] = [];
	const cells = new Map<string, TableCellRegistration>();
	const cellOrder: string[] = [];

	const layoutVersion = writable(0);
	const selectionVersion = writable(0);
	const focusVersion = writable(0);
	const sortVersion = writable(0);

	function notifyLayout() {
		layoutVersion.update((value) => value + 1);
	}

	function notifySelection() {
		selectionVersion.update((value) => value + 1);
	}

	function notifyFocus() {
		focusVersion.update((value) => value + 1);
	}

	function notifySort() {
		sortVersion.update((value) => value + 1);
	}

	function registerColumn(column: TableColumnRegistration) {
		columns.set(column.token, column);
		if (!columnOrder.includes(column.token)) {
			columnOrder.push(column.token);
		}
		notifyLayout();
	}

	function unregisterColumn(token: string) {
		columns.delete(token);
		const index = columnOrder.indexOf(token);
		if (index >= 0) {
			columnOrder.splice(index, 1);
		}
		notifyLayout();
	}

	function getColumnCount() {
		return columnOrder.length;
	}

	function getColumnAt(index: number) {
		const token = columnOrder[index];
		return token ? columns.get(token) : undefined;
	}

	function getColumnIndexByToken(token: string) {
		return columnOrder.indexOf(token);
	}

	function registerRow(row: TableRowRegistration) {
		rows.set(row.token, row);
		const order =
			row.section === 'header' ? headerRowOrder : row.section === 'body' ? bodyRowOrder : null;
		if (order && !order.includes(row.token)) {
			order.push(row.token);
		}
		notifyLayout();
	}

	function unregisterRow(token: string) {
		const row = rows.get(token);
		rows.delete(token);
		for (const order of [headerRowOrder, bodyRowOrder]) {
			const index = order.indexOf(token);
			if (index >= 0) {
				order.splice(index, 1);
			}
		}
		for (const [key, cell] of cells.entries()) {
			if (cell.rowToken === token) {
				cells.delete(key);
			}
		}
		if (row && focusedCellKey) {
			const focusedCell = cells.get(focusedCellKey);
			if (!focusedCell || focusedCell.rowToken === token) {
				focusedCellKey = null;
				notifyFocus();
			}
		}
		notifyLayout();
	}

	function getBodyRowCount() {
		return getOrderedRowTokens('body').length;
	}

	function compareRowsByDocumentOrder(leftToken: string, rightToken: string, fallback: string[]) {
		const leftIndex = fallback.indexOf(leftToken);
		const rightIndex = fallback.indexOf(rightToken);
		const leftRow = rows.get(leftToken)?.element;
		const rightRow = rows.get(rightToken)?.element;

		if (!leftRow || !rightRow || leftRow === rightRow) {
			return leftIndex - rightIndex;
		}

		const position = leftRow.compareDocumentPosition(rightRow);
		if (position & Node.DOCUMENT_POSITION_FOLLOWING) return -1;
		if (position & Node.DOCUMENT_POSITION_PRECEDING) return 1;
		return leftIndex - rightIndex;
	}

	function getOrderedRowTokens(section: 'header' | 'body') {
		const fallback = section === 'header' ? headerRowOrder : bodyRowOrder;
		return [...fallback].sort((leftToken, rightToken) =>
			compareRowsByDocumentOrder(leftToken, rightToken, fallback)
		);
	}

	function getOrderedSelectableRowIds() {
		const rowIds: TableSelectionKey[] = [];
		for (const token of getOrderedRowTokens('body')) {
			const row = rows.get(token);
			if (!row?.id) continue;
			if (disabledKeys.has(row.id) || row.disabled) continue;
			rowIds.push(row.id);
		}
		return rowIds;
	}

	function isRowDisabled(id: TableSelectionKey | undefined, localDisabled = false) {
		if (localDisabled) return true;
		if (id === undefined) return false;
		return disabledKeys.has(id);
	}

	function isRowSelected(id: TableSelectionKey | undefined) {
		if (id === undefined) return false;
		return selectedKeys.has(id);
	}

	function isRowFocused(token: string) {
		if (!focusedCellKey) return false;
		return cells.get(focusedCellKey)?.rowToken === token;
	}

	function registerCell(cell: TableCellRegistration) {
		cells.set(cell.key, cell);
		if (!cellOrder.includes(cell.key)) {
			cellOrder.push(cell.key);
		}
		notifyLayout();
	}

	function unregisterCell(key: string) {
		cells.delete(key);
		const index = cellOrder.indexOf(key);
		if (index >= 0) {
			cellOrder.splice(index, 1);
		}
		if (focusedCellKey === key) {
			focusedCellKey = null;
			notifyFocus();
		}
		notifyLayout();
	}

	function isCellFocused(key: string) {
		return focusedCellKey === key;
	}

	function isCellTabStop(key: string) {
		if (focusedCellKey) {
			return focusedCellKey === key;
		}
		return cellOrder[0] === key;
	}

	function getGlobalRowIndex(rowToken: string) {
		const orderedHeaderRows = getOrderedRowTokens('header');
		const orderedBodyRows = getOrderedRowTokens('body');
		const headerIndex = orderedHeaderRows.indexOf(rowToken);
		if (headerIndex >= 0) return headerIndex;
		const bodyIndex = orderedBodyRows.indexOf(rowToken);
		if (bodyIndex >= 0) return orderedHeaderRows.length + bodyIndex;
		return -1;
	}

	function getColumnIndex(cell: TableCellRegistration) {
		if (cell.section === 'header' && cell.columnToken) {
			return getColumnIndexByToken(cell.columnToken);
		}
		return cell.columnIndex ?? -1;
	}

	function getCellCoord(cell: TableCellRegistration): TableGridCoord | null {
		const row = getGlobalRowIndex(cell.rowToken);
		const col = getColumnIndex(cell);
		if (row < 0 || col < 0) return null;
		return { row, col };
	}

	function getNavigableCells() {
		return Array.from(cells.values())
			.map((cell) => ({ cell, coord: getCellCoord(cell) }))
			.filter((entry): entry is { cell: TableCellRegistration; coord: TableGridCoord } =>
				Boolean(entry.coord && entry.cell.element)
			);
	}

	function getRowsWithCells() {
		const rowsByIndex = new Map<number, { col: number; key: string; element: HTMLElement }[]>();
		for (const { cell, coord } of getNavigableCells()) {
			const rowCells = rowsByIndex.get(coord.row) ?? [];
			rowCells.push({ col: coord.col, key: cell.key, element: cell.element! });
			rowsByIndex.set(coord.row, rowCells);
		}
		for (const rowCells of rowsByIndex.values()) {
			rowCells.sort((a, b) => a.col - b.col);
		}
		return rowsByIndex;
	}

	function getClosestCellKey(rowIndex: number, preferredCol: number) {
		const rowCells = getRowsWithCells().get(rowIndex);
		if (!rowCells || rowCells.length === 0) return null;
		const exact = rowCells.find((rowCell) => rowCell.col === preferredCol);
		if (exact) return exact.key;
		const before = [...rowCells].reverse().find((rowCell) => rowCell.col <= preferredCol);
		if (before) return before.key;
		return rowCells[0]?.key ?? null;
	}

	function focusCellByKey(key: string | null) {
		if (!key) return;
		const cell = cells.get(key);
		if (!cell?.element) return;
		focusedCellKey = key;
		notifyFocus();
		cell.element.focus();
		cell.element.scrollIntoView?.({ block: 'nearest', inline: 'nearest' });
	}

	function setFocusedCell(key: string | null) {
		if (focusedCellKey === key) return;
		focusedCellKey = key;
		notifyFocus();
	}

	function setFocusVisible(visible: boolean) {
		if (focusVisible === visible) return;
		focusVisible = visible;
		notifyFocus();
	}

	function getFocusedCoord() {
		if (!focusedCellKey) return null;
		const cell = cells.get(focusedCellKey);
		return cell ? getCellCoord(cell) : null;
	}

	function getFocusedRowId() {
		if (!focusedCellKey) return null;
		const rowToken = cells.get(focusedCellKey)?.rowToken;
		if (!rowToken) return null;
		const row = rows.get(rowToken);
		return row?.section === 'body' ? (row.id ?? null) : null;
	}

	function hasSameSelection(
		left: Set<TableSelectionKey>,
		right: Set<TableSelectionKey>
	) {
		if (left.size !== right.size) return false;
		for (const key of left) {
			if (!right.has(key)) return false;
		}
		return true;
	}

	function setSelectedKeys(next: Set<TableSelectionKey>, anchor?: TableSelectionKey | null) {
		selectedKeys =
			selectionMode === 'none'
				? new Set()
				: selectionMode === 'single' && next.size > 1
					? new Set([next.values().next().value as TableSelectionKey])
					: next;

		const fallbackAnchor = selectedKeys.values().next().value ?? null;
		if (anchor === undefined) {
			selectionAnchorKey = fallbackAnchor;
			return;
		}

		selectionAnchorKey = anchor === null || selectedKeys.has(anchor) ? anchor : fallbackAnchor;
	}

	function replaceSelectionWithRow(id: TableSelectionKey | undefined) {
		if (id === undefined || disabledKeys.has(id)) return;
		setSelectedKeys(new Set([id]), id);
		emitSelectionChange();
	}

	function toggleSelectionForRow(id: TableSelectionKey | undefined) {
		if (id === undefined || disabledKeys.has(id)) return;
		if (selectionMode === 'single') {
			const wasSelected = selectedKeys.has(id);
			setSelectedKeys(
				selectionBehavior === 'toggle' && wasSelected ? new Set() : new Set([id]),
				selectionBehavior === 'toggle' && wasSelected ? null : id
			);
			emitSelectionChange();
			return;
		}
		const next = new Set(selectedKeys);
		if (next.has(id)) {
			next.delete(id);
		} else {
			next.add(id);
		}
		setSelectedKeys(next, id);
		emitSelectionChange();
	}

	function extendSelectionToRow(
		id: TableSelectionKey | undefined,
		anchorOverride?: TableSelectionKey | null
	) {
		if (id === undefined || disabledKeys.has(id)) return;
		if (selectionMode !== 'multiple') {
			replaceSelectionWithRow(id);
			return;
		}

		const orderedIds = getOrderedSelectableRowIds();
		const targetIndex = orderedIds.indexOf(id);
		if (targetIndex < 0) return;

		const anchor =
			anchorOverride ??
			(selectionAnchorKey && orderedIds.includes(selectionAnchorKey) ? selectionAnchorKey : null) ??
			getFocusedRowId() ??
			id;
		const anchorIndex = orderedIds.indexOf(anchor);
		if (anchorIndex < 0) {
			replaceSelectionWithRow(id);
			return;
		}

		const start = Math.min(anchorIndex, targetIndex);
		const end = Math.max(anchorIndex, targetIndex);
		setSelectedKeys(new Set(orderedIds.slice(start, end + 1)), anchor);
		emitSelectionChange();
	}

	function pressRow(id: TableSelectionKey | undefined, interaction: TableSelectionInteraction = {}) {
		if (selectionMode === 'none' || id === undefined || disabledKeys.has(id)) return;

		if (selectionBehavior === 'replace' && selectionMode === 'multiple') {
			if (interaction.shiftKey) {
				extendSelectionToRow(id);
				return;
			}
			if (interaction.ctrlKey || interaction.metaKey) {
				toggleSelectionForRow(id);
				return;
			}
			replaceSelectionWithRow(id);
			return;
		}

		toggleSelectionForRow(id);
	}

	function moveFocus(
		direction: 'up' | 'down' | 'left' | 'right',
		interaction: TableSelectionInteraction = {}
	) {
		const rowMap = getRowsWithCells();
		const currentCoord = getFocusedCoord();
		const rowIndexes = Array.from(rowMap.keys()).sort((a, b) => a - b);
		if (rowIndexes.length === 0) return;
		const previousFocusedRowId = getFocusedRowId();

		function maybeSyncSelectionAfterFocus(targetKey: string | null) {
			if (direction !== 'up' && direction !== 'down') return;
			if (!targetKey) return;
			if (selectionMode === 'none') return;
			if (interaction.ctrlKey || interaction.metaKey || interaction.altKey) return;

			const targetRowId = getFocusedRowId();
			if (targetRowId === null) return;

			if (interaction.shiftKey) {
				extendSelectionToRow(targetRowId, selectionAnchorKey ?? previousFocusedRowId);
				return;
			}

			if (selectionBehavior !== 'replace') return;

			replaceSelectionWithRow(targetRowId);
		}

		if (!currentCoord) {
			const firstKey = getClosestCellKey(rowIndexes[0], 0);
			focusCellByKey(firstKey);
			maybeSyncSelectionAfterFocus(firstKey);
			return;
		}

		if (direction === 'left' || direction === 'right') {
			const rowCells = rowMap.get(currentCoord.row) ?? [];
			const currentIndex = rowCells.findIndex((rowCell) => rowCell.key === focusedCellKey);
			if (currentIndex < 0) return;
			const nextIndex = direction === 'left' ? currentIndex - 1 : currentIndex + 1;
			const nextKey = rowCells[nextIndex]?.key;
			if (nextKey) {
				focusCellByKey(nextKey);
			}
			return;
		}

		const rowPosition = rowIndexes.indexOf(currentCoord.row);
		const targetRowIndex =
			direction === 'up' ? rowIndexes[rowPosition - 1] : rowIndexes[rowPosition + 1];
		if (targetRowIndex === undefined) return;
		const targetKey = getClosestCellKey(targetRowIndex, currentCoord.col);
		focusCellByKey(targetKey);
		maybeSyncSelectionAfterFocus(targetKey);
	}

	function moveToRowStart() {
		const currentCoord = getFocusedCoord();
		if (!currentCoord) {
			moveToGridStart();
			return;
		}
		focusCellByKey(getClosestCellKey(currentCoord.row, -1));
	}

	function moveToRowEnd() {
		const rowMap = getRowsWithCells();
		const currentCoord = getFocusedCoord();
		if (!currentCoord) {
			moveToGridEnd();
			return;
		}
		const rowCells = rowMap.get(currentCoord.row) ?? [];
		focusCellByKey(rowCells[rowCells.length - 1]?.key ?? null);
	}

	function moveToGridStart() {
		const rowIndexes = Array.from(getRowsWithCells().keys()).sort((a, b) => a - b);
		if (rowIndexes.length === 0) return;
		focusCellByKey(getClosestCellKey(rowIndexes[0], -1));
	}

	function moveToGridEnd() {
		const rowMap = getRowsWithCells();
		const bodyGlobalRows = getOrderedRowTokens('body')
			.map((token) => getGlobalRowIndex(token))
			.filter((index) => index >= 0)
			.sort((a, b) => a - b);
		const targetRow =
			bodyGlobalRows.at(-1) ??
			Array.from(rowMap.keys())
				.sort((a, b) => a - b)
				.at(-1);
		if (targetRow === undefined) return;
		const rowCells = rowMap.get(targetRow) ?? [];
		focusCellByKey(rowCells[rowCells.length - 1]?.key ?? null);
	}

	function emitSelectionChange() {
		options.onSelectionChange?.(new Set(selectedKeys));
		notifySelection();
	}

	function toggleRowSelection(id: TableSelectionKey | undefined) {
		toggleSelectionForRow(id);
	}

	function selectAllRows() {
		if (selectionMode !== 'multiple') return;
		const next = new Set<TableSelectionKey>();
		for (const token of getOrderedRowTokens('body')) {
			const row = rows.get(token);
			if (!row?.id || disabledKeys.has(row.id) || row.disabled) continue;
			next.add(row.id);
		}
		setSelectedKeys(next, next.values().next().value ?? null);
		emitSelectionChange();
	}

	function setSelection(keys: Iterable<TableSelectionKey>) {
		const next = new Set(keys);
		const preservedAnchor =
			selectionAnchorKey !== null && next.has(selectionAnchorKey) ? selectionAnchorKey : undefined;
		setSelectedKeys(next, preservedAnchor);
		notifySelection();
	}

	function setSelectionMode(mode: TableSelectionMode) {
		const previousSelectedKeys = new Set(selectedKeys);
		const previousAnchor = selectionAnchorKey;
		selectionMode = mode;
		setSelectedKeys(new Set(selectedKeys), selectionAnchorKey);
		if (
			!hasSameSelection(previousSelectedKeys, selectedKeys) ||
			previousAnchor !== selectionAnchorKey
		) {
			emitSelectionChange();
			return;
		}
		notifySelection();
	}

	function setSelectionBehavior(behavior: TableSelectionBehavior) {
		selectionBehavior = behavior;
		notifySelection();
	}

	function setDisabledKeys(keys?: Iterable<TableSelectionKey>) {
		disabledKeys.clear();
		if (keys) {
			for (const key of keys) {
				disabledKeys.add(key);
			}
		}
		notifySelection();
	}

	function setSortDescriptor(descriptor: TableSortDescriptor | undefined) {
		sortDescriptor = descriptor;
		options.onSortChange?.(descriptor);
		notifySort();
	}

	function isColumnSortable(columnId: string) {
		return Array.from(columns.values()).some(
			(column) => column.id === columnId && column.allowsSorting
		);
	}

	function toggleSort(columnId: string) {
		if (!isColumnSortable(columnId)) return;
		if (!sortDescriptor || sortDescriptor.column !== columnId) {
			setSortDescriptor({ column: columnId, direction: 'ascending' });
			return;
		}
		setSortDescriptor({
			column: columnId,
			direction: sortDescriptor.direction === 'ascending' ? 'descending' : 'ascending'
		});
	}

	function getSortDirection(columnId: string) {
		if (sortDescriptor?.column !== columnId) return undefined;
		return sortDescriptor.direction;
	}

	return {
		layoutVersion,
		selectionVersion,
		focusVersion,
		sortVersion,
		get selectionMode() {
			return selectionMode;
		},
		get selectionBehavior() {
			return selectionBehavior;
		},
		disabledKeys,
		get focusedCellKey() {
			return focusedCellKey;
		},
		get focusVisible() {
			return focusVisible;
		},
		get sortDescriptor() {
			return sortDescriptor;
		},
		registerColumn,
		unregisterColumn,
		getColumnCount,
		getColumnAt,
		getColumnIndexByToken,
		registerRow,
		unregisterRow,
		getBodyRowCount,
		isRowSelected,
		isRowFocused,
		isRowDisabled,
		registerCell,
		unregisterCell,
		isCellFocused,
		isCellTabStop,
		focusCellByKey,
		pressRow,
		setFocusedCell,
		setFocusVisible,
		moveFocus,
		moveToRowStart,
		moveToRowEnd,
		moveToGridStart,
		moveToGridEnd,
		toggleRowSelection,
		selectAllRows,
		setSelection,
		setSelectionMode,
		setSelectionBehavior,
		setDisabledKeys,
		setSortDescriptor,
		toggleSort,
		isColumnSortable,
		getSortDirection
	};
}

export function setTableContext(context: TableContext) {
	setContext(TABLE_KEY, context);
	return context;
}

export function getTableContext() {
	return getContext<TableContext | undefined>(TABLE_KEY);
}

export function useTableContext() {
	const context = getTableContext();
	if (!context) {
		throw new Error('Table parts must be used inside `Table.Root`.');
	}
	return context;
}

export function setTableSectionContext(context: TableSectionContext) {
	setContext(TABLE_SECTION_KEY, context);
	return context;
}

export function getTableSectionContext() {
	return getContext<TableSectionContext | undefined>(TABLE_SECTION_KEY);
}

export function useTableSectionContext() {
	const context = getTableSectionContext();
	if (!context) {
		throw new Error('Table section parts must be used inside `Table.Root`.');
	}
	return context;
}

export function setTableRowContext(context: TableRowContext) {
	setContext(TABLE_ROW_KEY, context);
	return context;
}

export function getTableRowContext() {
	return getContext<TableRowContext | undefined>(TABLE_ROW_KEY);
}

export function useTableRowContext() {
	const context = getTableRowContext();
	if (!context) {
		throw new Error('Table cells must be used inside `Table.Row`.');
	}
	return context;
}

export function setTableColumnContext(context: TableColumnContext) {
	setContext(TABLE_COLUMN_KEY, context);
	return context;
}

export function getTableColumnContext() {
	return getContext<TableColumnContext | undefined>(TABLE_COLUMN_KEY);
}

export function useTableColumnContext() {
	const context = getTableColumnContext();
	if (!context) {
		throw new Error('`Table.ColumnHeaderCell` must be used inside `Table.Column`.');
	}
	return context;
}
