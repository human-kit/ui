import { describe, it, expect } from 'vitest';
import {
	isValidTimePickerValue,
	parseTimePickerValue,
	formatTimePickerValue,
	buildTimePickerSegments,
	buildTimePartsFromDraft,
	clampToStep,
	isTimeOutOfRange,
	toDraftFromTimeValue,
	adjustSegmentWithStep,
	createEmptyTimePickerDraft,
	type TimePickerDraft
} from './time-utils';

describe('isValidTimePickerValue', () => {
	it('accepts HH:mm format', () => {
		expect(isValidTimePickerValue('00:00')).toBe(true);
		expect(isValidTimePickerValue('14:30')).toBe(true);
		expect(isValidTimePickerValue('23:59')).toBe(true);
	});

	it('accepts HH:mm:ss format', () => {
		expect(isValidTimePickerValue('00:00:00')).toBe(true);
		expect(isValidTimePickerValue('14:30:45')).toBe(true);
		expect(isValidTimePickerValue('23:59:59')).toBe(true);
	});

	it('rejects invalid formats', () => {
		expect(isValidTimePickerValue('')).toBe(false);
		expect(isValidTimePickerValue('24:00')).toBe(false);
		expect(isValidTimePickerValue('12:60')).toBe(false);
		expect(isValidTimePickerValue('1:30')).toBe(false);
		expect(isValidTimePickerValue('14')).toBe(false);
		expect(isValidTimePickerValue('14:30:60')).toBe(false);
		expect(isValidTimePickerValue(':30')).toBe(false);
		expect(isValidTimePickerValue('1.5:30')).toBe(false);
		expect(isValidTimePickerValue('  :  ')).toBe(false);
		expect(isValidTimePickerValue('abc')).toBe(false);
	});

	it('rejects non-string values', () => {
		expect(isValidTimePickerValue(null)).toBe(false);
		expect(isValidTimePickerValue(undefined)).toBe(false);
		expect(isValidTimePickerValue(1430)).toBe(false);
	});
});

describe('parseTimePickerValue', () => {
	it('parses HH:mm string', () => {
		expect(parseTimePickerValue('14:30')).toEqual({ hour: 14, minute: 30, second: 0 });
		expect(parseTimePickerValue('00:00')).toEqual({ hour: 0, minute: 0, second: 0 });
	});

	it('parses HH:mm:ss string', () => {
		expect(parseTimePickerValue('14:30:45')).toEqual({ hour: 14, minute: 30, second: 45 });
	});

	it('returns null for invalid input', () => {
		expect(parseTimePickerValue('')).toBeNull();
		expect(parseTimePickerValue('invalid')).toBeNull();
		expect(parseTimePickerValue('24:00')).toBeNull();
		expect(parseTimePickerValue('1:30')).toBeNull();
		expect(parseTimePickerValue(':30')).toBeNull();
		expect(parseTimePickerValue('1.5:30')).toBeNull();
	});
});

describe('formatTimePickerValue', () => {
	it('formats with hour granularity', () => {
		expect(formatTimePickerValue({ hour: 14, minute: 30, second: 45 }, 'hour')).toBe('14:00');
		expect(formatTimePickerValue({ hour: 9, minute: 0, second: 0 }, 'hour')).toBe('09:00');
	});

	it('formats with minute granularity', () => {
		expect(formatTimePickerValue({ hour: 14, minute: 30, second: 45 }, 'minute')).toBe('14:30');
		expect(formatTimePickerValue({ hour: 0, minute: 0, second: 0 }, 'minute')).toBe('00:00');
	});

	it('formats with second granularity', () => {
		expect(formatTimePickerValue({ hour: 14, minute: 30, second: 45 }, 'second')).toBe('14:30:45');
		expect(formatTimePickerValue({ hour: 0, minute: 0, second: 0 }, 'second')).toBe('00:00:00');
	});

	it('forces :00 for hour granularity regardless of minute value', () => {
		expect(formatTimePickerValue({ hour: 14, minute: 45, second: 30 }, 'hour')).toBe('14:00');
	});
});

