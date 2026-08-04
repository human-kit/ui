import type { CoverageStats, FrameStats, LongTaskStats } from './metrics';

/**
 * `text` writes the value straight into the cell, `wrap` adds the single
 * wrapper element apps use to carry `title` and truncation, `rich` nests one
 * more inside it.
 */
export type BenchCellVariant = 'text' | 'wrap' | 'rich';

export type TableBenchConfig = {
	/** Rows handed to `Table.Body` (the full list, not the rendered window). */
	rows: number;
	/** Data columns, on top of the selection column. */
	columns: number;
	/** `none` skips the selection column entirely. */
	selectionMode: 'none' | 'single' | 'multiple';
	/** How far the roving tab stop reaches into the body. */
	keyboardNavigation: 'grid' | 'row' | 'none';
	/** Whether every data column renders a `Table.ColumnResizer`. */
	resizable: boolean;
	/** Pins the first data column to the left when true. */
	pinFirstColumn: boolean;
	/** Turns `Table.Body`'s fixed-height virtualizer on/off. */
	virtualized: boolean;
	rowHeight: number;
	/** `undefined` uses the component default. */
	overscan: number | undefined;
	/** `rich` renders nested elements per cell, like a real app list. */
	cellVariant: BenchCellVariant;
	/**
	 * Fixed px width per data column. Set it above `viewport / columns` to make
	 * the table overflow horizontally, which is the only case where rendering
	 * off-screen columns costs anything.
	 */
	columnWidth: number | undefined;
	/**
	 * Renders only the columns intersecting the horizontal viewport, with a
	 * spacer column on each side holding the rest of the width. Needs
	 * `columnWidth`; without it every column is already on screen.
	 */
	horizontalWindow: boolean;
	/** Height of the scroll viewport, in px. */
	viewportHeight: number;
};

export type ScenarioName =
	| 'mount'
	| 'scroll-smooth'
	| 'scroll-fast'
	| 'scroll-jump'
	| 'resize-column'
	| 'select-all'
	| 'sort-toggle';

/**
 * Driven from outside the page (real wheel input via CDP) rather than by
 * `run()`, because only genuine compositor-driven scrolling can outrun the
 * main thread — which is exactly what produces the blank rows.
 */
export const WHEEL_SCENARIO = 'scroll-wheel';

export type ScenarioResult = {
	scenario: ScenarioName;
	config: TableBenchConfig;
	/** Frame pacing during the scenario. Absent for one-shot scenarios. */
	frames?: FrameStats;
	/** Blank-viewport measurement. Only meaningful for scroll scenarios. */
	coverage?: CoverageStats;
	longTasks: LongTaskStats;
	/** Synchronous cost of a single update, in ms. Only for one-shot scenarios. */
	syncMs?: number;
	/** Cache-invalidation counters consumed during the scenario. */
	epochs?: { layout: number; width: number; selection: number };
	/** Rows actually present in the DOM when the scenario ended. */
	renderedRows: number;
	durationMs: number;
};

export type TableBenchApi = {
	readonly version: 1;
	getConfig(): TableBenchConfig;
	configure(patch: Partial<TableBenchConfig>): Promise<void>;
	run(scenario: ScenarioName): Promise<ScenarioResult>;
	/** One-off blank-viewport probe, for externally driven scrolling. */
	probeCoverage(): { bandPx: number; blankPx: number; ratio: number } | null;
	/** Resets the scroll offset and starts sampling every animation frame. */
	startWatch(): Promise<void>;
	/** Stops sampling and returns the same shape as an in-page scenario. */
	stopWatch(): ScenarioResult;
};

declare global {
	interface Window {
		__tableBench?: TableBenchApi;
	}
}
