/**
 * Scroll lock primitive.
 * Prevents scrolling of the document body.
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

function lock() {
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
	}
	lockCount++;
}

function unlock() {
	lockCount--;
	if (lockCount === 0) {
		const body = document.body;

		body.style.overflow = originalOverflow;
		body.style.paddingRight = originalPaddingRight;
		body.style.position = originalPosition;
		body.style.top = originalTop;
		body.style.left = originalLeft;
		body.style.right = originalRight;

		// Pinning the body reset the document scroll offset; put the page back where it was.
		window.scrollTo(savedScrollX, savedScrollY);
	}
	lockCount = Math.max(0, lockCount);
}

/**
 * Svelte action that locks scrolling on the document body.
 * Handles multiple nested scroll locks correctly.
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
		lock();
	}

	return {
		update(newEnabled: boolean) {
			if (newEnabled && !enabled) {
				lock();
			} else if (!newEnabled && enabled) {
				unlock();
			}
			enabled = newEnabled;
		},
		destroy() {
			if (enabled) {
				unlock();
			}
		}
	};
}
