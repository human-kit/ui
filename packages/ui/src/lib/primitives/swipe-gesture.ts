/**
 * Single-axis pointer drag, for panels that follow the finger and settle on
 * release (drawers, sheets, swipe-to-open edges).
 *
 * The action deliberately owns as little policy as possible: it reports a signed
 * displacement and a release velocity, and leaves clamping, snapping and
 * dismissal thresholds to the caller. Everything that can be decided without a
 * DOM is exported as a pure function so it can be unit-tested directly.
 *
 * Two behaviours are worth calling out, because they are what separates a usable
 * sheet from an infuriating one:
 *
 * 1. The gesture is CLAIMED, not assumed. Nothing happens until the finger has
 *    moved past a small threshold, mostly along the axis, and no scrollable
 *    region between the touch and the panel could have consumed that movement.
 *    Without the last check, a bottom sheet with a scrolling body drags itself
 *    off screen the moment you try to scroll it.
 * 2. `touch-action` is left alone by default. Setting `none` on the panel would
 *    kill native scrolling for every descendant — `touch-action` intersects down
 *    the ancestor chain, so a child cannot opt back in. Horizontal drawers can
 *    safely pass `pan-y` (children keep scrolling vertically, we take the
 *    horizontal axis); vertical ones rely on `preventDefault` once claimed.
 */

export type SwipeSide = 'top' | 'right' | 'bottom' | 'left';
export type SwipeAxis = 'x' | 'y';

/** Axis a panel anchored to `side` travels along. */
export function getSwipeAxis(side: SwipeSide): SwipeAxis {
	return side === 'left' || side === 'right' ? 'x' : 'y';
}

/**
 * Sign of the OUTWARD direction along the axis — the way the panel moves to leave
 * the screen. A bottom drawer exits downward (+y), a left drawer leftward (-x).
 * Displacements reported by the action are already multiplied by this, so
 * "positive means closer to dismissed" holds for every side.
 */
export function getOutwardSign(side: SwipeSide): 1 | -1 {
	return side === 'bottom' || side === 'right' ? 1 : -1;
}

export type SwipeSample = {
	/** `performance.now()` timestamp. */
	time: number;
	/** Outward displacement, in px, at that moment. */
	position: number;
};

/** Window (ms) over which the release velocity is measured. */
export const RELEASE_VELOCITY_WINDOW_MS = 100;

/**
 * Release velocity in px/ms (signed, positive = outward) over the trailing
 * `windowMs` before `now`.
 *
 * Returns `0` when there is no recent movement — no samples, or the newest one is
 * already older than the window, which is what a finger held still before lifting
 * looks like. Samples sharing a timestamp with a non-zero displacement yield
 * `±Infinity`; callers treat that as a flick.
 *
 * (The Clock wheel has a sibling of this function measuring `scrollTop` instead;
 * they are kept separate so gesture work cannot regress the picker.)
 */
export function getReleaseVelocity(
	samples: readonly SwipeSample[],
	now: number,
	windowMs: number = RELEASE_VELOCITY_WINDOW_MS
): number {
	if (samples.length === 0) return 0;

	const newest = samples[samples.length - 1];
	if (now - newest.time > windowMs) return 0;

	// Oldest sample still inside the window.
	let referenceIndex = samples.length - 1;
	while (referenceIndex > 0 && now - samples[referenceIndex - 1].time <= windowMs) {
		referenceIndex -= 1;
	}
	// Only reach OUTSIDE the window when the newest sample is alone in it and
	// there is nothing to measure against. Stepping back unconditionally (as the
	// Clock's sibling does) lets one stale buffered sample stretch the elapsed
	// time and flatten a genuine flick to a crawl.
	if (referenceIndex === samples.length - 1 && referenceIndex > 0) {
		referenceIndex -= 1;
	}

	const reference = samples[referenceIndex];
	const distance = newest.position - reference.position;
	const elapsed = newest.time - reference.time;

	if (elapsed <= 0) {
		if (distance === 0) return 0;
		return distance > 0 ? Number.POSITIVE_INFINITY : Number.NEGATIVE_INFINITY;
	}

	return distance / elapsed;
}

/** How far (ms of travel) a flick is projected past the release point. */
export const RELEASE_MOMENTUM_MS = 180;

/**
 * Where the panel would come to rest if the flick kept its speed for
 * `momentumMs`. Used to pick a snap point that respects intent: a short but fast
 * flick should skip ahead, a long slow drag should not.
 *
 * Infinite velocities (samples with identical timestamps) project to the
 * corresponding infinity, which callers clamp against their own bounds.
 */
export function projectRelease(
	position: number,
	velocity: number,
	momentumMs: number = RELEASE_MOMENTUM_MS
): number {
	if (!Number.isFinite(velocity)) return velocity > 0 ? Infinity : -Infinity;
	return position + velocity * momentumMs;
}

/**
 * Diminishing-returns resistance for dragging past a bound, so the panel keeps
 * moving (the gesture stays alive) without following the finger 1:1.
 *
 * Asymptotic: no matter how far the finger travels, the result stays below
 * `dimension`. `factor` is the initial stiffness — lower is stiffer.
 */
