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

export type TableColumnWidth = number | `${number}px`;

export type TableGridCoord = {
	row: number;
	col: number;
};

export type TableColumnRegistration = {
	token: string;
	id: string;
	allowsSorting: boolean;
	allowsResizing: boolean;
	isRowHeader: boolean;
	textValue?: string;
	width?: TableColumnWidth;
	defaultWidth?: TableColumnWidth;
	minWidth?: number;
	maxWidth?: number;
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
	initialColumnWidths?: Iterable<readonly [string, number]>;
	disabledKeys?: Iterable<TableSelectionKey>;
	onSelectionChange?: (keys: Set<TableSelectionKey>) => void;
	onSortChange?: (descriptor: TableSortDescriptor | undefined) => void;
	onColumnWidthsChange?: (widths: Map<string, number>) => void;
	onColumnResizeStart?: (columnId: string) => void;
	onColumnResizeEnd?: (widths: Map<string, number>) => void;
};

export type TableContext = {
	layoutVersion: Readable<number>;
	selectionVersion: Readable<number>;
	focusVersion: Readable<number>;
	sortVersion: Readable<number>;
	widthVersion: Readable<number>;
	resizeVersion: Readable<number>;
	createInstanceToken: (prefix: string) => string;
	selectionMode: TableSelectionMode;
	selectionBehavior: TableSelectionBehavior;
	disabledKeys: Set<TableSelectionKey>;
	focusedCellKey: string | null;
	focusVisible: boolean;
	sortDescriptor: TableSortDescriptor | undefined;
	resizingColumnId: string | null;
	registerColumn: (column: TableColumnRegistration) => void;
	unregisterColumn: (token: string) => void;
	getColumnCount: () => number;
	getColumnAt: (index: number) => TableColumnRegistration | undefined;
	getColumnIndexByToken: (token: string) => number;
	getColumnTextValue: (columnId: string) => string | undefined;
	getColumnWidth: (columnId: string) => number | undefined;
	getColumnMinWidth: (columnId: string) => number | undefined;
	getColumnMaxWidth: (columnId: string) => number | undefined;
	isColumnResizable: (columnId: string) => boolean;
	getColumnWidths: () => Map<string, number>;
	setColumnWidths: (widths?: Iterable<readonly [string, number]>) => void;
	setColumnWidth: (columnId: string, width: number) => void;
	measureColumnContentWidth: (columnId: string) => number | undefined;
	startColumnResize: (columnId: string) => void;
	endColumnResize: () => void;
	suppressHeaderClickOnce: () => void;
	consumeHeaderClickSuppression: () => boolean;
	hasResizableColumns: () => boolean;
	registerRow: (row: TableRowRegistration) => void;
	unregisterRow: (token: string) => void;
	getHeaderRowCount: () => number;
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
	cellOrderVersion: Readable<number>;
	registerCellToken: (token: string, getElement?: () => HTMLElement | undefined) => void;
	unregisterCellToken: (token: string) => void;
	getCellIndex: (token: string) => number;
};

