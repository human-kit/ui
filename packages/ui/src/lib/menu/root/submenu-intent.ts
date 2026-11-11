import type { MenuContext } from './context';

/**
 * "Safe triangle" pointer intent for submenus.
 *
 * When a submenu is open and the pointer moves diagonally from the trigger toward the
 * submenu, the path crosses sibling items. Naively, each sibling's `pointerenter` would
 * close the submenu before the pointer arrives. This tracks the pointer trajectory and,
 * while the pointer keeps moving toward the open submenu, defers the sibling highlight/close
 * so the user can reach the submenu.
 *
 * The deferral ends as soon as the pointer shows it is not on its way:
 * - it stops: a still pointer sends no `pointermove`, so a short timer stands in for it.
 *   A fixed long timeout would make everyone who wants the sibling wait for it.
 * - it leaves the triangle on two moves in a row. One stray move is forgiven, so a hand
 *   tremor or a jittery trackpad does not drop the submenu mid-travel.
 *
 * Only a mouse aims. Touch and pen have no hover travel, so they highlight at once.
 */
type Point = { x: number; y: number };

/** How long the pointer may go without moving before a deferred highlight commits. Pointer
 *  events arrive once per frame while the pointer moves; 100 ms still holds when a busy page
 *  drops to 30 fps and loses a frame, and it is a third of a fixed 300 ms timeout. */
export const SUBMENU_INTENT_STOP_MS = 100;
/** Consecutive moves outside the triangle that commit a deferred highlight. */
const MAX_MISSES = 2;
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
	/** Highlights an item, deferring if a mouse pointer is aimed at the open submenu. */
	request: (point: Point, commit: () => void, pointerType?: string) => void;
	/** Drops a pending highlight without committing (pointer reached the submenu). */
	cancel: () => void;
};

export function createSubmenuIntent(getActiveChild: () => MenuContext | null): SubmenuIntent {
	let previous: Point | null = null;
	let pending: { commit: () => void } | null = null;
	let misses = 0;
	let timer: ReturnType<typeof setTimeout> | null = null;

	function clearTimer() {
		if (timer !== null) {
			clearTimeout(timer);
			timer = null;
		}
	}

	function armStopTimer() {
		clearTimer();
		timer = setTimeout(commit, SUBMENU_INTENT_STOP_MS);
	}

	function commit() {
		const current = pending;
		pending = null;
		misses = 0;
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
			// The browser sends a `pointermove` at the `pointerenter` coordinates. It has no
			// direction, so it is neither a miss nor progress. The stop timer still runs.
			if (previous && previous.x === x && previous.y === y) return;
			if (pending) {
				if (isAimingAtSubmenu(point)) {
					misses = 0;
					armStopTimer();
				} else {
					misses += 1;
					if (misses >= MAX_MISSES) commit();
					// A forgiven miss keeps the stop timer running: it is not progress.
				}
			}
			previous = point;
		},
		request(point, commitFn, pointerType) {
			const canAim = pointerType !== 'touch' && pointerType !== 'pen';
			if (canAim && getActiveChild() && isAimingAtSubmenu(point)) {
				pending = { commit: commitFn };
				misses = 0;
				armStopTimer();
			} else {
				pending = null;
				misses = 0;
				clearTimer();
				commitFn();
			}
			previous = point;
		},
		cancel() {
			pending = null;
			misses = 0;
			clearTimer();
		}
	};
}
