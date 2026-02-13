import { describe, it, expect } from 'vitest';
import {
	addDays,
	addMonths,
	buildMonthGrid,
	formatCalendarDate,
	getFirstDayOfWeek,
	getWeekdayLabels,
	isValidCalendarDateValue,
	parseCalendarDate,
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

	it('builds a 6x7 month grid', () => {
		const month = startOfMonth(parseCalendarDate('2026-02-10')!);
		const grid = buildMonthGrid(month, 0);

		expect(grid.length).toBe(6);
		expect(grid.every((week) => week.length === 7)).toBe(true);
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
});