export type TableColumnContext = {
	token: string;
	id: string;
	allowsSorting: boolean;
	allowsResizing: boolean;
	isRowHeader: boolean;
	textValue?: string;
	width?: TableColumnWidth;
	defaultWidth?: TableColumnWidth;
	minWidth?: number;
	maxWidth?: number;
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
	let resizingColumnId: string | null = null;
	let suppressNextHeaderClick = false;

	const columns = new Map<string, TableColumnRegistration>();
	const columnIds = new Map<string, string>();
	const columnOrder: string[] = [];
	const columnWidths = new Map<string, number>(options.initialColumnWidths ?? []);
	const rows = new Map<string, TableRowRegistration>();
	const headerRowOrder: string[] = [];
	const bodyRowOrder: string[] = [];
	const cells = new Map<string, TableCellRegistration>();
	const cellOrder: string[] = [];
	let orderedRowTokensCache: { header: string[] | null; body: string[] | null } = {
		header: null,
		body: null
	};
	let navigableCellsCache: Array<{ cell: TableCellRegistration; coord: TableGridCoord }> | null =
		null;
	let rowsWithCellsCache: Map<number, { col: number; key: string; element: HTMLElement }[]> | null =
		null;

	const layoutVersion = writable(0);
	const selectionVersion = writable(0);
	const focusVersion = writable(0);
	const sortVersion = writable(0);
	const widthVersion = writable(0);
	const resizeVersion = writable(0);
	const instanceCounters = new Map<string, number>();

	function createInstanceToken(prefix: string) {
		const nextCount = (instanceCounters.get(prefix) ?? 0) + 1;
		instanceCounters.set(prefix, nextCount);
		return `table-${prefix}-${nextCount}`;
	}

	function invalidateLayoutCaches() {
		orderedRowTokensCache = { header: null, body: null };
		navigableCellsCache = null;
		rowsWithCellsCache = null;
	}

	function notifyLayout() {
		invalidateLayoutCaches();
		layoutVersion.update((value) => value + 1);
	}

	function notifySelection() {
		selectionVersion.update((value) => value + 1);
	}

	function notifyFocus() {
		focusVersion.update((value) => value + 1);
	}

	function notifySort() {
		invalidateLayoutCaches();
		sortVersion.update((value) => value + 1);
	}

	function notifyWidth() {
		widthVersion.update((value) => value + 1);
	}

	function notifyResize() {
		resizeVersion.update((value) => value + 1);
	}

	function normalizeColumnWidth(width: TableColumnWidth | undefined) {
		if (typeof width === 'number') {
			return Number.isFinite(width) ? width : undefined;
		}

		if (typeof width === 'string') {
			const match = width.trim().match(/^(\d+(?:\.\d+)?)px$/i);
			if (!match) return undefined;
			const next = Number(match[1]);
			return Number.isFinite(next) ? next : undefined;
		}

		return undefined;
	}

	function getColumnRegistrationById(columnId: string) {
		const token = columnIds.get(columnId);
		return token ? columns.get(token) : undefined;
	}

	function getColumnMinWidth(columnId: string) {
		return getColumnRegistrationById(columnId)?.minWidth;
	}

	function getColumnMaxWidth(columnId: string) {
		return getColumnRegistrationById(columnId)?.maxWidth;
	}

	function clampColumnWidth(columnId: string, width: number) {
		const registration = getColumnRegistrationById(columnId);
		const minWidth = registration?.minWidth ?? 75;
		const maxWidth = registration?.maxWidth;
		let next = Math.round(width);
		if (Number.isNaN(next) || !Number.isFinite(next)) {
			next = minWidth;
		}
		next = Math.max(minWidth, next);
		if (maxWidth !== undefined) {
			next = Math.min(maxWidth, next);
		}
		return next;
	}

	function hasResizableColumns() {
		for (const column of columns.values()) {
			if (column.allowsResizing) return true;
		}
		return false;
	}

	function sameColumnRegistration(left: TableColumnRegistration, right: TableColumnRegistration) {
		return (
			left.token === right.token &&
			left.id === right.id &&
			left.allowsSorting === right.allowsSorting &&
			left.allowsResizing === right.allowsResizing &&
			left.isRowHeader === right.isRowHeader &&
			left.textValue === right.textValue &&
			left.width === right.width &&
			left.defaultWidth === right.defaultWidth &&
			left.minWidth === right.minWidth &&
			left.maxWidth === right.maxWidth
		);
	}

	function sameRowRegistration(left: TableRowRegistration, right: TableRowRegistration) {
		return (
			left.token === right.token &&
			left.section === right.section &&
			left.id === right.id &&
			left.disabled === right.disabled &&
			left.element === right.element
		);
	}

	function sameCellRegistration(left: TableCellRegistration, right: TableCellRegistration) {
		return (
			left.key === right.key &&
			left.rowToken === right.rowToken &&
			left.section === right.section &&
			left.columnIndex === right.columnIndex &&
			left.columnToken === right.columnToken &&
			left.element === right.element
		);
	}

	function registerColumn(column: TableColumnRegistration) {
		const existing = columns.get(column.token);
		const alreadyOrdered = columnOrder.includes(column.token);
		if (existing && sameColumnRegistration(existing, column) && alreadyOrdered) return;
		if (existing && existing.id !== column.id && columnIds.get(existing.id) === column.token) {
			columnIds.delete(existing.id);
		}
		columns.set(column.token, column);
		columnIds.set(column.id, column.token);
		if (!alreadyOrdered) {
			columnOrder.push(column.token);
		}
		notifyLayout();
	}

	function unregisterColumn(token: string) {
		const column = columns.get(token);
		if (column && columnIds.get(column.id) === token) {
			columnIds.delete(column.id);
		}
		columns.delete(token);
		const index = columnOrder.indexOf(token);
		if (index >= 0) {
			columnOrder.splice(index, 1);
		}
		notifyLayout();
	}

	function getOrderedColumnTokens() {
		return [...columnOrder].sort((leftToken, rightToken) => {
			const leftCell = Array.from(cells.values()).find(
				(cell) => cell.section === 'header' && cell.columnToken === leftToken && cell.element
			)?.element;
			const rightCell = Array.from(cells.values()).find(
				(cell) => cell.section === 'header' && cell.columnToken === rightToken && cell.element
			)?.element;

			if (!leftCell || !rightCell) {
				return columnOrder.indexOf(leftToken) - columnOrder.indexOf(rightToken);
			}

			if (leftCell === rightCell) return 0;
			const position = leftCell.compareDocumentPosition(rightCell);
			if (position & Node.DOCUMENT_POSITION_FOLLOWING) return -1;
			if (position & Node.DOCUMENT_POSITION_PRECEDING) return 1;
			return columnOrder.indexOf(leftToken) - columnOrder.indexOf(rightToken);
		});
	}

	function getColumnCount() {
		return getOrderedColumnTokens().length;
	}

	function getColumnAt(index: number) {
		const token = getOrderedColumnTokens()[index];
		return token ? columns.get(token) : undefined;
	}

	function getColumnIndexByToken(token: string) {
		return getOrderedColumnTokens().indexOf(token);
	}

	function getColumnTextValue(columnId: string) {
		return getColumnRegistrationById(columnId)?.textValue;
	}

	function getColumnWidth(columnId: string) {
		const managedWidth = columnWidths.get(columnId);
		if (managedWidth !== undefined) {
			return clampColumnWidth(columnId, managedWidth);
		}

		const registration = getColumnRegistrationById(columnId);
		if (!registration) return undefined;

		const nextWidth =
			normalizeColumnWidth(registration.width) ?? normalizeColumnWidth(registration.defaultWidth);

		return nextWidth !== undefined ? clampColumnWidth(columnId, nextWidth) : undefined;
	}

	function isColumnResizable(columnId: string) {
		return getColumnRegistrationById(columnId)?.allowsResizing ?? false;
	}

	function getColumnWidths() {
		const widths = new Map<string, number>();
		for (const token of getOrderedColumnTokens()) {
			const column = columns.get(token);
			if (!column) continue;
			const width = getColumnWidth(column.id);
			if (width !== undefined) {
				widths.set(column.id, width);
			}
		}
		return widths;
	}

	function getMeasuredHeaderWidth(columnToken: string) {
		const headerCell = Array.from(cells.values()).find(
			(cell) => cell.section === 'header' && cell.columnToken === columnToken && cell.element
		);
		const width = headerCell?.element?.getBoundingClientRect().width;
		if (width === undefined || width <= 0 || !Number.isFinite(width)) {
			return undefined;
		}
		return Math.round(width);
	}

	function freezeColumnWidthsFromLayout() {
		const next = new Map<string, number>();
		let changed = false;

		for (const token of columnOrder) {
			const column = columns.get(token);
			if (!column) continue;

			const measuredWidth = getMeasuredHeaderWidth(token);
			const resolvedWidth = measuredWidth ?? getColumnWidth(column.id);
			if (resolvedWidth === undefined) continue;

			const clampedWidth = clampColumnWidth(column.id, resolvedWidth);
			next.set(column.id, clampedWidth);
			if (columnWidths.get(column.id) !== clampedWidth) {
				changed = true;
			}
		}

		if (!changed || next.size === 0) return;

		columnWidths.clear();
		for (const [columnId, width] of next) {
			columnWidths.set(columnId, width);
		}

		options.onColumnWidthsChange?.(getColumnWidths());
		notifyWidth();
	}

	function setColumnWidths(widths?: Iterable<readonly [string, number]>) {
		const next = new Map<string, number>();
		for (const token of columnOrder) {
			const column = columns.get(token);
			if (!column) continue;
			const incomingWidth = widths ? new Map<string, number>(widths).get(column.id) : undefined;
			if (incomingWidth !== undefined) {
				next.set(column.id, clampColumnWidth(column.id, incomingWidth));
			}
		}

		columnWidths.clear();
		for (const [columnId, width] of next) {
			columnWidths.set(columnId, width);
		}
		notifyWidth();
	}

	function setColumnWidth(columnId: string, width: number) {
		if (!isColumnResizable(columnId)) return;
		const nextWidth = clampColumnWidth(columnId, width);
		if (columnWidths.get(columnId) === nextWidth) return;
		columnWidths.set(columnId, nextWidth);
		const nextWidths = getColumnWidths();
		options.onColumnWidthsChange?.(nextWidths);
		notifyWidth();
	}

	function measureIntrinsicElementWidth(cell: HTMLElement) {
		const target =
			cell.querySelector<HTMLElement>('[data-table-header-content]') ??
			cell.firstElementChild ??
			cell;
		const clone = target.cloneNode(true) as HTMLElement;
		for (const separator of clone.querySelectorAll('[role="separator"]')) {
			separator.remove();
		}

		// Copy the cell's computed font so the clone inherits correct text metrics
		// (the clone is appended to document.body which may have different font styles)
		const cellFont = getComputedStyle(cell);
		clone.style.font = cellFont.font;
		clone.style.letterSpacing = cellFont.letterSpacing;
		clone.style.wordSpacing = cellFont.wordSpacing;

		clone.style.position = 'absolute';
		clone.style.visibility = 'hidden';
		clone.style.pointerEvents = 'none';
		clone.style.left = '-99999px';
		clone.style.top = '0';
		clone.style.width = 'max-content';
		clone.style.maxWidth = 'none';
		clone.style.minWidth = '0';
		clone.style.overflow = 'visible';
		clone.style.whiteSpace = 'nowrap';
		document.body.appendChild(clone);

		const width = Math.ceil(clone.getBoundingClientRect().width);
		clone.remove();
		return width;
	}

	function measureColumnContentWidth(columnId: string) {
		const registration = getColumnRegistrationById(columnId);
		if (!registration) return undefined;

		const columnIndex = getColumnIndexByToken(registration.token);
		if (columnIndex < 0) return undefined;

		const measuredWidths: number[] = [];
		for (const cell of cells.values()) {
			const matchesHeader =
				cell.section === 'header' && cell.columnToken === registration.token && cell.element;
			const matchesBody =
				cell.section === 'body' && cell.columnIndex === columnIndex && cell.element;
			if (!matchesHeader && !matchesBody) continue;

			const element = cell.element;
			if (!element) continue;

			const computedStyle = getComputedStyle(element);
			const paddingX =
				parseFloat(computedStyle.paddingLeft || '0') +
				parseFloat(computedStyle.paddingRight || '0');
			const borderX =
				parseFloat(computedStyle.borderLeftWidth || '0') +
				parseFloat(computedStyle.borderRightWidth || '0');
			const contentWidth = measureIntrinsicElementWidth(element);

			if (contentWidth <= 0) continue;
			measuredWidths.push(Math.ceil(contentWidth + paddingX + borderX));
		}

		if (measuredWidths.length === 0) return undefined;
		return clampColumnWidth(columnId, Math.max(...measuredWidths));
	}

	function startColumnResize(columnId: string) {
		if (!isColumnResizable(columnId) || resizingColumnId === columnId) return;
		if (getColumnWidths().size < getColumnCount()) {
			freezeColumnWidthsFromLayout();
		}
		resizingColumnId = columnId;
		options.onColumnResizeStart?.(columnId);
		notifyResize();
	}

	function endColumnResize() {
		if (!resizingColumnId) return;
		resizingColumnId = null;
		options.onColumnResizeEnd?.(getColumnWidths());
		notifyResize();
	}

	function suppressHeaderClickOnce() {
		suppressNextHeaderClick = true;
	}

	function consumeHeaderClickSuppression() {
		const shouldSuppress = suppressNextHeaderClick;
		suppressNextHeaderClick = false;
		return shouldSuppress;
	}

	function registerRow(row: TableRowRegistration) {
		const existing = rows.get(row.token);
		const targetOrder =
			row.section === 'header' ? headerRowOrder : row.section === 'body' ? bodyRowOrder : null;
		const alreadyOrdered = targetOrder ? targetOrder.includes(row.token) : false;
		const wasInHeader = headerRowOrder.includes(row.token);
		const wasInBody = bodyRowOrder.includes(row.token);
		if (
			existing &&
			sameRowRegistration(existing, row) &&
			(targetOrder ? alreadyOrdered : !wasInHeader && !wasInBody)
		) {
			return;
		}
		if (wasInHeader) {
			headerRowOrder.splice(headerRowOrder.indexOf(row.token), 1);
		}
		if (wasInBody) {
			bodyRowOrder.splice(bodyRowOrder.indexOf(row.token), 1);
		}
		rows.set(row.token, row);
		if (targetOrder && !targetOrder.includes(row.token)) {
			targetOrder.push(row.token);
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

	function getHeaderRowCount() {
		return getOrderedRowTokens('header').length;
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
		const cached = orderedRowTokensCache[section];
		if (cached) return cached;
		const fallback = section === 'header' ? headerRowOrder : bodyRowOrder;
		const sorted = [...fallback].sort((leftToken, rightToken) =>
			compareRowsByDocumentOrder(leftToken, rightToken, fallback)
		);
		orderedRowTokensCache[section] = sorted;
		return sorted;
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
		const existing = cells.get(cell.key);
		const alreadyOrdered = cellOrder.includes(cell.key);
		if (existing && sameCellRegistration(existing, cell) && alreadyOrdered) return;
		cells.set(cell.key, cell);
		if (!alreadyOrdered) {
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

	function getDefaultFocusKey() {
		for (const rowToken of getOrderedRowTokens('header')) {
			const headerCells = Array.from(cells.values())
				.filter((cell) => cell.section === 'header' && cell.rowToken === rowToken)
				.sort((left, right) => getColumnIndex(left) - getColumnIndex(right));
			const firstHeaderCell = headerCells[0]?.key;
			if (firstHeaderCell) return firstHeaderCell;
		}

		for (const rowToken of getOrderedRowTokens('body')) {
			const row = rows.get(rowToken);
			if (isRowDisabled(row?.id, row?.disabled)) continue;
			const bodyCells = Array.from(cells.values())
				.filter((cell) => cell.section === 'body' && cell.rowToken === rowToken)
				.sort((left, right) => (left.columnIndex ?? -1) - (right.columnIndex ?? -1));
			const firstBodyCell = bodyCells[0]?.key;
			if (firstBodyCell) return firstBodyCell;
		}

		return null;
	}

	function isCellTabStop(key: string) {
		if (focusedCellKey) {
			return focusedCellKey === key;
		}
		return getDefaultFocusKey() === key;
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
		if (navigableCellsCache) return navigableCellsCache;
		navigableCellsCache = Array.from(cells.values())
			.map((cell) => ({ cell, coord: getCellCoord(cell) }))
			.filter((entry): entry is { cell: TableCellRegistration; coord: TableGridCoord } =>
				Boolean(
					entry.coord &&
					entry.cell.element &&
					(entry.cell.section !== 'body' ||
						!isRowDisabled(
							rows.get(entry.cell.rowToken)?.id,
							rows.get(entry.cell.rowToken)?.disabled
						))
				)
			)
			.sort((left, right) =>
				left.coord.row === right.coord.row
					? left.coord.col - right.coord.col
					: left.coord.row - right.coord.row
			);
		return navigableCellsCache;
	}

	function getRowsWithCells() {
		if (rowsWithCellsCache) return rowsWithCellsCache;
		const rowsByIndex = new Map<number, { col: number; key: string; element: HTMLElement }[]>();
		for (const { cell, coord } of getNavigableCells()) {
			const rowCells = rowsByIndex.get(coord.row) ?? [];
			rowCells.push({ col: coord.col, key: cell.key, element: cell.element! });
			rowsByIndex.set(coord.row, rowCells);
		}
		for (const rowCells of rowsByIndex.values()) {
			rowCells.sort((a, b) => a.col - b.col);
		}
		rowsWithCellsCache = rowsByIndex;
		return rowsWithCellsCache;
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
		if (
			cell.section === 'body' &&
			isRowDisabled(rows.get(cell.rowToken)?.id, rows.get(cell.rowToken)?.disabled)
		) {
			return;
		}
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

	function hasSameSelection(left: Set<TableSelectionKey>, right: Set<TableSelectionKey>) {
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

	function pressRow(
		id: TableSelectionKey | undefined,
		interaction: TableSelectionInteraction = {}
	) {
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
		widthVersion,
		resizeVersion,
		createInstanceToken,
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
		get resizingColumnId() {
			return resizingColumnId;
		},
		registerColumn,
		unregisterColumn,
		getColumnCount,
		getColumnAt,
		getColumnIndexByToken,
		getColumnTextValue,
		getColumnWidth,
		getColumnMinWidth,
		getColumnMaxWidth,
		isColumnResizable,
		getColumnWidths,
		setColumnWidths,
		setColumnWidth,
		measureColumnContentWidth,
		startColumnResize,
		endColumnResize,
		suppressHeaderClickOnce,
		consumeHeaderClickSuppression,
		hasResizableColumns,
		registerRow,
		unregisterRow,
		getHeaderRowCount,
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
