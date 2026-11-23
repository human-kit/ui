import { tick } from 'svelte';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { userEvent } from 'vitest/browser';
import DotTest from './dot-test.svelte';

const dots = () => [...document.querySelectorAll<SVGPathElement>('[data-point]')];
const names = () => dots().map((dot) => dot.getAttribute('aria-label'));
const texts = (selector: string) =>
	[...document.querySelectorAll(selector)].map((element) => element.textContent?.trim());

describe('Chart.Dot', () => {
	it('puts the dots of a series in the order of x, then of y', () => {
		render(DotTest);
		expect(names()).toEqual([
			'A, Weight 1, Speed 10',
			'A, Weight 2, Speed 20',
			'A, Weight 2, Speed 25',
			'A, Weight 3, Speed 30',
			'B, Weight 1, Speed 15',
			'B, Weight 2, Speed 5',
			'B, Weight 4, Speed 32'
		]);
		expect(dots()[0].getAttribute('transform')).toBe('translate(75,150)');
		expect(dots().map((dot) => dot.getAttribute('role'))).toEqual(Array(7).fill('img'));
	});

	it('gives each series a shape, also in the legend', () => {
		render(DotTest);
		const groups = [...document.querySelectorAll('[data-mark="dot"] > g')];
		expect(groups.map((g) => g.getAttribute('data-symbol'))).toEqual(['circle', 'square']);
		expect(groups.map((g) => g.getAttribute('aria-label'))).toEqual(['A', 'B']);
		const items = [...document.querySelectorAll('[data-legend-item]')];
		expect(items.map((item) => item.getAttribute('data-symbol'))).toEqual(['circle', 'square']);
		expect(items[1].querySelector('[data-swatch] svg path')!.getAttribute('d')).toMatch(/^M-/);
	});

	it('gives all of the series one shape on request', () => {
		render(DotTest, { symbol: 'diamond' });
		const groups = [...document.querySelectorAll('[data-mark="dot"] > g')];
		expect(groups.map((g) => g.getAttribute('data-symbol'))).toEqual(['diamond', 'diamond']);
	});

	it('moves in the order of x, and between series to the closest x, then the closest y', async () => {
		render(DotTest);
		dots()[0].focus();

		await userEvent.keyboard('{ArrowRight}');
		expect(document.activeElement).toBe(dots()[1]);
		await userEvent.keyboard('{ArrowDown}');
		expect(document.activeElement).toBe(dots()[5]);
		await userEvent.keyboard('{ArrowUp}');
		// Two dots of A have the x value 2. The y value 5 is closer to 20 than to 25.
		expect(document.activeElement).toBe(dots()[1]);
		await userEvent.keyboard('{End}{ArrowDown}');
		// From 3: the dots at 2 and 4 have the same distance, and 32 is closer to 30 than 5 is.
		expect(document.activeElement).toBe(dots()[6]);
	});

	it('keeps the focus and the selection on the row of the key when rows move', async () => {
		type Row = { w: number; v: number; s: string };
		const data: Row[] = [
			{ w: 1, v: 10, s: 'A' },
			{ w: 2, v: 20, s: 'A' },
			{ w: 3, v: 30, s: 'A' }
		];
		const key = (row: Row) => `${row.w}:${row.v}`;
		const { rerender } = render(DotTest, { data, key });
		dots()[1].focus();
		await userEvent.keyboard('{Enter}');
		const name = () => document.activeElement?.getAttribute('aria-label');
		const current = () => dots().map((dot) => dot.getAttribute('aria-current'));

		await rerender({ data: [data[2], { w: 0, v: 5, s: 'A' }, data[1], data[0]], key });
		expect(name()).toBe('A, Weight 2, Speed 20');
		expect(current()).toEqual([null, null, 'true', null]);

		await rerender({ data: [data[1], data[2]], key });
		expect(name()).toBe('A, Weight 2, Speed 20');
		expect(current()).toEqual(['true', null]);
	});

	it('uses the row index as the key by default', async () => {
		const data = [
			{ w: 1, v: 10, s: 'A' },
			{ w: 2, v: 20, s: 'A' }
		];
		const { rerender } = render(DotTest, { data });
		dots()[0].focus();

		// Two dots can have the same x value, thus the default key is the row index.
		await rerender({ data: [data[1], data[0]] });
		expect(document.activeElement?.getAttribute('aria-label')).toBe('A, Weight 2, Speed 20');
	});

	it('shows the label of the channel on an axis without a label', () => {
		render(DotTest);
		expect(texts('[data-axis-label]')).toEqual(['Weight']);
	});

	it('shows the labels in the tooltip', async () => {
		render(DotTest);
		await userEvent.hover(dots()[0]);
		await tick();
		expect(texts('[data-tooltip-key]')).toEqual(['Weight 1']);
		expect(texts('[data-tooltip-value]')).toEqual(['A Speed 10']);
	});
});

describe('Chart.DataTable with dots', () => {
	it('makes a row per dot, also for two dots with the same x value', () => {
		render(DotTest);
		expect(texts('thead th')).toEqual(['s', 'Weight', 'Speed']);
		const rows = [...document.querySelectorAll('tbody tr')].map((row) =>
			[...row.children].map((cell) => cell.textContent)
		);
		expect(rows).toEqual([
			['A', '1', '10'],
			['A', '2', '20'],
			['A', '2', '25'],
			['A', '3', '30'],
			['B', '1', '15'],
			['B', '2', '5'],
			['B', '4', '32']
		]);
		expect(document.querySelectorAll('tbody th')).toHaveLength(0);
	});

	it('marks the row of the selected dot', async () => {
		render(DotTest);
		await userEvent.click(dots()[2]);
		const current = [...document.querySelectorAll('tbody tr')].filter((row) =>
			row.hasAttribute('aria-current')
		);
		expect(current.map((row) => row.textContent)).toEqual(['A225']);
	});
});