export function applyRubberBand(
	overshoot: number,
	dimension: number,
	factor: number = 0.55
): number {
	if (overshoot <= 0) return 0;
	if (dimension <= 0) return 0;
	return (1 - 1 / ((overshoot * factor) / dimension + 1)) * dimension;
}

/**
 * Marks a subtree as not starting a swipe (sliders, carousels, drag handles).
 *
 * Valueless — or any value other than `"mouse"` — opts the subtree out for every
 * input type. `"mouse"` opts it out for a mouse only, which is how a region can
 * stay swipeable under a finger while a mouse drag inside it selects text: on
 * touch there is no drag-to-select to protect, so the two never compete.
 */
export const SWIPE_IGNORE_ATTRIBUTE = 'data-hk-swipe-ignore';

/** Whether `target` sits in a subtree that opts out of swipes for `pointerType`. */
function isSwipeIgnored(target: Element, pointerType: string): boolean {
	const ignored = target.closest(`[${SWIPE_IGNORE_ATTRIBUTE}]`);
	if (!ignored) return false;
	if (ignored.getAttribute(SWIPE_IGNORE_ATTRIBUTE) === 'mouse') return pointerType === 'mouse';
	return true;
}

export type SwipeMoveState = {
	/** Signed displacement along the axis; positive = outward (toward dismissal). */
	displacement: number;
	event: PointerEvent;
};

export type SwipeEndState = {
	displacement: number;
	/** px/ms along the axis; positive = outward. */
	velocity: number;
	event: PointerEvent;
};

export type SwipeGestureOptions = {
	/** Whether the gesture listens at all. Defaults to `true`. */
	enabled?: boolean;
	/** Side the panel is anchored to; sets the axis and the outward direction. */
	side: SwipeSide;
	/** Axial movement (px) required before the gesture is claimed. */
	threshold?: number;
	/**
	 * `touch-action` written on the node. `null` (the default) leaves it alone —
	 * see the note at the top of this file before passing `none`.
	 */
	touchAction?: string | null;
	/** Fires once the gesture is claimed, not on pointerdown. */
	onStart?: (event: PointerEvent) => void;
	onMove?: (state: SwipeMoveState) => void;
	/** Fires on pointerup, only for a claimed gesture. */
	onEnd?: (state: SwipeEndState) => void;
	/** Fires on pointercancel, only for a claimed gesture. */
	onCancel?: () => void;
};

function isScrollableOn(element: Element, axis: SwipeAxis): boolean {
	const style = getComputedStyle(element);
	const overflow = axis === 'y' ? style.overflowY : style.overflowX;
	return /(auto|scroll|overlay)/.test(overflow);
}

/**
 * Whether a scrollable region between `target` and `node` (inclusive) could
 * absorb a drag of `delta` px along `axis`, and so should keep the gesture.
 *
 * `delta` is raw finger movement, not outward displacement: a finger moving down
 * scrolls the content up, which only a scroller with room above can do.
 */
function scrollerCanConsume(
	target: Element,
	node: HTMLElement,
	axis: SwipeAxis,
	delta: number
): boolean {
	let element: Element | null = target;

	while (element) {
		if (element instanceof HTMLElement && isScrollableOn(element, axis)) {
			if (axis === 'y') {
				const max = element.scrollHeight - element.clientHeight;
				if (max > 0) {
					// Sub-pixel scroll offsets are common on zoomed/HiDPI viewports;
					// the 1px slack keeps "at the bound" from flickering.
					if (delta > 0 && element.scrollTop > 0) return true;
					if (delta < 0 && element.scrollTop < max - 1) return true;
				}
			} else {
				const max = element.scrollWidth - element.clientWidth;
				if (max > 0) {
					if (delta > 0 && element.scrollLeft > 0) return true;
					if (delta < 0 && element.scrollLeft < max - 1) return true;
				}
			}
		}

		if (element === node) break;
		element = element.parentElement;
	}

	return false;
}

/**
 * Svelte action wiring a single-axis drag on `node`.
 *
 * @example
 * ```svelte
 * <div use:swipeGesture={{ side: 'bottom', onMove: ({ displacement }) => (offset = displacement) }}>
 * ```
 */
