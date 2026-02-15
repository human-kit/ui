export type CalendarDateValue = string;

import {
	createUtcDate,
	formatDateOnlyValue,
	isValidDateOnlyValue,
	parseDateOnlyValue
} from '../../utils/date-only';

export function isValidCalendarDateValue(value: string): boolean {
	return isValidDateOnlyValue(value);
}

export function parseCalendarDate(value: CalendarDateValue): Date | null {
	return parseDateOnlyValue(value);
}

export function formatCalendarDate(date: Date): CalendarDateValue {
	return formatDateOnlyValue(date);
}

export function startOfMonth(date: Date): Date {
	return createUtcDate(date.getUTCFullYear(), date.getUTCMonth(), 1);
}

function getDaysInMonthUtc(year: number, monthIndex: number): number {
	return createUtcDate(year, monthIndex + 1, 0).getUTCDate();
}

export function addMonths(date: Date, amount: number): Date {
	const targetMonth = date.getUTCMonth() + amount;
	const targetYear = date.getUTCFullYear() + Math.floor(targetMonth / 12);
	const normalizedMonth = ((targetMonth % 12) + 12) % 12;
	const targetDay = Math.min(date.getUTCDate(), getDaysInMonthUtc(targetYear, normalizedMonth));
	return createUtcDate(targetYear, normalizedMonth, targetDay);
}

export function addDays(date: Date, amount: number): Date {
	return createUtcDate(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate() + amount);
}

export function compareDates(a: Date, b: Date): number {
	const at = a.getTime();
	const bt = b.getTime();
	if (at < bt) return -1;
	if (at > bt) return 1;
	return 0;
}

export function getTodayUtcDate(): Date {
	const now = new Date();
	return createUtcDate(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
}

export function getFirstDayOfWeek(locale: string): number {
	try {
		const intlLocale = new Intl.Locale(locale);
		const weekInfo = (intlLocale as Intl.Locale & { weekInfo?: { firstDay?: number } }).weekInfo;
		if (weekInfo?.firstDay) {
			return weekInfo.firstDay % 7;
		}
	} catch {
		// ignore and fallback to sunday
	}
	return 0;
}

export function getWeekdayLabels(locale: string, firstDayOfWeek: number): string[] {
	const formatter = new Intl.DateTimeFormat(locale, {
		weekday: 'short',
		timeZone: 'UTC'
	});

	const sunday = new Date(Date.UTC(2024, 0, 7));

	return Array.from({ length: 7 }, (_, index) => {
		const dayOffset = (firstDayOfWeek + index) % 7;
		return formatter.format(addDays(sunday, dayOffset));
	});
}

export type CalendarDayCell = {
	date: CalendarDateValue;
	isOutsideMonth: boolean;
};

export function buildMonthGrid(
	monthStart: Date,
	firstDayOfWeek: number,
	showOutsideDays = true
): CalendarDayCell[][] {
	const firstOfMonth = startOfMonth(monthStart);
	const firstWeekday = firstOfMonth.getUTCDay();
	const startOffset = (firstWeekday - firstDayOfWeek + 7) % 7;
	const gridStart = addDays(firstOfMonth, -startOffset);
	const lastOfMonth = addDays(addMonths(firstOfMonth, 1), -1);
	const lastWeekday = lastOfMonth.getUTCDay();
	const endOffset = (firstDayOfWeek + 6 - lastWeekday + 7) % 7;
	const visibleDays = startOffset + lastOfMonth.getUTCDate() + endOffset;
	const weekCount = showOutsideDays ? 6 : Math.max(1, Math.ceil(visibleDays / 7));

	const weeks: CalendarDayCell[][] = [];
	for (let weekIndex = 0; weekIndex < weekCount; weekIndex++) {
		const week: CalendarDayCell[] = [];
		for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
			const date = addDays(gridStart, weekIndex * 7 + dayIndex);
			week.push({
				date: formatCalendarDate(date),
				isOutsideMonth: date.getUTCMonth() !== firstOfMonth.getUTCMonth()
			});
		}
		weeks.push(week);
	}

	return weeks;
}

export function formatMonthHeading(date: Date, locale: string): string {
	return new Intl.DateTimeFormat(locale, {
		month: 'long',
		year: 'numeric',
		timeZone: 'UTC'
	}).format(date);
}
