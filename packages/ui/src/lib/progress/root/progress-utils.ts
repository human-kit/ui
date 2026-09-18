export type ProgressStatus = 'progressing' | 'complete' | 'indeterminate';

/** A finite number is a value. Anything else keeps the progress indeterminate. */
export function normalizeProgressValue(value: number | null | undefined): number | null {
	return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

export function clampProgressValue(value: number, min: number, max: number): number {
	if (max < min) return min;
	return Math.min(max, Math.max(min, value));
}

/** The position of a value in the range, from 0 to 100. An empty range reads as 0. */
export function getProgressPercent(value: number, min: number, max: number): number {
	const span = max - min;
	if (!(span > 0)) return 0;
	const percent = ((clampProgressValue(value, min, max) - min) / span) * 100;
	return Math.min(100, Math.max(0, percent));
}

export function getProgressStatus(value: number | null, min: number, max: number): ProgressStatus {
	if (value === null) return 'indeterminate';
	return clampProgressValue(value, min, max) >= max ? 'complete' : 'progressing';
}

function createFormatter(locale: string | undefined, options: Intl.NumberFormatOptions) {
	try {
		return new Intl.NumberFormat(locale, options);
	} catch {
		return new Intl.NumberFormat(undefined, options);
	}
}

/**
 * The text for a value. With `format`, it is the value in that format. Without it, it is the
 * position in the range as a percentage: `31%` for 31 of 100, and for 62 of 200.
 */
export function formatProgressValue(
	value: number | null,
	min: number,
	max: number,
	locale: string | undefined,
	format: Intl.NumberFormatOptions | undefined
): string {
	if (value === null) return '';
	if (format) return createFormatter(locale, format).format(clampProgressValue(value, min, max));
	return createFormatter(locale, { style: 'percent' }).format(
		getProgressPercent(value, min, max) / 100
	);
}
