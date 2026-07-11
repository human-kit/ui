import { describe, expect, it } from 'vitest';
import { parseNumberInput, roundNumberValueToFormat } from './number-utils';

describe('roundNumberValueToFormat', () => {
	const formatOptions: Intl.NumberFormatOptions = { maximumFractionDigits: 2 };

	it('rounds ties away from zero for both signs', () => {
		expect(roundNumberValueToFormat(0.025, 'en-US', formatOptions)).toBe(0.03);
		expect(roundNumberValueToFormat(-0.025, 'en-US', formatOptions)).toBe(-0.03);
	});

	it('rounds non-tie values to the nearest digit for both signs', () => {
		expect(roundNumberValueToFormat(0.024, 'en-US', formatOptions)).toBe(0.02);
		expect(roundNumberValueToFormat(-0.024, 'en-US', formatOptions)).toBe(-0.02);
		expect(roundNumberValueToFormat(0.026, 'en-US', formatOptions)).toBe(0.03);
		expect(roundNumberValueToFormat(-0.026, 'en-US', formatOptions)).toBe(-0.03);
	});
});

describe('parseNumberInput with percent style and no fraction digits', () => {
	const formatOptions: Intl.NumberFormatOptions = { style: 'percent', maximumFractionDigits: 0 };

	it('reads sub-1 decimals as the fractional percent shorthand', () => {
		expect(parseNumberInput('0.5', 'en-US', formatOptions)).toEqual({ kind: 'valid', value: 5 });
		expect(parseNumberInput('.5', 'en-US', formatOptions)).toEqual({ kind: 'valid', value: 5 });
		expect(parseNumberInput('-0.5', 'en-US', formatOptions)).toEqual({ kind: 'valid', value: -5 });
	});

	it('rounds decimals with an integer part instead of concatenating digits', () => {
		expect(parseNumberInput('12.5', 'en-US', formatOptions)).toEqual({ kind: 'valid', value: 13 });
		expect(parseNumberInput('12.4', 'en-US', formatOptions)).toEqual({ kind: 'valid', value: 12 });
	});
});
