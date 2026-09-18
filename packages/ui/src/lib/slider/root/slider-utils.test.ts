import { describe, expect, it } from 'vitest';
import {
	getDefaultLargeStep,
	getNearestThumbIndex,
	getSliderPercent,
	getSliderValueFromPointer,
	getThumbBounds,
	snapSliderValue
} from './slider-utils';

describe('snapSliderValue', () => {
	it('snaps to the nearest step from min', () => {
		expect(snapSliderValue(44, 0, 100, 10)).toBe(40);
		expect(snapSliderValue(45, 0, 100, 10)).toBe(50);
		expect(snapSliderValue(13, 5, 100, 5)).toBe(15);
	});

	it('keeps a decimal step exact', () => {
		expect(snapSliderValue(0.1 + 0.2, 0, 1, 0.1)).toBe(0.3);
		expect(snapSliderValue(0.35, 0, 1, 0.05)).toBe(0.35);
	});

	it('keeps max reachable when the range is not a multiple of the step', () => {
		expect(snapSliderValue(97, 0, 97, 10)).toBe(97);
		expect(snapSliderValue(200, 0, 97, 10)).toBe(97);
		expect(snapSliderValue(-5, 0, 97, 10)).toBe(0);
	});

	it('falls back to min for a value that is not a number', () => {
		expect(snapSliderValue(Number.NaN, 10, 20, 1)).toBe(10);
	});
});

describe('getSliderPercent', () => {
	it('maps the range to 0..1', () => {
		expect(getSliderPercent(25, 0, 100)).toBe(0.25);
		expect(getSliderPercent(15, 10, 20)).toBe(0.5);
		expect(getSliderPercent(200, 0, 100)).toBe(1);
		expect(getSliderPercent(5, 10, 10)).toBe(0);
	});
});

describe('getSliderValueFromPointer', () => {
	const rect = { left: 100, top: 50, width: 200, height: 20 };

	it('reads a horizontal track from the left', () => {
		expect(
			getSliderValueFromPointer({ clientX: 150, clientY: 60 }, rect, {
				min: 0,
				max: 100,
				orientation: 'horizontal',
				rtl: false
			})
		).toBe(25);
	});

	it('reads a horizontal track from the right in a right-to-left context', () => {
		expect(
			getSliderValueFromPointer({ clientX: 150, clientY: 60 }, rect, {
				min: 0,
				max: 100,
				orientation: 'horizontal',
				rtl: true
			})
		).toBe(75);
	});

	it('reads a vertical track from the bottom', () => {
		const vertical = { left: 100, top: 50, width: 20, height: 200 };
		expect(
			getSliderValueFromPointer({ clientX: 110, clientY: 200 }, vertical, {
				min: 0,
				max: 100,
				orientation: 'vertical',
				rtl: false
			})
		).toBe(25);
	});

	it('clamps a pointer outside the track', () => {
		expect(
			getSliderValueFromPointer({ clientX: 0, clientY: 60 }, rect, {
				min: 0,
				max: 100,
				orientation: 'horizontal',
				rtl: false
			})
		).toBe(0);
	});
});

describe('getNearestThumbIndex', () => {
	it('takes the nearest thumb', () => {
		expect(getNearestThumbIndex([20, 80], 60)).toBe(1);
		expect(getNearestThumbIndex([20, 80], 30)).toBe(0);
	});

	it('takes the thumb that can move toward the pointer when two are at the same distance', () => {
		expect(getNearestThumbIndex([50, 50], 70)).toBe(1);
		expect(getNearestThumbIndex([50, 50], 30)).toBe(0);
		expect(getNearestThumbIndex([40, 60], 50)).toBe(0);
	});
});

describe('getThumbBounds', () => {
	it('keeps a thumb between its neighbors', () => {
		const options = { min: 0, max: 100, step: 1, minStepsBetweenThumbs: 0 };
		expect(getThumbBounds([20, 50, 80], 1, options)).toEqual({ min: 20, max: 80 });
		expect(getThumbBounds([20, 50, 80], 0, options)).toEqual({ min: 0, max: 50 });
		expect(getThumbBounds([20, 50, 80], 2, options)).toEqual({ min: 50, max: 100 });
	});

	it('adds the steps between thumbs', () => {
		const options = { min: 0, max: 100, step: 5, minStepsBetweenThumbs: 2 };
		expect(getThumbBounds([20, 50], 0, options)).toEqual({ min: 0, max: 40 });
		expect(getThumbBounds([20, 50], 1, options)).toEqual({ min: 30, max: 100 });
	});
});

describe('getDefaultLargeStep', () => {
	it('is one tenth of the range, on a step', () => {
		expect(getDefaultLargeStep(0, 100, 1)).toBe(10);
		expect(getDefaultLargeStep(0, 1, 0.1)).toBe(0.1);
		expect(getDefaultLargeStep(0, 95, 10)).toBe(10);
	});

	it('is never less than one step', () => {
		expect(getDefaultLargeStep(0, 5, 1)).toBe(1);
		expect(getDefaultLargeStep(0, 10, 25)).toBe(25);
	});
});
