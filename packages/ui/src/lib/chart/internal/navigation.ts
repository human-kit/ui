/** The place of a point: the index of its series, and its index in that series. */
export type Position = { series: number; index: number };

/** The number of points that `PageUp` and `PageDown` move. */
export const PAGE = 10;

/** The position of a point: its value along the series, and its value across the series. */
export type Place = readonly [number, number];

/**
 * The point in `places` with the value along the series closest to `from`. When two have the
 * same distance, the value across the series breaks the tie. Returns its index, or -1 for an
 * empty list.
 */
function nearest(places: readonly Place[], from: Place): number {
	let best = -1;
	let distance = Infinity;
	let across = Infinity;
	places.forEach(([x, y], i) => {
		const d = Math.abs(x - from[0]);
		const a = Math.abs(y - from[1]);
		if (d < distance || (d === distance && a < across)) [best, distance, across] = [i, d, a];
	});
	return best;
}

/**
 * The position after a key press, or `null` when the key does not move the focus. `series`
 * holds the places of the points of each series, in the order of the keyboard.
 *
 * The keys do not wrap: at the end of a series, `ArrowRight` does nothing.
 */
export function move(
	series: ReadonlyArray<readonly Place[]>,
	from: Position,
	key: string
): Position | null {
	const points = series[from.series];
	if (!points?.length) return null;
	const last = points.length - 1;
	let index = from.index;
	switch (key) {
		case 'ArrowRight':
			index++;
			break;
		case 'ArrowLeft':
			index--;
			break;
		case 'PageDown':
			index += PAGE;
			break;
		case 'PageUp':
			index -= PAGE;
			break;
		case 'Home':
			index = 0;
			break;
		case 'End':
			index = last;
			break;
		case 'ArrowDown':
		case 'ArrowUp': {
			const step = key === 'ArrowDown' ? 1 : -1;
			// Skip the series without points.
			for (let s = from.series + step; s >= 0 && s < series.length; s += step) {
				const target = nearest(series[s], points[from.index]);
				if (target >= 0) return { series: s, index: target };
			}
			return null;
		}
		default:
			return null;
	}
	index = Math.max(0, Math.min(last, index));
	return index === from.index ? null : { series: from.series, index };
}
