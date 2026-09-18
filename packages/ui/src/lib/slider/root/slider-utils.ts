import type { SliderOrientation } from './context';

function decimalPlaces(value: number): number {
	if (!Number.isFinite(value)) return 0;
	const text = value.toString().toLowerCase();
	if (!text.includes('e')) {
		return text.split('.')[1]?.length ?? 0;
	}
	const [coefficient, exponentText] = text.split('e');
	const coefficientDecimals = coefficient.split('.')[1]?.length ?? 0;
	return Math.max(0, coefficientDecimals - Number(exponentText));
}

function roundToPrecision(value: number, precision: number): number {
	const factor = 10 ** Math.min(precision, 12);
	return Math.round(value * factor) / factor;
}

/** A step that is not a positive finite number falls back to 1. */
export function normalizeSliderStep(step: number | undefined): number {
	return Number.isFinite(step) && Number(step) > 0 ? Number(step) : 1;
}

export function clampSliderValue(value: number, min: number, max: number): number {
	return Math.min(max, Math.max(min, value));
}

/**
 * Snaps a value to the nearest step from `min`, and then clamps it to `[min, max]`.
 *
 * The clamp comes after the snap on purpose: when the range is not a multiple of the step, `max`
 * stays reachable, as in a native `<input type="range">` and in React Aria.
 */
export function snapSliderValue(value: number, min: number, max: number, step: number): number {
	if (!Number.isFinite(value)) return min;
	const resolvedStep = normalizeSliderStep(step);
	const precision = Math.max(decimalPlaces(resolvedStep), decimalPlaces(min));
	const snapped = roundToPrecision(
		min + Math.round((value - min) / resolvedStep) * resolvedStep,
		precision
	);
	return clampSliderValue(snapped, min, max);
}

/** The position of a value in the range, from 0 to 1. A range of zero width gives 0. */
export function getSliderPercent(value: number, min: number, max: number): number {
	if (max <= min) return 0;
	return clampSliderValue((value - min) / (max - min), 0, 1);
}

/**
 * The value under a pointer, from its position in the track.
 *
 * On a horizontal track the start edge is `min`, thus the math flips in a right-to-left context.
 * On a vertical track the bottom edge is `min`.
 */
export function getSliderValueFromPointer(
	position: { clientX: number; clientY: number },
	rect: { left: number; top: number; width: number; height: number },
	options: { min: number; max: number; orientation: SliderOrientation; rtl: boolean }
): number {
	let percent: number;
	if (options.orientation === 'vertical') {
		percent = rect.height === 0 ? 0 : (rect.top + rect.height - position.clientY) / rect.height;
	} else {
		percent = rect.width === 0 ? 0 : (position.clientX - rect.left) / rect.width;
		if (options.rtl) percent = 1 - percent;
	}
	percent = clampSliderValue(percent, 0, 1);
	return options.min + percent * (options.max - options.min);
}

/**
 * The thumb that a press on the track moves: the nearest one by value. When two thumbs sit at
 * the same distance (which includes two thumbs on the same value), the press takes the one that
 * can move toward the pointer, so that stacked thumbs can separate again.
 */
export function getNearestThumbIndex(values: number[], target: number): number {
	let nearest = 0;
	let nearestDistance = Infinity;
	values.forEach((value, index) => {
		const distance = Math.abs(value - target);
		if (distance < nearestDistance || (distance === nearestDistance && target > value)) {
			nearest = index;
			nearestDistance = distance;
		}
	});
	return nearest;
}

/**
 * The bounds of one thumb of a range: it cannot pass its neighbors, and it keeps
 * `minStepsBetweenThumbs` steps away from them.
 */
export function getThumbBounds(
	values: number[],
	index: number,
	options: { min: number; max: number; step: number; minStepsBetweenThumbs: number }
): { min: number; max: number } {
	const gap = normalizeSliderStep(options.step) * Math.max(0, options.minStepsBetweenThumbs);
	const previous = values[index - 1];
	const next = values[index + 1];
	return {
		min: previous === undefined ? options.min : Math.max(options.min, previous + gap),
		max: next === undefined ? options.max : Math.min(options.max, next - gap)
	};
}

/**
 * The step that PageUp, PageDown and Shift+Arrow use when the consumer gives none: one tenth of
 * the range, and never less than one step. React Aria does the same.
 */
export function getDefaultLargeStep(min: number, max: number, step: number): number {
	const resolvedStep = normalizeSliderStep(step);
	const tenth = (max - min) / 10;
	if (!Number.isFinite(tenth) || tenth <= resolvedStep) return resolvedStep;
	return roundToPrecision(
		Math.round(tenth / resolvedStep) * resolvedStep,
		decimalPlaces(resolvedStep)
	);
}
