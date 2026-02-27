import type { DatePickerOpenChangeDetails, DatePickerOpenChangeReason } from './context';
import { createDatePickerOpenChangeDetails } from './open-change';

type DatePickerOpenChangeInput =
	| DatePickerOpenChangeDetails
	| {
			reason?: DatePickerOpenChangeReason;
			event?: Event;
	  }
	| undefined;

function isDatePickerOpenChangeDetails(value: unknown): value is DatePickerOpenChangeDetails {
	if (!value || typeof value !== 'object') return false;
	const candidate = value as Partial<DatePickerOpenChangeDetails>;
	return (
		typeof candidate.cancel === 'function' &&
		typeof candidate.reason === 'string' &&
		typeof candidate.isCanceled === 'boolean'
	);
}

export function resolveDatePickerOpenChangeDetails(
	input: DatePickerOpenChangeInput
): DatePickerOpenChangeDetails {
	if (isDatePickerOpenChangeDetails(input)) {
		return input;
	}
	return createDatePickerOpenChangeDetails(input);
}
