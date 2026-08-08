/**
 * Scroll lock primitive.
 *
 * Prevents the page from scrolling while an overlay is open. Two layers work
 * together:
 *
 * 1. The document body is pinned (`overflow: hidden` + `position: fixed`), which
 *    freezes the *document* scroller and blocks iOS Safari touch scrolling. The
 *    scrollbar width is compensated so the page doesn't shift.
 *
 * 2. `wheel`/`touchmove` are intercepted in the capture phase and cancelled
 *    unless they target the overlay's own scroll region. Pinning the body is NOT
 *    enough when the scrollable element is an INNER container (e.g. an app shell
 *    whose content scrolls in a pane rather than on `<body>`): hiding body
 *    overflow does nothing to that pane. Cancelling the scroll event itself
 *    freezes any scroller, inner or not — matching React Aria's `usePreventScroll`.
 *    This is why an earlier "body only" lock silently did nothing inside layouts
 *    like the docs shell.
 *
 * Scrolling INSIDE the overlay still works, and scroll chaining from the
 * overlay's inner scroller out to the background is blocked once that scroller
 * reaches its bounds.
 */

let lockCount = 0;
let originalOverflow = '';
let originalPaddingRight = '';
let originalPosition = '';
let originalTop = '';
let originalLeft = '';
let originalRight = '';
let savedScrollX = 0;
let savedScrollY = 0;

// The overlay nodes whose inner scroll regions stay live while the background is
// frozen. A Set (rather than just the lock count) so the event handlers can tell
// an overlay-targeted scroll from a background one.
const overlayNodes = new Set<HTMLElement>();

function getScrollbarWidth(): number {
	return window.innerWidth - document.documentElement.clientWidth;
}

/**
 * When the page reserves a stable scrollbar gutter (`scrollbar-gutter: stable`), hiding the
 * scrollbar does not change the layout width, so the JS padding compensation below must be skipped
 * — adding it would itself shift the page. Read off the root, where the gutter is reserved.
 */
function reservesStableGutter(): boolean {
	return getComputedStyle(document.documentElement)
		.getPropertyValue('scrollbar-gutter')
		.includes('stable');
}

/** The registered overlay node that contains `target`, if any. */
function overlayContaining(target: EventTarget | null): HTMLElement | null {
	if (!(target instanceof Node)) return null;
	for (const node of overlayNodes) {
		if (node.contains(target)) return node;
	}
	return null;
}

function isScrollable(el: Element): boolean {
	const { overflowX, overflowY } = getComputedStyle(el);
	return /(auto|scroll|overlay)/.test(overflowY) || /(auto|scroll|overlay)/.test(overflowX);
}

/** Nearest actually-scrollable element between `target` and `root` (inclusive), or null. */
function scrollableWithin(target: Element, root: HTMLElement): HTMLElement | null {
	let el: Element | null = target;
	while (el) {
		if (
			el instanceof HTMLElement &&
			(el.scrollHeight > el.clientHeight || el.scrollWidth > el.clientWidth) &&
			isScrollable(el)
		) {
			return el;
		}
		if (el === root) break;
		el = el.parentElement;
	}
	return null;
}

function onWheel(event: WheelEvent) {
	if (!event.cancelable) return;
	const overlay = overlayContaining(event.target);
	if (!overlay) {
		// Background scroll — freeze it.
		event.preventDefault();
		return;
	}
	const scroller = scrollableWithin(event.target as Element, overlay);
	if (!scroller) {
		// The overlay has no scroll region of its own; the wheel would chain to the
		// background, so cancel it.
		event.preventDefault();
		return;
	}
	// Otherwise let the inner scroller consume the delta, but cancel once it hits a
	// bound so the scroll doesn't chain out to the frozen background.
	const { deltaX, deltaY } = event;
	if (Math.abs(deltaY) >= Math.abs(deltaX)) {
		const atTop = scroller.scrollTop <= 0;
		const atBottom = scroller.scrollTop + scroller.clientHeight >= scroller.scrollHeight - 1;
		if ((deltaY < 0 && atTop) || (deltaY > 0 && atBottom)) event.preventDefault();
	} else {
		const atLeft = scroller.scrollLeft <= 0;
		const atRight = scroller.scrollLeft + scroller.clientWidth >= scroller.scrollWidth - 1;
		if ((deltaX < 0 && atLeft) || (deltaX > 0 && atRight)) event.preventDefault();
	}
}

