import type { Scale, ScaleSettings } from './types.js';

/** A scale that divides the range into one band per category. */
export type BandScale = Scale & {
	readonly kind: 'band';
	/** The distance from the start of a band to the start of the next band, in pixels. */
	readonly step: number;
	readonly categories: readonly string[];
};

/**
 * Makes a band scale. The values are the indexes of `settings.categories`; the domain is not
 * used. `settings.padding` is the space between two bands, and half of it is at each end. The
 * default is 0.2.
 */
export function scaleBand(
	_domain: readonly [number, number],
	range: readonly [number, number],
	settings: ScaleSettings = { categories: [] }
): BandScale {
	const { categories, padding = 0.2 } = settings;
	const n = categories.length;
	const [r0, r1] = range;
	// A step holds a band and one padding: n bands, n - 1 paddings between, and half at each end.
	const step = (r1 - r0) / Math.max(1, n);
	const bandwidth = Math.abs(step) * (1 - padding);
	const scale = (index: number) => r0 + step * (index + 0.5);
	const name = (index: number) => categories[index] ?? '';
	const indexes = categories.map((_, i) => i);
	return Object.assign(scale, {
		kind: 'band' as const,
		domain: [0, Math.max(0, n - 1)] as const,
		range,
		bandwidth,
		step: Math.abs(step),
		categories,
		invert: (position: number) => Math.max(0, Math.min(n - 1, Math.floor((position - r0) / step))),
		// Each category is a tick. An axis with more categories than room shows every k-th one.
		ticks: (count = n) => indexes.filter((i) => i % Math.max(1, Math.ceil(n / count)) === 0),
		tickFormat: () => name,
		valueFormat: () => name,
		nice: () => [0, Math.max(0, n - 1)] as [number, number]
	});
}
