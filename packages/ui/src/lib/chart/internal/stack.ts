/**
 * Puts the series one on the other. Each point has a `key` (the x value) and a `y` value. The
 * function returns the bottom and the top of each point, in the order of the input. Positive
 * values go up from zero and negative values go down from zero, each on their own stack.
 *
 * The order of the series in a stack follows the keyboard: `ArrowDown` goes to the next series,
 * and on a vertical stack the next series is below on the screen. Thus with `vertical`, the first
 * series is on the top of the positive stack and next to zero on the negative stack. Without it,
 * the next series is on the right: the first series is next to zero on the positive stack.
 */
export function stack(
	series: ReadonlyArray<ReadonlyArray<{ key: string | number; y: number }>>,
	vertical: boolean
): [number, number][][] {
	const out: [number, number][][] = series.map(() => []);
	for (const positive of [true, false]) {
		const sums = new Map<string | number, number>();
		const order = series.map((_, s) => s);
		if (positive === vertical) order.reverse();
		for (const s of order) {
			series[s].forEach(({ key, y }, i) => {
				if (y < 0 === positive) return;
				const base = sums.get(key) ?? 0;
				sums.set(key, base + y);
				out[s][i] = [base, base + y];
			});
		}
	}
	return out;
}
