import type { Snippet } from 'svelte';
import type { HTMLAttributes, SVGAttributes } from 'svelte/elements';
import type { Channel } from './internal/channel.js';
import type {
	ChartContext,
	ChartMargin,
	ChartPoint,
	ChartTick,
	ChartTooltipState,
	ChartValue
} from './root/context.js';
import type { ChartSymbol } from './internal/symbol.js';
import type { FormatOptions, Scale, ScaleType } from './scales/types.js';

export type {
	Channel,
	ChartSymbol,
	ChartContext,
	ChartMargin,
	ChartPoint,
	ChartTick,
	FormatOptions,
	Scale,
	ScaleType,
	ChartTooltipState,
	ChartValue
};

/** The settings of the scale of an axis. */
export type ScaleOptions = {
	/**
	 * The type of scale: `scaleLinear` (the default), `scaleTime` or `scaleBand`. Import the type
	 * from its subpath, thus a chart includes only the scales that it uses.
	 */
	type?: ScaleType;
	/** The values at the two ends. Without it, the root uses the smallest and the largest value. */
	domain?: [number | Date, number | Date];
	/** Extends the domain to round values. The default is the same as for `zero`. */
	nice?: boolean;
	/**
	 * Extends the domain to include zero. A bar starts at zero, thus a bar chart needs it. The
	 * default is `true` for the value axis of a chart with categories on the other axis, and for y
	 * when no axis has categories.
	 */
	zero?: boolean;
	/** The space between two bands of a band scale, as a fraction of a step. The default is 0.2. */
	padding?: number;
};

/**
 * The format of the values of a channel: the options of `Intl.NumberFormat` or
 * `Intl.DateTimeFormat`, or a function that writes the text.
 */
export type ValueFormat = FormatOptions | ((value: ChartValue) => string);

export type ChartRootProps<T> = {
	/** A stable id, from which the component makes its internal ids. Give one on a server. */
	id?: string;
	/** The rows. Each mark uses them when it has no `data` of its own. */
	data?: readonly T[];
	/** The x channel: a field name of the row, or a function of the row. */
	x?: Channel<T, ChartValue>;
	/** The y channel: a field name of the row, or a function of the row. */
	y?: Channel<T, ChartValue>;
	/** The channel that divides the rows into series. Without it, the chart has one series. */
	series?: Channel<T, string>;
	/**
	 * The channel that identifies a row in its series across data updates, for example a date or
	 * an id. Then the focus and the selection stay on the same row when the rows move. Without it,
	 * the key is the row index. When two rows of a series have the same key, that series uses the
	 * row index.
	 */
	key?: Channel<T, ChartValue>;
	/** The x scale. */
	xScale?: ScaleOptions;
	/** The y scale. */
	yScale?: ScaleOptions;
	/** The width of the SVG, in pixels. Without it, the chart follows the width of its container. */
	width?: number;
	/** The height of the SVG, in pixels. The default is 300. */
	height?: number;
	/** The space around the plot, in pixels. */
	margin?: Partial<ChartMargin>;
	/**
	 * The point that has the focus, or `null`. You can bind it with `bind:focused`. The component
	 * writes it; it does not read it.
	 */
	focused?: ChartPoint<T> | null;
	/**
	 * The selected point, or `null`. You can bind it with `bind:selected`. `Enter`, `Space` or a
	 * click selects a point, and a second time clears the selection. The selected point has
	 * `aria-current="true"` and `data-selected`, and so has its cell in `Chart.DataTable`. The
	 * selection follows the key and the series of the point.
	 */
	selected?: ChartPoint<T> | null;
	/** The component calls it when the user activates a point with `Enter`, `Space` or a click. */
	onSelect?: (point: ChartPoint<T>) => void;
	/** The locale of the values in the names and the ticks. The default is the locale of the page. */
	locale?: string;
	/**
	 * The format of the x values in the accessible names and the ticks. Without it, a time scale
	 * shows dates as precise as the data.
	 */
	xFormat?: ValueFormat;
	/** The format of the y values in the accessible names and the ticks. */
	yFormat?: ValueFormat;
	/**
	 * The name of the x channel for a user, for example "Weight (lb)". The name of a point puts it
	 * before the x value. An x axis without a `label` shows it, and the data table uses it as a
	 * column header. Give it when the x values are measures and not positions, as on a scatter plot.
	 */
	xLabel?: string;
	/** The name of the y channel for a user, for example "Fuel economy (mpg)". See `xLabel`. */
	yLabel?: string;
	/** The accessible name of the chart, for when there is no `Chart.Title`. */
	'aria-label'?: string;
	/** The id of the element that gives the chart its name. */
	'aria-labelledby'?: string;
	/** The id of the element that describes the chart, for example a summary of the trend. */
	'aria-describedby'?: string;
	/** The content: the title, the plot and the other parts. */
	children?: Snippet;
	/** The CSS class names of the root element. */
	class?: string;
	/** A bindable reference to the root element. */
	element?: HTMLElement | null;
	/** A bindable reference to the context, for a composition of your own. */
	context?: ChartContext;
} & Omit<
	HTMLAttributes<HTMLElement>,
	'class' | 'children' | 'id' | 'aria-label' | 'aria-labelledby' | 'aria-describedby'
