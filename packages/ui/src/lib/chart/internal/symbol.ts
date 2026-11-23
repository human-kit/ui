import { round } from './path.js';

/** The shapes of a dot, in the order that `symbol="auto"` gives them to the series. */
export const SYMBOLS = [
	'circle',
	'square',
	'triangle',
	'diamond',
	'cross',
	'triangle-down'
] as const;

export type ChartSymbol = (typeof SYMBOLS)[number];

const T = Math.sqrt(4 / Math.sqrt(3)); // The side of an equilateral triangle with an area of 1.
const H = (T * Math.sqrt(3)) / 2; // Its height.
const D = Math.SQRT1_2; // Half the diagonal of a square with an area of 1.
const C = Math.sqrt(0.05); // Half the width of an arm of a cross with an area of 1.

/** The corners of each polygon, with an area of 1 and the center at 0,0. */
const POLYGONS: Record<Exclude<ChartSymbol, 'circle'>, number[]> = {
	square: [-0.5, -0.5, 0.5, -0.5, 0.5, 0.5, -0.5, 0.5],
	triangle: [0, (-2 * H) / 3, T / 2, H / 3, -T / 2, H / 3],
	diamond: [0, -D, D, 0, 0, D, -D, 0],
	// prettier-ignore
	cross: [-C, -3 * C, C, -3 * C, C, -C, 3 * C, -C, 3 * C, C, C, C, C, 3 * C, -C, 3 * C, -C, C, -3 * C, C, -3 * C, -C, -C, -C],
	'triangle-down': [0, (2 * H) / 3, -T / 2, -H / 3, T / 2, -H / 3]
};

/**
 * The `d` attribute of a shape with its center at 0,0. All of the shapes with the same `area`
 * have the same area, thus no series looks larger than the others.
 */
export function symbolPath(symbol: ChartSymbol, area: number): string {
	if (symbol === 'circle') {
		const r = round(Math.sqrt(area / Math.PI));
		return `M${r},0A${r},${r} 0 1 1 ${-r},0A${r},${r} 0 1 1 ${r},0Z`;
	}
	const scale = Math.sqrt(area);
	const corners = POLYGONS[symbol].map((value) => round(value * scale));
	let d = '';
	for (let i = 0; i < corners.length; i += 2)
		d += `${i ? 'L' : 'M'}${corners[i]},${corners[i + 1]}`;
	return d + 'Z';
}
