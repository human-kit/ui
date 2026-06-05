import { describe, it, expect, afterEach } from 'vitest';
import { scrollLock } from './scroll-lock';

describe('scrollLock', () => {
	afterEach(() => {
		document.body.style.overflow = '';
		document.body.style.paddingRight = '';
		document.documentElement.style.removeProperty('scrollbar-gutter');
	});

	it('locks the body on enable and restores the original overflow on destroy', () => {
		document.body.style.overflow = 'auto';

		const handle = scrollLock(document.createElement('div'), true);
		expect(document.body.style.overflow).toBe('hidden');

		handle.destroy();
		expect(document.body.style.overflow).toBe('auto');
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

		first.destroy();
		expect(document.body.style.overflow).toBe('hidden');

		second.destroy();
		expect(document.body.style.overflow).toBe('auto');
	});

	it('toggles the lock through update()', () => {
		document.body.style.overflow = 'auto';

		const handle = scrollLock(document.createElement('div'), false);
		expect(document.body.style.overflow).toBe('auto');

		handle.update(true);
		expect(document.body.style.overflow).toBe('hidden');

		handle.update(false);
		expect(document.body.style.overflow).toBe('auto');

		handle.destroy();
	});
});
