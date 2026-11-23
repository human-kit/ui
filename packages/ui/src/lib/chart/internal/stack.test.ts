import { describe, expect, it } from 'vitest';
import { stack } from './stack.js';

const two = [
	[
		{ key: 'A', y: 1 },
		{ key: 'B', y: 2 }
	],
	[
		{ key: 'A', y: 3 },
		{ key: 'B', y: 4 }
	]
];

describe('stack', () => {
	it('puts the first series on the top of a vertical stack', () => {
		expect(stack(two, true)).toEqual([
			[
				[3, 4],
				[4, 6]
			],
			[
				[0, 3],
				[0, 4]
			]
		]);
	});

	it('puts the first series next to zero on a horizontal stack', () => {
		expect(stack(two, false)).toEqual([
			[
				[0, 1],
				[0, 2]
			],
			[
				[1, 4],
				[2, 6]
			]
		]);
	});

	it('stacks negative values down from zero, the next series further down', () => {
		expect(stack([[{ key: 1, y: 2 }], [{ key: 1, y: -3 }], [{ key: 1, y: -1 }]], true)).toEqual([
			[[0, 2]],
			[[0, -3]],
			[[-3, -4]]
		]);
	});

	it('stacks negative values to the left, the next series nearer to zero', () => {
		expect(stack([[{ key: 1, y: -3 }], [{ key: 1, y: -1 }], [{ key: 1, y: 2 }]], false)).toEqual([
			[[-1, -4]],
			[[0, -1]],
			[[0, 2]]
		]);
	});
});
