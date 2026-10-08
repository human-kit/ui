import { describe, expect, it } from 'vitest';
import {
	clampPinInputIndex,
	deletePinInputCharacter,
	filterPinInputText,
	getPinInputPattern,
	insertPinInputText
} from './pin-input-utils';

describe('pin input utils', () => {
	it('keeps only the characters the type accepts', () => {
		expect(filterPinInputText('1a2b3', getPinInputPattern('numeric'))).toBe('123');
		expect(filterPinInputText('1a2b3', getPinInputPattern('alphabetic'))).toBe('ab');
		expect(filterPinInputText('1a-2b', getPinInputPattern('alphanumeric'))).toBe('1a2b');
	});

	it('takes a test of the consumer in place of the one of the type', () => {
		expect(filterPinInputText('abcd', getPinInputPattern('numeric', /[ab]/))).toBe('ab');
	});

	it('keeps a global test from holding its position between two characters', () => {
		expect(filterPinInputText('121', getPinInputPattern('numeric', /1/g))).toBe('11');
	});

	it('writes text at one position, over the characters that are there', () => {
		expect(insertPinInputText('', 0, '12', 4)).toBe('12');
		expect(insertPinInputText('1234', 1, '9', 4)).toBe('1934');
		expect(insertPinInputText('9', 1, '12345', 4)).toBe('9123');
	});

	it('writes at the end when the position is past it', () => {
		expect(insertPinInputText('1', 3, '2', 4)).toBe('12');
	});

	it('moves the characters after the one it removes to the left', () => {
		expect(deletePinInputCharacter('1234', 0)).toBe('234');
		expect(deletePinInputCharacter('1234', 3)).toBe('123');
		expect(deletePinInputCharacter('12', 5)).toBe('12');
	});

	it('clamps the focus to the first cell that is open', () => {
		expect(clampPinInputIndex(3, '1', 4)).toBe(1);
		expect(clampPinInputIndex(-1, '1', 4)).toBe(0);
		expect(clampPinInputIndex(9, '1234', 4)).toBe(3);
	});
});
