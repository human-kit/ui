export type DateOnlyValue = string;

const DATE_ONLY_RE = /^(\d{4})-(\d{2})-(\d{2})$/;

export function createUtcDate(year: number, monthIndex: number, day: number): Date {
	const date = new Date(Date.UTC(0, 0, 1));
	date.setUTCHours(0, 0, 0, 0);
	date.setUTCFullYear(year, monthIndex, day);
	return date;
}

export function parseDateOnlyParts(value: string): {
	year: number;
	month: number;
	day: number;
} | null {
	const match = DATE_ONLY_RE.exec(value);
	if (!match) return null;

	const year = Number(match[1]);
	const month = Number(match[2]);
	const day = Number(match[3]);
	if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) return null;

	return { year, month, day };
}

export function isValidDateOnlyValue(value: string | undefined): value is DateOnlyValue {
	if (!value) return false;
	const parts = parseDateOnlyParts(value);
	if (!parts) return false;

	const { year, month, day } = parts;
	if (month < 1 || month > 12 || day < 1 || day > 31) return false;

	const date = createUtcDate(year, month - 1, day);
	return (
		date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day
	);
}

export function parseDateOnlyValue(value: string): Date | null {
	if (!isValidDateOnlyValue(value)) return null;
	const parts = parseDateOnlyParts(value);
	if (!parts) return null;
	return createUtcDate(parts.year, parts.month - 1, parts.day);
}

export function formatDateOnlyValue(date: Date): DateOnlyValue {
	const year = String(date.getUTCFullYear()).padStart(4, '0');
	const month = String(date.getUTCMonth() + 1).padStart(2, '0');
	const day = String(date.getUTCDate()).padStart(2, '0');
	return `${year}-${month}-${day}`;
}

export function compareDateOnlyValues(left: DateOnlyValue, right: DateOnlyValue): number {
	const leftDate = parseDateOnlyValue(left);
	const rightDate = parseDateOnlyValue(right);
	if (!leftDate || !rightDate) return 0;
	if (leftDate.getTime() === rightDate.getTime()) return 0;
	return leftDate.getTime() < rightDate.getTime() ? -1 : 1;
}
