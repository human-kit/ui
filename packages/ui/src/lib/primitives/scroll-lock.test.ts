import { describe, it, expect, afterEach } from 'vitest';
import { allowScrollWithin, scrollLock } from './scroll-lock';

function resetBodyStyles() {
	document.body.style.overflow = '';
	document.body.style.paddingRight = '';
	document.body.style.position = '';
	document.body.style.top = '';
	document.body.style.left = '';
	document.body.style.right = '';
}

describe('scrollLock', () => {
	afterEach(() => {
		resetBodyStyles();
		document.documentElement.style.removeProperty('scrollbar-gutter');
		window.scrollTo(0, 0);
	});

	it('locks the body on enable and restores the original overflow on destroy', () => {
		document.body.style.overflow = 'auto';

		const handle = scrollLock(document.createElement('div'), true);
		expect(document.body.style.overflow).toBe('hidden');

		handle.destroy();
		expect(document.body.style.overflow).toBe('auto');
	});

	it('pins the body with position: fixed so iOS Safari touch scrolling is blocked too', () => {
		const handle = scrollLock(document.createElement('div'), true);

		expect(document.body.style.position).toBe('fixed');
		expect(document.body.style.top).toBe('0px');
		expect(document.body.style.left).toBe('0px');
		expect(document.body.style.right).toBe('0px');

		handle.destroy();
		expect(document.body.style.position).toBe('');
		expect(document.body.style.top).toBe('');
		expect(document.body.style.left).toBe('');
		expect(document.body.style.right).toBe('');
	});

	it('offsets the pinned body by the scroll position and restores it on unlock', async () => {
		const filler = document.createElement('div');
		filler.style.height = '500vh';
		document.body.appendChild(filler);

		try {
			window.scrollTo(0, 150);
			await new Promise((resolve) => requestAnimationFrame(resolve));
			const scrolledY = Math.round(window.scrollY);
			expect(scrolledY).toBeGreaterThan(0);

			const handle = scrollLock(document.createElement('div'), true);
			expect(document.body.style.position).toBe('fixed');
			expect(document.body.style.top).toBe(`${-scrolledY}px`);

			handle.destroy();
			expect(document.body.style.position).toBe('');
			expect(document.body.style.top).toBe('');
			// The scroll position lost by pinning the body is restored on unlock.
			expect(Math.round(window.scrollY)).toBe(scrolledY);
		} finally {
			filler.remove();
		}
	});

	it('skips the padding compensation when the page reserves a stable gutter', () => {
		// With `scrollbar-gutter: stable` the layout width is constant whether or not the scrollbar
		// shows, so compensating would itself shift the page.
		document.documentElement.style.scrollbarGutter = 'stable';

		const handle = scrollLock(document.createElement('div'), true);
		expect(document.body.style.paddingRight).toBe('');

		handle.destroy();
	});

	it('reference-counts nested locks so the first release keeps it locked', () => {
		document.body.style.overflow = 'auto';

		const first = scrollLock(document.createElement('div'), true);
		const second = scrollLock(document.createElement('div'), true);
		expect(document.body.style.overflow).toBe('hidden');
		expect(document.body.style.position).toBe('fixed');

		first.destroy();
		expect(document.body.style.overflow).toBe('hidden');
		expect(document.body.style.position).toBe('fixed');

		second.destroy();
		expect(document.body.style.overflow).toBe('auto');
		expect(document.body.style.position).toBe('');
	});

	it('toggles the lock through update()', () => {
		document.body.style.overflow = 'auto';

		const handle = scrollLock(document.createElement('div'), false);
		expect(document.body.style.overflow).toBe('auto');

		handle.update(true);
		expect(document.body.style.overflow).toBe('hidden');
		expect(document.body.style.position).toBe('fixed');

		handle.update(false);
		expect(document.body.style.overflow).toBe('auto');
		expect(document.body.style.position).toBe('');

		handle.destroy();
	});

	// The body-only lock above passes even when real scrolling is NOT prevented:
	// in a layout whose scroller is an inner pane (not `<body>`), hiding body
	// overflow does nothing. These exercise the actual scroll event so that
	// regression is caught — dispatching a real `wheel` and asserting it is (or is
	// not) cancelled.
	describe('event blocking', () => {
		function wheel(deltaY = 40, deltaX = 0) {
			return new WheelEvent('wheel', { bubbles: true, cancelable: true, deltaY, deltaX });
		}

		function scrollableOverlay() {
			const overlay = document.createElement('div');
			overlay.style.cssText = 'overflow: auto; height: 100px; width: 100px;';
			const content = document.createElement('div');
			content.style.cssText = 'height: 400px; width: 100px;';
			overlay.appendChild(content);
			document.body.appendChild(overlay);
			return { overlay, content };
		}

		it('cancels a wheel that targets the background, so an inner scroll pane cannot scroll behind the overlay', () => {
			const overlay = document.createElement('div');
			const background = document.createElement('div');
			document.body.append(overlay, background);
			const handle = scrollLock(overlay, true);

			try {
				const event = wheel();
				background.dispatchEvent(event);
				expect(event.defaultPrevented).toBe(true);
			} finally {
				handle.destroy();
				overlay.remove();
				background.remove();
			}
		});

		it('lets the overlay scroll its own content while it still has room', () => {
			const { overlay, content } = scrollableOverlay();
			const handle = scrollLock(overlay, true);

			try {
				const event = wheel(40);
				content.dispatchEvent(event);
				// scrollTop is 0 with room below → the inner scroller takes it.
				expect(event.defaultPrevented).toBe(false);
			} finally {
				handle.destroy();
				overlay.remove();
			}
		});

		it('lets a registered non-modal overlay scroll while a modal holds the lock', () => {
			// Un listbox de combobox se portalea fuera del diálogo: sin registrarlo, el
			// bloqueo del diálogo le cancela la rueda y la lista no scrollea.
			const modal = document.createElement('div');
			document.body.appendChild(modal);
			const { overlay, content } = scrollableOverlay();

			const lock = scrollLock(modal, true);
			const allowed = allowScrollWithin(overlay, true);

			try {
				const event = wheel(40);
				content.dispatchEvent(event);
				expect(event.defaultPrevented).toBe(false);
			} finally {
				allowed.destroy();
				lock.destroy();
				overlay.remove();
				modal.remove();
			}
		});

		it('stops allowing it once the non-modal overlay closes', () => {
			const modal = document.createElement('div');
			document.body.appendChild(modal);
			const { overlay, content } = scrollableOverlay();

			const lock = scrollLock(modal, true);
			const allowed = allowScrollWithin(overlay, true);
			allowed.update(false);

			try {
				const event = wheel(40);
				content.dispatchEvent(event);
				expect(event.defaultPrevented).toBe(true);
			} finally {
				allowed.destroy();
				lock.destroy();
				overlay.remove();
				modal.remove();
			}
		});

		it('cancels once the overlay scroller reaches its bound so the scroll does not chain out', () => {
			const { overlay, content } = scrollableOverlay();
			overlay.scrollTop = overlay.scrollHeight; // pin to the bottom
			const handle = scrollLock(overlay, true);

			try {
				const event = wheel(40); // further down would chain to the background
				content.dispatchEvent(event);
				expect(event.defaultPrevented).toBe(true);
			} finally {
				handle.destroy();
				overlay.remove();
			}
		});

		it('cancels a wheel inside a non-scrollable overlay', () => {
			const overlay = document.createElement('div');
			overlay.style.cssText = 'height: 100px; width: 100px;';
			document.body.appendChild(overlay);
			const handle = scrollLock(overlay, true);

			try {
				const event = wheel();
				overlay.dispatchEvent(event);
				expect(event.defaultPrevented).toBe(true);
			} finally {
				handle.destroy();
				overlay.remove();
			}
		});

		it('stops cancelling once unlocked', () => {
			const overlay = document.createElement('div');
			const background = document.createElement('div');
			document.body.append(overlay, background);
			const handle = scrollLock(overlay, true);
			handle.destroy();

			try {
				const event = wheel();
				background.dispatchEvent(event);
				expect(event.defaultPrevented).toBe(false);
			} finally {
				overlay.remove();
				background.remove();
			}
		});
	});
});
