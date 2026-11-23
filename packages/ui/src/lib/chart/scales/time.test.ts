import { describe, expect, it } from 'vitest';
import { scaleTime, timeTicks } from './time.js';

const date = (...parts: number[]) =>
	+new Date(parts[0], parts[1] ?? 0, parts[2] ?? 1, parts[3] ?? 0, parts[4] ?? 0);
const iso = (values: number[]) =>
	values.map((v) => {
		const d = new Date(v);
		return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()} ${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`;
	});

describe('timeTicks', () => {
	it('puts ticks on the first day of a year', () => {
		expect(iso(timeTicks(date(2014, 3), date(2019, 6), 5))).toEqual([
			'2015-1-1 0:00',
			'2016-1-1 0:00',
			'2017-1-1 0:00',
			'2018-1-1 0:00',
			'2019-1-1 0:00'
		]);
	});

	it('puts ticks on round years for a long span', () => {
		expect(iso(timeTicks(date(1990), date(2030), 4))).toEqual([
			'1990-1-1 0:00',
			'2000-1-1 0:00',
			'2010-1-1 0:00',
			'2020-1-1 0:00',
			'2030-1-1 0:00'
		]);
	});

	it('puts ticks on the first day of a month and of a quarter', () => {
		expect(iso(timeTicks(date(2025, 0, 15), date(2025, 4, 2), 4))).toEqual([
			'2025-2-1 0:00',
			'2025-3-1 0:00',
			'2025-4-1 0:00',
			'2025-5-1 0:00'
		]);
		expect(iso(timeTicks(date(2025, 0), date(2025, 11, 31), 4))).toEqual([
			'2025-1-1 0:00',
			'2025-4-1 0:00',
			'2025-7-1 0:00',
			'2025-10-1 0:00'
		]);
	});

	it('puts ticks on Sundays for weeks, and on round hours', () => {
		const weeks = timeTicks(date(2025, 0, 1), date(2025, 1, 15), 6);
		expect(weeks.every((v) => new Date(v).getDay() === 0)).toBe(true);
		expect(iso(timeTicks(date(2025, 0, 1, 0), date(2025, 0, 1, 12), 4))).toEqual([
			'2025-1-1 0:00',
			'2025-1-1 3:00',
			'2025-1-1 6:00',
			'2025-1-1 9:00',
			'2025-1-1 12:00'
		]);
	});
});

describe('scaleTime', () => {
	const scale = scaleTime([date(2015), date(2025)], [0, 100]);

	it('maps dates in proportion', () => {
		expect(scale(date(2015))).toBe(0);
		expect(scale(date(2025))).toBe(100);
	});

	it('writes the largest calendar field that changes at a tick', () => {
		const label = scale.tickFormat(10, 'en-US');
		expect(label(date(2020))).toBe('2020');
		expect(label(date(2020, 2))).toBe('Mar');
		expect(label(date(2020, 2, 5))).toBe('Mar 5');
	});

	it('writes a value as precise as the data', () => {
		expect(scale.valueFormat([date(2015), date(2016)], 'en-US')(date(2015))).toBe('2015');
		expect(scale.valueFormat([date(2015, 1)], 'en-US')(date(2015, 1))).toBe('February 2015');
		expect(scale.valueFormat([date(2015, 1, 3)], 'en-US')(date(2015, 1, 3))).toBe('Feb 3, 2015');
	});

	it('extends the domain to calendar boundaries', () => {
		const [start, stop] = scaleTime([date(2015, 3), date(2019, 7)], [0, 1]).nice(5);
		expect(iso([start, stop])).toEqual(['2015-1-1 0:00', '2020-1-1 0:00']);
	});
});
