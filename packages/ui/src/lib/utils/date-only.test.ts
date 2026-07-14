import { describe, it, expect } from 'vitest';
import {
	compareDateOnlyValues,
	formatDateOnlyValue,
	isValidDateOnlyValue,
	parseDateOnlyValue
} from './date-only';

describe('date-only utils', () => {
	describe('isValidDateOnlyValue', () => {
		it('accepts well-formed calendar dates', () => {
			expect(isValidDateOnlyValue('2026-07-10')).toBe(true);
			expect(isValidDateOnlyValue('2024-02-29')).toBe(true);
		});

		it('rejects malformed or impossible dates', () => {
			expect(isValidDateOnlyValue(undefined)).toBe(false);
			expect(isValidDateOnlyValue('')).toBe(false);
			expect(isValidDateOnlyValue('2026-7-10')).toBe(false);
			expect(isValidDateOnlyValue('2026-02-30')).toBe(false);
			expect(isValidDateOnlyValue('not-a-date')).toBe(false);
		});
	});

	describe('parse/format round trip', () => {
		it('round-trips a valid value', () => {
			const date = parseDateOnlyValue('2026-07-10');
			expect(date).not.toBeNull();
			expect(formatDateOnlyValue(date as Date)).toBe('2026-07-10');
		});
	});

	describe('compareDateOnlyValues', () => {
		it('compares valid values chronologically', () => {
			expect(compareDateOnlyValues('2026-01-01', '2026-01-02')).toBe(-1);
			expect(compareDateOnlyValues('2026-01-02', '2026-01-01')).toBe(1);
			expect(compareDateOnlyValues('2026-01-01', '2026-01-01')).toBe(0);
		});

		it('sorts invalid values after valid ones', () => {
			expect(compareDateOnlyValues('2026-01-01', 'invalid')).toBe(-1);
			expect(compareDateOnlyValues('invalid', '2026-01-01')).toBe(1);
			// Even a "large" valid date sorts before an invalid value.
			expect(compareDateOnlyValues('9999-12-31', 'aaaa')).toBe(-1);
		});

		it('compares two invalid values deterministically by string', () => {
			expect(compareDateOnlyValues('invalid', 'invalid')).toBe(0);
			expect(compareDateOnlyValues('aaa', 'bbb')).toBe(-1);
			expect(compareDateOnlyValues('bbb', 'aaa')).toBe(1);
		});

		it('keeps the ordering transitive when sorting mixed values', () => {
			const values = ['zzz', '2026-01-02', 'aaa', '2025-12-31', ''];
			const sorted = [...values].sort(compareDateOnlyValues);
			expect(sorted).toEqual(['2025-12-31', '2026-01-02', '', 'aaa', 'zzz']);
		});
	});
});
