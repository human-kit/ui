import { describe, expect, it } from 'vitest';

import { computeListWindow, scrollTopForIndex } from './list-virtualizer';

const base = { itemHeight: 30, gap: 2, viewportHeight: 240, count: 1000, scrollTop: 0 };

describe('computeListWindow', () => {
	it('renders a viewport worth of rows plus one partial', () => {
		const window = computeListWindow(base);

		// 240 / 32 = 7.5 -> 8 whole rows on screen, plus one for the partial edge.
		expect(window.from).toBe(0);
		expect(window.to).toBe(8);
	});

	it('sizes the content to the whole list, so the scrollbar tells the truth', () => {
		// 1000 rows of 30 with 2px between them, and no gap trailing the last one.
		expect(computeListWindow(base).contentHeight).toBe(1000 * 32 - 2);
	});

	it('moves the window and the offset with the scroll', () => {
		const window = computeListWindow({ ...base, scrollTop: 320 });

		expect(window.from).toBe(10);
		expect(window.offset).toBe(320);
	});

	it('keeps the offset aligned with the first rendered row', () => {
		const window = computeListWindow({ ...base, scrollTop: 1000, overscan: 4 });

		expect(window.offset).toBe(window.from * 32);
	});

	it('extends the window by the overscan on both sides', () => {
		const plain = computeListWindow({ ...base, scrollTop: 3200 });
		const buffered = computeListWindow({ ...base, scrollTop: 3200, overscan: 5 });

		expect(buffered.from).toBe(plain.from - 5);
		expect(buffered.to).toBe(plain.to + 5);
	});

	it('never runs past either end of the list', () => {
		const top = computeListWindow({ ...base, scrollTop: 0, overscan: 10 });
		expect(top.from).toBe(0);

		const bottom = computeListWindow({ ...base, scrollTop: 1000 * 32, overscan: 10 });
		expect(bottom.to).toBe(999);
	});

	it('renders nothing for an empty list', () => {
		const window = computeListWindow({ ...base, count: 0 });

		expect(window).toEqual({ from: 0, to: -1, offset: 0, contentHeight: 0 });
	});

	// Before the first row is measured there is no height to divide by, and dividing by zero
	// would produce an infinite window — every row rendered at once, which is what
	// virtualizing exists to avoid.
	it('renders nothing until a row height is known', () => {
		expect(computeListWindow({ ...base, itemHeight: 0 }).to).toBe(-1);
	});
});

describe('scrollTopForIndex', () => {
	it('scrolls up to a row above the viewport', () => {
		expect(scrollTopForIndex({ ...base, index: 5, scrollTop: 320 })).toBe(160);
	});

	it('scrolls down just enough to reveal a row below it', () => {
		// Row 20 ends at 20*32 + 30 = 670; the viewport must end there.
		expect(scrollTopForIndex({ ...base, index: 20, scrollTop: 0 })).toBe(670 - 240);
	});

	// Otherwise every focus change would reassign scrollTop and fight the user's own
	// scrolling while the pointer moves over the list.
	it('leaves a visible row alone', () => {
		expect(scrollTopForIndex({ ...base, index: 3, scrollTop: 0 })).toBeNull();
	});

	// `scrollTop` counts from the top of the padding box, the rows start after the padding:
	// ignoring it left the row it had just scrolled to clipped by the edge.
	it('accounts for the scroller padding', () => {
		expect(scrollTopForIndex({ ...base, index: 5, scrollTop: 320, padding: 4 })).toBe(164);
		expect(scrollTopForIndex({ ...base, index: 20, scrollTop: 0, padding: 4 })).toBe(674 - 240);
	});

	it('centres a row when asked to', () => {
		// Row 20 spans 640..670; centring it in a 240px viewport starts at 640 - 105.
		expect(scrollTopForIndex({ ...base, index: 20, scrollTop: 0, align: 'center' })).toBe(535);
	});

	it('never centres past either end of the list', () => {
		expect(scrollTopForIndex({ ...base, index: 0, scrollTop: 500, align: 'center' })).toBe(0);
		expect(scrollTopForIndex({ ...base, index: 999, scrollTop: 0, align: 'center' })).toBe(
			1000 * 32 - 2 - 240
		);
	});

	it('ignores an index outside the list', () => {
		expect(scrollTopForIndex({ ...base, index: -1, scrollTop: 0 })).toBeNull();
		expect(scrollTopForIndex({ ...base, index: 1000, scrollTop: 0 })).toBeNull();
	});
});
