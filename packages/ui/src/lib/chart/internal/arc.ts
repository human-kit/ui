import { round } from './path.js';

const TAU = 2 * Math.PI;

/** The position at a radius and an angle. The angle starts at the top and goes clockwise. */
export function polar(r: number, angle: number): [number, number] {
	return [round(r * Math.sin(angle)), round(-r * Math.cos(angle))];
}

/**
 * The `d` attribute of a slice of a ring with its center at 0,0: from the angle `a0` to the
 * angle `a1`, between the radius `r0` and the radius `r1`. A radius `r0` of 0 makes a slice of a
 * pie. A full circle is two half circles, because one arc cannot start and end at one position.
 */
export function arcPath(r0: number, r1: number, a0: number, a1: number): string {
	if (a1 - a0 >= TAU - 1e-9) {
		const ring = (r: number, sweep: number) =>
			`M0,${-r}A${r},${r} 0 1 ${sweep} 0,${r}A${r},${r} 0 1 ${sweep} 0,${-r}Z`;
		// The inner circle goes the other way, thus it makes a hole.
		return ring(round(r1), 1) + (r0 > 0 ? ring(round(r0), 0) : '');
	}
	const large = a1 - a0 > Math.PI ? 1 : 0;
	const side = (r: number, to: number, sweep: number) =>
		`A${round(r)},${round(r)} 0 ${large} ${sweep} ${polar(r, to)}`;
	return (
		`M${polar(r1, a0)}${side(r1, a1, 1)}` +
		(r0 > 0 ? `L${polar(r0, a1)}${side(r0, a0, 0)}` : 'L0,0') +
		'Z'
	);
}

/**
 * Whether a position, from the center, is in the slice. The start angle is in the slice and the
 * end angle is not, thus a position on the line between two slices is in one slice only.
 */
export function inArc(r0: number, r1: number, a0: number, a1: number, x: number, y: number) {
	const r = Math.hypot(x, y);
	const angle = (Math.atan2(x, -y) + TAU) % TAU;
	return r >= r0 && r <= r1 && angle >= a0 && angle < a1;
}