export function swipeGesture(node: HTMLElement, options: SwipeGestureOptions) {
	let current = options;

	let pointerId: number | null = null;
	let startX = 0;
	let startY = 0;
	let startTarget: Element | null = null;
	let claimed = false;
	let samples: SwipeSample[] = [];
	let suppressClickTimer: ReturnType<typeof setTimeout> | null = null;
	let suppressClickListener: ((event: MouseEvent) => void) | null = null;

	function axis(): SwipeAxis {
		return getSwipeAxis(current.side);
	}

	function applyTouchAction() {
		const value = current.touchAction ?? null;
		if (value === null) {
			node.style.removeProperty('touch-action');
			return;
		}
		node.style.touchAction = value;
	}

	/**
	 * Removes the pending click suppression, if any.
	 *
	 * Must also run on `destroy`: the timeout below normally lifts the listener a
	 * macrotask later, but a gesture that ends by unmounting the node never gets
	 * there — and a capture-phase listener left on `window` goes on to swallow the
	 * next click anywhere on the page.
	 */
	function clearClickSuppression() {
		if (suppressClickTimer !== null) {
			clearTimeout(suppressClickTimer);
			suppressClickTimer = null;
		}
		if (suppressClickListener) {
			window.removeEventListener('click', suppressClickListener, true);
			suppressClickListener = null;
		}
	}

	/**
	 * A claimed drag that started on a button must not also activate it on release.
	 * One capture-phase listener, lifted on the next macrotask in case no click ever
	 * follows (a drag that ended outside the element it started on).
	 */
	function suppressNextClick() {
		clearClickSuppression();

		suppressClickListener = (event: MouseEvent) => {
			event.preventDefault();
			event.stopPropagation();
			clearClickSuppression();
		};

		window.addEventListener('click', suppressClickListener, true);
		suppressClickTimer = setTimeout(clearClickSuppression, 0);
	}

	function detachWindowListeners() {
		window.removeEventListener('pointermove', handleMove);
		window.removeEventListener('pointerup', handleUp);
		window.removeEventListener('pointercancel', handleCancel);
	}

	function reset() {
		if (claimed && pointerId !== null && node.hasPointerCapture?.(pointerId)) {
			node.releasePointerCapture(pointerId);
		}
		detachWindowListeners();
		pointerId = null;
		startTarget = null;
		claimed = false;
		samples = [];
	}

	function handleDown(event: PointerEvent) {
		if (current.enabled === false) return;
		// A gesture is already in flight (second finger, or a stale capture).
		if (pointerId !== null) return;
		if (event.pointerType === 'mouse' && event.button !== 0) return;
		if (!(event.target instanceof Element)) return;
		if (isSwipeIgnored(event.target, event.pointerType)) return;

		pointerId = event.pointerId;
		startX = event.clientX;
		startY = event.clientY;
		startTarget = event.target;
		claimed = false;
		samples = [{ time: performance.now(), position: 0 }];

		window.addEventListener('pointermove', handleMove, { passive: false });
		window.addEventListener('pointerup', handleUp);
		window.addEventListener('pointercancel', handleCancel);
	}

	function handleMove(event: PointerEvent) {
		if (pointerId === null || event.pointerId !== pointerId) return;

		const currentAxis = axis();
		const deltaX = event.clientX - startX;
		const deltaY = event.clientY - startY;
		const main = currentAxis === 'x' ? deltaX : deltaY;
		const cross = currentAxis === 'x' ? deltaY : deltaX;

		if (!claimed) {
			const threshold = current.threshold ?? 4;
			if (Math.abs(main) < threshold && Math.abs(cross) < threshold) return;

			// Mostly a cross-axis movement: this is someone else's gesture.
			if (Math.abs(cross) > Math.abs(main)) {
				reset();
				return;
			}

			if (startTarget && scrollerCanConsume(startTarget, node, currentAxis, main)) {
				reset();
				return;
			}

			claimed = true;
			try {
				node.setPointerCapture(pointerId);
			} catch {
				// Capture is an optimisation (it keeps events flowing when the finger
				// leaves the panel); the window listeners work without it.
			}
			current.onStart?.(event);
		}

		const displacement = main * getOutwardSign(current.side);
		samples.push({ time: performance.now(), position: displacement });
		// Keep only what the release-velocity window can still use as a baseline.
		while (samples.length > 2 && performance.now() - samples[1].time > RELEASE_VELOCITY_WINDOW_MS) {
			samples.shift();
		}

		// Stops the browser from turning the claimed drag into a scroll or a
		// text selection. Non-cancelable once a native scroll has begun, which is
		// exactly when we should not be dragging anyway.
		if (event.cancelable) event.preventDefault();

		current.onMove?.({ displacement, event });
	}

	function handleUp(event: PointerEvent) {
		if (pointerId === null || event.pointerId !== pointerId) return;

		const wasClaimed = claimed;
		const displacement =
			(axis() === 'x' ? event.clientX - startX : event.clientY - startY) *
			getOutwardSign(current.side);
		const velocity = getReleaseVelocity(samples, performance.now());

		reset();

		if (!wasClaimed) return;
		suppressNextClick();
		current.onEnd?.({ displacement, velocity, event });
	}

	function handleCancel(event: PointerEvent) {
		if (pointerId === null || event.pointerId !== pointerId) return;
		const wasClaimed = claimed;
		reset();
		if (wasClaimed) current.onCancel?.();
	}

	node.addEventListener('pointerdown', handleDown);
	applyTouchAction();

	return {
		update(newOptions: SwipeGestureOptions) {
			const touchActionChanged = (newOptions.touchAction ?? null) !== (current.touchAction ?? null);
			current = newOptions;
			if (touchActionChanged) applyTouchAction();
			// Disabling mid-gesture must not leave the pointer captured.
			if (current.enabled === false && pointerId !== null) reset();
		},
		destroy() {
			node.removeEventListener('pointerdown', handleDown);
			clearClickSuppression();
			reset();
		}
	};
}
