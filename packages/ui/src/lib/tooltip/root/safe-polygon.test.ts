import { describe, expect, it } from 'vitest';
import { buildSafePolygon, isPointInPolygon, isPointInRect } from './safe-polygon';

const content = { left: 100, top: 20, right: 200, bottom: 60 };

describe('buildSafePolygon', () => {
	it('spans from the exit point to the near edge of a panel above the trigger', () => {
		const polygon = buildSafePolygon({ x: 150, y: 80 }, content, 'top', 0);
		expect(polygon).toEqual([
			{ x: 150, y: 80 },
			{ x: 100, y: 60 },
			{ x: 200, y: 60 }
		]);
	});

	it('takes the top edge for a panel below, and the side edges for left and right', () => {
		expect(buildSafePolygon({ x: 150, y: 0 }, content, 'bottom', 0)[1]).toEqual({ x: 100, y: 20 });
		expect(buildSafePolygon({ x: 250, y: 40 }, content, 'left', 0)[1]).toEqual({ x: 200, y: 20 });
		expect(buildSafePolygon({ x: 50, y: 40 }, content, 'right', 0)[1]).toEqual({ x: 100, y: 20 });
	});

	it('widens the far edge by the padding', () => {
		const polygon = buildSafePolygon({ x: 150, y: 80 }, content, 'top', 8);
		expect(polygon[1].x).toBe(92);
		expect(polygon[2].x).toBe(208);
	});
});

describe('isPointInPolygon', () => {
	const triangle = buildSafePolygon({ x: 150, y: 80 }, content, 'top', 0);

	it('holds a point on the way to the panel', () => {
		expect(isPointInPolygon({ x: 150, y: 70 }, triangle)).toBe(true);
		expect(isPointInPolygon({ x: 130, y: 65 }, triangle)).toBe(true);
	});

	it('rejects a point that went to the side', () => {
		expect(isPointInPolygon({ x: 100, y: 75 }, triangle)).toBe(false);
		expect(isPointInPolygon({ x: 150, y: 90 }, triangle)).toBe(false);
	});

	it('holds a point on an edge', () => {
		expect(isPointInPolygon({ x: 150, y: 60 }, triangle)).toBe(true);
		expect(isPointInPolygon({ x: 150, y: 80 }, triangle)).toBe(true);
	});
});

describe('isPointInRect', () => {
	it('holds the edges', () => {
		expect(isPointInRect({ x: 100, y: 20 }, content)).toBe(true);
		expect(isPointInRect({ x: 200, y: 60 }, content)).toBe(true);
		expect(isPointInRect({ x: 201, y: 40 }, content)).toBe(false);
	});
});
