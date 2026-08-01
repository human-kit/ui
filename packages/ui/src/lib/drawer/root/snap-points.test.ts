import { describe, it, expect } from 'vitest';
import {
	resolveSnapPointSize,
	resolveSnapOffsets,
	findNearestSnapIndex,
	resolveSnapOnRelease
} from './snap-points';

describe('resolveSnapPointSize', () => {
	it('reads a 0–1 number as a fraction of the viewport', () => {
		expect(resolveSnapPointSize(0.5, 800)).toBe(400);
		expect(resolveSnapPointSize(0.25, 800)).toBe(200);
	});

	it('reads 1 as the whole viewport, not one pixel', () => {
		expect(resolveSnapPointSize(1, 800)).toBe(800);
	});

	it('reads a number above 1 as pixels', () => {
		expect(resolveSnapPointSize(320, 800)).toBe(320);
	});

	it('parses css lengths', () => {
		expect(resolveSnapPointSize('148px', 800)).toBe(148);
		expect(resolveSnapPointSize('30rem', 800, 16)).toBe(480);
		expect(resolveSnapPointSize('30rem', 800, 10)).toBe(300);
		expect(resolveSnapPointSize('50%', 800)).toBe(400);
	});

	it('parses a bare numeric string like the numeric form', () => {
		expect(resolveSnapPointSize('0.5', 800)).toBe(400);
		expect(resolveSnapPointSize('320', 800)).toBe(320);
	});

	it('rejects nonsense rather than producing NaN offsets', () => {
		expect(resolveSnapPointSize('half', 800)).toBeNull();
		expect(resolveSnapPointSize(-1, 800)).toBeNull();
		expect(resolveSnapPointSize(Number.NaN, 800)).toBeNull();
	});
});

describe('resolveSnapOffsets', () => {
	it('turns visible sizes into ascending translation offsets', () => {
		// A 600px panel showing 600 / 400 / 150px translates by 0 / 200 / 450.
		expect(resolveSnapOffsets([1, 0.5, '150px'], 800, 600)).toEqual([0, 200, 450]);
	});

	it('clamps a snap point larger than the panel to fully open', () => {
		expect(resolveSnapOffsets([2000], 800, 600)).toEqual([0]);
	});

	it('drops duplicates and unparseable points', () => {
		expect(resolveSnapOffsets([0.5, '400px', 'nope'], 800, 600)).toEqual([200]);
	});

	it('is empty when nothing parses', () => {
		expect(resolveSnapOffsets(['nope'], 800, 600)).toEqual([]);
	});
});

describe('findNearestSnapIndex', () => {
	it('finds the closest offset', () => {
		expect(findNearestSnapIndex([0, 200, 450], 30)).toBe(0);
		expect(findNearestSnapIndex([0, 200, 450], 210)).toBe(1);
		expect(findNearestSnapIndex([0, 200, 450], 400)).toBe(2);
	});

	it('keeps the earlier point on an exact tie', () => {
		expect(findNearestSnapIndex([0, 200], 100)).toBe(0);
	});

	it('reports -1 with no snap points', () => {
		expect(findNearestSnapIndex([], 100)).toBe(-1);
	});
});

describe('resolveSnapOnRelease', () => {
	const offsets = [0, 200, 450];
	const base = { offsets, panelSize: 600, currentIndex: 0 };

	it('settles on the nearest point when released at rest', () => {
		expect(resolveSnapOnRelease({ ...base, offset: 190, velocity: 0 })).toEqual({
			index: 1,
			dismiss: false
		});
	});

	it('follows the flick past the nearest point', () => {
		// 210px out at 1 px/ms projects to ~390 — intent is the next point down.
		const result = resolveSnapOnRelease({ ...base, currentIndex: 1, offset: 210, velocity: 1 });
		expect(result).toEqual({ index: 2, dismiss: false });
	});

	it('goes back up when flicked inward', () => {
		const result = resolveSnapOnRelease({ ...base, currentIndex: 2, offset: 440, velocity: -1.5 });
		expect(result).toEqual({ index: 1, dismiss: false });
	});

	it('limits a flick to the neighbouring point when sequential', () => {
		const result = resolveSnapOnRelease({
			...base,
			currentIndex: 0,
			offset: 20,
			velocity: 3,
			sequential: true
		});
		expect(result.index).toBe(1);
		expect(result.dismiss).toBe(false);
	});

	it('skips ahead without sequential', () => {
		const result = resolveSnapOnRelease({ ...base, currentIndex: 0, offset: 20, velocity: 2 });
		expect(result.index).toBe(2);
	});

	it('dismisses when projected past half the remaining travel', () => {
		// Past the last point (450) plus half of the 150px left: 525.
		const result = resolveSnapOnRelease({
			...base,
			currentIndex: 2,
			offset: 530,
			velocity: 0,
			dismissible: true
		});
		expect(result.dismiss).toBe(true);
	});

	it('does not dismiss when dismissible is off', () => {
		const result = resolveSnapOnRelease({
			...base,
			currentIndex: 2,
			offset: 590,
			velocity: 2,
			dismissible: false
		});
		expect(result.dismiss).toBe(false);
		expect(result.index).toBe(2);
	});

	it('dismisses on a flick from the last point', () => {
		const result = resolveSnapOnRelease({
			...base,
			currentIndex: 2,
			offset: 455,
			velocity: 0.6,
			dismissible: true
		});
		expect(result.dismiss).toBe(true);
	});

	it('does not dismiss on a flick from a higher point — it steps down instead', () => {
		const result = resolveSnapOnRelease({
			...base,
			currentIndex: 0,
			offset: 10,
			velocity: 0.6,
			dismissible: true
		});
		expect(result.dismiss).toBe(false);
	});

	it('reports no snap point when none are configured', () => {
		expect(resolveSnapOnRelease({ ...base, offsets: [], offset: 100, velocity: 0 })).toEqual({
			index: -1,
			dismiss: false
		});
	});
});
