import { describe, expect, it } from 'vitest';
import type { ChartBarProps, ChartDotProps, ChartLineProps } from './types.js';

// The checks are in the types: `pnpm check` fails when an `@ts-expect-error` has no error.
type Sale = { month: number; revenue: number; cost: number };
const sales: Sale[] = [];

describe('mark channels', () => {
	it('accepts a mark without data and without channels', () => {
		const line: ChartLineProps<Sale> = { r: 2 };
		expect(line.r).toBe(2);
	});

	it('checks the channels of a mark against its own data', () => {
		const line: ChartLineProps<Sale> = { data: sales, y: 'cost', x: (row) => row.month };
		// @ts-expect-error the field is not in the rows
		const wrong: ChartLineProps<Sale> = { data: sales, y: 'typo' };
		expect([line.y, wrong.y]).toEqual(['cost', 'typo']);
	});

	it('rejects a channel on a mark without data', () => {
		// @ts-expect-error a mark without data cannot check a field name
		const line: ChartLineProps<Sale> = { y: 'cost' };
		// @ts-expect-error the same rule for bars
		const bar: ChartBarProps<Sale> = { series: 'cost', layout: 'stacked' };
		expect([line.y, bar.series]).toEqual(['cost', 'cost']);
	});

	it('checks the channels and the shape of a dot mark', () => {
		const dot: ChartDotProps<Sale> = { data: sales, x: 'cost', y: 'revenue', symbol: 'cross' };
		// @ts-expect-error the shape is not one of the shapes
		const wrong: ChartDotProps<Sale> = { symbol: 'star' };
		expect([dot.symbol, wrong.symbol]).toEqual(['cross', 'star']);
	});
});
