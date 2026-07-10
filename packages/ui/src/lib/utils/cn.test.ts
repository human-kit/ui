import { describe, it, expect } from 'vitest';
import { cn } from './cn';

describe('cn', () => {
	it('joins strings with a single space', () => {
		expect(cn('a', 'b', 'c')).toBe('a b c');
	});

	it('flattens nested arrays', () => {
		expect(cn('a', ['b', ['c', 'd']], 'e')).toBe('a b c d e');
	});

	it('drops falsy values so `condition && class` works', () => {
		expect(cn('a', false, null, undefined, '', 'b')).toBe('a b');
	});

	it('drops the number 0 (documented falsy-drop contract)', () => {
		expect(cn(0)).toBe('');
		expect(cn('a', 0, 'b')).toBe('a b');
		expect(cn(['a', 0])).toBe('a');
	});

	it('drops NaN', () => {
		expect(cn('a', Number.NaN)).toBe('a');
	});

	it('keeps non-zero numbers, stringified', () => {
		expect(cn(1, 'a', 2.5, -3)).toBe('1 a 2.5 -3');
	});

	it('returns an empty string when everything is dropped', () => {
		expect(cn()).toBe('');
		expect(cn(false, null, undefined, 0, '')).toBe('');
	});
});
