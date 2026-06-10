import { compareDatePickerValues, isValidDatePickerValue } from '../../datepicker/root/date-utils';
import type { DateRangePickerRangeValue } from './context';

export type DateRangePickerValueLike = DateRangePickerRangeValue | null | undefined;

export function normalizeDateRangePickerValue(
	value: DateRangePickerValueLike
): DateRangePickerRangeValue | null {
	if (!value) return null;
	if (!isValidDatePickerValue(value.start) || !isValidDatePickerValue(value.end)) return null;
	if (compareDatePickerValues(value.start, value.end) <= 0) {
		return { start: value.start, end: value.end };
	}
	return { start: value.end, end: value.start };
}