>;

export type ChartTitleProps = Omit<HTMLAttributes<HTMLElement>, 'class'> & {
	/** The CSS class names of the title. */
	class?: string;
};

export type ChartPlotProps = Omit<SVGAttributes<SVGSVGElement>, 'class' | 'role'> & {
	/** The marks and the guides. */
	children?: Snippet;
	/** The CSS class names of the SVG element. */
	class?: string;
	/** A bindable reference to the SVG element. */
	element?: SVGSVGElement | null;
};

/**
 * The data and the channels of a mark. A mark uses the data and the channels of the root, or it
 * has its own `data`. Only a mark with its own `data` can have its own channels: a child cannot
 * get the row type of the root, thus the types can check a field name only against the data of
 * the same component.
 */
export type ChartMarkData<T> =
	| {
			/** The rows of this mark. Without it, the mark uses the data of the root. */
			data: readonly T[];
			/** The x channel of this mark. It needs `data`. Without it, the mark uses the channel of the root. */
			x?: Channel<T, ChartValue>;
			/** The y channel of this mark. It needs `data`. Without it, the mark uses the channel of the root. */
			y?: Channel<T, ChartValue>;
			/** The series channel of this mark. It needs `data`. Without it, the mark uses the channel of the root. */
			series?: Channel<T, string>;
			/** The key channel of this mark. It needs `data`. Without it, the mark uses the channel of the root. */
			key?: Channel<T, ChartValue>;
	  }
	| { data?: undefined; x?: undefined; y?: undefined; series?: undefined; key?: undefined };

export type ChartLineProps<T> = ChartMarkData<T> & {
	/**
	 * The name of the series of this mark, when it has no series channel. The legend, the names of
	 * the points and the data table show it. Give a name to each mark when two marks show two
	 * fields, for example the revenue and the cost.
	 */
	name?: string;
	/** The radius of the point of each row, in pixels. The default is 3. */
	r?: number;
	/** The CSS class names of the group of the mark. */
	class?: string;
};

export type ChartDotProps<T> = ChartMarkData<T> & {
	/**
	 * The name of the series of this mark, when it has no series channel. The legend, the names of
	 * the points and the data table show it.
	 */
	name?: string;
	/**
	 * The radius of a circle, in pixels. The other shapes have the same area as that circle. The
	 * default is 4.
	 */
	r?: number;
	/**
	 * The shape of the dots. `auto` gives each series the next shape of `circle`, `square`,
	 * `triangle`, `diamond`, `cross` and `triangle-down`, thus color does not identify a series
	 * alone. A shape name gives all of the series that shape. The default is `auto`.
	 */
	symbol?: 'auto' | ChartSymbol;
	/** The CSS class names of the group of the mark. */
	class?: string;
};

export type ChartArcProps<T> = ChartMarkData<T> & {
	/**
	 * The name of the series of this mark, when it has no series channel. The names of the slices
	 * and the data table show it. The mark draws only the first series.
	 */
	name?: string;
	/**
	 * The radius of the hole, as a fraction of the radius of the circle. The default is 0: a pie
	 * chart. A value of 0.6 makes a donut chart.
	 */
	inner?: number;
	/**
	 * Shows a text in the middle of each slice. `true` writes the value in the format of the y
	 * channel; a function writes the text of each point. A text that is wider than its slice does
	 * not show. The labels are hidden from assistive technology: the name of each slice already
	 * has the value. The default is `false`.
	 */
	labels?: boolean | ((point: ChartPoint<T>) => string);
	/** The CSS class names of the group of the mark. */
	class?: string;
};

export type ChartAxisProps = {
	/** The side of the plot. The default is `bottom`. `top` and `bottom` show the x scale. */
	position?: 'top' | 'right' | 'bottom' | 'left';
	/** The text of the axis, for example the name and the unit of the values. */
	label?: string;
	/** The length of a tick line, in pixels. The default is 6. */
	tickSize?: number;
	/** The distance between a tick line and its label, in pixels. The default is 3. */
	tickPadding?: number;
	/** The CSS class names of the group of the axis. */
	class?: string;
};

export type ChartGridProps = {
	/** The axis whose ticks give the lines. The default is `y`: horizontal lines. */
	axis?: 'x' | 'y';
	/** The CSS class names of the group of the grid. */
	class?: string;
};

