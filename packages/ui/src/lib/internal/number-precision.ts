/**
 * The decimal digits of a number, also for a number written with an exponent: `1e-7` has 7.
 */
export function decimalPlaces(value: number): number {
	if (!Number.isFinite(value)) return 0;
	const text = value.toString().toLowerCase();
	if (!text.includes('e')) {
		return text.split('.')[1]?.length ?? 0;
	}

	const [coefficient, exponentText] = text.split('e');
	const exponent = Number(exponentText);
	const coefficientDecimals = coefficient.split('.')[1]?.length ?? 0;
	return Math.max(0, coefficientDecimals - exponent);
}

/**
 * Rounds a number to a count of decimal digits, and removes the float error of an arithmetic
 * step: `0.1 + 0.2` at one digit is `0.3`.
 */
export function roundToPrecision(value: number, precision: number): number {
	const factor = 10 ** Math.min(precision, 12);
	// Round on the absolute value and reapply the sign so ties resolve
	// away from zero symmetrically: 0.025 → 0.03 and -0.025 → -0.03
	// (Math.round alone rounds -0.025 toward +Infinity, giving -0.02).
	const rounded = Math.round((Math.abs(value) + Number.EPSILON) * factor) / factor;
	return value < 0 ? -rounded : rounded;
}
