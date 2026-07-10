import { describe, it, expect } from 'vitest';
import {
	addDays,
	addMonths,
	buildMonthGrid,
	formatCalendarDate,
	formatMonthHeading,
	getFirstDayOfWeek,
	getTodayUtcDate,
	getWeekdayLabels,
	isValidCalendarDateValue,
	parseCalendarDate,
	resolveFirstDayOfWeek,
	startOfMonth
} from './date-utils';

describe('calendar date utils', () => {
	it('validates YYYY-MM-DD format correctly', () => {
		expect(isValidCalendarDateValue('2026-02-10')).toBe(true);
		expect(isValidCalendarDateValue('2026-02-30')).toBe(false);
		expect(isValidCalendarDateValue('10-02-2026')).toBe(false);
	});

	it('parses and formats dates as UTC calendar values', () => {
		const parsed = parseCalendarDate('2026-02-10');
		expect(parsed).toBeTruthy();
		expect(formatCalendarDate(parsed!)).toBe('2026-02-10');
	});

	it('builds a 6x7 month grid when showOutsideDays is true', () => {
		const month = startOfMonth(parseCalendarDate('2026-02-10')!);
		const grid = buildMonthGrid(month, 0, true);

		expect(grid.length).toBe(6);
		expect(grid.every((week) => week.length === 7)).toBe(true);
	});

	it('trims physical rows when showOutsideDays is false', () => {
		const month = startOfMonth(parseCalendarDate('2026-02-10')!);
		const grid = buildMonthGrid(month, 0, false);

		expect(grid.length).toBe(4);
		expect(grid.every((week) => week.length === 7)).toBe(true);
	});

	it('computes today from the local civil date, stored as a UTC-normalized value', () => {
		const now = new Date();
		const expected = [
			String(now.getFullYear()).padStart(4, '0'),
			String(now.getMonth() + 1).padStart(2, '0'),
			String(now.getDate()).padStart(2, '0')
		].join('-');

		expect(formatCalendarDate(getTodayUtcDate())).toBe(expected);
	});

	it('supports month and day arithmetic', () => {
		const base = parseCalendarDate('2026-02-10')!;
		expect(formatCalendarDate(addDays(base, 1))).toBe('2026-02-11');
		expect(formatCalendarDate(addMonths(base, 1))).toBe('2026-03-10');
	});

	it('clamps addMonths to the last day of target month', () => {
		const january31 = parseCalendarDate('2026-01-31')!;
		expect(formatCalendarDate(addMonths(january31, 1))).toBe('2026-02-28');
	});

	it('returns weekday labels for locale', () => {
		const firstDay = getFirstDayOfWeek('en-US');
		const labels = getWeekdayLabels('en-US', firstDay);

		expect(labels.length).toBe(7);
		expect(labels.every((label) => label.length > 0)).toBe(true);
	});

	it('returns narrow weekday labels for Spanish Argentina', () => {
		const firstDay = resolveFirstDayOfWeek('es-AR', 'sun');
		const labels = getWeekdayLabels('es-AR', firstDay, 'narrow');

		expect(labels).toEqual(['D', 'L', 'M', 'M', 'J', 'V', 'S']);
	});

	it('allows overriding the locale first day of week', () => {
		expect(resolveFirstDayOfWeek('es-AR', 'sun')).toBe(0);
		expect(resolveFirstDayOfWeek('es-AR', 'mon')).toBe(1);
	});

	it('reads week info from locales that only implement getWeekInfo() (Firefox)', () => {
		const OriginalLocale = Intl.Locale;

		// Intl.Locale-like object without the V8-only `weekInfo` getter.
		class GetWeekInfoOnlyLocale {
			constructor(public readonly tag: string) {}
			getWeekInfo() {
				return { firstDay: 1 };
			}
		}

		try {
			(Intl as { Locale: unknown }).Locale = GetWeekInfoOnlyLocale;
			expect(getFirstDayOfWeek('es-AR')).toBe(1);
		} finally {
			(Intl as { Locale: unknown }).Locale = OriginalLocale;
		}
	});

	it('reads week info from locales that expose the weekInfo getter (V8)', () => {
		const OriginalLocale = Intl.Locale;

		class WeekInfoGetterLocale {
			constructor(public readonly tag: string) {}
			get weekInfo() {
				return { firstDay: 7 };
			}
		}

		try {
			(Intl as { Locale: unknown }).Locale = WeekInfoGetterLocale;
			expect(getFirstDayOfWeek('en-US')).toBe(0);
		} finally {
			(Intl as { Locale: unknown }).Locale = OriginalLocale;
		}
	});

	it('formats month heading as month and year without locale connector', () => {
		const date = parseCalendarDate('2026-05-10')!;

		expect(formatMonthHeading(date, 'es-AR', 'month-year')).toBe('mayo 2026');
		expect(formatMonthHeading(date, 'es-AR')).toContain('de');
	});
});