export type ChartRuleProps = {
	/**
	 * The value of the rule: a number, a date, or a category of a band scale. A number or a date
	 * goes into the domain of its axis. A value with no place on the scale makes no line.
	 */
	value: ChartValue;
	/**
	 * The axis of the value. The default is `y`: a horizontal line. `x` makes a vertical line.
	 */
	axis?: 'x' | 'y';
	/**
	 * The text of the rule, for example "Target". The plot shows it at the end of the line. The
	 * description of the plot and the data table give it with the value.
	 */
	label: string;
	/**
	 * A function of a point and the value of the rule. Its text goes at the end of the name of the
	 * point, for example "above target". An empty text adds nothing.
	 */
	compare?: (point: ChartPoint, value: ChartValue) => string;
	/** The CSS class names of the group of the rule. */
	class?: string;
};

export type ChartBarProps<T> = ChartMarkData<T> & {
	/**
	 * The name of the series of this mark, when it has no series channel. The legend, the names of
	 * the points and the data table show it. Give a name to each mark when two marks show two
	 * fields, for example the revenue and the cost.
	 */
	name?: string;
	/** The CSS class names of the group of the mark. */
	class?: string;
	/**
	 * How the bars of two series share a category. `grouped` puts them side by side, and
	 * `stacked` puts them one on the other. The default is `grouped`.
	 */
	layout?: 'grouped' | 'stacked';
	/** The space between the bars of a group, as a fraction of a bar. The default is 0.1. */
	groupPadding?: number;
	/**
	 * The radius of the corners at the end of each bar, in pixels. The corners at zero stay
	 * square. The default is 0. A stacked layout ignores it.
	 */
	radius?: number;
	/**
	 * Shows the value of each bar after its end. `true` writes the value in the format of the
	 * value axis; a function writes the text of each point. The chart makes space for the labels.
	 * The labels are hidden from assistive technology: the name of each bar already has the
	 * value. The default is `false`. A stacked layout ignores it.
	 */
	labels?: boolean | ((point: ChartPoint<T>) => string);
};

export type ChartAreaProps<T> = ChartMarkData<T> & {
	/**
	 * The name of the series of this mark, when it has no series channel. The legend, the names of
	 * the points and the data table show it. Give a name to each mark when two marks show two
	 * fields, for example the revenue and the cost.
	 */
	name?: string;
	/** The CSS class names of the group of the mark. */
	class?: string;
	/** Puts the series one on the other. The default is `false`: each area starts at zero. */
	stacked?: boolean;
	/** The radius of the point of each row, in pixels. The default is 0: the points are hidden. */
	r?: number;
	/** The radius of the point that has the focus, in pixels. The default is 4. */
	focusRadius?: number;
};

export type ChartLegendProps = Omit<HTMLAttributes<HTMLUListElement>, 'class' | 'children'> & {
	/**
	 * The content of an item. It receives the name and the index of the series, and the shape of its
	 * dots when a dot mark shows the series. Without it, an item shows a `data-swatch` element and
	 * the name. For a series with a shape, the swatch holds an SVG of the shape.
	 */
	children?: Snippet<[{ name: string; index: number; symbol: ChartSymbol | undefined }]>;
	/** The CSS class names of the list. */
	class?: string;
};

export type ChartDataTableProps = Omit<HTMLAttributes<HTMLTableElement>, 'class' | 'children'> & {
	/**
	 * `visible` shows the table. `screen-reader` keeps it only in the accessibility tree. The
	 * default is `screen-reader`.
	 */
	visibility?: 'visible' | 'screen-reader';
	/** The caption of the table. Without it, the `Chart.Title` names the table. */
	caption?: string;
	/**
	 * The header of the first column. It is the column of the categories or of the x values. In a
	 * table with a row per point, it is the column of the series. The default is the label or the
	 * name of the field.
	 */
	rowHeader?: string;
	/** The CSS class names of the table. */
	class?: string;
};

export type ChartTooltipProps = Omit<HTMLAttributes<HTMLDivElement>, 'class' | 'children'> & {
	/**
	 * The content. It receives the point, and the x and y values as text. Without it, the tooltip
	 * shows the x value, the series and the y value.
	 */
	children?: Snippet<[ChartTooltipState]>;
	/** The distance between the point and the tooltip, in pixels. The default is 8. */
	offset?: number;
	/**
	 * Moves the tooltip along with the pointer, at the height of the point under it. For a large
	 * mark, as a long bar, whose anchor can be far from the pointer. The point that has the
	 * keyboard focus keeps its tooltip at the point. The default is `false`.
	 */
	follow?: boolean;
	/**
	 * The CSS class names of the tooltip. It has `data-entering` while it opens and `data-exiting`
	 * while it closes, for CSS animations: it closes after the animations end.
	 */
	class?: string;
};
