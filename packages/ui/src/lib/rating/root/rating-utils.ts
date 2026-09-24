/** The value of one step. A precision above 1, or a precision that is not a number, becomes 1. */
export function normalizeRatingPrecision(precision: number): number {
	if (!Number.isFinite(precision) || precision <= 0 || precision > 1) return 1;
	return precision;
}

/** The count of stars. A count below 1, or a count that is not a number, becomes 5. */
export function normalizeRatingCount(count: number): number {
	if (!Number.isFinite(count) || count < 1) return 5;
	return Math.floor(count);
}

/**
 * The nearest value on the scale. The result is a multiple of the precision, between 0 and the
 * count. The multiplication removes the error of the binary fractions: 0.1 + 0.2 is 0.30000000004,
 * and a rating of 0.3 must stay 0.3.
 */
export function snapRatingValue(value: number, count: number, precision: number): number {
	if (!Number.isFinite(value)) return 0;
	const steps = Math.round(value / precision);
	const maxSteps = Math.round(count / precision);
	const clamped = Math.min(Math.max(steps, 0), maxSteps);
	const decimals = getDecimalCount(precision);
	return Number((clamped * precision).toFixed(decimals));
}

function getDecimalCount(precision: number): number {
	const text = String(precision);
	const dot = text.indexOf('.');
	return dot === -1 ? 0 : Math.min(text.length - dot - 1, 10);
}

/**
 * The value under the pointer. The measure starts at the left edge of the row, or at the right
 * edge in a right-to-left context. The value is always at least one step: a press on the first
 * star gives one star, and never zero.
 */
export function getRatingValueFromPointer(
	clientX: number,
	rect: { left: number; width: number },
	options: { count: number; precision: number; rtl: boolean }
): number {
	const { count, precision, rtl } = options;
	if (rect.width <= 0) return precision;
	const distance = rtl ? rect.left + rect.width - clientX : clientX - rect.left;
	const fraction = Math.min(Math.max(distance / rect.width, 0), 1);
	const raw = Math.ceil((fraction * count) / precision) * precision;
	return Math.max(snapRatingValue(raw, count, precision), precision);
}

/**
 * How much of one star the value fills, from 0 to 1. The star at 3 is full while the value is 3
 * or more, it is empty at 2 or less, and it is half full at 2.5.
 */
export function getRatingItemFill(itemValue: number, value: number): number {
	const fill = value - (itemValue - 1);
	return Math.min(Math.max(fill, 0), 1);
}
