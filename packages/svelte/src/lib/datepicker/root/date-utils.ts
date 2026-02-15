export type DatePickerDateValue = string;

export type DatePickerSegmentType = 'day' | 'month' | 'year' | 'literal';

export type DatePickerSegmentPart = {
	type: DatePickerSegmentType;
	text: string;
	value: string;
	placeholder: string;
	isPlaceholder: boolean;
};

const segmentsFormatterCache = new Map<string, Intl.DateTimeFormat>();

import {
	compareDateOnlyValues,
	formatDateOnlyValue,
	isValidDateOnlyValue,
	parseDateOnlyValue
} from '../../utils/date-only';

export function isValidDatePickerValue(value: string | undefined): value is DatePickerDateValue {
	return isValidDateOnlyValue(value);
}

export function parseDatePickerValue(value: string): Date | null {
	return parseDateOnlyValue(value);
}

export function formatDatePickerValue(date: Date): DatePickerDateValue {
	return formatDateOnlyValue(date);
}

export function compareDatePickerValues(left: DatePickerDateValue, right: DatePickerDateValue): number {
	return compareDateOnlyValues(left, right);
}

function getPartValue(type: Exclude<DatePickerSegmentType, 'literal'>, value?: DatePickerDateValue): string {
	if (!value || !isValidDatePickerValue(value)) return '';
	const [year, month, day] = value.split('-');
	if (type === 'day') return day;
	if (type === 'month') return month;
	return year;
}

function getPlaceholder(type: Exclude<DatePickerSegmentType, 'literal'>): string {
	if (type === 'day') return 'dd';
	if (type === 'month') return 'mm';
	return 'yyyy';
}

export function buildDatePickerSegments(
	locale: string,
	value?: DatePickerDateValue
): DatePickerSegmentPart[] {
	let formatter = segmentsFormatterCache.get(locale);
	if (!formatter) {
		formatter = new Intl.DateTimeFormat(locale, {
			timeZone: 'UTC',
			year: 'numeric',
			month: '2-digit',
			day: '2-digit'
		});
		segmentsFormatterCache.set(locale, formatter);
	}

	const sample = new Date(Date.UTC(2030, 10, 22));
	const parts = formatter.formatToParts(sample);

	return parts
		.filter((part) => part.type === 'literal' || part.type === 'day' || part.type === 'month' || part.type === 'year')
		.map((part) => {
			if (part.type === 'literal') {
				return {
					type: 'literal' as const,
					text: part.value,
					value: part.value,
					placeholder: part.value,
					isPlaceholder: false
				};
			}

			const type = part.type as Exclude<DatePickerSegmentType, 'literal'>;
			const segmentValue = getPartValue(type, value);
			const placeholder = getPlaceholder(type);

			return {
				type,
				text: segmentValue || placeholder,
				value: segmentValue,
				placeholder,
				isPlaceholder: segmentValue.length === 0
			};
		});
}
