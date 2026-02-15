export type DatePickerDateValue = string;

export type DatePickerSegmentType = 'day' | 'month' | 'year' | 'literal';

export type DatePickerSegmentPart = {
	type: DatePickerSegmentType;
	text: string;
	value: string;
	placeholder: string;
	isPlaceholder: boolean;
};

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function createUtcDate(year: number, monthIndex: number, day: number): Date {
	const date = new Date(Date.UTC(0, 0, 1));
	date.setUTCHours(0, 0, 0, 0);
	date.setUTCFullYear(year, monthIndex, day);
	return date;
}

export function isValidDatePickerValue(value: string | undefined): value is DatePickerDateValue {
	if (!value || !DATE_RE.test(value)) return false;
	const parsed = parseDatePickerValue(value);
	if (!parsed) return false;
	return formatDatePickerValue(parsed) === value;
}

export function parseDatePickerValue(value: string): Date | null {
	if (!DATE_RE.test(value)) return null;
	const [yearRaw, monthRaw, dayRaw] = value.split('-');
	const year = Number(yearRaw);
	const month = Number(monthRaw);
	const day = Number(dayRaw);
	if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) return null;
	const date = createUtcDate(year, month - 1, day);
	if (
		date.getUTCFullYear() !== year ||
		date.getUTCMonth() !== month - 1 ||
		date.getUTCDate() !== day
	) {
		return null;
	}
	return date;
}

export function formatDatePickerValue(date: Date): DatePickerDateValue {
	const year = date.getUTCFullYear().toString().padStart(4, '0');
	const month = (date.getUTCMonth() + 1).toString().padStart(2, '0');
	const day = date.getUTCDate().toString().padStart(2, '0');
	return `${year}-${month}-${day}`;
}

export function compareDatePickerValues(left: DatePickerDateValue, right: DatePickerDateValue): number {
	const leftDate = parseDatePickerValue(left);
	const rightDate = parseDatePickerValue(right);
	if (!leftDate || !rightDate) return 0;
	if (leftDate.getTime() === rightDate.getTime()) return 0;
	return leftDate.getTime() < rightDate.getTime() ? -1 : 1;
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
	const formatter = new Intl.DateTimeFormat(locale, {
		timeZone: 'UTC',
		year: 'numeric',
		month: '2-digit',
		day: '2-digit'
	});

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
