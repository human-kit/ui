import { getContext, setContext } from 'svelte';
import type { Channel } from '../internal/channel.js';
import type { ChartSymbol } from '../internal/symbol.js';
import type { Scale } from '../scales/types.js';

/** A value of a channel: a number, a date, or a category of a band scale. */
export type ChartValue = number | Date | string;

/** One point of the chart, as the focus state and `onSelect` give it. */
export type ChartPoint<T = unknown> = {
	/** The row of the data. */
	datum: T;
	/** The index of the row in the data of its mark. */
	index: number;
	/**
	 * The value that identifies the point in its series across updates, from the `key` channel. A
	 * date is its time.
	 */
	key: string | number;
	/** The name of the series. It is empty when the chart has one series. */
	series: string;
	/** The value of the x channel. */
	x: ChartValue;
	/** The value of the y channel. */
	y: ChartValue;
};

/** The values that a mark adds to the domains of the scales. */
export type ChartExtent = { x?: ChartValue[]; y?: ChartValue[] };

/** The state of the tooltip. */
export type ChartTooltipState<T = unknown> = {
	point: ChartPoint<T>;
	/** The position of the point in the plot, in pixels. */
	x: number;
	y: number;
	/** The x value as text. */
	xText: string;
	/** The y value as text. */
	yText: string;
	/**
	 * Whether the categories of the mark are on the y axis, as in a horizontal bar chart. Then
	 * `yText` names the category and `xText` is the value.
	 */
	horizontal: boolean;
};

/** The points of one series of a mark. */
export type ChartSeries<T = unknown> = {
	name: string;
	points: ChartPoint<T>[];
	/** The indexes in `points` that come after a row without a valid value: a line breaks there. */
	breaks: number[];
};

/** A mark, as it registers with the root. */
export type ChartMark = {
	/** The series of the mark. */
	read: () => ChartSeries[];
	/**
	 * The values that the domains must include in addition to the data of the root: the data of a
	 * mark with data or channels of its own, or the tops of a stack.
	 */
	extent?: () => ChartExtent;
	/** The position in pixels where the tooltip of a point points. */
	anchor: (series: number, index: number) => [number, number];
	/**
	 * The squared distance in pixels from a position on the plot to the shape of a point, for a
	 * mark with points that have an area. Without it, the distance goes to the anchor.
	 */
	distance?: (series: number, index: number, x: number, y: number) => number;
	/**
	 * Whether the categories of the mark are on the y axis. Then the vertical arrows move in a
	 * series, and a name and a table row start with the y value.
	 */
	horizontal?: () => boolean;
	/**
	 * Whether the mark shows each point on its own, as the dot mark does. Then a name starts with the
	 * series, and the data table has one row per point.
	 */
	list?: boolean;
	/**
	 * The shape of the dots of a series, for the legend: its name, and the `d` attribute of a path
	 * with its center at 0,0 that fits in 12 pixels.
	 */
	symbol?: (series: number) => { name: ChartSymbol; d: string };
	/**
	 * The share of a point in the total of its series, as text, for a mark that shows parts of a
	 * whole, as the arc mark does. It is empty when the total is 0. Then the names and the data
	 * table add the share, the legend lists the x values, and all of the arrows move in the series.
	 */
	share?: (point: ChartPoint) => string;
};

/** One series of a mark with points, in the order of the keyboard. */
export type ChartEntry = {
	mark: string;
	series: number;
	points: ChartPoint[];
	horizontal: boolean;
	/** Whether the mark shows parts of a whole: all of the arrows move in the series. */
	share: boolean;
};

/** A tick of an axis. */
export type ChartTick = {
	/** The value, as a number. A date is its time in milliseconds. */
	value: number;
	/** The position on the axis, in pixels. */
	position: number;
	/** The text of the label. */
	label: string;
};

/** The space around the plot, in pixels. */
export type ChartMargin = { top: number; right: number; bottom: number; left: number };

/** The attributes of the element of a point. A mark spreads them on the element. */
export type PointAttributes = {
	id: string;
	role: 'img';
	tabindex: 0 | -1;
	'aria-label': string;
	'aria-current': 'true' | undefined;
	'data-focused': 'true' | undefined;
	'data-focus-visible': 'true' | undefined;
	'data-selected': 'true' | undefined;
};