describe('buildTimePickerSegments', () => {
	it('shows 00:00 when draft hour is 0 in 24h mode', () => {
		const segments = buildTimePickerSegments({
			locale: 'en-US',
			hourCycle: 24,
			granularity: 'minute',
			draft: { hour: '0', minute: '0', second: '', dayPeriod: '' }
		});

		expect(segments.find((segment) => segment.type === 'hour')?.text).toBe('00');
		expect(segments.find((segment) => segment.type === 'minute')?.text).toBe('00');
	});

	it('shows 1:00 when draft hour is 1 in 24h mode', () => {
		const segments = buildTimePickerSegments({
			locale: 'en-US',
			hourCycle: 24,
			granularity: 'minute',
			draft: { hour: '1', minute: '0', second: '', dayPeriod: '' }
		});

		expect(segments.find((segment) => segment.type === 'hour')?.text).toBe('1');
		expect(segments.find((segment) => segment.type === 'minute')?.text).toBe('00');
	});

	it('keeps AM/PM display text in English for en-US', () => {
		const segments = buildTimePickerSegments({
			locale: 'en-US',
			hourCycle: 12,
			granularity: 'minute',
			draft: { hour: '2', minute: '30', second: '', dayPeriod: 'PM' }
		});

		expect(segments.find((segment) => segment.type === 'dayPeriod')?.text).toBe('PM');
	});

	it('maps the internal PM token to the Spanish dayPeriod display text', () => {
		const expected = new Intl.DateTimeFormat('es', {
			hour: 'numeric',
			hour12: true,
			timeZone: 'UTC'
		})
			.formatToParts(new Date(Date.UTC(2024, 0, 1, 15, 0, 0)))
			.find((part) => part.type === 'dayPeriod')
			?.value?.trim();

		const segments = buildTimePickerSegments({
			locale: 'es',
			hourCycle: 12,
			granularity: 'minute',
			draft: { hour: '2', minute: '30', second: '', dayPeriod: 'PM' }
		});

		expect(expected).toBeTruthy();
		expect(segments.find((segment) => segment.type === 'dayPeriod')?.text).toBe(expected);
	});
});

describe('buildTimePartsFromDraft', () => {
	it('returns null for empty draft', () => {
		expect(buildTimePartsFromDraft(createEmptyTimePickerDraft(), 'minute', 24)).toBeNull();
	});

	it('builds parts from complete 24h draft', () => {
		const draft: TimePickerDraft = { hour: '14', minute: '30', second: '0', dayPeriod: '' };
		expect(buildTimePartsFromDraft(draft, 'minute', 24)).toEqual({
			hour: 14,
			minute: 30,
			second: 0
		});
	});

	it('returns null for incomplete draft (missing minute)', () => {
		const draft: TimePickerDraft = { hour: '14', minute: '', second: '0', dayPeriod: '' };
		expect(buildTimePartsFromDraft(draft, 'minute', 24)).toBeNull();
	});

	it('handles 12h: 12 AM → hour 0', () => {
		const draft: TimePickerDraft = { hour: '12', minute: '0', second: '0', dayPeriod: 'AM' };
		expect(buildTimePartsFromDraft(draft, 'minute', 12)).toEqual({
			hour: 0,
			minute: 0,
			second: 0
		});
	});

	it('handles 12h: 12 PM → hour 12', () => {
		const draft: TimePickerDraft = { hour: '12', minute: '0', second: '0', dayPeriod: 'PM' };
		expect(buildTimePartsFromDraft(draft, 'minute', 12)).toEqual({
			hour: 12,
			minute: 0,
			second: 0
		});
	});

	it('handles 12h: 2 PM → hour 14', () => {
		const draft: TimePickerDraft = { hour: '2', minute: '30', second: '0', dayPeriod: 'PM' };
		expect(buildTimePartsFromDraft(draft, 'minute', 12)).toEqual({
			hour: 14,
			minute: 30,
			second: 0
		});
	});

	it('handles 12h: 2 AM → hour 2', () => {
		const draft: TimePickerDraft = { hour: '2', minute: '30', second: '0', dayPeriod: 'AM' };
		expect(buildTimePartsFromDraft(draft, 'minute', 12)).toEqual({
			hour: 2,
			minute: 30,
			second: 0
		});
	});

	it('returns null when 12h hour is 0 (out of 1-12 range)', () => {
		const draft: TimePickerDraft = { hour: '0', minute: '30', second: '0', dayPeriod: 'AM' };
		expect(buildTimePartsFromDraft(draft, 'minute', 12)).toBeNull();
	});

	it('returns null when 12h hour is 13 (out of 1-12 range)', () => {
		const draft: TimePickerDraft = { hour: '13', minute: '30', second: '0', dayPeriod: 'AM' };
		expect(buildTimePartsFromDraft(draft, 'minute', 12)).toBeNull();
	});

	it('returns null when dayPeriod is empty in 12h mode', () => {
		const draft: TimePickerDraft = { hour: '2', minute: '30', second: '0', dayPeriod: '' };
		expect(buildTimePartsFromDraft(draft, 'minute', 12)).toBeNull();
	});

	it('treats minute as 0 for hour granularity', () => {
		const draft: TimePickerDraft = { hour: '14', minute: '', second: '', dayPeriod: '' };
		expect(buildTimePartsFromDraft(draft, 'hour', 24)).toEqual({
			hour: 14,
			minute: 0,
			second: 0
		});
	});
});

