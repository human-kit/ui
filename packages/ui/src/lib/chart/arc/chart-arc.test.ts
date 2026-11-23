import { tick } from 'svelte';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { userEvent } from 'vitest/browser';
import ArcTest from './arc-test.svelte';

const slices = () => [...document.querySelectorAll<SVGPathElement>('[data-point]')];
const names = () => slices().map((slice) => slice.getAttribute('aria-label'));
const texts = (selector: string) =>
	[...document.querySelectorAll(selector)].map((element) => element.textContent?.trim());

describe('Chart.Arc', () => {
	it('makes a slice per row, clockwise from the top, with the share in the name', () => {
		render(ArcTest);
		expect(names()).toEqual([
			'North, Sales 50, 50%',
			'East, Sales 25, 25%',
			'South, Sales 0, 0%',
			'West, Sales 25, 25%'
		]);
		expect(slices()[0].getAttribute('d')).toBe('M0,-100A100,100 0 0 1 0,100L0,0Z');
		expect(slices()[1].getAttribute('d')).toBe('M0,100A100,100 0 0 1 -100,0L0,0Z');
		expect(slices().map((slice) => slice.getAttribute('data-category'))).toEqual([
			'North',
			'East',
			'South',
			'West'
		]);
		expect(document.querySelector('[data-mark="arc"]')!.getAttribute('transform')).toBe(
			'translate(100,100)'
		);
	});

	it('makes a hole with inner', () => {
		render(ArcTest, { inner: 0.5 });
		expect(slices()[0].getAttribute('d')).toBe(
			'M0,-100A100,100 0 0 1 0,100L0,50A50,50 0 0 0 0,-50Z'
		);
	});

	it('moves to the next slice with ArrowRight and ArrowDown, and does not wrap', async () => {
		render(ArcTest);
		slices()[0].focus();
		await userEvent.keyboard('{ArrowRight}');
		expect(document.activeElement).toBe(slices()[1]);
		await userEvent.keyboard('{ArrowDown}');
		expect(document.activeElement).toBe(slices()[2]);
		await userEvent.keyboard('{ArrowUp}');
		expect(document.activeElement).toBe(slices()[1]);
		await userEvent.keyboard('{ArrowLeft}{ArrowLeft}');
		expect(document.activeElement).toBe(slices()[0]);
		await userEvent.keyboard('{End}{ArrowDown}');
		expect(document.activeElement).toBe(slices()[3]);
	});

	it('lists the categories in the legend, in the order of the slices', () => {
		render(ArcTest);
		const items = [...document.querySelectorAll('[data-legend-item]')];
		expect(items.map((item) => item.getAttribute('data-category'))).toEqual([
			'North',
			'East',
			'South',
			'West'
		]);
		expect(items[0].hasAttribute('data-series')).toBe(false);
		expect(document.querySelector('[data-legend]')!.getAttribute('aria-hidden')).toBe('true');
	});

	it('opens the tooltip in a slice, and not in the hole', async () => {
		render(ArcTest, { inner: 0.5 });
		const plot = document.querySelector('svg')!;
		// The middle of the hole.
		await userEvent.hover(plot, { position: { x: 100, y: 100 } });
		await tick();
		expect(document.querySelector('[data-tooltip]')).toBeNull();
		// In the ring, at the right: the slice North.
		await userEvent.hover(plot, { position: { x: 175, y: 100 } });
		await tick();
		expect(texts('[data-tooltip-key]')).toEqual(['North']);
	});

	it('shows a label only when it fits in its slice', async () => {
		render(ArcTest, { labels: true });
		await tick();
		await tick();
		const labels = [...document.querySelectorAll<SVGTextElement>('[data-arc-label]')];
		expect(labels.map((label) => label.textContent)).toEqual(['50', '25', '0', '25']);
		expect(labels.map((label) => label.getAttribute('visibility'))).toEqual([
			null,
			null,
			'hidden',
			null
		]);
		expect(labels[0].closest('[aria-hidden="true"]')).not.toBeNull();
	});

	it('selects a slice, and marks its row in the data table', async () => {
		render(ArcTest);
		slices()[1].focus();
		await userEvent.keyboard('{Enter}');
		expect(slices()[1].getAttribute('aria-current')).toBe('true');
		const rows = [...document.querySelectorAll('tbody tr')];
		expect(rows.map((row) => row.getAttribute('aria-current'))).toEqual([null, 'true', null, null]);
	});
});

describe('Chart.DataTable with slices', () => {
	it('adds the share column', () => {
		render(ArcTest);
		expect(texts('thead th')).toEqual(['region', 'Sales', '%']);
		const rows = [...document.querySelectorAll('tbody tr')].map((row) =>
			[...row.children].map((cell) => cell.textContent)
		);
		expect(rows).toEqual([
			['North', '50', '50%'],
			['East', '25', '25%'],
			['South', '0', '0%'],
			['West', '25', '25%']
		]);
	});

	it('gives no share when the total is 0', () => {
		render(ArcTest, { data: [{ region: 'North', sales: 0 }] });
		expect(names()).toEqual(['North, Sales 0']);
		expect(texts('tbody td')).toEqual(['0', '']);
	});
});
