import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { userEvent } from 'vitest/browser';
import HorizontalTest from './horizontal-test.svelte';

const bars = () => [...document.querySelectorAll<SVGRectElement>('[data-bar]')];
const box = (bar: SVGRectElement) =>
	['x', 'y', 'width', 'height'].map((name) => Number(bar.getAttribute(name)));
const texts = (selector: string) =>
	[...document.querySelectorAll(selector)].map((element) => element.textContent?.trim());
const selectedText = () => document.querySelector('[data-testid="selected"]')!.textContent;

describe('Chart.Bar with categories on y', () => {
	it('grows the bars along x, with the categories from the top down', () => {
		render(HorizontalTest);
		// Two bands of 100 pixels: Red at the top, Blue below. Two bars of 50 pixels in a band.
		// The largest value is 30 at 300 pixels.
		expect(box(bars()[0])).toEqual([0, 0, 100, 50]);
		expect(box(bars()[1])).toEqual([0, 100, 200, 50]);
		expect(box(bars()[2])).toEqual([0, 50, 300, 50]);
		expect(document.querySelector('[data-mark]')!.getAttribute('data-orientation')).toBe(
			'horizontal'
		);
		expect(texts('[data-axis="left"] [data-tick] text')).toEqual(['Red', 'Blue']);
	});

	it('stacks the series along x', () => {
		render(HorizontalTest, { layout: 'stacked' });
		// Red: 10 + 30 = 40, the largest stack.
		expect(box(bars()[2])).toEqual([75, 0, 225, 100]);
	});

	it('sets the margins from the axes and keeps them stable', async () => {
		render(HorizontalTest, { measure: true });
		await new Promise((resolve) => requestAnimationFrame(() => setTimeout(resolve, 50)));
		const plot = document.querySelector('[data-axis="left"] [data-axis-line]')!;
		const [top, bottom] = [Number(plot.getAttribute('y1')), Number(plot.getAttribute('y2'))];
		// The band range runs from the top down, inside the 200 pixels of the chart.
		expect(top).toBeGreaterThanOrEqual(0);
		expect(bottom).toBeGreaterThan(top);
		expect(bottom).toBeLessThanOrEqual(200);
		const first = box(bars()[0]);
		expect(first[1]).toBeGreaterThanOrEqual(top);
	});

	it('names each bar with the category first', () => {
		render(HorizontalTest);
		expect(bars()[0].getAttribute('aria-label')).toBe('Red, 2024, 10');
	});

	it('moves along the categories with the vertical arrows', async () => {
		render(HorizontalTest);
		bars()[0].focus();

		await userEvent.keyboard('{ArrowDown}');
		expect(document.activeElement).toBe(bars()[1]);
		await userEvent.keyboard('{ArrowRight}');
		expect(document.activeElement).toBe(bars()[3]);
		await userEvent.keyboard('{ArrowUp}');
		expect(document.activeElement).toBe(bars()[2]);
	});

	it('makes a table row per category', () => {
		render(HorizontalTest);
		expect(texts('thead th')).toEqual(['team', '2024', '2025']);
		expect(texts('tbody th')).toEqual(['Red', 'Blue']);
		expect(texts('tbody tr:first-child td')).toEqual(['10', '30']);
	});
});

describe('Chart selection', () => {
	it('selects a point with Enter, marks it in the chart and in the table, and clears it', async () => {
		render(HorizontalTest);
		bars()[0].focus();
		await userEvent.keyboard('{ArrowDown}');
		await userEvent.keyboard('{Enter}');

		expect(selectedText()).toBe('Blue:2024');
		expect(bars()[1].getAttribute('aria-current')).toBe('true');
		expect(bars()[1].dataset.selected).toBe('true');
		expect(bars()[0].hasAttribute('aria-current')).toBe(false);
		const cell = document.querySelector('tbody tr:nth-child(2) td:first-of-type')!;
		expect(cell.getAttribute('aria-current')).toBe('true');

		await userEvent.keyboard('{Enter}');
		expect(selectedText()).toBe('');
		expect(bars()[1].hasAttribute('aria-current')).toBe(false);
	});

	it('moves the selection with a click on another point', async () => {
		render(HorizontalTest);
		await userEvent.click(bars()[2]);
		expect(selectedText()).toBe('Red:2025');
		await userEvent.click(bars()[3]);
		expect(selectedText()).toBe('Blue:2025');
	});
});
