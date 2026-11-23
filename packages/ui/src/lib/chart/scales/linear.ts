import type { FormatOptions, Scale } from './types.js';

/** A scale that maps numbers to positions in proportion. */
export type LinearScale = Scale & { readonly kind: 'linear' };

const E10 = Math.sqrt(50);
const E5 = Math.sqrt(10);
const E2 = Math.sqrt(2);

/**
 * The distance between two ticks: 1, 2 or 5 times a power of ten, so that about `count` ticks
 * cover the span.
 */
export function tickStep(start: number, stop: number, count: number): number {
	const raw = Math.abs(stop - start) / Math.max(1, count);
	const power = 10 ** Math.floor(Math.log10(raw));
	const error = raw / power;
	const factor = error >= E10 ? 10 : error >= E5 ? 5 : error >= E2 ? 2 : 1;
	return factor * power;
}

/** Round values from `start` to `stop`, about `count` of them. */
export function ticks(start: number, stop: number, count = 10): number[] {
	if (!(count > 0) || !Number.isFinite(start) || !Number.isFinite(stop)) return [];
	if (start === stop) return [start];
	const reverse = stop < start;
	const [lo, hi] = reverse ? [stop, start] : [start, stop];
	const step = tickStep(lo, hi, count);
	// Integer multiples avoid the drift of repeated additions (0.1 + 0.2).
	const first = Math.ceil(lo / step);
	const last = Math.floor(hi / step);
	// A step below 1 divides: 0.1 is exact as 1 / 10, not as 1 * 0.1.
	const inverse = step < 1 ? Math.round(1 / step) : 0;
	const out: number[] = [];
	for (let i = first; i <= last; i++) out.push(inverse ? i / inverse : i * step);
	return reverse ? out.reverse() : out;
}

/** Extends the domain to round values, so that the first and the last tick are at the ends. */
export function nice(domain: readonly [number, number], count = 10): [number, number] {
	let [start, stop] = domain;
	if (!Number.isFinite(start) || !Number.isFinite(stop) || start === stop) return [start, stop];
	const reverse = stop < start;
	if (reverse) [start, stop] = [stop, start];
	// Two passes: the first extension can change the step.
	for (let i = 0; i < 2; i++) {
		const step = tickStep(start, stop, count);
		start = Math.floor(start / step) * step;
		stop = Math.ceil(stop / step) * step;
	}
	return reverse ? [stop, start] : [start, stop];
}

/** Makes a linear scale from `domain` to `range`. */
export function scaleLinear(
	domain: readonly [number, number],
	range: readonly [number, number]
): LinearScale {
	const [d0, d1] = domain;
	const [r0, r1] = range;
	// An empty domain puts every value in the middle of the range.
	const span = d1 - d0;
	const k = span ? (r1 - r0) / span : 0;
	const scale = (value: number) => (span ? r0 + (value - d0) * k : (r0 + r1) / 2);
	return Object.assign(scale, {
		kind: 'linear' as const,
		domain,
		range,
		bandwidth: 0,
		invert: (position: number) => (k ? d0 + (position - r0) / k : d0),
		ticks: (count?: number) => ticks(d0, d1, count),
		tickFormat(count = 10, locale?: string) {
			// As many decimals as the step has, and not more: 0.5 shows as "0.5", 2 as "2".
			const digits = Math.max(0, -Math.floor(Math.log10(tickStep(d0, d1, count) || 1)));
			const format = new Intl.NumberFormat(locale, {
				minimumFractionDigits: digits,
				maximumFractionDigits: digits
			});
			return (value: number) => format.format(value);
		},
		valueFormat(_values: number[], locale?: string, options?: FormatOptions) {
			const format = new Intl.NumberFormat(locale, options as Intl.NumberFormatOptions);
			return (value: number) => format.format(value);
		},
		nice: (count?: number) => nice(domain, count)
	});
}
