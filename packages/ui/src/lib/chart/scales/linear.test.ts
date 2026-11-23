import { describe, expect, it } from 'vitest';
import { nice, scaleLinear, ticks } from './linear.js';

describe('ticks', () => {
	it('gives round values in the span', () => {
		expect(ticks(0, 10, 5)).toEqual([0, 2, 4, 6, 8, 10]);
		expect(ticks(0, 1, 10)).toEqual([0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1]);
		expect(ticks(-3, 7, 5)).toEqual([-2, 0, 2, 4, 6]);
	});

	it('keeps the order of a reversed span', () => {
		expect(ticks(10, 0, 5)).toEqual([10, 8, 6, 4, 2, 0]);
	});

	it('gives one tick for an empty span and none for an invalid one', () => {
		expect(ticks(3, 3)).toEqual([3]);
		expect(ticks(0, NaN)).toEqual([]);
		expect(ticks(0, 1, 0)).toEqual([]);
	});
});

describe('nice', () => {
	it('extends the domain to round values', () => {
		expect(nice([0.3, 9.6], 10)).toEqual([0, 10]);
		expect(nice([43, 187], 5)).toEqual([0, 200]);
		expect(nice([187, 43], 5)).toEqual([200, 0]);
	});
});

describe('scaleLinear', () => {
	it('maps the domain to the range and back', () => {
		const scale = scaleLinear([0, 10], [100, 0]);
		expect(scale(0)).toBe(100);
		expect(scale(2.5)).toBe(75);
		expect(scale.invert(75)).toBe(2.5);
		expect(scale.ticks(2)).toEqual([0, 5, 10]);
	});

	it('puts every value in the middle for an empty domain', () => {
		expect(scaleLinear([5, 5], [0, 100])(5)).toBe(50);
	});
});
