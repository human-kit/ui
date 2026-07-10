import type { MenuContext } from './context';

/**
 * "Safe triangle" pointer intent for submenus.
 *
 * When a submenu is open and the pointer moves diagonally from the trigger toward the
 * submenu, the path crosses sibling items. Naively, each sibling's `pointerenter` would
 * close the submenu before the pointer arrives. This tracks the pointer trajectory and,
 * while the pointer is aimed at the open submenu, defers the sibling highlight/close for a
 * short grace period so the user can reach the submenu.
 */
type Point = { x: number; y: number };

const GRACE_MS = 300;
/** Vertical padding added to the submenu's near edge so the triangle is forgiving. */
const EDGE_PADDING = 16;

function cross(p1: Point, p2: Point, p3: Point): number {
	return (p1.x - p3.x) * (p2.y - p3.y) - (p2.x - p3.x) * (p1.y - p3.y);
}

function pointInTriangle(p: Point, a: Point, b: Point, c: Point): boolean {
	const d1 = cross(p, a, b);
	const d2 = cross(p, b, c);
	const d3 = cross(p, c, a);
	const hasNeg = d1 < 0 || d2 < 0 || d3 < 0;
	const hasPos = d1 > 0 || d2 > 0 || d3 > 0;
	return !(hasNeg && hasPos);
}

export type SubmenuIntent = {
	/** Records a pointer move; flushes a pending highlight if the pointer stops aiming. */
	track: (x: number, y: number) => void;
	/** Highlights an item, deferring if the pointer is aimed at the open submenu. */
	request: (point: Point, commit: () => void) => void;
	/** Drops a pending highlight without committing (pointer reached the submenu). */
	cancel: () => void;
};

export function createSubmenuIntent(getActiveChild: () => MenuContext | null): SubmenuIntent {
	let previous: Point | null = null;
	let pending: { commit: () => void } | null = null;
	let timer: ReturnType<typeof setTimeout> | null = null;

	function clearTimer() {
		if (timer !== null) {
			clearTimeout(timer);
			timer = null;
		}
	}

	function commit() {
		const current = pending;
		pending = null;
		clearTimer();
		current?.commit();
	}

	/** Whether `point` lies in the triangle from the previous pointer position to the
	 *  open submenu's near edge — i.e. the pointer is travelling toward the submenu. */
	function isAimingAtSubmenu(point: Point): boolean {
		const rect = getActiveChild()?.contentRef?.getBoundingClientRect();
		if (!rect || rect.width === 0) return false;

		// Without prior movement (or no movement since), there's no trajectory to judge.
		if (!previous || (previous.x === point.x && previous.y === point.y)) return false;
		const apex = previous;
		const submenuOnRight = rect.left >= point.x;
		const nearX = submenuOnRight ? rect.left : rect.right;
		const topCorner = { x: nearX, y: rect.top - EDGE_PADDING };
		const bottomCorner = { x: nearX, y: rect.bottom + EDGE_PADDING };

		return pointInTriangle(point, apex, topCorner, bottomCorner);
	}

	return {
		track(x, y) {
			const point = { x, y };
			if (pending) {
				if (isAimingAtSubmenu(point)) {
					// Still aiming at the submenu: re-arm the grace timer so a long diagonal
					// travel doesn't expire (and commit the highlight/close) mid-flight.
					clearTimer();
					timer = setTimeout(commit, GRACE_MS);
				} else {
					commit();
				}
			}
			previous = point;
		},
		request(point, commitFn) {
			if (getActiveChild() && isAimingAtSubmenu(point)) {
				clearTimer();
				pending = { commit: commitFn };
				timer = setTimeout(commit, GRACE_MS);
			} else {
				pending = null;
				clearTimer();
				commitFn();
			}
			previous = point;
		},
		cancel() {
			pending = null;
			clearTimer();
		}
	};
}
