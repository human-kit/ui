import { describe, expect, it } from 'vitest';
import {
	clampProgressValue,
	formatProgressValue,
	getProgressPercent,
	getProgressStatus,
	normalizeProgressValue
} from './progress-utils';

describe('normalizeProgressValue', () => {
	it('keeps a finite number, and turns the rest into null', () => {
		expect(normalizeProgressValue(31)).toBe(31);
		expect(normalizeProgressValue(0)).toBe(0);
		expect(normalizeProgressValue(null)).toBeNull();
		expect(normalizeProgressValue(undefined)).toBeNull();
		expect(normalizeProgressValue(Number.NaN)).toBeNull();
		expect(normalizeProgressValue(Number.POSITIVE_INFINITY)).toBeNull();
	});
});

describe('clampProgressValue', () => {
	it('holds the value in the range', () => {
		expect(clampProgressValue(-5, 0, 100)).toBe(0);
		expect(clampProgressValue(140, 0, 100)).toBe(100);
		expect(clampProgressValue(31, 0, 100)).toBe(31);
	});

	it('answers min for a range that ends before it starts', () => {
		expect(clampProgressValue(31, 100, 0)).toBe(100);
	});
});

describe('getProgressPercent', () => {
	it('is the position in the range', () => {
		expect(getProgressPercent(31, 0, 100)).toBe(31);
		expect(getProgressPercent(150, 100, 300)).toBe(25);
		expect(getProgressPercent(1, 0, 3)).toBeCloseTo(33.333, 2);
	});

	it('is 0 for an empty range', () => {
		expect(getProgressPercent(5, 5, 5)).toBe(0);
		expect(getProgressPercent(5, 10, 0)).toBe(0);
	});
});

describe('getProgressStatus', () => {
	it('is complete at max, and indeterminate without a value', () => {
		expect(getProgressStatus(null, 0, 100)).toBe('indeterminate');
		expect(getProgressStatus(0, 0, 100)).toBe('progressing');
		expect(getProgressStatus(99.9, 0, 100)).toBe('progressing');
		expect(getProgressStatus(100, 0, 100)).toBe('complete');
		expect(getProgressStatus(140, 0, 100)).toBe('complete');
	});
});

describe('formatProgressValue', () => {
	it('is the percentage without a format', () => {
		expect(formatProgressValue(31, 0, 100, 'en-US', undefined)).toBe('31%');
		expect(formatProgressValue(150, 100, 300, 'en-US', undefined)).toBe('25%');
		expect(formatProgressValue(1, 0, 3, 'en-US', undefined)).toBe('33%');
	});

	it('is the value in the format, held in the range', () => {
		const format: Intl.NumberFormatOptions = { style: 'unit', unit: 'megabyte' };
		expect(formatProgressValue(512, 0, 2048, 'en-US', format)).toBe('512 MB');
		expect(formatProgressValue(4096, 0, 2048, 'en-US', format)).toBe('2,048 MB');
	});

	it('is empty without a value', () => {
		expect(formatProgressValue(null, 0, 100, 'en-US', undefined)).toBe('');
	});

	it('falls back to the runtime locale for a locale it does not know', () => {
		expect(formatProgressValue(31, 0, 100, 'not a locale', undefined)).toMatch(/31/);
	});
});
