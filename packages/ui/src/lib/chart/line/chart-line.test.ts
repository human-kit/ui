import { tick } from 'svelte';
import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { userEvent } from 'vitest/browser';
import LineTest from './line-test.svelte';
import NamedTest from './named-test.svelte';

function points() {
	return [...document.querySelectorAll<SVGCircleElement>('[data-point]')];
}

function focusedText() {
	return document.querySelector('[data-testid="focused"]')?.textContent;
}

describe('Chart.Line', () => {
	it('names the chart from the title, and each point from its values', () => {
		render(LineTest);
		const plot = document.querySelector('[data-testid="plot"]')!;
		const title = document.querySelector('figcaption')!;

		expect(plot.getAttribute('role')).toBe('application');
		expect(plot.getAttribute('aria-roledescription')).toBe('chart');
		expect(plot.getAttribute('aria-labelledby')).toBe(title.id);
		expect(points().map((p) => p.getAttribute('aria-label'))).toEqual([
			'1, A, 10',
			'2, A, 20',
			'3, A, 15',
			'1, B, 5',
			'3, B, 8'
		]);
		expect(document.querySelector('[data-line]')!.getAttribute('aria-hidden')).toBe('true');
	});

	it('makes one tab stop, on the first point', async () => {
		render(LineTest);
		expect(points().map((p) => p.getAttribute('tabindex'))).toEqual(['0', '-1', '-1', '-1', '-1']);

		(document.querySelector('[data-testid="before"]') as HTMLElement).focus();
		await userEvent.tab();
		expect(document.activeElement).toBe(points()[0]);
		await userEvent.tab();
		expect(document.activeElement).toBe(document.querySelector('[data-testid="after"]'));
	});

	it('moves the focus with the arrows, Home and End', async () => {
		render(LineTest);
		points()[0].focus();

		await userEvent.keyboard('{ArrowRight}');
		expect(document.activeElement).toBe(points()[1]);
		await userEvent.keyboard('{End}');
		expect(document.activeElement).toBe(points()[2]);
		await userEvent.keyboard('{ArrowRight}');
		expect(document.activeElement).toBe(points()[2]);
		await userEvent.keyboard('{Home}');
		expect(document.activeElement).toBe(points()[0]);
	});

	it('moves between series to the closest x value', async () => {
		render(LineTest);
		points()[2].focus();

		await userEvent.keyboard('{ArrowDown}');
		expect(document.activeElement).toBe(points()[4]);
		await userEvent.keyboard('{ArrowUp}');
		expect(document.activeElement).toBe(points()[2]);
	});

	it('does not make the names again on a focus move', async () => {
		const xFormat = vi.fn((value: unknown) => String(value));
		render(LineTest, { xFormat });
		points()[0].focus();
		await tick();
		xFormat.mockClear();

		await userEvent.keyboard('{ArrowRight}');
		await tick();
		expect(document.activeElement).toBe(points()[1]);
		// The names have the x values. A focus move must not format them again for each point.
		expect(xFormat.mock.calls.length).toBeLessThan(points().length);
	});

	it('keeps the tab stop on the last focused point', async () => {
		render(LineTest);
		points()[0].focus();
		await userEvent.keyboard('{ArrowRight}');
		await tick();

		expect(points()[1].getAttribute('tabindex')).toBe('0');
		expect(points()[0].getAttribute('tabindex')).toBe('-1');
	});

	it('shows the focus state, and writes the focused point', async () => {
		render(LineTest);
		const figure = document.querySelector('figure')!;
		(document.querySelector('[data-testid="before"]') as HTMLElement).focus();
		await userEvent.tab();

		expect(points()[0].dataset.focused).toBe('true');
		expect(points()[0].dataset.focusVisible).toBe('true');
		expect(figure.dataset.focusWithin).toBe('true');
		expect(figure.dataset.focusVisible).toBe('true');
		expect(focusedText()).toBe('A:1');

		await userEvent.tab();
		expect(points()[0].dataset.focused).toBeUndefined();
		expect(figure.dataset.focusWithin).toBeUndefined();
		expect(focusedText()).toBe('');
	});

	it('shows no focus ring after a pointer press', async () => {
		render(LineTest);
		await userEvent.click(points()[1]);

		expect(document.activeElement).toBe(points()[1]);
		expect(points()[1].dataset.focused).toBe('true');
		expect(points()[1].dataset.focusVisible).toBeUndefined();

		await userEvent.keyboard('{ArrowRight}');
		expect(points()[2].dataset.focusVisible).toBe('true');
	});

	it('selects a point with Enter, Space and a click', async () => {
		const onSelect = vi.fn();
		render(LineTest, { onSelect });
		points()[0].focus();

		await userEvent.keyboard('{Enter}');
		await userEvent.keyboard(' ');
		await userEvent.click(points()[3]);

		expect(onSelect.mock.calls.map(([p]) => `${p.series}:${p.x}`)).toEqual(['A:1', 'A:1', 'B:1']);
		expect(onSelect.mock.calls[2][0].datum).toEqual({ x: 1, y: 5, s: 'B' });
	});

	it('selects the nearest point with a click or a tap near it', async () => {
		const onSelect = vi.fn();
		render(LineTest, { onSelect });
		const plot = document.querySelector('svg')!;
		const point = points()[3];
		// 12 pixels from a point of 3 pixels: on the plot, not on the point.
		await userEvent.click(plot, {
			position: { x: Number(point.getAttribute('cx')) + 12, y: Number(point.getAttribute('cy')) }
		});
		expect(onSelect.mock.calls.map(([p]) => `${p.series}:${p.x}`)).toEqual(['B:1']);
	});

	it('breaks the line at a row without a value, and gives that row no focus', () => {
		render(LineTest, {
			data: [
				{ x: 1, y: 1, s: 'A' },
				{ x: 2, y: null, s: 'A' },
				{ x: 3, y: 3, s: 'A' }
			]
		});

		expect(points()).toHaveLength(2);
		expect(document.querySelector('[data-line]')!.getAttribute('d')).toMatch(/^M[^ML]*M[^ML]*$/);
	});

	it('gives the name of a mark to its series, when it has no series channel', () => {
		render(NamedTest);
		expect(points().map((p) => p.getAttribute('aria-label'))).toEqual([
			'1, Revenue, 66',
			'2, Revenue, 70',
			'1, Cost, 40',
			'2, Cost, 42'
		]);
		const legend = [...document.querySelectorAll('[data-legend-item]')];
		expect(legend.map((item) => item.textContent?.trim())).toEqual(['Revenue', 'Cost']);
		const headers = [...document.querySelectorAll('thead th')];
		expect(headers.map((th) => th.textContent)).toEqual(['month', 'Revenue', 'Cost']);
		const cells = [...document.querySelectorAll('tbody tr')].map((row) =>
			[...row.children].map((cell) => cell.textContent)
		);
		expect(cells).toEqual([
			['1', '66', '40'],
			['2', '70', '42']
		]);
	});

	it('keeps the focus and the selection on the same row when rows move', async () => {
		const data = [
			{ x: 1, y: 10, s: 'A' },
			{ x: 2, y: 20, s: 'A' },
			{ x: 3, y: 15, s: 'A' }
		];
		const { rerender } = render(LineTest, { data, key: 'x' });
		points()[1].focus();
		await userEvent.keyboard('{Enter}');
		const focusedPoint = points()[1];
		const name = () => document.activeElement?.getAttribute('aria-label');
		const current = () => points().map((p) => p.getAttribute('aria-current'));

		// A row before the focused row.
		await rerender({ key: 'x', data: [{ x: 0, y: 5, s: 'A' }, ...data] });
		expect(document.activeElement).toBe(focusedPoint);
		expect(name()).toBe('2, A, 20');
		expect(focusedPoint.dataset.focused).toBe('true');
		expect(points()[2].getAttribute('tabindex')).toBe('0');
		expect(current()).toEqual([null, null, 'true', null]);
		expect(focusedText()).toBe('A:2');

		// The rows in the opposite order.
		await rerender({ key: 'x', data: [...data].reverse() });
		expect(name()).toBe('2, A, 20');
		expect(document.activeElement?.getAttribute('data-focused')).toBe('true');
		expect(current()).toEqual([null, 'true', null]);

		// A row before the focused row goes out of the data.
		await rerender({ key: 'x', data: data.slice(1) });
		expect(name()).toBe('2, A, 20');
		expect(current()).toEqual(['true', null]);

		await userEvent.keyboard('{ArrowRight}');
		expect(name()).toBe('3, A, 15');
	});

	it('keeps the focus on the same row index without a key channel', async () => {
		const data = [
			{ x: 1, y: 10, s: 'A' },
			{ x: 2, y: 20, s: 'A' }
		];
		const { rerender } = render(LineTest, { data });
		points()[1].focus();

		await rerender({ data: [{ x: 0, y: 5, s: 'A' }, ...data] });
		expect(document.activeElement?.getAttribute('aria-label')).toBe('1, A, 10');
	});

	it('moves the focus to the same index when the focused row goes out of the data', async () => {
		const data = [
			{ x: 1, y: 10, s: 'A' },
			{ x: 2, y: 20, s: 'A' },
			{ x: 3, y: 15, s: 'A' }
		];
		const { rerender } = render(LineTest, { data, key: 'x' });
		points()[1].focus();

		await rerender({ key: 'x', data: [data[0], data[2]] });
		expect(document.activeElement?.getAttribute('aria-label')).toBe('3, A, 15');
		expect(focusedText()).toBe('A:3');

		await rerender({ key: 'x', data: [data[0]] });
		expect(document.activeElement?.getAttribute('aria-label')).toBe('1, A, 10');
	});

	it('does not move the focus into the chart on a data update', async () => {
		const data = [
			{ x: 1, y: 10, s: 'A' },
			{ x: 2, y: 20, s: 'A' }
		];
		const { rerender } = render(LineTest, { data, key: 'x' });
		points()[1].focus();
		(document.querySelector('[data-testid="after"]') as HTMLElement).focus();

		await rerender({ key: 'x', data: [{ x: 0, y: 5, s: 'A' }, ...data] });
		expect(document.activeElement).toBe(document.querySelector('[data-testid="after"]'));
		// The tab stop stays on the last focused row.
		expect(points().map((p) => p.getAttribute('tabindex'))).toEqual(['-1', '-1', '0']);
	});
});
