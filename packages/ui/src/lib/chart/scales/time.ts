import { scaleLinear, tickStep, ticks as linearTicks } from './linear.js';
import type { FormatOptions, Scale } from './types.js';

/** A scale that maps dates to positions in proportion, with ticks at calendar boundaries. */
export type TimeScale = Scale & { readonly kind: 'time' };

const SECOND = 1e3;
const MINUTE = 6e4;
const HOUR = 36e5;
const DAY = 864e5;
const YEAR = 31536e6;

// The calendar fields, from the largest to the smallest. A day is stored from 0, as the others.
const FIELDS = ['FullYear', 'Month', 'Date', 'Hours', 'Minutes', 'Seconds'] as const;
type Field = 0 | 1 | 2 | 3 | 4 | 5;
const WEEK = 6; // A pseudo field: seven days from a Sunday.

function get(date: Date, field: Field): number {
	return date[`get${FIELDS[field]}`]() - (field === 2 ? 1 : 0);
}

function set(date: Date, field: Field, value: number) {
	date[`set${FIELDS[field]}`](value + (field === 2 ? 1 : 0));
}

/** The tick intervals: a field and a count of it, with the approximate length in milliseconds. */
const INTERVALS: [Field | typeof WEEK, number, number][] = [
	[5, 1, SECOND],
	[5, 5, 5 * SECOND],
	[5, 15, 15 * SECOND],
	[5, 30, 30 * SECOND],
	[4, 1, MINUTE],
	[4, 5, 5 * MINUTE],
	[4, 15, 15 * MINUTE],
	[4, 30, 30 * MINUTE],
	[3, 1, HOUR],
	[3, 3, 3 * HOUR],
	[3, 6, 6 * HOUR],
	[3, 12, 12 * HOUR],
	[2, 1, DAY],
	[2, 2, 2 * DAY],
	[WEEK, 1, 7 * DAY],
	[1, 1, YEAR / 12],
	[1, 3, YEAR / 4],
	[0, 1, YEAR]
];

/** The interval with the length closest to `span / count`. */
function interval(span: number, count: number): [Field | typeof WEEK, number] | null {
	const target = span / count;
	if (target < SECOND) return null;
	if (target > YEAR) return [0, Math.max(1, tickStep(0, span / YEAR, count))];
	let i = INTERVALS.findIndex(([, , length]) => length >= target);
	if (i < 0) i = INTERVALS.length - 1;
	if (i > 0 && target / INTERVALS[i - 1][2] < INTERVALS[i][2] / target) i--;
	return [INTERVALS[i][0], INTERVALS[i][1]];
}

/** The start of the interval that holds `time`. */
function floor(time: number, field: Field | typeof WEEK, step: number): Date {
	const date = new Date(time);
	const unit: Field = field === WEEK ? 2 : field;
	date.setMilliseconds(0);
	for (let f = unit + 1; f < FIELDS.length; f++) set(date, f as Field, 0);
	const value = get(date, unit);
	set(
		date,
		unit,
		field === WEEK ? value - date.getDay() : value - (((value % step) + step) % step)
	);
	return date;
}

/** Dates at calendar boundaries from `start` to `stop`, about `count` of them. */
export function timeTicks(start: number, stop: number, count = 10): number[] {
	if (!Number.isFinite(start) || !Number.isFinite(stop)) return [];
	if (stop < start) return timeTicks(stop, start, count).reverse();
	const chosen = interval(stop - start, count);
	if (!chosen) return linearTicks(start, stop, count);
	const [field, step] = chosen;
	const unit: Field = field === WEEK ? 2 : field;
	const size = field === WEEK ? 7 : step;
	const out: number[] = [];
	const date = floor(start, field, step);
	if (+date < start) set(date, unit, get(date, unit) + size);
	// The guard stops a loop on an invalid date.
	while (+date <= stop && out.length < 1000) {
		out.push(+date);
		set(date, unit, get(date, unit) + size);
	}
	return out;
}

const formats = new Map<string, Intl.DateTimeFormat>();

function format(locale: string | undefined, options: Intl.DateTimeFormatOptions, value: number) {
	const key = `${locale}|${JSON.stringify(options)}`;
	let formatter = formats.get(key);
	if (!formatter) formats.set(key, (formatter = new Intl.DateTimeFormat(locale, options)));
	return formatter.format(value);
}

/** The label of a tick: only the largest calendar field that changes at the tick. */
function tickLabel(value: number, locale?: string): string {
	const d = new Date(value);
	return format(
		locale,
		d.getSeconds()
			? { hour: 'numeric', minute: '2-digit', second: '2-digit' }
			: d.getMinutes() || d.getHours()
				? { hour: 'numeric', minute: '2-digit' }
				: d.getDate() !== 1
					? { month: 'short', day: 'numeric' }
					: d.getMonth()
						? { month: 'short' }
						: { year: 'numeric' },
		value
	);
}

/**
 * The format of a date in full: as precise as the most precise of `values`. Dates that are all
 * on the first of January show only the year.
 */
function fullFormat(values: number[]): Intl.DateTimeFormatOptions {
	let level = 0;
	for (const value of values) {
		const d = new Date(value);
		level = Math.max(
			level,
			d.getSeconds()
				? 4
				: d.getMinutes() || d.getHours()
					? 3
					: d.getDate() !== 1
						? 2
						: d.getMonth()
							? 1
							: 0
		);
	}
	return [
		{ year: 'numeric' },
		{ month: 'long', year: 'numeric' },
		{ dateStyle: 'medium' },
		{ dateStyle: 'medium', timeStyle: 'short' },
		{ dateStyle: 'medium', timeStyle: 'medium' }
	][level] as Intl.DateTimeFormatOptions;
}

/** Makes a time scale from `domain` (times in milliseconds) to `range`. */
export function scaleTime(
	domain: readonly [number, number],
	range: readonly [number, number]
): TimeScale {
	const linear = scaleLinear(domain, range);
	return Object.assign((value: number) => linear(value), linear, {
		kind: 'time' as const,
		ticks: (count?: number) => timeTicks(domain[0], domain[1], count),
		tickFormat: (_count?: number, locale?: string) => (value: number) => tickLabel(value, locale),
		valueFormat(values: number[], locale?: string, options?: FormatOptions) {
			const resolved = (options as Intl.DateTimeFormatOptions) ?? fullFormat(values);
			return (value: number) => format(locale, resolved, value);
		},
		nice(count = 10): [number, number] {
			const chosen = interval(Math.abs(domain[1] - domain[0]), count);
			if (!chosen) return [domain[0], domain[1]];
			const [field, step] = chosen;
			const start = +floor(domain[0], field, step);
			const end = floor(domain[1], field, step);
			if (+end < domain[1])
				set(
					end,
					field === WEEK ? 2 : field,
					get(end, field === WEEK ? 2 : field) + (field === WEEK ? 7 : step)
				);
			return [start, +end];
		}
	});
}
