import { describe, it, expect, afterEach } from 'vitest';
import { scrollLock } from './scroll-lock';

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
});