// The channels of the root are typed by `Chart.Root`; the context does not know `T`.
/* eslint-disable @typescript-eslint/no-explicit-any */
export type ChartContext = {
	/** The instance id. Every id of the parts is made from it. */
	readonly instanceId: string;
	readonly data: readonly any[];
	readonly x: Channel<any, ChartValue> | undefined;
	readonly y: Channel<any, ChartValue> | undefined;
	readonly series: Channel<any, string> | undefined;
	readonly key: Channel<any, ChartValue> | undefined;
	/** The name of the x channel for a user, for example "Weight (lb)", or `undefined`. */
	readonly xLabel: string | undefined;
	/** The name of the y channel for a user, or `undefined`. */
	readonly yLabel: string | undefined;
	/** The locale of the values in names, ticks, the tooltip and the data table. */
	readonly locale: string | undefined;
	/** The size of the SVG, in pixels. */
	readonly width: number;
	/**
	 * Whether the width is not known yet: there is no `width` prop and no measure. On the server and
	 * before the first measure, the SVG fills its container and scales the default width.
	 */
	readonly fluid: boolean;
	readonly height: number;
	readonly margin: ChartMargin;
	readonly xScale: Scale;
	readonly yScale: Scale;
	/** The ticks of each axis. `Chart.Axis` and `Chart.Grid` share them. */
	readonly xTicks: ChartTick[];
	readonly yTicks: ChartTick[];
	/**
	 * Asks for space around the plot, for the labels of an axis. The margin of a side is the
	 * largest space that a part asks for, unless the consumer gives the margin.
	 */
	reserve(needs: Partial<ChartMargin>): {
		update(needs: Partial<ChartMargin>): void;
		unregister(): void;
	};
	/** The id of the `Chart.Title` element, when one is in the DOM. */
	titleId: string | null;
	/** An x value as a number for the x scale: a date is its time, and a category is its index. */
	toX(value: ChartValue): number;
	/** A y value as a number for the y scale. */
	toY(value: ChartValue): number;
	/** Adds a mark. The root reads its functions again each time the data changes. */
	register(mark: ChartMark): { id: string; unregister(): void };
	/** The marks, in mount order. A part reads their series, for example a legend. */
	readonly marks: ReadonlyArray<ChartMark>;
	/** The series of all of the marks with points, in the order of the keyboard. */
	readonly entries: ReadonlyArray<ChartEntry>;
	/** The id of the element of a point. */
	pointId(mark: string, series: number, index: number): string;
	/** The point with the id, or `null`. */
	pointAt(id: string | null): ChartPoint | null;
	/** The entry and the index of the point with the id, or `null`. */
	locate(id: string | null): { entry: ChartEntry; index: number } | null;
	/** The position in pixels where the tooltip of a point points, from its mark. */
	anchor(mark: string, series: number, index: number): [number, number] | null;
	/** The id of the point nearest to a position on the screen, within 40 pixels, or `null`. */
	nearest(clientX: number, clientY: number): string | null;
	/** An x value (as a number for the x scale) as text, in the format of the chart. */
	formatX(value: number): string;
	/** A y value (as a number for the y scale) as text, in the format of the chart. */
	formatY(value: number): string;
	/** The point that has the focus, and whether it shows the focus ring. */
	readonly focus: { id: string | null; visible: boolean };
	/** Whether the point is the selected point. */
	isSelected(point: ChartPoint): boolean;
	/** The SVG element of `Chart.Plot`. */
	plotElement: SVGSVGElement | null;
	/** The attributes of the element of a point. */
	point(mark: string, series: number, index: number, point: ChartPoint): PointAttributes;
	/** The accessible name and description of the chart, for the `Chart.Plot` element. */
	readonly labels: {
		'aria-label': string | undefined;
		'aria-labelledby': string | undefined;
		'aria-describedby': string | undefined;
	};
	/** The handlers of the `Chart.Plot` element. */
	readonly plotHandlers: {
		onkeydown(event: KeyboardEvent): void;
		onfocusin(event: FocusEvent): void;
		onfocusout(event: FocusEvent): void;
		onclick(event: MouseEvent): void;
	};
};
/* eslint-enable @typescript-eslint/no-explicit-any */

const KEY = Symbol('human-kit-chart');

export function setChartContext(context: ChartContext) {
	setContext(KEY, context);
}

/** The context of the closest `Chart.Root`, or `undefined` outside one. */
export function getChartContext(): ChartContext | undefined {
	return getContext<ChartContext | undefined>(KEY);
}

/** The context of the closest `Chart.Root`. It throws outside one. */
export function useChartContext(part: string): ChartContext {
	const context = getChartContext();
	if (!context) throw new Error(`${part} must be inside Chart.Root.`);
	return context;
}
