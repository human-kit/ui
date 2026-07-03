import type { DatePickerDateValue } from './date-utils';

export type DatePickerValueLike = DatePickerDateValue | null | undefined;

export function normalizeDatePickerValue(
	value: DatePickerValueLike,
	isValid: (value: string | undefined) => value is DatePickerDateValue
): DatePickerDateValue | null {
	if (typeof value !== 'string') return null;
	return isValid(value) ? value : null;
}

export function normalizeBindableDatePickerValue(
	value: DatePickerValueLike
): DatePickerDateValue | null {
	return value === undefined ? null : value;
}
