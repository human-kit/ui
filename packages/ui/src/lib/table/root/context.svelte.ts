import { flushSync, getContext, setContext } from 'svelte';
import { SvelteMap, SvelteSet } from 'svelte/reactivity';
import { asCommand } from '../../internal/as-command.js';
import { isRtl } from '../../internal/rtl';

const TABLE_KEY = Symbol('table');
const TABLE_SECTION_KEY = Symbol('table-section');
const TABLE_ROW_KEY = Symbol('table-row');
const TABLE_COLUMN_KEY = Symbol('table-column');
const TABLE_CELL_KEY = Symbol('table-cell');
const IS_BROWSER = typeof window !== 'undefined';

export type TableSelectionKey = string | number;
export type TableRowItem = Record<string, unknown> & { id: TableSelectionKey };
export type TableSelectionMode = 'none' | 'single' | 'multiple';
export type TableSelectionBehavior = 'toggle' | 'replace';
export type TableDisabledBehavior = 'selection' | 'all';
export type TableSortDirection = 'ascending' | 'descending';
export type TableSectionKind = 'header' | 'body' | 'footer';
export type TableRowActionHandler = (id: TableSelectionKey) => void;

type TableSelectionInteraction = {
	shiftKey?: boolean;
	ctrlKey?: boolean;
	metaKey?: boolean;
	altKey?: boolean;
};

type TableRowPressSource = 'pointer' | 'pointer-double' | 'keyboard-enter' | 'keyboard-space';

export type TableSortDescriptor = {
	column: string;
	direction: TableSortDirection;
};

export type TableColumnWidth = number | `${number}px` | `${number}%` | `${number}fr`;

export type TableColumnPin = 'left' | 'right';

/**
 * Resolved sticky placement for a pinned column. `offset` is the distance (px)
 * from the pinned edge, accumulated from the resolved widths of the columns
 * already pinned to the same side ahead of this one. `isEdge` marks the inner
 * column of a pinned group (the rightmost left-pinned / leftmost right-pinned
 * one) so consumers can render the divider against the scrolling content.
 */
export type TableColumnPinState = {
	side: TableColumnPin;
	offset: number;
	isEdge: boolean;
};

export const DEFAULT_TABLE_COLUMN_MIN_WIDTH = 60;

type ParsedTableColumnWidth = {
	unit: 'px' | '%' | 'fr';
	value: number;
};

type RelativeColumnWidthAllocation = {
	columnId: string;
	index: number;
	exactWidth: number;
	width: number;
	minWidth: number;
	maxWidth?: number;
	remainder: number;
};

export type RoundedWidthDistributionEntry = {
	columnId: string;
	index: number;
	exactWidth: number;
	width: number;
	minWidth: number;
	maxWidth?: number;
	remainder: number;
};

export function distributeRoundedWidths(
	entries: RoundedWidthDistributionEntry[],
	targetTotal: number
) {
	let delta = targetTotal - entries.reduce((total, entry) => total + entry.width, 0);
	if (delta === 0) return entries;

	const prioritizedEntries = [...entries].sort((left, right) => {
		if (delta > 0) {
			if (right.remainder !== left.remainder) return right.remainder - left.remainder;
			return right.index - left.index;
		}

		if (left.remainder !== right.remainder) return left.remainder - right.remainder;
		return left.index - right.index;
	});

	while (delta !== 0) {
		let updated = false;

		for (const entry of prioritizedEntries) {
			if (delta > 0) {
				if (entry.maxWidth !== undefined && entry.width >= entry.maxWidth) continue;
				entry.width += 1;
				delta -= 1;
				updated = true;
			} else {
				if (entry.width <= entry.minWidth) continue;
				entry.width -= 1;
				delta += 1;
				updated = true;
			}

			if (delta === 0) break;
		}

		if (!updated) break;
	}

	return entries;
}

export type TableGridCoord = {
	row: number;
	col: number;
};

export type TableRowFocusEdge = 'start' | 'end';

type TableColumnMetadata = {
	token: string;
	id: string;
	isRowHeader: boolean;
	textValue?: string;
	width?: TableColumnWidth;
	defaultWidth?: TableColumnWidth;
	minWidth?: number;
	maxWidth?: number;
	pin?: TableColumnPin;
};

type TableColumnLayoutEntry = {
	column: TableColumnMetadata | undefined;
	isHidden: boolean;
	visibleColumnIndex: number;
};

export type TableSelectionCheckboxState = 'none' | 'some' | 'all';

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
	focusDelegate?: () => HTMLElement | undefined;
};

export type CreateTableContextOptions = {
	selectionMode?: TableSelectionMode;
	selectionBehavior?: TableSelectionBehavior;
	disabledBehavior?: TableDisabledBehavior;
	disallowEmptySelection?: boolean;
	initialSelectedKeys?: Iterable<TableSelectionKey>;
	initialSortDescriptor?: TableSortDescriptor;
	initialColumnWidths?: Iterable<readonly [string, TableColumnWidth]>;
	initialHiddenColumns?: Iterable<string>;
	disabledKeys?: Iterable<TableSelectionKey>;
	onRowAction?: TableRowActionHandler;
	onSelectionChange?: (keys: Set<TableSelectionKey>) => void;
	onSortChange?: (descriptor: TableSortDescriptor | undefined) => void;
	onColumnWidthsChange?: (widths: Map<string, TableColumnWidth>) => void;
	onHiddenColumnsChange?: (columnIds: string[]) => void;
	onColumnResizeStart?: (columnId: string) => void;
	onColumnResizeEnd?: (widths: Map<string, TableColumnWidth>) => void;
};

export type TableContext = {
	/**
	 * Counter bumped when the column/row layout is (re)built or its plain
	 * caches are invalidated (registration order, hidden columns, DOM
	 * mutations reported via `notifyLayoutChange`). Deliberately kept
	 * counter-based: the ordered-token/navigable-cell caches are plain
	 * (non-reactive, performance-critical), so cache-mediated reads must do
	 * `void ctx.layoutEpoch` to re-run.
	 */
	layoutEpoch: number;
	/**
	 * Structural selection epoch. Selection values (`selectedKeys`, anchor,
	 * mode…) are fine-grained `$state`, but select-all/checkbox state also
	 * depends on the plain row registries (row order, logical rows,
	 * selectable-row count). Those structural changes bump this counter with
	 * the same dedupe guards the old `selectionVersion` store used.
	 */
	selectionEpoch: number;
	/**
	 * Counter for DOM-measurement-driven width invalidation (container
	 * resizes, header measurements, resize sessions). Resolved widths live in
	 * plain caches, so width consumers read `void ctx.widthEpoch`.
	 */
	widthEpoch: number;
	createInstanceToken: (prefix: string) => string;
	selectionMode: TableSelectionMode;
	selectionBehavior: TableSelectionBehavior;
	disabledBehavior: TableDisabledBehavior;
	disallowEmptySelection: boolean;
	selectionUnavailableDescriptionId: string;
	disabledKeys: Set<TableSelectionKey>;
	focusedCellKey: string | null;
	focusVisible: boolean;
	sortDescriptor: TableSortDescriptor | undefined;
	resizingColumnId: string | null;
	registerColumn: (column: TableColumnMetadata) => void;
	unregisterColumn: (token: string) => void;
	registerColumnResizer: (columnToken: string) => void;
	unregisterColumnResizer: (columnToken: string) => void;
	getColumnCount: () => number;
	getVisibleColumnCount: () => number;
	getColumnAt: (index: number) => TableColumnMetadata | undefined;
	getColumnLayoutAt: (index: number) => TableColumnLayoutEntry;
	getColumnIndexByToken: (token: string) => number;
	getVisibleColumnIndexByToken: (token: string) => number;
	getColumnTextValue: (columnId: string) => string | undefined;
	getColumnWidth: (columnId: string) => number | undefined;
	getColumnWidthStyle: (columnId: string) => string | undefined;
	hasAuthoredColumnWidthSpec: (columnId: string) => boolean;
	getColumnMinWidth: (columnId: string) => number | undefined;
	getColumnMaxWidth: (columnId: string) => number | undefined;
	getColumnPin: (columnId: string) => TableColumnPin | undefined;
	getColumnPinState: (columnId: string) => TableColumnPinState | null;
	registerColumnSortTrigger: (columnToken: string) => void;
	unregisterColumnSortTrigger: (columnToken: string) => void;
	isColumnHidden: (columnId: string) => boolean;
	isColumnResizable: (columnId: string) => boolean;
	getColumnWidths: () => Map<string, TableColumnWidth>;
	getVisibleColumnWidths: () => Map<string, TableColumnWidth>;
	getResolvedVisibleColumnWidths: () => Map<string, number>;
	hasRelativeVisibleColumnWidths: () => boolean;
	refreshMeasuredLayout: () => void;
	notifyLayoutChange: () => void;
	setColumnWidths: (widths?: Iterable<readonly [string, TableColumnWidth]>) => void;
	setColumnWidth: (columnId: string, width: number) => void;
	setHiddenColumns: (columnIds?: Iterable<string>) => void;
	measureColumnContentWidth: (columnId: string) => number | undefined;
	startColumnResize: (columnId: string) => void;
	endColumnResize: () => void;
	suppressHeaderClickOnce: () => void;
	consumeHeaderClickSuppression: () => boolean;
	hasResizableColumns: () => boolean;
	registerRow: (row: TableRowRegistration) => void;
	unregisterRow: (token: string) => void;
	setLogicalBodyRows: (ids?: Iterable<TableSelectionKey>) => void;
	markBodyRowsInitialized: () => void;
	getHeaderRowCount: () => number;
	getBodyRowCount: () => number;
	getLogicalBodyRowCount: () => number;
	getRowAriaIndex: (token: string) => number | undefined;
	isRowSelected: (id: TableSelectionKey | undefined) => boolean;
	isRowFocused: (token: string) => boolean;
	isRowFocusTarget: (token: string) => boolean;
	getRowFocusEdge: (token: string) => TableRowFocusEdge | null;
	isRowDisabled: (id: TableSelectionKey | undefined, localDisabled?: boolean) => boolean;
	isRowSelectionDisabled: (id: TableSelectionKey | undefined, localDisabled?: boolean) => boolean;
	isRowActionDisabled: (id: TableSelectionKey | undefined, localDisabled?: boolean) => boolean;
	isRowActionable: (id: TableSelectionKey | undefined, localDisabled?: boolean) => boolean;
	hasSelectableRows: () => boolean;
	getSelectionCheckboxState: () => TableSelectionCheckboxState;
	registerCell: (cell: TableCellRegistration) => void;
	unregisterCell: (key: string) => void;
	isCellFocused: (key: string) => boolean;
	isCellTabStop: (key: string) => boolean;
	isRowTabStop: (token: string) => boolean;
	focusCellByKey: (key: string | null) => void;
	focusRowByToken: (token: string, edge: TableRowFocusEdge) => void;
	pressRow: (
		id: TableSelectionKey | undefined,
		source: TableRowPressSource,
		interaction?: TableSelectionInteraction,
		localDisabled?: boolean
	) => void;
	setFocusedCell: (key: string | null) => void;
	setFocusedRow: (token: string | null, edge?: TableRowFocusEdge) => void;
	setFocusVisible: (visible: boolean) => void;
	moveFocus: (
		direction: 'up' | 'down' | 'left' | 'right',
		interaction?: TableSelectionInteraction
	) => void;
	moveToRowStart: () => void;
	moveToRowEnd: () => void;
	moveToBodyRowStart: () => void;
	moveToBodyRowEnd: () => void;
	moveToGridStart: () => void;
	moveToGridEnd: () => void;
	toggleRowSelection: (id: TableSelectionKey | undefined) => void;
	selectAllRows: () => void;
	deselectAllRows: () => void;
	setSelection: (keys: Iterable<TableSelectionKey>) => void;
	setSelectionMode: (mode: TableSelectionMode) => void;
	setSelectionBehavior: (behavior: TableSelectionBehavior) => void;
	setDisabledBehavior: (behavior: TableDisabledBehavior) => void;
	setDisallowEmptySelection: (disallow: boolean) => void;
	setDisabledKeys: (keys?: Iterable<TableSelectionKey>) => void;
	setRowActionHandler: (handler?: TableRowActionHandler) => void;
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
	rowState: {
		readonly isSelected: boolean;
		readonly isAriaDisabled: boolean;
		readonly isSelectionDisabled: boolean;
		readonly isActionable: boolean;
	};
	/**
	 * Counter bumped when the row's cell order changes (cells register /
	 * unregister or the row's DOM children are reordered). Cell indexes are
	 * resolved against the live DOM, so index reads stay epoch-mediated.
	 */
	cellOrderEpoch: number;
	registerCellToken: (token: string, getElement?: () => HTMLElement | undefined) => void;
	unregisterCellToken: (token: string) => void;
	getCellIndex: (token: string) => number;
};

