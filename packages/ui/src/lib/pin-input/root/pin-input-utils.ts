export type PinInputType = 'numeric' | 'alphanumeric' | 'alphabetic';

const PATTERNS: Record<PinInputType, RegExp> = {
	numeric: /[0-9]/,
	alphanumeric: /[a-zA-Z0-9]/,
	alphabetic: /[a-zA-Z]/
};

/** The test one character must pass. A pattern of the consumer replaces the one of the type. */
export function getPinInputPattern(type: PinInputType, pattern?: RegExp): RegExp {
	return pattern ?? PATTERNS[type];
}

/** The characters of a text that pass the test, in order. */
export function filterPinInputText(text: string, pattern: RegExp): string {
	let result = '';
	for (const character of text) {
		// A global pattern holds `lastIndex` between two tests, thus a fresh one each time.
		if (new RegExp(pattern.source, pattern.flags.replace(/[gy]/g, '')).test(character)) {
			result += character;
		}
	}
	return result;
}

/**
 * Writes text into the value at one position. The value has no holes: a write past the end goes
 * to the end, and the text after the position moves to the right. The result is not longer than
 * the length.
 */
export function insertPinInputText(
	value: string,
	index: number,
	text: string,
	length: number
): string {
	const at = Math.min(Math.max(index, 0), value.length);
	const next = value.slice(0, at) + text + value.slice(at + text.length);
	return next.slice(0, length);
}

/** Removes one character. The characters after it move to the left. */
export function deletePinInputCharacter(value: string, index: number): string {
	if (index < 0 || index >= value.length) return value;
	return value.slice(0, index) + value.slice(index + 1);
}

/**
 * The cell the focus goes to. The value has no holes, thus the first empty cell is the one after
 * the last character. A full value keeps the focus on the last cell.
 */
export function clampPinInputIndex(index: number, value: string, length: number): number {
	const lastOpen = Math.min(value.length, length - 1);
	return Math.min(Math.max(index, 0), lastOpen);
}
