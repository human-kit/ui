import { describe, it, expect } from 'vitest';
import {
	getSwipeAxis,
	getOutwardSign,
	getReleaseVelocity,
	projectRelease,
	applyRubberBand,
	RELEASE_VELOCITY_WINDOW_MS,
	SWIPE_IGNORE_ATTRIBUTE,
	swipeGesture,
	type SwipeSample
} from './swipe-gesture';

describe('swipe-gesture geometry', () => {
	it('maps each side to its travel axis', () => {
		expect(getSwipeAxis('left')).toBe('x');
		expect(getSwipeAxis('right')).toBe('x');
		expect(getSwipeAxis('top')).toBe('y');
		expect(getSwipeAxis('bottom')).toBe('y');
	});

	it('points the outward sign away from the anchored edge', () => {
		// A bottom sheet leaves downward (+y), a top one upward (-y).
		expect(getOutwardSign('bottom')).toBe(1);
		expect(getOutwardSign('top')).toBe(-1);
		expect(getOutwardSign('right')).toBe(1);
		expect(getOutwardSign('left')).toBe(-1);
	});
});

describe('getReleaseVelocity', () => {
	it('is zero without samples', () => {
		expect(getReleaseVelocity([], 100)).toBe(0);
	});

	it('is zero when the finger sat still before lifting', () => {
		const samples: SwipeSample[] = [
			{ time: 0, position: 0 },
			{ time: 50, position: 120 }
		];
		// Newest sample is older than the window — no recent movement.
		expect(getReleaseVelocity(samples, 50 + RELEASE_VELOCITY_WINDOW_MS + 1)).toBe(0);
	});

	it('measures px/ms over the trailing window', () => {
		const samples: SwipeSample[] = [
			{ time: 0, position: 0 },
			{ time: 50, position: 50 },
			{ time: 100, position: 150 }
		];
		// Baseline reaches one sample past the window edge: (150 - 0) / 100.
		expect(getReleaseVelocity(samples, 100)).toBeCloseTo(1.5, 5);
	});

	it('is negative when the panel travelled inward', () => {
		const samples: SwipeSample[] = [
			{ time: 0, position: 80 },
			{ time: 40, position: 20 }
		];
		expect(getReleaseVelocity(samples, 40)).toBeLessThan(0);
	});

	it('reports an infinite flick when samples share a timestamp', () => {
		const samples: SwipeSample[] = [
			{ time: 10, position: 0 },
			{ time: 10, position: 30 }
		];
		expect(getReleaseVelocity(samples, 10)).toBe(Number.POSITIVE_INFINITY);
	});

	it('ignores samples older than the window when a newer baseline exists', () => {
		const samples: SwipeSample[] = [
			{ time: 0, position: 0 },
			{ time: 900, position: 0 },
			{ time: 950, position: 25 },
			{ time: 1000, position: 50 }
		];
		// The stale first sample must not drag the average toward zero.
		expect(getReleaseVelocity(samples, 1000)).toBeCloseTo(0.5, 5);
	});
});

describe('projectRelease', () => {
	it('projects a flick forward by its momentum window', () => {
		expect(projectRelease(100, 1, 200)).toBe(300);
	});

	it('projects backwards for an inward flick', () => {
		expect(projectRelease(100, -0.5, 200)).toBe(0);
	});

	it('leaves the position untouched at rest', () => {
		expect(projectRelease(140, 0)).toBe(140);
	});

	it('carries infinite velocity through as an infinite projection', () => {
		expect(projectRelease(10, Number.POSITIVE_INFINITY)).toBe(Infinity);
		expect(projectRelease(10, Number.NEGATIVE_INFINITY)).toBe(-Infinity);
	});
});

describe('applyRubberBand', () => {
	it('does not resist before the bound', () => {
		expect(applyRubberBand(0, 400)).toBe(0);
		expect(applyRubberBand(-20, 400)).toBe(0);
	});

	it('returns less than the raw overshoot', () => {
		expect(applyRubberBand(100, 400)).toBeLessThan(100);
		expect(applyRubberBand(100, 400)).toBeGreaterThan(0);
	});

	it('stays below the dimension no matter how far the finger travels', () => {
		expect(applyRubberBand(100_000, 400)).toBeLessThan(400);
	});

	it('grows monotonically so the panel keeps tracking the finger', () => {
		const steps = [10, 40, 90, 200, 500].map((value) => applyRubberBand(value, 400));
		for (let index = 1; index < steps.length; index += 1) {
			expect(steps[index]).toBeGreaterThan(steps[index - 1]);
		}
	});

	it('resists harder with a smaller factor', () => {
		expect(applyRubberBand(100, 400, 0.2)).toBeLessThan(applyRubberBand(100, 400, 0.8));
	});

	it('collapses to zero without a dimension to work against', () => {
		expect(applyRubberBand(100, 0)).toBe(0);
	});
});

describe('swipe ignore scoping', () => {
	function setup(attributeValue: string | null) {
		const panel = document.createElement('div');
		const inner = document.createElement('div');
		if (attributeValue !== null) inner.setAttribute(SWIPE_IGNORE_ATTRIBUTE, attributeValue);
		panel.append(inner);
		document.body.append(panel);
		return { panel, inner, cleanup: () => panel.remove() };
	}

	/** Drives a claimed vertical drag and reports whether the gesture ever started. */
	function dragged(node: HTMLElement, target: HTMLElement, pointerType: string) {
		let started = false;
		const action = swipeGesture(node, {
			side: 'bottom',
			onStart: () => {
				started = true;
			}
		});
		const base = { bubbles: true, pointerId: 7, pointerType, isPrimary: true };
		target.dispatchEvent(
			new PointerEvent('pointerdown', { ...base, button: 0, clientX: 0, clientY: 0 })
		);
		window.dispatchEvent(new PointerEvent('pointermove', { ...base, clientX: 0, clientY: 60 }));
		window.dispatchEvent(new PointerEvent('pointerup', { ...base, clientX: 0, clientY: 60 }));
		action.destroy();
		return started;
	}

	it('drags from an unmarked region with either pointer', () => {
		const { panel, inner, cleanup } = setup(null);
		expect(dragged(panel, inner, 'mouse')).toBe(true);
		expect(dragged(panel, inner, 'touch')).toBe(true);
		cleanup();
	});

	it('never drags from a valueless ignored region', () => {
		const { panel, inner, cleanup } = setup('');
		expect(dragged(panel, inner, 'mouse')).toBe(false);
		expect(dragged(panel, inner, 'touch')).toBe(false);
		cleanup();
	});

	it('lets a finger drag a region that only opts out of the mouse', () => {
		// The Drawer.Body case: a mouse drag there is a text selection, a finger drag
		// is the only way to move a sheet from most of its surface.
		const { panel, inner, cleanup } = setup('mouse');
		expect(dragged(panel, inner, 'mouse')).toBe(false);
		expect(dragged(panel, inner, 'touch')).toBe(true);
		expect(dragged(panel, inner, 'pen')).toBe(true);
		cleanup();
	});
});
