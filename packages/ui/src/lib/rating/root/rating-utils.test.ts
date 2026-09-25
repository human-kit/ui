import { describe, expect, it } from 'vitest';
import {
	getRatingItemFill,
	getRatingValueFromPointer,
	normalizeRatingCount,
	normalizeRatingPrecision,
	snapRatingValue
} from './rating-utils';

describe('rating utils', () => {
	it('keeps the precision between 0 and 1', () => {
		expect(normalizeRatingPrecision(0.5)).toBe(0.5);
		expect(normalizeRatingPrecision(0)).toBe(1);
		expect(normalizeRatingPrecision(2)).toBe(1);
		expect(normalizeRatingPrecision(Number.NaN)).toBe(1);
	});

	it('keeps the count a whole number of 1 or more', () => {
		expect(normalizeRatingCount(10)).toBe(10);
		expect(normalizeRatingCount(5.7)).toBe(5);
		expect(normalizeRatingCount(0)).toBe(5);
	});

	it('snaps a value to the scale, without the error of the binary fractions', () => {
		expect(snapRatingValue(2.3, 5, 0.5)).toBe(2.5);
		expect(snapRatingValue(2.2, 5, 0.5)).toBe(2);
		expect(snapRatingValue(0.1 + 0.2, 5, 0.1)).toBe(0.3);
		expect(snapRatingValue(9, 5, 1)).toBe(5);
		expect(snapRatingValue(-3, 5, 1)).toBe(0);
	});

	it('reads the value under the pointer from the left edge, or the right edge in RTL', () => {
		const rect = { left: 0, width: 100 };

		expect(getRatingValueFromPointer(10, rect, { count: 5, precision: 1, rtl: false })).toBe(1);
		expect(getRatingValueFromPointer(45, rect, { count: 5, precision: 1, rtl: false })).toBe(3);
		expect(getRatingValueFromPointer(100, rect, { count: 5, precision: 1, rtl: false })).toBe(5);
		expect(getRatingValueFromPointer(10, rect, { count: 5, precision: 1, rtl: true })).toBe(5);
	});

	it('gives one step to a press on the left edge, and never zero', () => {
		const rect = { left: 0, width: 100 };

		expect(getRatingValueFromPointer(0, rect, { count: 5, precision: 1, rtl: false })).toBe(1);
		expect(getRatingValueFromPointer(0, rect, { count: 5, precision: 0.5, rtl: false })).toBe(0.5);
	});

	it('fills one item from empty to full across one step of the value', () => {
		expect(getRatingItemFill(3, 2)).toBe(0);
		expect(getRatingItemFill(3, 2.5)).toBe(0.5);
		expect(getRatingItemFill(3, 3)).toBe(1);
		expect(getRatingItemFill(3, 4)).toBe(1);
	});
});
