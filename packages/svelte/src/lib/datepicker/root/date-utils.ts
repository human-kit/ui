export type DatePickerDateValue = string;

export type DatePickerSegmentType = 'day' | 'month' | 'year' | 'literal';
export type DatePickerEditableSegmentType = Exclude<DatePickerSegmentType, 'literal'>;

export type DatePickerSegmentPart = {
	type: DatePickerSegmentType;
	text: string;
	value: string;
	placeholder: string;
	isPlaceholder: boolean;
};

import {
	compareDateOnlyValues,
	formatDateOnlyValue,
	isValidDateOnlyValue,
	parseDateOnlyValue
} from '../../utils/date-only';

type DatePickerSegmentTemplatePart =
	| {
			type: 'literal';
			text: string;
	  }
	| {
			type: DatePickerEditableSegmentType;
			placeholder: string;
	  };

const segmentsFormatterCache = new Map<string, Intl.DateTimeFormat>();
const segmentTemplateCache = new Map<string, DatePickerSegmentTemplatePart[]>();
const segmentLabelCache = new Map<string, Record<DatePickerEditableSegmentType, string>>();

const fallbackSegmentLabels: Record<DatePickerEditableSegmentType, string> = {
	day: 'Day',
	month: 'Month',
	year: 'Year'
};

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

function getPartValue(type: DatePickerEditableSegmentType, value?: DatePickerDateValue): string {
	if (!value || !isValidDatePickerValue(value)) return '';
	const [year, month, day] = value.split('-');
	if (type === 'day') return day;
	if (type === 'month') return month;
	return year;
}

function getPlaceholder(type: DatePickerEditableSegmentType): string {
	if (type === 'day') return 'dd';
	if (type === 'month') return 'mm';
	return 'yyyy';
}

function getFormatter(locale: string): Intl.DateTimeFormat {
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
	return formatter;
}

function getSegmentTemplate(locale: string): DatePickerSegmentTemplatePart[] {
	let template = segmentTemplateCache.get(locale);
	if (template) return template;

	const formatter = getFormatter(locale);
	const sample = new Date(Date.UTC(2030, 10, 22));
	const parts = formatter.formatToParts(sample);

	template = parts
		.filter(
			(part) =>
				part.type === 'literal' || part.type === 'day' || part.type === 'month' || part.type === 'year'
		)
		.map((part) => {
			if (part.type === 'literal') {
				return {
					type: 'literal' as const,
					text: part.value
				};
			}

			const type = part.type as DatePickerEditableSegmentType;
			return {
				type,
				placeholder: getPlaceholder(type)
			};
		});

	segmentTemplateCache.set(locale, template);
	return template;
}

function sentenceCase(value: string): string {
	if (value.length === 0) return value;
	return value.charAt(0).toUpperCase() + value.slice(1);
}

function getSegmentLabels(locale: string): Record<DatePickerEditableSegmentType, string> {
	let labels = segmentLabelCache.get(locale);
	if (labels) return labels;

	const nextLabels: Record<DatePickerEditableSegmentType, string> = { ...fallbackSegmentLabels };

	if (typeof Intl.DisplayNames === 'function') {
		try {
			const displayNames = new Intl.DisplayNames([locale], {
				type: 'dateTimeField'
			} as Intl.DisplayNamesOptions);
			const day = displayNames.of('day');
			const month = displayNames.of('month');
			const year = displayNames.of('year');

			if (day) nextLabels.day = sentenceCase(day);
			if (month) nextLabels.month = sentenceCase(month);
			if (year) nextLabels.year = sentenceCase(year);
		} catch {
			// Ignore locale/feature errors and use fallback labels.
		}
	}

	segmentLabelCache.set(locale, nextLabels);
	return nextLabels;
}

export function getDatePickerSegmentOrder(locale: string): DatePickerEditableSegmentType[] {
	return getSegmentTemplate(locale).flatMap((part) => (part.type === 'literal' ? [] : [part.type]));
}

export function getDatePickerSegmentLabel(
	locale: string,
	type: DatePickerEditableSegmentType
): string {
	return getSegmentLabels(locale)[type];
}

export function buildDatePickerSegments(
	locale: string,
	value?: DatePickerDateValue
): DatePickerSegmentPart[] {
	return getSegmentTemplate(locale).map((part) => {
		if (part.type === 'literal') {
			return {
				type: 'literal' as const,
				text: part.text,
				value: part.text,
				placeholder: part.text,
				isPlaceholder: false
			};
		}

		const segmentValue = getPartValue(part.type, value);
		return {
			type: part.type,
			text: segmentValue || part.placeholder,
			value: segmentValue,
			placeholder: part.placeholder,
			isPlaceholder: segmentValue.length === 0
		};
	});
}
