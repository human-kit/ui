import { describe, expect, it } from 'vitest';
import { scaleBand } from './band.js';

describe('scaleBand', () => {
	const scale = scaleBand([0, 3], [0, 400], { categories: ['A', 'B', 'C', 'D'] });

	it('gives the middle of each band, and the width of a band', () => {
		expect([0, 1, 2, 3].map(scale)).toEqual([50, 150, 250, 350]);
		expect(scale.step).toBe(100);
		expect(scale.bandwidth).toBe(80);
	});

	it('uses the padding of the settings', () => {
		const wide = scaleBand([0, 1], [0, 200], { categories: ['A', 'B'], padding: 0 });
		expect(wide.bandwidth).toBe(100);
	});

	it('writes the category of an index', () => {
		expect(scale.tickFormat()(2)).toBe('C');
		expect(scale.valueFormat([])(0)).toBe('A');
	});

	it('gives a tick per category, or every k-th category when there is no room', () => {
		expect(scale.ticks()).toEqual([0, 1, 2, 3]);
		expect(scale.ticks(2)).toEqual([0, 2]);
	});

	it('finds the category at a position', () => {
		expect(scale.invert(260)).toBe(2);
		expect(scale.invert(-10)).toBe(0);
	});
});
