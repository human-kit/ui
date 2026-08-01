import { describe, expect, it } from 'vitest';

import { foldForSearch } from './text';

describe('foldForSearch', () => {
	it('lowercases', () => {
		expect(foldForSearch('MEDELLIN')).toBe('medellin');
	});

	it('strips the diacritics, which is the point', () => {
		expect(foldForSearch('TULUÁ')).toBe('tulua');
		expect(foldForSearch('BOGOTÁ, D.C.')).toBe('bogota, d.c.');
		expect(foldForSearch('Antioquía')).toBe('antioquia');
	});

	// Spanish `ñ` is a letter of its own, not an accented `n`, but folding it is what a
	// search box wants: nobody expects "espana" to miss "España".
	it('folds ñ as well', () => {
		expect(foldForSearch('España')).toBe('espana');
	});

	it('leaves plain text alone', () => {
		expect(foldForSearch('cali')).toBe('cali');
		expect(foldForSearch('')).toBe('');
	});
});
