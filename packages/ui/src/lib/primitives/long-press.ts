/**
 * Long press on a touch or pen pointer, for surfaces that expose an alternative
 * action the way a right click does on a mouse.
 *
 * It exists because touch has no `contextmenu` worth relying on: Android Chrome
 * fires it, iOS Safari only does so for a few built-in element types, so a
 * context menu that waits for that event is unreachable on a phone.
 *
 * Two details are what make it survive contact with a real device:
 *
 * 1. The press is abandoned as soon as the finger travels — a long press and the
 *    start of a scroll look identical for the first few hundred milliseconds, and
 *    the one thing worse than no menu is a menu that opens whenever the page is
 *    slow to scroll. Nothing captures the pointer either: capturing it would take
 *    the scroll away from the browser for the whole delay.
 * 2. The `click` and `contextmenu` that the platform emits around the same
 *    gesture are swallowed afterwards. Without that, the same finger press opens
 *    the menu and then immediately dismisses it.
 */

export type LongPressPoint = { x: number; y: number };

/** How long the pointer has to stay down. Matches the platform convention. */
export const LONG_PRESS_DELAY_MS = 500;

/** How far the pointer may drift before the press is treated as a drag/scroll. */
export const LONG_PRESS_MOVE_TOLERANCE_PX = 10;

/**
 * How long the synthetic events that follow a long press are swallowed. Only has
 * to outlive the platform's own emulation, which is immediate in practice; the
 * timeout is there so a gesture that never produces them doesn't leave the
 * listeners armed.
 */
const SUPPRESSION_WINDOW_MS = 700;

/** Whether the pointer moved far enough from where it went down to abandon the press. */
export function hasMovedBeyond(
	start: LongPressPoint,
	current: LongPressPoint,
	tolerance: number
): boolean {
	return Math.hypot(current.x - start.x, current.y - start.y) > tolerance;
}

/**
 * Whether this pointer should be considered for a long press at all.
 *
 * A mouse is excluded on purpose: it already has `contextmenu`, and treating a
 * held left button as a long press would fire on every slow drag.
 */
export function isLongPressPointer(event: PointerEvent): boolean {
	return event.isPrimary && event.button === 0 && event.pointerType !== 'mouse';
}

export type LongPressOptions = {
	/** Whether the action listens at all. */
	enabled?: boolean;
	/** How long the pointer must stay down. Defaults to `LONG_PRESS_DELAY_MS`. */
	delay?: number;
	/** Movement tolerance in px. Defaults to `LONG_PRESS_MOVE_TOLERANCE_PX`. */
	tolerance?: number;
	/** Called once the press is held long enough, with the viewport point of the pointer. */
	onLongPress: (point: LongPressPoint, event: PointerEvent) => void;
};

/**
 * Svelte action: calls `onLongPress` when a touch or pen pointer is held on the
 * node without travelling.
 *
 * @example
 * ```svelte
 * <div use:longPress={{ onLongPress: (point) => openAt(point) }}>…</div>
 * ```
 */
export function longPress(node: HTMLElement, options: LongPressOptions) {
	let currentOptions = options;
	let timer: ReturnType<typeof setTimeout> | null = null;
	let start: LongPressPoint | null = null;
	let pointerId: number | null = null;
	let releaseSuppression: (() => void) | null = null;

	function isEnabled() {
		return currentOptions.enabled ?? true;
	}

	function clearTimer() {
		if (timer === null) return;
		clearTimeout(timer);
		timer = null;
	}

	function stopTracking() {
		clearTimer();
		start = null;
		pointerId = null;
		window.removeEventListener('pointermove', handlePointerMove);
		window.removeEventListener('pointerup', stopTracking);
		window.removeEventListener('pointercancel', stopTracking);
		// Capture, so a scroll inside any container — not just the page — abandons the press.
		window.removeEventListener('scroll', stopTracking, true);
	}

	/**
	 * Swallows the `click` / `contextmenu` the platform emits for the same gesture.
	 * Registered in the capture phase so they never reach the node's own handlers.
	 */
	function suppressFollowingEvents() {
		releaseSuppression?.();

		const suppress = (event: Event) => {
			event.preventDefault();
			event.stopPropagation();
			release();
		};

		function release() {
			clearTimeout(expiry);
			releaseSuppression = null;
			window.removeEventListener('click', suppress, true);
			window.removeEventListener('contextmenu', suppress, true);
		}

		window.addEventListener('click', suppress, true);
		window.addEventListener('contextmenu', suppress, true);
		const expiry = setTimeout(release, SUPPRESSION_WINDOW_MS);
		// Held so `destroy` can drop it: these listeners are on the window, and a
		// surface that goes away mid-gesture must not keep swallowing the page's events.
		releaseSuppression = release;
	}

	function handlePointerMove(event: PointerEvent) {
		if (start === null || event.pointerId !== pointerId) return;
		const tolerance = currentOptions.tolerance ?? LONG_PRESS_MOVE_TOLERANCE_PX;
		if (hasMovedBeyond(start, { x: event.clientX, y: event.clientY }, tolerance)) {
			stopTracking();
		}
	}

	function handlePointerDown(event: PointerEvent) {
		if (!isEnabled() || !isLongPressPointer(event)) return;
		stopTracking();
		start = { x: event.clientX, y: event.clientY };
		pointerId = event.pointerId;

		window.addEventListener('pointermove', handlePointerMove);
		window.addEventListener('pointerup', stopTracking);
		window.addEventListener('pointercancel', stopTracking);
		window.addEventListener('scroll', stopTracking, true);

		timer = setTimeout(() => {
			const point = start;
			stopTracking();
			if (point === null) return;
			suppressFollowingEvents();
			currentOptions.onLongPress(point, event);
		}, currentOptions.delay ?? LONG_PRESS_DELAY_MS);
	}

	node.addEventListener('pointerdown', handlePointerDown);

	return {
		update(newOptions: LongPressOptions) {
			currentOptions = newOptions;
			if (!isEnabled()) stopTracking();
		},
		destroy() {
			stopTracking();
			releaseSuppression?.();
			node.removeEventListener('pointerdown', handlePointerDown);
		}
	};
}
