/** Two decimals are below the precision of a screen, and they keep the markup short. */
export function round(value: number): number {
	return Math.round(value * 100) / 100;
}

type Position = readonly [number, number];

/**
 * The `d` attribute of a polyline through the points. The line breaks before each index in
 * `breaks`, and around a point with a value that is not finite.
 */
export function linePath(
	points: ReadonlyArray<Position>,
	breaks: ReadonlyArray<number> = []
): string {
	let d = '';
	let open = false;
	points.forEach(([x, y], i) => {
		if (!Number.isFinite(x) || !Number.isFinite(y)) {
			open = false;
			return;
		}
		d += `${open && !breaks.includes(i) ? 'L' : 'M'}${round(x)},${round(y)}`;
		open = true;
	});
	return d;
}

/**
 * The `d` attribute of a filled area between two lines with the same x positions: along `top`,
 * back along `bottom`, and closed. Each part between two `breaks` is a closed area of its own.
 */
export function areaPath(
	top: ReadonlyArray<Position>,
	bottom: ReadonlyArray<Position>,
	breaks: ReadonlyArray<number> = []
): string {
	let d = '';
	[0, ...breaks].forEach((start, part, starts) => {
		const end = starts[part + 1] ?? top.length;
		if (end <= start) return;
		const back = bottom.slice(start, end).reverse();
		d += `${linePath(top.slice(start, end))}L${linePath(back).slice(1)}Z`;
	});
	return d;
}