function onTouchMove(event: TouchEvent) {
	if (!event.cancelable) return;
	// Leave multi-touch gestures (pinch-zoom) alone.
	if (event.touches.length > 1) return;
	const overlay = overlayContaining(event.target);
	if (!overlay) {
		event.preventDefault();
		return;
	}
	// An inner scroll region present → let the browser scroll it natively; none →
	// block so the touch doesn't scroll the background.
	if (!scrollableWithin(event.target as Element, overlay)) event.preventDefault();
}

function addEventBlockers() {
	document.addEventListener('wheel', onWheel, { passive: false, capture: true });
	document.addEventListener('touchmove', onTouchMove, { passive: false, capture: true });
}

function removeEventBlockers() {
	document.removeEventListener('wheel', onWheel, { capture: true });
	document.removeEventListener('touchmove', onTouchMove, { capture: true });
}

function lock(node: HTMLElement) {
	overlayNodes.add(node);
	if (lockCount === 0) {
		const body = document.body;

		originalOverflow = body.style.overflow;
		originalPaddingRight = body.style.paddingRight;
		originalPosition = body.style.position;
		originalTop = body.style.top;
		originalLeft = body.style.left;
		originalRight = body.style.right;
		savedScrollX = window.scrollX;
		savedScrollY = window.scrollY;

		const scrollbarWidth = getScrollbarWidth();
		const skipCompensation = reservesStableGutter();

		body.style.overflow = 'hidden';
		if (!skipCompensation && scrollbarWidth > 0) {
			body.style.paddingRight = `${scrollbarWidth}px`;
		}

		// `overflow: hidden` alone does not stop touch scrolling on iOS Safari; pinning the body
		// with `position: fixed` does (applied universally rather than UA-sniffed). The negative
		// `top` keeps the page visually at its scroll position; it is restored on unlock.
		body.style.position = 'fixed';
		body.style.top = `${-savedScrollY}px`;
		body.style.left = '0';
		body.style.right = '0';

		addEventBlockers();
	}
	lockCount++;
}

function unlock(node: HTMLElement) {
	overlayNodes.delete(node);
	lockCount--;
	if (lockCount === 0) {
		const body = document.body;

		body.style.overflow = originalOverflow;
		body.style.paddingRight = originalPaddingRight;
		body.style.position = originalPosition;
		body.style.top = originalTop;
		body.style.left = originalLeft;
		body.style.right = originalRight;

		removeEventBlockers();

		// Pinning the body reset the document scroll offset; put the page back where it was.
		window.scrollTo(savedScrollX, savedScrollY);
	}
	lockCount = Math.max(0, lockCount);
}

/**
 * Svelte action that locks scrolling while `enabled`. The `node` it is placed on
 * is treated as the overlay whose inner scroll region stays live; everything
 * else is frozen. Handles multiple nested locks correctly (reference-counted).
 *
 * @example
 * ```svelte
 * <div use:scrollLock={isOpen}>
 *   Modal content
 * </div>
 * ```
 */
export function scrollLock(node: HTMLElement, enabled: boolean = true) {
	if (enabled) {
		lock(node);
	}

	return {
		update(newEnabled: boolean) {
			if (newEnabled && !enabled) {
				lock(node);
			} else if (!newEnabled && enabled) {
				unlock(node);
			}
			enabled = newEnabled;
		},
		destroy() {
			if (enabled) {
				unlock(node);
			}
		}
	};
}

/**
 * Svelte action that keeps a node scrollable while *someone else* holds the lock, without
 * locking anything itself.
 *
 * A non-modal overlay — a combobox listbox, a select menu — locks nothing, so it never
 * registers as a live scroll region. That is fine on its own, and broken inside a modal:
 * the dialog's lock cancels every wheel event outside its own node, and the listbox is
 * portalled to the body rather than nested in the dialog. The list then renders with a
 * scrollbar it refuses to move.
 *
 * Registering the node makes the existing "is this scroll inside an overlay?" check say
 * yes for it too. The lock count is untouched, so this can never keep the page frozen.
 *
 * @example
 * ```svelte
 * <div use:allowScrollWithin={isOpen}>
 *   Listbox portalled out of the dialog
 * </div>
 * ```
 */
export function allowScrollWithin(node: HTMLElement, enabled: boolean = true) {
	const register = (on: boolean) => {
		if (on) {
			overlayNodes.add(node);
		} else {
			overlayNodes.delete(node);
		}
	};

	register(enabled);

	return {
		update(newEnabled: boolean) {
			register(newEnabled);
			enabled = newEnabled;
		},
		destroy() {
			register(false);
		}
	};
}
