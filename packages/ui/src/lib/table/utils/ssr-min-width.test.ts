import { describe, expect, it } from 'vitest';
import { DEFAULT_TABLE_COLUMN_MIN_WIDTH } from '../root/context';
import { getTableSsrMinWidth } from './ssr-min-width';

describe('getTableSsrMinWidth', () => {
	it('sums authored px widths and floors a trailing fr column at its minWidth', () => {
		const columns = [
			{ id: 'product', defaultWidth: 200, minWidth: 100 },
			{ id: 'uom', defaultWidth: 150, minWidth: 100 },
			{ id: 'quantity', defaultWidth: 120, minWidth: 100 },
			{ id: 'unitPrice', defaultWidth: 140, minWidth: 130 },
			{ id: 'discountPercent', defaultWidth: 120, minWidth: 110 },
			{ id: 'tax', defaultWidth: 200, minWidth: 140 },
			{ id: 'subtotal', defaultWidth: '1fr' as const, minWidth: 130 }
		];

		// 50 (index) + 34 (actions) + 200+150+120+140+120+200+130
		expect(getTableSsrMinWidth(columns, { extraFixedWidth: 84 })).toBe(1144);
	});

	it('prefers an authored width over the default width', () => {
		expect(getTableSsrMinWidth([{ width: 80, defaultWidth: 200 }])).toBe(80);
	});

	it('parses px string specs', () => {
		expect(getTableSsrMinWidth([{ defaultWidth: '120px' }])).toBe(120);
	});

	it('falls back to minWidth for relative widths', () => {
		expect(getTableSsrMinWidth([{ defaultWidth: '50%', minWidth: 70 }])).toBe(70);
		expect(getTableSsrMinWidth([{ width: '2fr', minWidth: 90 }])).toBe(90);
	});

	it('uses the library default min width when a column has no width or minWidth', () => {
		expect(getTableSsrMinWidth([{}, {}])).toBe(2 * DEFAULT_TABLE_COLUMN_MIN_WIDTH);
		expect(getTableSsrMinWidth([{}], { defaultColumnMinWidth: 200 })).toBe(200);
	});

	it('skips hidden columns but still counts extra fixed width', () => {
		const columns = [
			{ id: 'a', defaultWidth: 100 },
			{ id: 'b', defaultWidth: 100 }
		];
		expect(getTableSsrMinWidth(columns, { hiddenColumns: ['b'], extraFixedWidth: 44 })).toBe(144);
	});

	it('returns the extra fixed width alone for an empty column list', () => {
		expect(getTableSsrMinWidth([], { extraFixedWidth: 44 })).toBe(44);
		expect(getTableSsrMinWidth([])).toBe(0);
	});
});