export type TableColumnContext = {
	token: string;
	id: string;
	isHidden: boolean;
	isRowHeader: boolean;
	textValue?: string;
	width?: TableColumnWidth;
	defaultWidth?: TableColumnWidth;
	minWidth?: number;
	maxWidth?: number;
	pin?: TableColumnPin;
};

export type TableCellContext = {
	cellKey: string;
	registerFocusDelegate: (getElement: () => HTMLElement | undefined) => void;
	unregisterFocusDelegate: () => void;
	notifyResizerPresent?: () => void;
	notifyResizerRemoved?: () => void;
};

export function createTableContext(options: CreateTableContextOptions = {}): TableContext {
	// Fine-grained reactive state. `selectedKeys` is always replaced (never
	// mutated in place), so a plain `Set` inside `$state` is enough; the
	// in-place-mutated collections use SvelteSet/SvelteMap instead.
	let selectionMode = $state(options.selectionMode ?? 'none');
	let selectionBehavior = $state(options.selectionBehavior ?? 'toggle');
	let disabledBehavior = $state(options.disabledBehavior ?? 'all');
	let disallowEmptySelection = $state(options.disallowEmptySelection ?? false);
	let onRowAction = $state(options.onRowAction);
	let sortDescriptor = $state(options.initialSortDescriptor);
	let focusedCellKey = $state<string | null>(null);
	let focusedRowTarget = $state<{ rowToken: string; edge: TableRowFocusEdge } | null>(null);
	let focusVisible = $state(false);
	const initialSelectedKeys = new SvelteSet<TableSelectionKey>(options.initialSelectedKeys ?? []);
	let selectedKeys = $state(initialSelectedKeys);
	let selectionAnchorKey = $state<TableSelectionKey | null>(
		initialSelectedKeys.values().next().value ?? null
	);
	const disabledKeys = new SvelteSet<TableSelectionKey>(options.disabledKeys ?? []);
	const hiddenColumnIds = new SvelteSet<string>(options.initialHiddenColumns ?? []);
	let resizingColumnId = $state<string | null>(null);
	let resizeSession: {
		activeColumnId: string;
		flexibleTailColumnId?: string;
		flexibleTailRestoreWidth?: TableColumnWidth;
		baselineWidths: Map<string, number>;
		baselineAvailableTableWidth: number;
		baselineTotalWidth: number;
	} | null = null;
	let suppressNextHeaderClick = false;

	const columns = new SvelteMap<string, TableColumnMetadata>();
	const columnIds = new SvelteMap<string, string>();
	const columnOrder: string[] = [];
	const columnsWithSortTriggers = new SvelteSet<string>();
	const columnsWithResizers = new SvelteSet<string>();
	let resizerLayoutReady = false;
	const columnWidths = new SvelteMap<string, TableColumnWidth>(options.initialColumnWidths ?? []);
	const rows = new SvelteMap<string, TableRowRegistration>();
	const headerRowOrder: string[] = [];
	const headerRowOrderSet = new SvelteSet<string>();
	const bodyRowOrder: string[] = [];
	const bodyRowOrderSet = new SvelteSet<string>();
	let bodyRowsInitialized = false;
	let selectableBodyRowCount = 0;
	let logicalBodyRowIds: TableSelectionKey[] | null = null;
	let logicalBodyRowIndexCache: Map<TableSelectionKey, number> | null = null;
	const cells = new SvelteMap<string, TableCellRegistration>();
	const cellOrderSet = new SvelteSet<string>();
	let orderedRowTokensCache: { header: string[] | null; body: string[] | null } = {
		header: null,
		body: null
	};
	let orderedColumnTokensCache: string[] | null = null;
	let visibleOrderedColumnTokensCache: string[] | null = null;
	let visibleColumnIndexByTokenCache: Map<string, number> | null = null;
	let columnLayoutByIndexCache: TableColumnLayoutEntry[] | null = null;
	let columnWidthsCache: Map<string, TableColumnWidth> | null = null;
	let visibleColumnWidthsCache: Map<string, TableColumnWidth> | null = null;
	let resolvedVisibleColumnWidthsCache: Map<string, number> | null = null;
	let measuredTableWidthCache: number | undefined;
	let hasMeasuredTableWidthCache = false;
	let navigableCellsCache: Array<{ cell: TableCellRegistration; coord: TableGridCoord }> | null =
		null;
	let rowsWithCellsCache: Map<number, { col: number; key: string; element: HTMLElement }[]> | null =
		null;
	let defaultFocusKeyCache: string | undefined;

	// Counter-based epochs (deliberately NOT fine-grained): they broadcast that
	// the plain, performance-critical caches above were invalidated. Layout and
	// width are driven by event-like sources (registration/DOM order,
	// MutationObserver, container-resize measurements); selection keeps a
	// structural epoch because select-all state depends on the plain row
	// registries. Focus, sort and resize state are fine-grained `$state` and
	// need no counters.
	let layoutEpoch = $state(0);
	let selectionEpoch = $state(0);
	let widthEpoch = $state(0);
	const instanceCounters = new SvelteMap<string, number>();
	const selectionUnavailableDescriptionId = createInstanceToken('selection-unavailable');
	setSelectedKeys(
		new SvelteSet(initialSelectedKeys),
		initialSelectedKeys.values().next().value ?? null
	);

	function createInstanceToken(prefix: string) {
		const nextCount = (instanceCounters.get(prefix) ?? 0) + 1;
		instanceCounters.set(prefix, nextCount);
		return `table-${prefix}-${nextCount}`;
	}

	function invalidateLayoutCaches() {
		orderedRowTokensCache = { header: null, body: null };
		orderedColumnTokensCache = null;
		visibleOrderedColumnTokensCache = null;
		visibleColumnIndexByTokenCache = null;
		columnLayoutByIndexCache = null;
		columnWidthsCache = null;
		visibleColumnWidthsCache = null;
		resolvedVisibleColumnWidthsCache = null;
		measuredTableWidthCache = undefined;
		hasMeasuredTableWidthCache = false;
		navigableCellsCache = null;
		rowsWithCellsCache = null;
		defaultFocusKeyCache = undefined;
	}

	function invalidateBodyStructureCaches() {
		orderedRowTokensCache = {
			header: orderedRowTokensCache.header,
			body: null
		};
		navigableCellsCache = null;
		rowsWithCellsCache = null;
		const cachedCell = defaultFocusKeyCache ? cells.get(defaultFocusKeyCache) : undefined;
		if (cachedCell?.section !== 'header') {
			defaultFocusKeyCache = undefined;
		}
	}

	let layoutNotifyScheduled = false;
	let selectionNotifyScheduled = false;
	let widthNotifyScheduled = false;
	let bodyStructureInvalidationScheduled = false;

	function scheduleBodyStructureCacheInvalidation() {
		if (bodyStructureInvalidationScheduled) return;
		bodyStructureInvalidationScheduled = true;
		queueMicrotask(() => {
			bodyStructureInvalidationScheduled = false;
			invalidateBodyStructureCaches();
		});
	}

	function seedDefaultFocusKeyFromCell(cell: TableCellRegistration) {
		if (focusedCellKey || focusedRowTarget || defaultFocusKeyCache !== undefined) {
			return;
		}

		if (cell.section === 'header') {
			defaultFocusKeyCache = cell.key;
			return;
		}

		const row = rows.get(cell.rowToken);
		if (!row || isRowDisabled(row.id, row.disabled)) return;
		defaultFocusKeyCache = cell.key;
	}

	function syncResizerLayoutReady(nextReady: boolean) {
		if (resizerLayoutReady === nextReady) return;
		resizerLayoutReady = nextReady;
		invalidateLayoutCaches();
		layoutEpoch += 1;
		notifyWidth();
	}

	function notifyLayout() {
		invalidateLayoutCaches();
		if (!layoutNotifyScheduled) {
			layoutNotifyScheduled = true;
			queueMicrotask(() => {
				layoutNotifyScheduled = false;
				layoutEpoch += 1;
			});
		}
	}

	function notifySelection() {
		if (!selectionNotifyScheduled) {
			selectionNotifyScheduled = true;
			queueMicrotask(() => {
				selectionNotifyScheduled = false;
				selectionEpoch += 1;
			});
		}
	}

	function notifyWidth() {
		columnWidthsCache = null;
		visibleColumnWidthsCache = null;
		resolvedVisibleColumnWidthsCache = null;
		measuredTableWidthCache = undefined;
		hasMeasuredTableWidthCache = false;
		if (!widthNotifyScheduled) {
			widthNotifyScheduled = true;
			queueMicrotask(() => {
				widthNotifyScheduled = false;
				widthEpoch += 1;
			});
		}
	}

	function notifyWidthImmediately() {
		columnWidthsCache = null;
		visibleColumnWidthsCache = null;
		resolvedVisibleColumnWidthsCache = null;
		measuredTableWidthCache = undefined;
		hasMeasuredTableWidthCache = false;
		flushSync(() => {
			widthEpoch += 1;
		});
	}

	function refreshMeasuredLayout() {
		notifyWidthImmediately();
	}

	function notifyLayoutChange() {
		notifyLayout();
	}

	function parseColumnWidth(
		width: TableColumnWidth | undefined
	): ParsedTableColumnWidth | undefined {
		if (typeof width === 'number') {
			return Number.isFinite(width) ? { unit: 'px', value: width } : undefined;
		}

		if (typeof width === 'string') {
			const match = width.trim().match(/^(\d+(?:\.\d+)?)(px|%|fr)$/i);
			if (!match) return undefined;
			const next = Number(match[1]);
			if (!Number.isFinite(next)) return undefined;
			const unit = match[2].toLowerCase() as ParsedTableColumnWidth['unit'];
			return { unit, value: next };
		}

		return undefined;
	}

	function normalizeColumnWidth(width: TableColumnWidth | undefined) {
		const parsed = parseColumnWidth(width);
		if (!parsed) return undefined;
		if (parsed.unit === 'px') {
			return typeof width === 'number' ? width : (`${parsed.value}px` as const);
		}
		if (parsed.unit === '%') {
			return `${parsed.value}%` as const;
		}
		return `${parsed.value}fr` as const;
	}

	function isRelativeColumnWidth(width: TableColumnWidth | undefined) {
		const parsed = parseColumnWidth(width);
		return parsed ? parsed.unit !== 'px' : false;
	}

	function getColumnRegistrationById(columnId: string) {
		const token = columnIds.get(columnId);
		return token ? columns.get(token) : undefined;
	}

	function isColumnHidden(columnId: string) {
		return hiddenColumnIds.has(columnId);
	}

	function getColumnMinWidth(columnId: string) {
		const registration = getColumnRegistrationById(columnId);
		if (!registration) return undefined;
		if (registration.minWidth !== undefined) return registration.minWidth;
		if (
			!isColumnResizable(columnId) &&
			!isRelativeColumnWidth(getEffectiveColumnWidthSpec(columnId))
		) {
			return undefined;
		}
		return getColumnWidthBounds(columnId).minWidth;
	}

	function getColumnMaxWidth(columnId: string) {
		return getColumnRegistrationById(columnId)?.maxWidth;
	}

	function getColumnPin(columnId: string) {
		return getColumnRegistrationById(columnId)?.pin;
	}

	function getColumnPinState(columnId: string): TableColumnPinState | null {
		const side = getColumnPin(columnId);
		if (!side || isColumnHidden(columnId)) return null;

		const resolvedWidths = getResolvedVisibleColumnWidths();
		const visibleColumns = getVisibleOrderedColumnTokens()
			.map((token) => columns.get(token))
			.filter((column): column is TableColumnMetadata => column !== undefined);
		const targetIndex = visibleColumns.findIndex((column) => column.id === columnId);
		if (targetIndex < 0) return null;

		let offset = 0;
		let isEdge = true;
		for (let index = 0; index < visibleColumns.length; index += 1) {
			if (index === targetIndex) continue;
			if (getColumnPin(visibleColumns[index].id) !== side) continue;
			// Columns pinned to the same side that sit *between* this column and its
			// edge contribute their resolved width to the offset; any same-side pin on
			// the inner flank means this column is not the group's edge.
			const isAhead = side === 'left' ? index < targetIndex : index > targetIndex;
			if (isAhead) {
				offset += resolvedWidths.get(visibleColumns[index].id) ?? 0;
			} else {
				isEdge = false;
			}
		}

		return { side, offset, isEdge };
	}

	function getFixedColumnWidthSpec(columnId: string) {
		return normalizeColumnWidth(getColumnRegistrationById(columnId)?.width);
	}

	function getManagedColumnWidthSpec(columnId: string) {
		return normalizeColumnWidth(columnWidths.get(columnId));
	}

	function getDefaultColumnWidthSpec(columnId: string) {
		return normalizeColumnWidth(getColumnRegistrationById(columnId)?.defaultWidth);
	}

	function hasAuthoredColumnWidthSpec(columnId: string) {
		return (
			getFixedColumnWidthSpec(columnId) !== undefined ||
			getManagedColumnWidthSpec(columnId) !== undefined ||
			getDefaultColumnWidthSpec(columnId) !== undefined
		);
	}

	function getEffectiveColumnWidthSpec(columnId: string) {
		const fixedWidth = getFixedColumnWidthSpec(columnId);
		if (fixedWidth !== undefined) {
			return fixedWidth;
		}

		const managedWidth = getManagedColumnWidthSpec(columnId);
		if (managedWidth !== undefined) {
			return managedWidth;
		}

		const defaultWidth = getDefaultColumnWidthSpec(columnId);
		if (defaultWidth !== undefined) {
			return defaultWidth;
		}

		return resizerLayoutReady && columnsWithResizers.size > 0 ? ('1fr' as const) : undefined;
	}

	function getMeasuredTableWidth() {
		if (hasMeasuredTableWidthCache) {
			return measuredTableWidthCache;
		}

		const tableCell = Array.from(cells.values()).find((cell) => cell.element)?.element;
		const tableElement = tableCell?.closest('table');
		const tableWidth = tableElement?.getBoundingClientRect().width;
		const containerElement = tableElement?.parentElement;
		const containerClientWidth = containerElement?.clientWidth;
		const containerStyle = containerElement ? getComputedStyle(containerElement) : undefined;
		const containerPaddingLeft = Number.parseFloat(containerStyle?.paddingLeft ?? '0');
		const containerPaddingRight = Number.parseFloat(containerStyle?.paddingRight ?? '0');
		const containerWidth =
			containerClientWidth !== undefined && Number.isFinite(containerClientWidth)
				? containerClientWidth - containerPaddingLeft - containerPaddingRight
				: undefined;
		// Use the container width as the stable reference for fr/% resolution.
		// Using Math.max(table, container) causes a feedback loop during resize:
		// the table grows → measurement returns more → fr columns get more space →
		// the table grows further. The container width is stable and represents
		// the actual available space the table should fill.
		const width = containerWidth ?? tableWidth;
		if (width === undefined || width <= 0 || !Number.isFinite(width)) {
			hasMeasuredTableWidthCache = true;
			measuredTableWidthCache = undefined;
			return undefined;
		}

		measuredTableWidthCache = Math.round(width);
		hasMeasuredTableWidthCache = true;
		return measuredTableWidthCache;
	}

	function getColumnWidthBounds(columnId: string) {
		const registration = getColumnRegistrationById(columnId);
		const fixedWidth = parseColumnWidth(registration?.width);
		const minWidth =
			registration?.minWidth ??
			(fixedWidth?.unit === 'px'
				? Math.min(fixedWidth.value, DEFAULT_TABLE_COLUMN_MIN_WIDTH)
				: DEFAULT_TABLE_COLUMN_MIN_WIDTH);

		return {
			minWidth,
			maxWidth: registration?.maxWidth
		};
	}

	function clampColumnWidth(columnId: string, width: number) {
		const { minWidth, maxWidth } = getColumnWidthBounds(columnId);
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

	function resolveRelativeColumnWidthAllocations(
		entries: Array<{ columnId: string; index: number; exactWidth: number }>,
		targetTotal: number
	) {
		const allocations: RelativeColumnWidthAllocation[] = entries.map((entry) => {
			const { minWidth, maxWidth } = getColumnWidthBounds(entry.columnId);
			return {
				...entry,
				width: clampColumnWidth(entry.columnId, entry.exactWidth),
				minWidth,
				maxWidth,
				remainder: entry.exactWidth - Math.floor(entry.exactWidth)
			};
		});

		return distributeRoundedWidths(allocations, targetTotal);
	}

	function hasResizableColumns() {
		for (const column of columns.values()) {
			if (isColumnResizable(column.id)) return true;
		}
		return false;
	}

	function registerColumnResizer(columnToken: string) {
		if (columnsWithResizers.has(columnToken)) return;
		columnsWithResizers.add(columnToken);
		if (IS_BROWSER) {
			syncResizerLayoutReady(true);
			return;
		}
		resizerLayoutReady = false;
		invalidateLayoutCaches();
		layoutEpoch += 1;
		notifyWidth();
	}

	function unregisterColumnResizer(columnToken: string) {
		if (!columnsWithResizers.delete(columnToken)) return;
		if (IS_BROWSER) {
			syncResizerLayoutReady(columnsWithResizers.size > 0);
			return;
		}
		resizerLayoutReady = false;
		invalidateLayoutCaches();
		layoutEpoch += 1;
		notifyWidth();
	}

	function sameColumnMetadata(left: TableColumnMetadata, right: TableColumnMetadata) {
		return (
			left.token === right.token &&
			left.id === right.id &&
			left.isRowHeader === right.isRowHeader &&
			left.textValue === right.textValue &&
			left.width === right.width &&
			left.defaultWidth === right.defaultWidth &&
			left.minWidth === right.minWidth &&
			left.maxWidth === right.maxWidth &&
			left.pin === right.pin
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
			left.element === right.element &&
			left.focusDelegate === right.focusDelegate
		);
	}

	type ResolvedCellTarget = TableCellRegistration;

	function resolveCellTargetByKey(key: string | null) {
		return key ? (cells.get(key) ?? null) : null;
	}

	function getResolvedBodyCellsForRow(rowToken: string) {
		return Array.from(cells.values()).filter(
			(cell): cell is ResolvedCellTarget => cell.section === 'body' && cell.rowToken === rowToken
		);
	}

	function registerColumn(column: TableColumnMetadata) {
		const existing = columns.get(column.token);
		const alreadyOrdered = columnOrder.includes(column.token);
		if (existing && sameColumnMetadata(existing, column) && alreadyOrdered) return;
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
		columnsWithSortTriggers.delete(token);
		columnsWithResizers.delete(token);
		const index = columnOrder.indexOf(token);
		if (index >= 0) {
			columnOrder.splice(index, 1);
		}
		notifyLayout();
	}

	function registerColumnSortTrigger(columnToken: string) {
		if (columnsWithSortTriggers.has(columnToken)) return;
		columnsWithSortTriggers.add(columnToken);
		notifyLayout();
	}

	function unregisterColumnSortTrigger(columnToken: string) {
		if (!columnsWithSortTriggers.delete(columnToken)) return;
		notifyLayout();
	}

	function getOrderedColumnTokens() {
		if (orderedColumnTokensCache) return orderedColumnTokensCache;

		// Pre-build a lookup from columnToken → header cell element to avoid
		// O(columns × cells) scanning inside the comparator.
		const headerElementByToken = new SvelteMap<string, HTMLElement>();
		for (const cell of cells.values()) {
			if (cell.section === 'header' && cell.columnToken && cell.element) {
				headerElementByToken.set(cell.columnToken, cell.element);
			}
		}

		const orderedColumnTokens = [...columnOrder].sort((leftToken, rightToken) => {
			const leftCell = headerElementByToken.get(leftToken);
			const rightCell = headerElementByToken.get(rightToken);

			if (!leftCell || !rightCell) {
				return columnOrder.indexOf(leftToken) - columnOrder.indexOf(rightToken);
			}

			if (leftCell === rightCell) return 0;
			const position = leftCell.compareDocumentPosition(rightCell);
			if (position & Node.DOCUMENT_POSITION_FOLLOWING) return -1;
			if (position & Node.DOCUMENT_POSITION_PRECEDING) return 1;
			return columnOrder.indexOf(leftToken) - columnOrder.indexOf(rightToken);
		});

		orderedColumnTokensCache = orderedColumnTokens;

		return orderedColumnTokens;
	}

	function getColumnCount() {
		return getOrderedColumnTokens().length;
	}

	function getVisibleOrderedColumnTokens() {
		if (visibleOrderedColumnTokensCache) return visibleOrderedColumnTokensCache;
		const visibleOrderedColumnTokens = getOrderedColumnTokens().filter((token) => {
			const column = columns.get(token);
			return column ? !isColumnHidden(column.id) : false;
		});

		visibleOrderedColumnTokensCache = visibleOrderedColumnTokens;

		return visibleOrderedColumnTokens;
	}

	function getVisibleColumnCount() {
		return getVisibleOrderedColumnTokens().length;
	}

	function getVisibleColumnIndexByTokenMap() {
		if (visibleColumnIndexByTokenCache) return visibleColumnIndexByTokenCache;

		const visibleColumnIndexByToken = new SvelteMap(
			getVisibleOrderedColumnTokens().map((token, index) => [token, index])
		);

		visibleColumnIndexByTokenCache = visibleColumnIndexByToken;

		return visibleColumnIndexByToken;
	}

	function getColumnAt(index: number) {
		const token = getOrderedColumnTokens()[index];
		return token ? columns.get(token) : undefined;
	}

	function getColumnLayoutAt(index: number) {
		if (!columnLayoutByIndexCache) {
			const visibleColumnIndexByToken = getVisibleColumnIndexByTokenMap();
			columnLayoutByIndexCache = getOrderedColumnTokens().map((token) => {
				const column = columns.get(token);
				if (!column) {
					return {
						column: undefined,
						isHidden: false,
						visibleColumnIndex: -1
					} satisfies TableColumnLayoutEntry;
				}

				return {
					column,
					isHidden: isColumnHidden(column.id),
					visibleColumnIndex: visibleColumnIndexByToken.get(column.token) ?? -1
				} satisfies TableColumnLayoutEntry;
			});
		}

		return (
			columnLayoutByIndexCache[index] ?? {
				column: undefined,
				isHidden: false,
				visibleColumnIndex: -1
			}
		);
	}

	function getColumnIndexByToken(token: string) {
		return getOrderedColumnTokens().indexOf(token);
	}

	function getVisibleColumnIndexByToken(token: string) {
		return getVisibleColumnIndexByTokenMap().get(token) ?? -1;
	}

	function getColumnTextValue(columnId: string) {
		return getColumnRegistrationById(columnId)?.textValue;
	}

	function getColumnWidth(columnId: string) {
		const parsed = parseColumnWidth(getEffectiveColumnWidthSpec(columnId));
		if (!parsed) return undefined;

		if (!isColumnHidden(columnId)) {
			if (parsed.unit !== 'px') {
				return undefined;
			}
			return getResolvedVisibleColumnWidths().get(columnId);
		}

		return parsed?.unit === 'px' ? clampColumnWidth(columnId, parsed.value) : undefined;
	}

	function formatCssLength(length: number) {
		const rounded = Math.round(length * 1000) / 1000;
		return Number.isInteger(rounded) ? `${rounded}` : `${rounded}`;
	}

	function getColumnWidthStyle(columnId: string) {
		const resolvedWidth = getColumnWidth(columnId);
		if (resolvedWidth !== undefined) {
			return `${resolvedWidth}px`;
		}

		const parsed = parseColumnWidth(getEffectiveColumnWidthSpec(columnId));
		if (!parsed) return undefined;
		if (parsed.unit === 'px') {
			return `${clampColumnWidth(columnId, parsed.value)}px`;
		}
		if (parsed.unit === '%') {
			return `${parsed.value}%`;
		}

		let fixedPxTotal = 0;
		let percentTotal = 0;
		let totalFr = 0;
		const resolvedVisibleWidths = getResolvedVisibleColumnWidths();
		const tableWidth = getMeasuredTableWidth();
		for (const token of getVisibleOrderedColumnTokens()) {
			const column = columns.get(token);
			if (!column) continue;
			const spec = parseColumnWidth(getEffectiveColumnWidthSpec(column.id));
			if (!spec) continue;
			if (spec.unit === 'px') {
				fixedPxTotal += clampColumnWidth(column.id, spec.value);
				continue;
			}
			if (spec.unit === '%') {
				percentTotal += spec.value;
				continue;
			}
			totalFr += spec.value;
		}

		if (totalFr <= 0) return undefined;
		const frShare = parsed.value / totalFr;
		const availableWidthTerms: string[] = ['100%'];
		if (fixedPxTotal > 0) {
			availableWidthTerms.push(`${formatCssLength(fixedPxTotal)}px`);
		}
		if (percentTotal > 0) {
			availableWidthTerms.push(`${formatCssLength(percentTotal)}%`);
		}

		const availableWidthExpression =
			availableWidthTerms.length === 1
				? availableWidthTerms[0]
				: `(${availableWidthTerms.join(' - ')})`;
		if (tableWidth !== undefined) {
			const targetRelativeTotal = Math.max(tableWidth - fixedPxTotal, 0);
			let actualRelativeTotal = 0;
			for (const token of getVisibleOrderedColumnTokens()) {
				const column = columns.get(token);
				if (!column) continue;
				const spec = parseColumnWidth(getEffectiveColumnWidthSpec(column.id));
				if (!spec || spec.unit === 'px') continue;
				actualRelativeTotal += resolvedVisibleWidths.get(column.id) ?? 0;
			}
			if (Math.abs(actualRelativeTotal - targetRelativeTotal) > 1) {
				const constrainedWidth = resolvedVisibleWidths.get(columnId);
				if (constrainedWidth !== undefined) {
					return `${constrainedWidth}px`;
				}
			}
		}
		if (frShare === 1) {
			return `calc(${availableWidthExpression})`;
		}
		return `calc(${availableWidthExpression} * ${formatCssLength(frShare)})`;
	}

	function isColumnResizable(columnId: string) {
		const column = getColumnRegistrationById(columnId);
		if (!column) return false;
		if (isColumnHidden(columnId)) return false;
		return columnsWithResizers.has(column.token);
	}

	function getColumnWidths() {
		if (columnWidthsCache) return columnWidthsCache;
		const widths = new SvelteMap<string, TableColumnWidth>();
		for (const token of getOrderedColumnTokens()) {
			const column = columns.get(token);
			if (!column) continue;
			const width = getManagedColumnWidthSpec(column.id);
			if (width !== undefined) {
				widths.set(column.id, width);
			}
		}
		columnWidthsCache = widths;
		return widths;
	}

	function getVisibleColumnWidths() {
		if (visibleColumnWidthsCache) return visibleColumnWidthsCache;
		const widths = new SvelteMap<string, TableColumnWidth>();
		for (const [columnId, width] of getColumnWidths()) {
			if (isColumnHidden(columnId)) continue;
			widths.set(columnId, width);
		}
		visibleColumnWidthsCache = widths;
		return widths;
	}

	function hasRelativeVisibleColumnWidths() {
		for (const token of getVisibleOrderedColumnTokens()) {
			const column = columns.get(token);
			if (!column) continue;
			if (isRelativeColumnWidth(getEffectiveColumnWidthSpec(column.id))) {
				return true;
			}
		}
		return false;
	}

	function getResolvedVisibleColumnWidths() {
		if (resolvedVisibleColumnWidthsCache) return resolvedVisibleColumnWidthsCache;

		const widths = new SvelteMap<string, number>();
		const flexibleColumns: Array<{ columnId: string; fr: number; index: number }> = [];
		const relativeColumns: Array<{ columnId: string; index: number; exactWidth: number }> = [];
		const tableWidth = getMeasuredTableWidth();
		let fixedWidthTotal = 0;
		let exactRelativeWidthTotal = 0;
		let totalFr = 0;

		for (const [index, token] of getVisibleOrderedColumnTokens().entries()) {
			const column = columns.get(token);
			if (!column) continue;

			const parsed = parseColumnWidth(getEffectiveColumnWidthSpec(column.id));
			if (!parsed) continue;

			if (parsed.unit === 'px') {
				const nextWidth = clampColumnWidth(column.id, parsed.value);
				widths.set(column.id, nextWidth);
				fixedWidthTotal += nextWidth;
				continue;
			}

			if (parsed.unit === '%') {
				if (tableWidth === undefined) continue;
				const exactWidth = (tableWidth * parsed.value) / 100;
				relativeColumns.push({ columnId: column.id, index, exactWidth });
				exactRelativeWidthTotal += exactWidth;
				continue;
			}

			flexibleColumns.push({ columnId: column.id, fr: parsed.value, index });
			totalFr += parsed.value;
		}

		if (tableWidth !== undefined && flexibleColumns.length > 0 && totalFr > 0) {
			const distributableWidth = Math.max(
				tableWidth - fixedWidthTotal - exactRelativeWidthTotal,
				0
			);
			for (const entry of flexibleColumns) {
				relativeColumns.push({
					columnId: entry.columnId,
					index: entry.index,
					exactWidth: (distributableWidth * entry.fr) / totalFr
				});
			}
		}

		if (tableWidth !== undefined && relativeColumns.length > 0) {
			const targetRelativeTotal = Math.max(tableWidth - fixedWidthTotal, 0);
			for (const entry of resolveRelativeColumnWidthAllocations(
				relativeColumns,
				targetRelativeTotal
			)) {
				widths.set(entry.columnId, entry.width);
			}
		}

		resolvedVisibleColumnWidthsCache = widths;
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

	function getFixedVisibleColumnWidthTotal() {
		let total = 0;

		for (const token of getVisibleOrderedColumnTokens()) {
			const column = columns.get(token);
			if (!column) continue;
			if (getFixedColumnWidthSpec(column.id) === undefined) continue;

			const measuredWidth = getMeasuredHeaderWidth(token);
			const resolvedWidth = getColumnWidth(column.id) ?? measuredWidth;
			if (resolvedWidth === undefined) continue;

			total += clampColumnWidth(column.id, resolvedWidth);
		}

		return total;
	}

	function getResizableRelativeTailColumnId(activeColumnId: string) {
		return getVisibleOrderedColumnTokens()
			.map((token) => columns.get(token))
			.filter((column): column is TableColumnMetadata => !!column)
			.filter((column) => {
				if (column.id === activeColumnId) return false;
				if (getFixedColumnWidthSpec(column.id) !== undefined) return false;
				return isRelativeColumnWidth(getEffectiveColumnWidthSpec(column.id));
			})
			.at(-1)?.id;
	}

	function prepareColumnWidthsForResize(activeColumnId: string) {
		const next = new SvelteMap<string, TableColumnWidth>(columnWidths);
		const baselineWidths = new SvelteMap<string, number>();
		const preservedFlexibleColumnId = getResizableRelativeTailColumnId(activeColumnId);
		const preservedFlexibleEffectiveWidth = preservedFlexibleColumnId
			? normalizeColumnWidth(getEffectiveColumnWidthSpec(preservedFlexibleColumnId))
			: undefined;
		const measuredTableWidth = getMeasuredTableWidth();
		const fixedVisibleColumnWidthTotal = getFixedVisibleColumnWidthTotal();

		for (const token of getVisibleOrderedColumnTokens()) {
			const column = columns.get(token);
			if (!column) continue;
			if (getFixedColumnWidthSpec(column.id) !== undefined) continue;

			const measuredWidth = getMeasuredHeaderWidth(token);
			const resolvedWidth = getColumnWidth(column.id) ?? measuredWidth;
			if (resolvedWidth === undefined) continue;

			const frozenWidth = clampColumnWidth(column.id, resolvedWidth);
			next.set(column.id, frozenWidth);
			baselineWidths.set(column.id, frozenWidth);
		}

		let changed = next.size !== columnWidths.size;
		if (!changed) {
			for (const [columnId, width] of next) {
				if (columnWidths.get(columnId) !== width) {
					changed = true;
					break;
				}
			}
		}

		if (!changed) return;

		columnWidths.clear();
		for (const [columnId, width] of next) {
			columnWidths.set(columnId, width);
		}

		columnWidthsCache = null;
		visibleColumnWidthsCache = null;
		const baselineTotalWidth = Array.from(baselineWidths.values()).reduce(
			(total, current) => total + current,
			0
		);
		resizeSession = {
			activeColumnId: activeColumnId,
			flexibleTailColumnId: preservedFlexibleColumnId,
			flexibleTailRestoreWidth:
				preservedFlexibleColumnId && isRelativeColumnWidth(preservedFlexibleEffectiveWidth)
					? preservedFlexibleEffectiveWidth
					: undefined,
			baselineWidths,
			baselineAvailableTableWidth:
				measuredTableWidth !== undefined
					? Math.max(measuredTableWidth - fixedVisibleColumnWidthTotal, 0)
					: baselineTotalWidth,
			baselineTotalWidth
		};
		options.onColumnWidthsChange?.(getColumnWidths());
		notifyWidth();
	}

	function shouldPrepareColumnWidthsForResize(columnId: string) {
		if (getFixedColumnWidthSpec(columnId) !== undefined) return false;
		if (!hasRelativeVisibleColumnWidths()) return false;
		return resizeSession?.activeColumnId !== columnId;
	}

	function setColumnWidths(widths?: Iterable<readonly [string, TableColumnWidth]>) {
		const next = new SvelteMap<string, TableColumnWidth>();
		const incomingWidths = widths ? new SvelteMap<string, TableColumnWidth>(widths) : undefined;
		for (const token of columnOrder) {
			const column = columns.get(token);
			if (!column) continue;
			if (getFixedColumnWidthSpec(column.id) !== undefined) continue;
			const incomingWidth = normalizeColumnWidth(incomingWidths?.get(column.id));
			if (incomingWidth !== undefined) {
				next.set(column.id, incomingWidth);
			}
		}

		columnWidths.clear();
		for (const [columnId, width] of next) {
			columnWidths.set(columnId, width);
		}
		notifyWidth();
	}

	function setColumnWidth(columnId: string, width: number) {
		if (getFixedColumnWidthSpec(columnId) !== undefined) return;
		if (!isColumnResizable(columnId)) return;
		if (shouldPrepareColumnWidthsForResize(columnId)) {
			prepareColumnWidthsForResize(columnId);
		}
		const nextWidth = clampColumnWidth(columnId, width);
		const currentWidth = columnWidths.get(columnId);
		if (
			resizeSession?.activeColumnId === columnId &&
			resizeSession.flexibleTailColumnId !== undefined
		) {
			const baselineActiveWidth = resizeSession.baselineWidths.get(columnId);
			const baselineTailWidth = resizeSession.baselineWidths.get(
				resizeSession.flexibleTailColumnId
			);
			if (baselineActiveWidth !== undefined && baselineTailWidth !== undefined) {
				const widthDelta = nextWidth - baselineActiveWidth;
				const overflowWidth = Math.max(
					resizeSession.baselineTotalWidth - resizeSession.baselineAvailableTableWidth,
					0
				);
				const tailTargetWidth =
					widthDelta >= 0
						? baselineTailWidth - widthDelta
						: baselineTailWidth + Math.max(-widthDelta - overflowWidth, 0);
				const tailWidth = clampColumnWidth(resizeSession.flexibleTailColumnId, tailTargetWidth);
				if (columnWidths.get(resizeSession.flexibleTailColumnId) !== tailWidth) {
					columnWidths.set(resizeSession.flexibleTailColumnId, tailWidth);
				}
			}
		}
		if (currentWidth === nextWidth) return;
		columnWidths.set(columnId, nextWidth);
		columnWidthsCache = null;
		visibleColumnWidthsCache = null;
		options.onColumnWidthsChange?.(getColumnWidths());
		notifyWidth();
	}

	function getCellColumn(cell: ResolvedCellTarget) {
		if (cell.section === 'header' && cell.columnToken) {
			return columns.get(cell.columnToken);
		}
		return cell.columnIndex !== undefined ? getColumnAt(cell.columnIndex) : undefined;
	}

	function isCellColumnHidden(cell: ResolvedCellTarget) {
		const column = getCellColumn(cell);
		return column ? isColumnHidden(column.id) : false;
	}

	function getNearestVisibleCellKey(targetCell: ResolvedCellTarget) {
		const targetPhysicalIndex =
			targetCell.section === 'header'
				? targetCell.columnToken
					? getColumnIndexByToken(targetCell.columnToken)
					: -1
				: (targetCell.columnIndex ?? -1);

		const siblingCandidates =
			targetCell.section === 'header'
				? Array.from(cells.values()).filter(
						(candidate) =>
							candidate.section === 'header' && candidate.rowToken === targetCell.rowToken
					)
				: getResolvedBodyCellsForRow(targetCell.rowToken);

		const siblingCells = siblingCandidates
			.filter((candidate) => {
				if (candidate.key === targetCell.key) return false;
				if (!candidate.element) return false;
				if (isCellColumnHidden(candidate)) return false;
				if (
					candidate.section === 'body' &&
					isRowDisabled(rows.get(candidate.rowToken)?.id, rows.get(candidate.rowToken)?.disabled)
				) {
					return false;
				}
				return true;
			})
			.map((candidate) => {
				const physicalIndex =
					candidate.section === 'header'
						? candidate.columnToken
							? getColumnIndexByToken(candidate.columnToken)
							: -1
						: (candidate.columnIndex ?? -1);
				const candidateColumn = getCellColumn(candidate);
				return { candidate, physicalIndex, candidateColumn };
			})
			.filter((entry) => entry.physicalIndex >= 0 && entry.candidateColumn);

		if (siblingCells.length === 0) return null;

		siblingCells.sort((left, right) => {
			const leftDistance = Math.abs(left.physicalIndex - targetPhysicalIndex);
			const rightDistance = Math.abs(right.physicalIndex - targetPhysicalIndex);
			if (leftDistance !== rightDistance) return leftDistance - rightDistance;
			return left.physicalIndex - right.physicalIndex;
		});

		return siblingCells[0]?.candidate.key ?? null;
	}

	function reconcileFocusAfterHiddenColumnsChange() {
		if (resizingColumnId && isColumnHidden(resizingColumnId)) {
			endColumnResize();
		}

		if (!focusedCellKey) return;
		const focusedCell = resolveCellTargetByKey(focusedCellKey);
		if (!focusedCell || !isCellColumnHidden(focusedCell)) return;

		const replacementKey = getNearestVisibleCellKey(focusedCell);
		if (replacementKey) {
			focusCellByKey(replacementKey);
			return;
		}

		focusedCellKey = null;
		focusedRowTarget = null;
	}

	function reconcileFocusAfterDisabledStateChange() {
		if (focusedCellKey) {
			const focusedCell = resolveCellTargetByKey(focusedCellKey);
			if (
				focusedCell &&
				focusedCell.section === 'body' &&
				isRowDisabled(rows.get(focusedCell.rowToken)?.id, rows.get(focusedCell.rowToken)?.disabled)
			) {
				moveFocus('down');
				const nextFocusedCell = resolveCellTargetByKey(focusedCellKey);
				if (
					nextFocusedCell?.section === 'body' &&
					isRowDisabled(
						rows.get(nextFocusedCell.rowToken)?.id,
						rows.get(nextFocusedCell.rowToken)?.disabled
					)
				) {
					moveFocus('up');
				}
			}
		}

		if (focusedRowTarget) {
			const focusedRow = rows.get(focusedRowTarget.rowToken);
			if (focusedRow && isRowDisabled(focusedRow.id, focusedRow.disabled)) {
				const nextToken = getFocusableBodyRowToken('start');
				if (nextToken) {
					setFocusedRow(nextToken, focusedRowTarget.edge);
				} else {
					setFocusedRow(null);
				}
			}
		}
	}

	function setHiddenColumns(columnIds?: Iterable<string>) {
		const next = new SvelteSet(columnIds ?? []);
		let changed = next.size !== hiddenColumnIds.size;
		if (!changed) {
			for (const columnId of hiddenColumnIds) {
				if (!next.has(columnId)) {
					changed = true;
					break;
				}
			}
		}

		if (!changed) return;

		hiddenColumnIds.clear();
		for (const columnId of next) {
			hiddenColumnIds.add(columnId);
		}

		options.onHiddenColumnsChange?.([...hiddenColumnIds]);
		reconcileFocusAfterHiddenColumnsChange();
		notifyLayout();
		notifyWidth();
	}

	function measureIntrinsicElementWidth(cell: HTMLElement) {
		const target = cell;
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
		resizeSession = null;
		resizingColumnId = columnId;
		options.onColumnResizeStart?.(columnId);
	}

	function endColumnResize() {
		if (!resizingColumnId) return;
		let restoredFlexibleTail = false;
		if (
			resizeSession?.flexibleTailColumnId !== undefined &&
			resizeSession.activeColumnId !== resizeSession.flexibleTailColumnId &&
			resizeSession.flexibleTailRestoreWidth !== undefined
		) {
			const tailColumnId = resizeSession.flexibleTailColumnId;
			columnWidths.set(tailColumnId, resizeSession.flexibleTailRestoreWidth);
			columnWidthsCache = null;
			visibleColumnWidthsCache = null;
			resolvedVisibleColumnWidthsCache = null;
			restoredFlexibleTail = true;
		}
		resizingColumnId = null;
		if (restoredFlexibleTail) {
			options.onColumnWidthsChange?.(getColumnWidths());
		}
		resizeSession = null;
		options.onColumnResizeEnd?.(getColumnWidths());
		notifyWidthImmediately();
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
		const previousSelectableBodyRowCount = selectableBodyRowCount;
		const targetOrder =
			row.section === 'header' ? headerRowOrder : row.section === 'body' ? bodyRowOrder : null;
		const targetOrderSet =
			row.section === 'header'
				? headerRowOrderSet
				: row.section === 'body'
					? bodyRowOrderSet
					: null;
		const alreadyOrdered = targetOrderSet ? targetOrderSet.has(row.token) : false;
		const wasInHeader = headerRowOrderSet.has(row.token);
		const wasInBody = bodyRowOrderSet.has(row.token);
		if (
			existing &&
			sameRowRegistration(existing, row) &&
			(targetOrder ? alreadyOrdered : !wasInHeader && !wasInBody)
		) {
			return;
		}
		if (wasInHeader) {
			headerRowOrder.splice(headerRowOrder.indexOf(row.token), 1);
			headerRowOrderSet.delete(row.token);
		}
		if (wasInBody) {
			bodyRowOrder.splice(bodyRowOrder.indexOf(row.token), 1);
			bodyRowOrderSet.delete(row.token);
		}
		const previousSelectableBodyRow = isSelectableBodyRow(existing);
		rows.set(row.token, row);
		if (targetOrder && targetOrderSet && !targetOrderSet.has(row.token)) {
			targetOrder.push(row.token);
			targetOrderSet.add(row.token);
		}
		const nextSelectableBodyRow = isSelectableBodyRow(row);
		if (previousSelectableBodyRow !== nextSelectableBodyRow) {
			selectableBodyRowCount += nextSelectableBodyRow ? 1 : -1;
		}
		if (
			(selectedKeys.size > 0 &&
				logicalBodyRowIds === null &&
				(existing?.section === 'body' || row.section === 'body')) ||
			(bodyRowsInitialized &&
				(previousSelectableBodyRowCount === 0) !== (selectableBodyRowCount === 0))
		) {
			notifySelection();
		}
		if (row.section === 'body' && logicalBodyRowIds !== null) {
			scheduleBodyStructureCacheInvalidation();
		} else {
			notifyLayout();
		}
	}

	function hasSameLogicalBodyRows(nextIds: TableSelectionKey[] | null) {
		if (logicalBodyRowIds === nextIds) return true;
		if (logicalBodyRowIds === null || nextIds === null) return false;
		if (logicalBodyRowIds.length !== nextIds.length) return false;
		for (let index = 0; index < logicalBodyRowIds.length; index += 1) {
			if (logicalBodyRowIds[index] !== nextIds[index]) return false;
		}
		return true;
	}

	function setLogicalBodyRows(ids?: Iterable<TableSelectionKey>) {
		const nextIds = ids ? [...ids] : null;
		if (hasSameLogicalBodyRows(nextIds)) return;
		logicalBodyRowIds = nextIds;
		logicalBodyRowIndexCache = null;
		notifyLayout();
		notifySelection();
	}

	function unregisterRow(token: string) {
		defaultFocusKeyCache = undefined;
		const row = rows.get(token);
		const previousSelectableBodyRowCount = selectableBodyRowCount;
		rows.delete(token);
		if (isSelectableBodyRow(row)) {
			selectableBodyRowCount = Math.max(0, selectableBodyRowCount - 1);
		}
		if (focusedRowTarget?.rowToken === token) {
			focusedRowTarget = null;
		}
		for (const order of [headerRowOrder, bodyRowOrder]) {
			const index = order.indexOf(token);
			if (index >= 0) {
				order.splice(index, 1);
			}
		}
		headerRowOrderSet.delete(token);
		bodyRowOrderSet.delete(token);
		for (const [key, cell] of cells.entries()) {
			if (cell.rowToken === token) {
				cells.delete(key);
				cellOrderSet.delete(key);
			}
		}
		if (row && focusedCellKey) {
			const focusedCell = resolveCellTargetByKey(focusedCellKey);
			if (!focusedCell || focusedCell.rowToken === token) {
				focusedCellKey = null;
			}
		}
		if (
			(selectedKeys.size > 0 && logicalBodyRowIds === null && row?.section === 'body') ||
			(bodyRowsInitialized &&
				(previousSelectableBodyRowCount === 0) !== (selectableBodyRowCount === 0))
		) {
			notifySelection();
		}
		if (row?.section === 'body' && logicalBodyRowIds !== null) {
			scheduleBodyStructureCacheInvalidation();
		} else {
			notifyLayout();
		}
	}

	function markBodyRowsInitialized() {
		if (bodyRowsInitialized) return;
		const optimisticHasSelectableRows = selectionMode === 'multiple' || selectedKeys.size > 0;
		bodyRowsInitialized = true;
		const actualHasSelectableRows = hasSelectableRows();
		if (optimisticHasSelectableRows !== actualHasSelectableRows) {
			notifySelection();
		}
	}

	function getBodyRowCount() {
		return getOrderedRowTokens('body').length;
	}

	function getLogicalBodyRowCount() {
		return logicalBodyRowIds?.length ?? getBodyRowCount();
	}

	function getHeaderRowCount() {
		return getOrderedRowTokens('header').length;
	}

	function getLogicalBodyRowIndex(id: TableSelectionKey) {
		if (!logicalBodyRowIds) return -1;
		if (!logicalBodyRowIndexCache) {
			logicalBodyRowIndexCache = new SvelteMap();
			for (let index = 0; index < logicalBodyRowIds.length; index += 1) {
				const rowId = logicalBodyRowIds[index];
				if (!logicalBodyRowIndexCache.has(rowId)) {
					logicalBodyRowIndexCache.set(rowId, index);
				}
			}
		}
		return logicalBodyRowIndexCache.get(id) ?? -1;
	}

	function getRowAriaIndex(token: string) {
		const row = rows.get(token);
		if (row?.section === 'header') {
			const headerIndex = getOrderedRowTokens('header').indexOf(token);
			return headerIndex >= 0 ? headerIndex + 1 : undefined;
		}
		if (row?.section !== 'body') return undefined;
		const headerRowCount = getHeaderRowCount();
		if (logicalBodyRowIds !== null) {
			if (row.id === undefined) return undefined;
			const logicalIndex = getLogicalBodyRowIndex(row.id);
			return logicalIndex >= 0 ? headerRowCount + logicalIndex + 1 : undefined;
		}
		const bodyIndex = getOrderedRowTokens('body').indexOf(token);
		return bodyIndex >= 0 ? headerRowCount + bodyIndex + 1 : undefined;
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
		if (logicalBodyRowIds) {
			return logicalBodyRowIds.filter((id) => !isRowSelectionDisabled(id));
		}

		const rowIds: TableSelectionKey[] = [];
		for (const token of getOrderedRowTokens('body')) {
			const row = rows.get(token);
			if (!row?.id) continue;
			if (isRowSelectionDisabled(row.id, row.disabled)) continue;
			rowIds.push(row.id);
		}
		return rowIds;
	}

	function isRowSelectionDisabled(id: TableSelectionKey | undefined, localDisabled = false) {
		if (localDisabled) return true;
		if (id === undefined) return false;
		return disabledKeys.has(id);
	}

	function isSelectableBodyRow(row: TableRowRegistration | undefined) {
		return (
			row?.section === 'body' &&
			row.id !== undefined &&
			!isRowSelectionDisabled(row.id, row.disabled)
		);
	}

	function recomputeSelectableBodyRowCount() {
		let nextSelectableBodyRowCount = 0;
		for (const token of bodyRowOrder) {
			if (isSelectableBodyRow(rows.get(token))) {
				nextSelectableBodyRowCount += 1;
			}
		}
		selectableBodyRowCount = nextSelectableBodyRowCount;
	}

	function isRowDisabled(id: TableSelectionKey | undefined, localDisabled = false) {
		return disabledBehavior === 'all' && isRowSelectionDisabled(id, localDisabled);
	}

	function isRowActionDisabled(id: TableSelectionKey | undefined, localDisabled = false) {
		return disabledBehavior === 'all' && isRowSelectionDisabled(id, localDisabled);
	}

	function isRowActionable(id: TableSelectionKey | undefined, localDisabled = false) {
		return Boolean(onRowAction) && id !== undefined && !isRowActionDisabled(id, localDisabled);
	}

	function isRowSelected(id: TableSelectionKey | undefined) {
		if (id === undefined) return false;
		return selectedKeys.has(id);
	}

	function getSelectionCheckboxState(): TableSelectionCheckboxState {
		const orderedIds = getOrderedSelectableRowIds();
		if (orderedIds.length === 0) {
			return selectedKeys.size > 0 ? 'some' : 'none';
		}

		if (selectedKeys.size === 0) {
			return 'none';
		}

		let selectedCount = 0;
		for (const id of orderedIds) {
			if (selectedKeys.has(id)) {
				selectedCount += 1;
			}
		}

		if (selectedCount === 0) return 'none';
		if (selectedCount === orderedIds.length) return 'all';
		return 'some';
	}

	function hasSelectableRows() {
		if (!bodyRowsInitialized) {
			return selectionMode === 'multiple' || selectedKeys.size > 0;
		}
		if (logicalBodyRowIds) {
			return getOrderedSelectableRowIds().length > 0 || selectedKeys.size > 0;
		}
		return selectableBodyRowCount > 0 || selectedKeys.size > 0;
	}

	function isRowFocused(token: string) {
		if (focusedRowTarget?.rowToken === token) return true;
		if (!focusedCellKey) return false;
		return resolveCellTargetByKey(focusedCellKey)?.rowToken === token;
	}

	function isRowFocusTarget(token: string) {
		return focusedRowTarget?.rowToken === token;
	}

	function getRowFocusEdge(token: string) {
		return focusedRowTarget?.rowToken === token ? focusedRowTarget.edge : null;
	}

	function registerCell(cell: TableCellRegistration) {
		const existing = cells.get(cell.key);
		const alreadyOrdered = cellOrderSet.has(cell.key);
		if (existing && sameCellRegistration(existing, cell) && alreadyOrdered) {
			if (cell.section === 'header') {
				notifyLayout();
				notifyWidth();
			}
			return;
		}
		cells.set(cell.key, cell);
		seedDefaultFocusKeyFromCell(cell);
		if (!alreadyOrdered) {
			cellOrderSet.add(cell.key);
		}
		if (cell.section === 'header') {
			notifyLayout();
			notifyWidth();
		} else {
			scheduleBodyStructureCacheInvalidation();
		}
	}

	function unregisterCell(key: string) {
		defaultFocusKeyCache = undefined;
		const cell = cells.get(key);
		cells.delete(key);
		cellOrderSet.delete(key);
		if (focusedCellKey === key) {
			focusedCellKey = null;
		}
		if (cell?.section === 'header') {
			notifyLayout();
			notifyWidth();
		} else {
			scheduleBodyStructureCacheInvalidation();
		}
	}

	function isCellFocused(key: string) {
		return focusedCellKey === key;
	}

	function getDefaultFocusKey() {
		if (defaultFocusKeyCache !== undefined) {
			return defaultFocusKeyCache;
		}

		for (const rowToken of getOrderedRowTokens('header')) {
			const headerCells = Array.from(cells.values())
				.filter((cell) => cell.section === 'header' && cell.rowToken === rowToken)
				.sort((left, right) => getColumnIndex(left) - getColumnIndex(right));
			const firstHeaderCell = headerCells[0]?.key;
			if (firstHeaderCell) {
				defaultFocusKeyCache = firstHeaderCell;
				return firstHeaderCell;
			}
		}

		for (const rowToken of getOrderedRowTokens('body')) {
			const row = rows.get(rowToken);
			if (isRowDisabled(row?.id, row?.disabled)) continue;
			const bodyCells = getResolvedBodyCellsForRow(rowToken)
				.filter(
					(cell): cell is ResolvedCellTarget & { columnIndex: number } =>
						Boolean(cell.element) && cell.columnIndex !== undefined && !isCellColumnHidden(cell)
				)
				.sort((left, right) => left.columnIndex - right.columnIndex);
			const firstBodyCell = bodyCells[0]?.key;
			if (firstBodyCell) {
				defaultFocusKeyCache = firstBodyCell;
				return firstBodyCell;
			}
		}

		return null;
	}

	function isCellTabStop(key: string) {
		if (focusedCellKey) {
			return focusedCellKey === key;
		}
		if (focusedRowTarget) {
			return false;
		}
		return getDefaultFocusKey() === key;
	}

	function isRowTabStop(token: string) {
		return focusedRowTarget?.rowToken === token;
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
			return getVisibleColumnIndexByToken(cell.columnToken);
		}

		const column = cell.columnIndex !== undefined ? getColumnAt(cell.columnIndex) : undefined;
		if (!column || isColumnHidden(column.id)) return -1;
		return getVisibleColumnIndexByToken(column.token);
	}

	function getCellCoord(cell: ResolvedCellTarget): TableGridCoord | null {
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
					!isCellColumnHidden(entry.cell) &&
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
		const rowsByIndex = new SvelteMap<
			number,
			{ col: number; key: string; element: HTMLElement }[]
		>();
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
		const cell = resolveCellTargetByKey(key);
		if (!cell?.element) return;
		if (
			cell.section === 'body' &&
			isRowDisabled(rows.get(cell.rowToken)?.id, rows.get(cell.rowToken)?.disabled)
		) {
			return;
		}
		focusedRowTarget = null;
		focusedCellKey = key;
		const focusTarget = cell.focusDelegate?.() ?? cell.element;
		focusTarget.focus();
		focusTarget.scrollIntoView?.({ block: 'nearest', inline: 'nearest' });
	}

	function focusRowByToken(token: string, edge: TableRowFocusEdge) {
		const row = rows.get(token);
		if (!row?.element || row.section !== 'body') return;
		if (isRowDisabled(row.id, row.disabled)) return;
		focusedCellKey = null;
		focusedRowTarget = { rowToken: token, edge };
		row.element.focus();
		row.element.scrollIntoView?.({ block: 'nearest', inline: 'nearest' });
	}

	function setFocusedCell(key: string | null) {
		if (focusedCellKey === key && focusedRowTarget === null) return;
		focusedCellKey = key;
		focusedRowTarget = null;
	}

	function setFocusedRow(token: string | null, edge: TableRowFocusEdge = 'start') {
		if (token === null) {
			if (focusedCellKey === null && focusedRowTarget === null) return;
			focusedCellKey = null;
			focusedRowTarget = null;
			return;
		}

		if (
			focusedCellKey === null &&
			focusedRowTarget?.rowToken === token &&
			focusedRowTarget.edge === edge
		) {
			return;
		}

		focusedCellKey = null;
		focusedRowTarget = { rowToken: token, edge };
	}

	function setFocusVisible(visible: boolean) {
		if (focusVisible === visible) return;
		focusVisible = visible;
	}

	function getFocusedCoord() {
		if (!focusedCellKey) return null;
		const cell = resolveCellTargetByKey(focusedCellKey);
		return cell ? getCellCoord(cell) : null;
	}

	function getFocusedRowId() {
		const rowToken = focusedRowTarget?.rowToken ?? resolveCellTargetByKey(focusedCellKey)?.rowToken;
		if (!rowToken) return null;
		const row = rows.get(rowToken);
		return row?.section === 'body' ? (row.id ?? null) : null;
	}

	function getRowTokenByGlobalIndex(index: number) {
		const headerRows = getOrderedRowTokens('header');
		if (index < headerRows.length) {
			return headerRows[index] ?? null;
		}

		return getOrderedRowTokens('body')[index - headerRows.length] ?? null;
	}

	function getFocusableBodyRowToken(direction: 'start' | 'end') {
		const orderedBodyTokens = getOrderedRowTokens('body');
		const tokens = direction === 'start' ? orderedBodyTokens : [...orderedBodyTokens].reverse();

		for (const token of tokens) {
			const row = rows.get(token);
			if (!row || isRowDisabled(row.id, row.disabled)) continue;
			return token;
		}

		return null;
	}

	function hasSameSelection(left: Set<TableSelectionKey>, right: Set<TableSelectionKey>) {
		if (left.size !== right.size) return false;
		for (const key of left) {
			if (!right.has(key)) return false;
		}
		return true;
	}

	function setSelectedKeys(next: Set<TableSelectionKey>, anchor?: TableSelectionKey | null) {
		const previousSelectedKeys = new SvelteSet(selectedKeys);
		selectedKeys =
			selectionMode === 'none'
				? new SvelteSet()
				: selectionMode === 'single' && next.size > 1
					? new SvelteSet([next.values().next().value as TableSelectionKey])
					: new SvelteSet(next);

		if (selectionMode !== 'none' && disallowEmptySelection && selectedKeys.size === 0) {
			const fallbackKey =
				(anchor !== undefined && anchor !== null && !isRowSelectionDisabled(anchor)
					? anchor
					: previousSelectedKeys.values().next().value) ??
				getFocusedRowId() ??
				getOrderedSelectableRowIds()[0];
			if (
				fallbackKey !== undefined &&
				fallbackKey !== null &&
				!isRowSelectionDisabled(fallbackKey)
			) {
				selectedKeys = new SvelteSet([fallbackKey]);
			}
		}

		const fallbackAnchor = selectedKeys.values().next().value ?? null;
		if (anchor === undefined) {
			selectionAnchorKey = fallbackAnchor;
			return;
		}

		selectionAnchorKey = anchor === null || selectedKeys.has(anchor) ? anchor : fallbackAnchor;
	}

	function replaceSelectionWithRow(id: TableSelectionKey | undefined) {
		if (id === undefined || isRowSelectionDisabled(id)) return;
		const next = new SvelteSet([id]);
		if (hasSameSelection(selectedKeys, next)) {
			setSelectedKeys(next, id);
			notifySelection();
			return;
		}
		setSelectedKeys(next, id);
		emitSelectionChange();
	}

	function applySelectionChange(next: Set<TableSelectionKey>, anchor?: TableSelectionKey | null) {
		const previousSelection = new SvelteSet(selectedKeys);
		const previousAnchor = selectionAnchorKey;
		setSelectedKeys(next, anchor);
		if (!hasSameSelection(previousSelection, selectedKeys)) {
			emitSelectionChange();
			return;
		}
		if (!hasSameSelection(next, selectedKeys) || previousAnchor !== selectionAnchorKey) {
			notifySelection();
		}
	}

	function toggleSelectionForRow(id: TableSelectionKey | undefined) {
		if (id === undefined || isRowSelectionDisabled(id)) return;
		if (selectionMode === 'single') {
			const wasSelected = selectedKeys.has(id);
			applySelectionChange(
				selectionBehavior === 'toggle' && wasSelected ? new SvelteSet() : new SvelteSet([id]),
				selectionBehavior === 'toggle' && wasSelected ? null : id
			);
			return;
		}
		const next = new SvelteSet(selectedKeys);
		if (next.has(id)) {
			next.delete(id);
		} else {
			next.add(id);
		}
		applySelectionChange(next, id);
	}

	function extendSelectionToRow(
		id: TableSelectionKey | undefined,
		anchorOverride?: TableSelectionKey | null
	) {
		if (id === undefined || isRowSelectionDisabled(id)) return;
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
		applySelectionChange(new SvelteSet(orderedIds.slice(start, end + 1)), anchor);
	}

	function performRowAction(id: TableSelectionKey | undefined) {
		if (!onRowAction || id === undefined || isRowActionDisabled(id)) return;
		onRowAction(id);
	}

	function hasActiveSelection() {
		return selectedKeys.size > 0;
	}

	function pressRowSelection(
		id: TableSelectionKey | undefined,
		interaction: TableSelectionInteraction = {}
	) {
		if (selectionMode === 'none' || id === undefined || isRowSelectionDisabled(id)) return;

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

	function pressRow(
		id: TableSelectionKey | undefined,
		source: TableRowPressSource,
		interaction: TableSelectionInteraction = {},
		localDisabled = false
	) {
		if (id === undefined) return;
		if (isRowDisabled(id, localDisabled)) return;

		if (source === 'keyboard-enter') {
			if (onRowAction) {
				performRowAction(id);
				return;
			}
			pressRowSelection(id, interaction);
			return;
		}

		if (source === 'keyboard-space') {
			if (interaction.shiftKey) {
				extendSelectionToRow(id);
				return;
			}
			if (interaction.ctrlKey || interaction.metaKey) {
				toggleSelectionForRow(id);
				return;
			}
			toggleRowSelection(id);
			return;
		}

		if (source === 'pointer-double') {
			if (onRowAction && selectionMode !== 'none' && selectionBehavior === 'replace') {
				performRowAction(id);
			}
			return;
		}

		if (!onRowAction) {
			pressRowSelection(id, interaction);
			return;
		}

		if (selectionMode === 'none') {
			performRowAction(id);
			return;
		}

		if (selectionBehavior === 'replace') {
			pressRowSelection(id, interaction);
			return;
		}

		if (hasActiveSelection()) {
			pressRowSelection(id, interaction);
			return;
		}

		performRowAction(id);
	}

	function isRtlLayout() {
		if (!IS_BROWSER) return false;
		const cellElement = Array.from(cells.values()).find((cell) => cell.element)?.element;
		const target = cellElement?.closest('table') ?? cellElement;
		return isRtl(target);
	}

	function moveFocus(
		direction: 'up' | 'down' | 'left' | 'right',
		interaction: TableSelectionInteraction = {}
	) {
		// ArrowLeft/ArrowRight are physical: in RTL layouts the visually next
		// cell is the previous one in DOM order, so invert before navigating.
		if ((direction === 'left' || direction === 'right') && isRtlLayout()) {
			direction = direction === 'left' ? 'right' : 'left';
		}

		const rowMap = getRowsWithCells();
		const currentCoord = getFocusedCoord();
		const rowIndexes = Array.from(rowMap.keys()).sort((a, b) => a - b);
		if (rowIndexes.length === 0) return;
		const previousFocusedRowId = getFocusedRowId();

		function maybeSyncSelectionAfterFocus() {
			if (direction !== 'up' && direction !== 'down') return;
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
			if (focusedRowTarget) {
				const currentRowIndex = getGlobalRowIndex(focusedRowTarget.rowToken);
				if (currentRowIndex < 0) return;

				if (direction === 'left' || direction === 'right') {
					const rowCells = rowMap.get(currentRowIndex) ?? [];
					if (focusedRowTarget.edge === 'start') {
						if (direction === 'right') {
							focusCellByKey(getClosestCellKey(currentRowIndex, -1));
							return;
						}

						focusCellByKey(rowCells[rowCells.length - 1]?.key ?? null);
						return;
					}

					if (direction === 'left') {
						focusCellByKey(rowCells[rowCells.length - 1]?.key ?? null);
						return;
					}

					focusCellByKey(getClosestCellKey(currentRowIndex, -1));
					return;
				}

				const rowPosition = rowIndexes.indexOf(currentRowIndex);
				const targetRowIndex =
					direction === 'up' ? rowIndexes[rowPosition - 1] : rowIndexes[rowPosition + 1];
				if (targetRowIndex === undefined) return;

				const targetRowToken = getRowTokenByGlobalIndex(targetRowIndex);
				const targetRow = targetRowToken ? rows.get(targetRowToken) : null;
				if (targetRow?.section === 'body' && !isRowDisabled(targetRow.id, targetRow.disabled)) {
					focusRowByToken(targetRowToken!, focusedRowTarget.edge);
				} else if (focusedRowTarget.edge === 'start') {
					focusCellByKey(getClosestCellKey(targetRowIndex, -1));
				} else {
					const targetRowCells = rowMap.get(targetRowIndex) ?? [];
					focusCellByKey(targetRowCells[targetRowCells.length - 1]?.key ?? null);
				}

				maybeSyncSelectionAfterFocus();
				return;
			}

			const firstKey = getClosestCellKey(rowIndexes[0], 0);
			focusCellByKey(firstKey);
			maybeSyncSelectionAfterFocus();
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
				return;
			}

			const currentCell = resolveCellTargetByKey(focusedCellKey);
			if (currentCell?.section === 'body') {
				focusRowByToken(currentCell.rowToken, direction === 'left' ? 'start' : 'end');
			}
			return;
		}

		const rowPosition = rowIndexes.indexOf(currentCoord.row);
		const targetRowIndex =
			direction === 'up' ? rowIndexes[rowPosition - 1] : rowIndexes[rowPosition + 1];
		if (targetRowIndex === undefined) return;
		const targetKey = getClosestCellKey(targetRowIndex, currentCoord.col);
		focusCellByKey(targetKey);
		maybeSyncSelectionAfterFocus();
	}

	function moveToRowStart() {
		if (focusedRowTarget) {
			const rowIndex = getGlobalRowIndex(focusedRowTarget.rowToken);
			if (rowIndex < 0) return;
			focusCellByKey(getClosestCellKey(rowIndex, -1));
			return;
		}

		const currentCoord = getFocusedCoord();
		if (!currentCoord) {
			moveToGridStart();
			return;
		}
		focusCellByKey(getClosestCellKey(currentCoord.row, -1));
	}

	function moveToRowEnd() {
		const rowMap = getRowsWithCells();
		if (focusedRowTarget) {
			const rowIndex = getGlobalRowIndex(focusedRowTarget.rowToken);
			if (rowIndex < 0) return;
			const rowCells = rowMap.get(rowIndex) ?? [];
			focusCellByKey(rowCells[rowCells.length - 1]?.key ?? null);
			return;
		}

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

	function moveToBodyRowStart() {
		const targetToken = getFocusableBodyRowToken('start');
		if (!targetToken) return;
		focusRowByToken(targetToken, focusedRowTarget?.edge ?? 'start');
	}

	function moveToBodyRowEnd() {
		const targetToken = getFocusableBodyRowToken('end');
		if (!targetToken) return;
		focusRowByToken(targetToken, focusedRowTarget?.edge ?? 'end');
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
		options.onSelectionChange?.(new SvelteSet(selectedKeys));
		notifySelection();
	}

	function toggleRowSelection(id: TableSelectionKey | undefined) {
		if (selectionMode === 'none' || id === undefined || isRowSelectionDisabled(id)) return;

		if (selectionMode === 'single') {
			const wasSelected = selectedKeys.has(id);
			applySelectionChange(
				wasSelected ? new SvelteSet() : new SvelteSet([id]),
				wasSelected ? null : id
			);
			return;
		}

		const next = new SvelteSet(selectedKeys);
		if (next.has(id)) {
			next.delete(id);
		} else {
			next.add(id);
		}
		applySelectionChange(next, id);
	}

	function selectAllRows() {
		if (selectionMode !== 'multiple') return;
		const next = new SvelteSet<TableSelectionKey>(getOrderedSelectableRowIds());
		applySelectionChange(next, next.values().next().value ?? null);
	}

	function deselectAllRows() {
		if (selectedKeys.size === 0) return;
		applySelectionChange(new SvelteSet(), null);
	}

	function setSelection(keys: Iterable<TableSelectionKey>) {
		const previousSelection = new SvelteSet(selectedKeys);
		const previousAnchor = selectionAnchorKey;
		const next = new SvelteSet(keys);
		const preservedAnchor =
			selectionAnchorKey !== null && next.has(selectionAnchorKey) ? selectionAnchorKey : undefined;
		setSelectedKeys(next, preservedAnchor);
		if (!hasSameSelection(previousSelection, selectedKeys)) {
			emitSelectionChange();
			return;
		}
		if (previousAnchor !== selectionAnchorKey) {
			notifySelection();
		}
	}

	function setSelectionMode(mode: TableSelectionMode) {
		const previousSelectedKeys = new SvelteSet(selectedKeys);
		const previousAnchor = selectionAnchorKey;
		selectionMode = mode;
		setSelectedKeys(new SvelteSet(selectedKeys), selectionAnchorKey);
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

	function setDisabledBehavior(behavior: TableDisabledBehavior) {
		disabledBehavior = behavior;
		invalidateLayoutCaches();
		reconcileFocusAfterDisabledStateChange();
		notifyLayout();
		notifySelection();
	}

	function setDisallowEmptySelection(disallow: boolean) {
		disallowEmptySelection = disallow;
		const previousSelection = new SvelteSet(selectedKeys);
		setSelectedKeys(new SvelteSet(selectedKeys), selectionAnchorKey);
		if (!hasSameSelection(previousSelection, selectedKeys)) {
			emitSelectionChange();
			return;
		}
		notifySelection();
	}

	function setDisabledKeys(keys?: Iterable<TableSelectionKey>) {
		const previousSelectableBodyRowCount = selectableBodyRowCount;
		disabledKeys.clear();
		if (keys) {
			for (const key of keys) {
				disabledKeys.add(key);
			}
		}
		recomputeSelectableBodyRowCount();
		invalidateLayoutCaches();
		reconcileFocusAfterDisabledStateChange();
		notifyLayout();
		if (
			selectedKeys.size > 0 ||
			(bodyRowsInitialized &&
				(previousSelectableBodyRowCount === 0) !== (selectableBodyRowCount === 0))
		) {
			notifySelection();
		}
	}

	function setRowActionHandler(handler?: TableRowActionHandler) {
		onRowAction = handler;
		notifySelection();
	}

	function hasSameSortDescriptor(
		left: TableSortDescriptor | undefined,
		right: TableSortDescriptor | undefined
	) {
		if (left === right) return true;
		if (!left || !right) return false;
		return left.column === right.column && left.direction === right.direction;
	}

	function setSortDescriptor(descriptor: TableSortDescriptor | undefined) {
		if (hasSameSortDescriptor(sortDescriptor, descriptor)) return;
		sortDescriptor = descriptor;
		options.onSortChange?.(descriptor);
		invalidateLayoutCaches();
	}

	function isColumnSortable(columnId: string) {
		const token = columnIds.get(columnId);
		return token ? columnsWithSortTriggers.has(token) : false;
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

	// State-mutating commands are wrapped in `asCommand` (untrack) so callers
	// inside $effect / $derived contexts do not register the mutated state as a
	// dependency of their own reactive scope (prop-sync + registration effects
	// would otherwise loop or clobber fresh state with stale props).
	return {
		get layoutEpoch() {
			return layoutEpoch;
		},
		get selectionEpoch() {
			return selectionEpoch;
		},
		get widthEpoch() {
			return widthEpoch;
		},
		createInstanceToken,
		get selectionMode() {
			return selectionMode;
		},
		get selectionBehavior() {
			return selectionBehavior;
		},
		get disabledBehavior() {
			return disabledBehavior;
		},
		get disallowEmptySelection() {
			return disallowEmptySelection;
		},
		get selectionUnavailableDescriptionId() {
			return selectionUnavailableDescriptionId;
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
		registerColumn: asCommand(registerColumn),
		unregisterColumn: asCommand(unregisterColumn),
		registerColumnSortTrigger: asCommand(registerColumnSortTrigger),
		unregisterColumnSortTrigger: asCommand(unregisterColumnSortTrigger),
		registerColumnResizer: asCommand(registerColumnResizer),
		unregisterColumnResizer: asCommand(unregisterColumnResizer),
		getColumnCount,
		getVisibleColumnCount,
		getColumnAt,
		getColumnLayoutAt,
		getColumnIndexByToken,
		getVisibleColumnIndexByToken,
		getColumnTextValue,
		getColumnWidth,
		getColumnWidthStyle,
		hasAuthoredColumnWidthSpec,
		getColumnMinWidth,
		getColumnMaxWidth,
		getColumnPin,
		getColumnPinState,
		isColumnHidden,
		isColumnResizable,
		getColumnWidths,
		getVisibleColumnWidths,
		getResolvedVisibleColumnWidths,
		hasRelativeVisibleColumnWidths,
		refreshMeasuredLayout: asCommand(refreshMeasuredLayout),
		notifyLayoutChange: asCommand(notifyLayoutChange),
		setColumnWidths: asCommand(setColumnWidths),
		setColumnWidth: asCommand(setColumnWidth),
		setHiddenColumns: asCommand(setHiddenColumns),
		measureColumnContentWidth,
		startColumnResize: asCommand(startColumnResize),
		endColumnResize: asCommand(endColumnResize),
		suppressHeaderClickOnce,
		consumeHeaderClickSuppression,
		hasResizableColumns,
		registerRow: asCommand(registerRow),
		unregisterRow: asCommand(unregisterRow),
		setLogicalBodyRows: asCommand(setLogicalBodyRows),
		markBodyRowsInitialized: asCommand(markBodyRowsInitialized),
		getHeaderRowCount,
		getBodyRowCount,
		getLogicalBodyRowCount,
		getRowAriaIndex,
		isRowSelected,
		isRowFocused,
		isRowFocusTarget,
		getRowFocusEdge,
		isRowDisabled,
		isRowSelectionDisabled,
		isRowActionDisabled,
		isRowActionable,
		hasSelectableRows,
		getSelectionCheckboxState,
		registerCell: asCommand(registerCell),
		unregisterCell: asCommand(unregisterCell),
		isCellFocused,
		isCellTabStop,
		isRowTabStop,
		focusCellByKey: asCommand(focusCellByKey),
		focusRowByToken: asCommand(focusRowByToken),
		pressRow: asCommand(pressRow),
		setFocusedCell: asCommand(setFocusedCell),
		setFocusedRow: asCommand(setFocusedRow),
		setFocusVisible: asCommand(setFocusVisible),
		moveFocus: asCommand(moveFocus),
		moveToRowStart: asCommand(moveToRowStart),
		moveToRowEnd: asCommand(moveToRowEnd),
		moveToBodyRowStart: asCommand(moveToBodyRowStart),
		moveToBodyRowEnd: asCommand(moveToBodyRowEnd),
		moveToGridStart: asCommand(moveToGridStart),
		moveToGridEnd: asCommand(moveToGridEnd),
		toggleRowSelection: asCommand(toggleRowSelection),
		selectAllRows: asCommand(selectAllRows),
		deselectAllRows: asCommand(deselectAllRows),
		setSelection: asCommand(setSelection),
		setSelectionMode: asCommand(setSelectionMode),
		setSelectionBehavior: asCommand(setSelectionBehavior),
		setDisabledBehavior: asCommand(setDisabledBehavior),
		setDisallowEmptySelection: asCommand(setDisallowEmptySelection),
		setDisabledKeys: asCommand(setDisabledKeys),
		setRowActionHandler: asCommand(setRowActionHandler),
		setSortDescriptor: asCommand(setSortDescriptor),
		toggleSort: asCommand(toggleSort),
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

export function setTableCellContext(context: TableCellContext) {
	setContext(TABLE_CELL_KEY, context);
	return context;
}

export function getTableCellContext() {
	return getContext<TableCellContext | undefined>(TABLE_CELL_KEY);
}

export function useTableCellContext() {
	const context = getTableCellContext();
	if (!context) {
		throw new Error(
			'Table interactive cell parts must be used inside `Table.Cell` or `Table.ColumnHeaderCell`.'
		);
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
