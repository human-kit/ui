/**
 * Scroll lock primitive.
 * Prevents scrolling of the document body.
 */

let lockCount = 0;
let originalOverflow = '';
let originalPaddingRight = '';

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
		originalOverflow = document.body.style.overflow;
		originalPaddingRight = document.body.style.paddingRight;

		const scrollbarWidth = getScrollbarWidth();
		const skipCompensation = reservesStableGutter();

		document.body.style.overflow = 'hidden';
		if (!skipCompensation && scrollbarWidth > 0) {
			document.body.style.paddingRight = `${scrollbarWidth}px`;
		}
	}
	lockCount++;
}

function unlock() {
	lockCount--;
	if (lockCount === 0) {
		document.body.style.overflow = originalOverflow;
		document.body.style.paddingRight = originalPaddingRight;
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
