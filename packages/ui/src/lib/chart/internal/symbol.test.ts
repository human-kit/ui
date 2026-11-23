import { describe, expect, it } from 'vitest';
import { SYMBOLS, symbolPath } from './symbol.js';

/** The area of a closed polygon path made of `M`, `L` and `Z`. */
function polygonArea(d: string): number {
	const points = [...d.matchAll(/[ML](-?[\d.]+),(-?[\d.]+)/g)].map((m) => [+m[1], +m[2]]);
	let sum = 0;
	points.forEach(([x, y], i) => {
		const [nx, ny] = points[(i + 1) % points.length];
		sum += x * ny - nx * y;
	});
	return Math.abs(sum) / 2;
}

describe('symbolPath', () => {
	it('gives each polygon the same area', () => {
		for (const symbol of SYMBOLS) {
			if (symbol === 'circle') continue;
			expect(polygonArea(symbolPath(symbol, 100)), symbol).toBeCloseTo(100, 0);
		}
	});

	it('makes a circle with the radius of the area', () => {
		expect(symbolPath('circle', Math.PI * 16)).toBe('M4,0A4,4 0 1 1 -4,0A4,4 0 1 1 4,0Z');
	});

	it('puts the center of each shape at 0,0', () => {
		for (const symbol of SYMBOLS) {
			if (symbol === 'circle') continue;
			const points = [...symbolPath(symbol, 100).matchAll(/[ML](-?[\d.]+),(-?[\d.]+)/g)];
			const xs = points.map((m) => +m[1]);
			expect(Math.min(...xs) + Math.max(...xs), symbol).toBeCloseTo(0, 1);
		}
	});
});
