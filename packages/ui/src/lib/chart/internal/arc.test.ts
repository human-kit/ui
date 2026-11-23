import { describe, expect, it } from 'vitest';
import { arcPath, inArc, polar } from './arc.js';

describe('arcPath', () => {
	it('starts a slice at the top and goes clockwise', () => {
		expect(arcPath(0, 10, 0, Math.PI / 2)).toBe('M0,-10A10,10 0 0 1 10,0L0,0Z');
	});

	it('uses the large arc for a slice of more than half of the circle', () => {
		expect(arcPath(0, 10, 0, (3 * Math.PI) / 2)).toBe('M0,-10A10,10 0 1 1 -10,0L0,0Z');
	});

	it('closes a slice of a ring along the inner radius', () => {
		expect(arcPath(5, 10, 0, Math.PI / 2)).toBe('M0,-10A10,10 0 0 1 10,0L5,0A5,5 0 0 0 0,-5Z');
	});

	it('makes a full circle of two half circles', () => {
		expect(arcPath(0, 10, 0, 2 * Math.PI)).toBe('M0,-10A10,10 0 1 1 0,10A10,10 0 1 1 0,-10Z');
	});

	it('makes a full ring with a hole that goes the other way', () => {
		expect(arcPath(5, 10, 0, 2 * Math.PI)).toBe(
			'M0,-10A10,10 0 1 1 0,10A10,10 0 1 1 0,-10ZM0,-5A5,5 0 1 0 0,5A5,5 0 1 0 0,-5Z'
		);
	});

	it('makes a slice with no angle', () => {
		expect(arcPath(0, 10, 1, 1)).toBe(`M${polar(10, 1)}A10,10 0 0 1 ${polar(10, 1)}L0,0Z`);
	});
});

describe('inArc', () => {
	it('finds a position in the slice', () => {
		expect(inArc(0, 10, 0, Math.PI / 2, 5, -5)).toBe(true);
		expect(inArc(0, 10, Math.PI / 2, Math.PI, 5, -5)).toBe(false);
	});

	it('does not find a position in the hole or out of the circle', () => {
		expect(inArc(5, 10, 0, Math.PI / 2, 1, -1)).toBe(false);
		expect(inArc(5, 10, 0, Math.PI / 2, 10, -10)).toBe(false);
	});

	it('puts the line between two slices in the second slice', () => {
		expect(inArc(0, 10, 0, Math.PI / 2, 5, 0)).toBe(false);
		expect(inArc(0, 10, Math.PI / 2, Math.PI, 5, 0)).toBe(true);
	});
});
