/**
 * Snap point math for `Drawer.Root`.
 *
 * Kept free of the DOM so the interesting decisions — which point a flick lands
 * on, when a release dismisses instead of snapping — can be tested directly
 * instead of through a synthesised gesture.
 *
 * Two quantities are easy to confuse:
 *
 * - **size**: how much of the panel a snap point leaves visible along its axis.
 *   That is what the consumer writes (`0.5`, `'320px'`).
 * - **offset**: how far the panel is translated OUT from fully open to leave that
 *   much visible — `panelSize - size`. That is what CSS consumes, through
 *   `--drawer-snap-point-offset`. Offsets grow as the drawer closes, matching the
 *   sign of a swipe, so a release can be resolved by comparing plain numbers.
 */

import { projectRelease } from '../../primitives/swipe-gesture';
import type { DrawerSnapPoint } from './types';

/**
 * Visible extent, in px, that `point` asks for.
 *
 * - `0`–`1`: a fraction of the viewport along the axis.
 * - above `1`: pixels.
 * - a string: a CSS length (`'320px'`, `'30rem'`) or a percentage of the viewport.
 *
 * Returns `null` for anything unparseable, so a typo surfaces as a skipped snap
 * point rather than a panel translated by `NaN`.
 */
export function resolveSnapPointSize(
	point: DrawerSnapPoint,
	viewportSize: number,
	rootFontSize: number = 16
): number | null {
	if (typeof point === 'number') {
		if (!Number.isFinite(point) || point < 0) return null;
		// The 0–1 fraction and the pixel range meet at 1, where "1px tall" is never
		// what anyone means; it reads as "the whole viewport".
		return point <= 1 ? point * viewportSize : point;
	}

	const text = point.trim();
	const value = Number.parseFloat(text);
	if (!Number.isFinite(value)) return null;

	if (text.endsWith('%')) return (value / 100) * viewportSize;
	if (text.endsWith('rem')) return value * rootFontSize;
	if (text.endsWith('em')) return value * rootFontSize;
	if (text.endsWith('px')) return value;
	// A bare number inside a string behaves like the numeric form.
	if (/^-?\d*\.?\d+$/.test(text)) return value <= 1 ? value * viewportSize : value;
	return null;
}

/**
 * Translation offsets for `points`, ascending — index 0 is the most open.
 *
 * Duplicates and unparseable entries are dropped, so the resulting array can be
 * indexed safely but is not necessarily the same length as the input.
 */
export function resolveSnapOffsets(
	points: readonly DrawerSnapPoint[],
	viewportSize: number,
	panelSize: number,
	rootFontSize: number = 16
): number[] {
	const offsets: number[] = [];

	for (const point of points) {
		const size = resolveSnapPointSize(point, viewportSize, rootFontSize);
		if (size === null) continue;
		const offset = Math.max(0, panelSize - size);
		if (!offsets.includes(offset)) offsets.push(offset);
	}

	return offsets.sort((a, b) => a - b);
}

/** Index of the snap point closest to `offset`, or `-1` when there are none. */
export function findNearestSnapIndex(offsets: readonly number[], offset: number): number {
	if (offsets.length === 0) return -1;

	let nearest = 0;
	let smallest = Math.abs(offsets[0] - offset);
	for (let index = 1; index < offsets.length; index += 1) {
		const distance = Math.abs(offsets[index] - offset);
		if (distance < smallest) {
			smallest = distance;
			nearest = index;
		}
	}
	return nearest;
}

export type SnapReleaseOptions = {
	/** Outward offset, in px, where the finger let go. */
	offset: number;
	/** Release velocity in px/ms; positive means outward. */
	velocity: number;
	/** Snap offsets, ascending. */
	offsets: readonly number[];
	/** Index the drawer was resting at before the drag. */
	currentIndex: number;
	/** Panel extent along the axis, for the dismissal threshold. */
	panelSize: number;
	/** Restricts the release to the neighbouring snap points. */
	sequential?: boolean;
	/** Whether a release past the last snap point may close the drawer. */
	dismissible?: boolean;
};

export type SnapRelease = {
	/** Snap point to settle on. Meaningless when `dismiss` is true. */
	index: number;
	/** Whether the drawer should close instead of settling. */
	dismiss: boolean;
};

/** Fraction of the remaining travel past the last snap point that dismisses. */
const DISMISS_FRACTION = 0.5;
/** px/ms past which a release counts as a flick regardless of distance. */
const FLICK_VELOCITY = 0.4;

/**
 * Where a release should land.
 *
 * The decision is made on the PROJECTED resting position, not the position the
 * finger left: a short flick means "go further", and snapping to whatever happened
 * to be nearest at lift-off ignores that intent. `sequential` clamps the result to
 * the neighbouring points for drawers where skipping ahead would be disorienting.
 */
export function resolveSnapOnRelease(options: SnapReleaseOptions): SnapRelease {
	const { offset, velocity, offsets, currentIndex, panelSize, sequential, dismissible } = options;

	if (offsets.length === 0) return { index: -1, dismiss: false };

	const projected = projectRelease(offset, velocity);
	const lastOffset = offsets[offsets.length - 1];

	if (dismissible) {
		const remaining = Math.max(0, panelSize - lastOffset);
		const dismissThreshold = lastOffset + remaining * DISMISS_FRACTION;
		const atLastPoint = currentIndex >= offsets.length - 1;
		// A flick only dismisses from the most-closed point; from anywhere else it
		// should still be able to fling the drawer down one step at a time.
		if (projected >= dismissThreshold || (atLastPoint && velocity >= FLICK_VELOCITY)) {
			return { index: offsets.length - 1, dismiss: true };
		}
	}

	const nearest = findNearestSnapIndex(offsets, projected);

	if (!sequential) return { index: nearest, dismiss: false };

	const lowerBound = Math.max(0, currentIndex - 1);
	const upperBound = Math.min(offsets.length - 1, currentIndex + 1);
	return { index: Math.min(Math.max(nearest, lowerBound), upperBound), dismiss: false };
}