describe('clampToStep', () => {
	it('returns value when step is 1', () => {
		expect(clampToStep(30, 1, 0, 59)).toBe(30);
	});

	it('clamps to nearest step', () => {
		expect(clampToStep(37, 15, 0, 59)).toBe(30);
		expect(clampToStep(22, 15, 0, 59)).toBe(15);
		expect(clampToStep(8, 15, 0, 59)).toBe(15);
		expect(clampToStep(7, 15, 0, 59)).toBe(0);
	});

	it('clamps to bounds', () => {
		expect(clampToStep(60, 15, 0, 59)).toBe(59);
		expect(clampToStep(-5, 15, 0, 59)).toBe(0);
	});

	it('handles non-finite values', () => {
		expect(clampToStep(NaN, 15, 0, 59)).toBe(0);
		expect(clampToStep(Infinity, 15, 0, 59)).toBe(0);
	});

	it('handles step=0 or negative (treats as 1)', () => {
		expect(clampToStep(30, 0, 0, 59)).toBe(30);
		expect(clampToStep(30, -5, 0, 59)).toBe(30);
	});

	it('anchors the step grid at min (12h wheel options: 1, 4, 7, 10)', () => {
		expect(clampToStep(1, 3, 1, 12)).toBe(1);
		expect(clampToStep(2, 3, 1, 12)).toBe(1);
		expect(clampToStep(3, 3, 1, 12)).toBe(4);
		expect(clampToStep(4, 3, 1, 12)).toBe(4);
		expect(clampToStep(7, 3, 1, 12)).toBe(7);
		expect(clampToStep(10, 3, 1, 12)).toBe(10);
		expect(clampToStep(11, 3, 1, 12)).toBe(10);
	});

	it('keeps every min-anchored option on its own grid slot', () => {
		expect(clampToStep(1, 2, 1, 12)).toBe(1);
		expect(clampToStep(3, 2, 1, 12)).toBe(3);
		expect(clampToStep(5, 2, 1, 12)).toBe(5);
		expect(clampToStep(11, 2, 1, 12)).toBe(11);
	});
});

describe('isTimeOutOfRange', () => {
	it('returns false when no min/max', () => {
		expect(isTimeOutOfRange('14:30', undefined, undefined)).toBe(false);
	});

	it('returns false when value is within range', () => {
		expect(isTimeOutOfRange('14:30', '09:00', '17:00')).toBe(false);
	});

	it('returns true when value is below min', () => {
		expect(isTimeOutOfRange('08:00', '09:00', '17:00')).toBe(true);
	});

	it('returns true when value is above max', () => {
		expect(isTimeOutOfRange('18:00', '09:00', '17:00')).toBe(true);
	});

	it('returns true when min > max (inverted range)', () => {
		expect(isTimeOutOfRange('12:00', '22:00', '06:00')).toBe(true);
	});

	it('returns true for invalid value string', () => {
		expect(isTimeOutOfRange('invalid', '09:00', '17:00')).toBe(true);
	});

	it('truncates to hour granularity for comparison', () => {
		// minValue="09:30" but with hour granularity, 09:00 should compare as 09:xx vs 09:xx → same hour → not out of range
		expect(isTimeOutOfRange('09:00', '09:30', '17:00', 'hour')).toBe(false);
	});

	it('truncates to minute granularity for comparison', () => {
		// minValue="09:00:30" but with minute granularity, 09:00 should compare as 09:00:xx vs 09:00:xx → same → not out of range
		expect(isTimeOutOfRange('09:00', '09:00:30', '17:00', 'minute')).toBe(false);
	});

	it('does not truncate with second granularity', () => {
		expect(isTimeOutOfRange('09:00:00', '09:00:30', '17:00:00', 'second')).toBe(true);
	});

	it('returns false for boundary values', () => {
		expect(isTimeOutOfRange('09:00', '09:00', '17:00')).toBe(false);
		expect(isTimeOutOfRange('17:00', '09:00', '17:00')).toBe(false);
	});
});

describe('toDraftFromTimeValue', () => {
	it('converts to 24h draft', () => {
		expect(toDraftFromTimeValue('14:30', 24)).toEqual({
			hour: '14',
			minute: '30',
			second: '0',
			dayPeriod: ''
		});
	});

	it('converts to 12h draft (PM)', () => {
		expect(toDraftFromTimeValue('14:30', 12)).toEqual({
			hour: '2',
			minute: '30',
			second: '0',
			dayPeriod: 'PM'
		});
	});

	it('converts to 12h draft (AM)', () => {
		expect(toDraftFromTimeValue('02:30', 12)).toEqual({
			hour: '2',
			minute: '30',
			second: '0',
			dayPeriod: 'AM'
		});
	});

	it('handles midnight (00:00) in 12h → 12 AM', () => {
		expect(toDraftFromTimeValue('00:00', 12)).toEqual({
			hour: '12',
			minute: '0',
			second: '0',
			dayPeriod: 'AM'
		});
	});

	it('handles noon (12:00) in 12h → 12 PM', () => {
		expect(toDraftFromTimeValue('12:00', 12)).toEqual({
			hour: '12',
			minute: '0',
			second: '0',
			dayPeriod: 'PM'
		});
	});

	it('handles 00:30 in 12h → 12:30 AM', () => {
		expect(toDraftFromTimeValue('00:30', 12)).toEqual({
			hour: '12',
			minute: '30',
			second: '0',
			dayPeriod: 'AM'
		});
	});

	it('returns empty draft for invalid value', () => {
		expect(toDraftFromTimeValue('invalid', 24)).toEqual(createEmptyTimePickerDraft());
	});

	it('converts with seconds', () => {
		expect(toDraftFromTimeValue('14:30:45', 24)).toEqual({
			hour: '14',
			minute: '30',
			second: '45',
			dayPeriod: ''
		});
	});
});

describe('adjustSegmentWithStep', () => {
	const baseOpts = { hourCycle: 24 as const, hourStep: 1, minuteStep: 1, secondStep: 1 };

	it('increments hour', () => {
		expect(adjustSegmentWithStep('14', 'hour', 1, baseOpts)).toBe('15');
	});

	it('decrements hour', () => {
		expect(adjustSegmentWithStep('14', 'hour', -1, baseOpts)).toBe('13');
	});

	it('wraps hour from 23 to 0 in 24h', () => {
		expect(adjustSegmentWithStep('23', 'hour', 1, baseOpts)).toBe('0');
	});

	it('wraps hour from 0 to 23 in 24h', () => {
		expect(adjustSegmentWithStep('0', 'hour', -1, baseOpts)).toBe('23');
	});

	it('wraps hour from 12 to 1 in 12h', () => {
		expect(adjustSegmentWithStep('12', 'hour', 1, { ...baseOpts, hourCycle: 12 })).toBe('1');
	});

	it('wraps hour from 1 to 12 in 12h', () => {
		expect(adjustSegmentWithStep('1', 'hour', -1, { ...baseOpts, hourCycle: 12 })).toBe('12');
	});

	it('increments minute with step', () => {
		expect(adjustSegmentWithStep('30', 'minute', 1, { ...baseOpts, minuteStep: 15 })).toBe('45');
	});

	it('wraps minute from 59 to 0', () => {
		expect(adjustSegmentWithStep('59', 'minute', 1, baseOpts)).toBe('0');
	});

	it('handles empty string as starting from min', () => {
		expect(adjustSegmentWithStep('', 'hour', 1, baseOpts)).toBe('1');
		expect(adjustSegmentWithStep('', 'minute', 1, baseOpts)).toBe('1');
	});
});
