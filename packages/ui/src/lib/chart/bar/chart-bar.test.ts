import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { userEvent } from 'vitest/browser';
import BarTest from './bar-test.svelte';

function bars() {
	return [...document.querySelectorAll<SVGRectElement>('[data-bar]')];
}

function box(bar: SVGRectElement) {
	return ['x', 'y', 'width', 'height'].map((name) => Number(bar.getAttribute(name)));
}

describe('Chart.Bar', () => {
	it('puts the bars of each category side by side', () => {
		render(BarTest);
		// Three bands of 100 pixels, and two bars of 50 pixels in each band.
		expect(box(bars()[0])).toEqual([0, 200 - (10 / 30) * 200, 50, (10 / 30) * 200].map(roundTwo));
		expect(box(bars()[3])).toEqual([50, 200 - (5 / 30) * 200, 50, (5 / 30) * 200].map(roundTwo));
		expect(box(bars()[2])[0]).toBe(200);
	});

	it('puts the bars of each category one on the other, and the scale includes the tops', () => {
		render(BarTest, { layout: 'stacked' });
		// The largest stack is 30 + 25 = 55. The first series is on the top, thus `ArrowDown` goes
		// down on the screen.
		const [x, yTop, width, height] = box(bars()[2]);
		expect([x, width]).toEqual([200, 100]);
		expect(yTop).toBe(0);
		expect(height).toBe(roundTwo((30 / 55) * 200));
		expect(box(bars()[5])[1] + box(bars()[5])[3]).toBe(200);
	});

	it('moves down on the screen with ArrowDown in a stack', async () => {
		render(BarTest, { layout: 'stacked' });
		bars()[2].focus();
		await userEvent.keyboard('{ArrowDown}');
		expect(document.activeElement).toBe(bars()[5]);
		expect(box(bars()[5])[1]).toBeGreaterThan(box(bars()[2])[1]);
	});

	it('names each bar with the category, the series and the value', () => {
		render(BarTest);
		expect(bars().map((bar) => bar.getAttribute('aria-label'))).toEqual([
			'Q1, North, 10',
			'Q2, North, 20',
			'Q3, North, 30',
			'Q1, South, 5',
			'Q2, South, 15',
			'Q3, South, 25'
		]);
		expect(bars()[0].getAttribute('role')).toBe('img');
	});

	it('labels the categories on the axis', () => {
		render(BarTest);
		expect(
			[...document.querySelectorAll('[data-axis] [data-tick] text')].map((t) => t.textContent)
		).toEqual(['Q1', 'Q2', 'Q3']);
	});

	it('moves along the categories and between the series', async () => {
		render(BarTest);
		bars()[0].focus();

		await userEvent.keyboard('{ArrowRight}');
		expect(document.activeElement).toBe(bars()[1]);
		await userEvent.keyboard('{ArrowDown}');
		expect(document.activeElement).toBe(bars()[4]);
		await userEvent.keyboard('{End}');
		expect(document.activeElement).toBe(bars()[5]);
	});

	it('shows the bar under the pointer, also far from the end of the bar', async () => {
		render(BarTest);
		const tooltip = () => document.querySelector<HTMLElement>('[data-tooltip]');
		const svg = document.querySelector('svg')!;
		// Q3 North is from x 200 to 250, and from y 0 to 200: its end is 190 pixels away.
		await userEvent.hover(svg, { position: { x: 225, y: 190 } });
		expect(tooltip()!.textContent).toMatch(/Q3\s*North\s*30/);
		// The next bar, Q3 South, starts at x 250.
		await userEvent.hover(svg, { position: { x: 255, y: 190 } });
		expect(tooltip()!.textContent).toMatch(/Q3\s*South\s*25/);
	});

	it('draws a negative value down from zero', () => {
		render(BarTest, {
			data: [
				{ quarter: 'Q1', region: 'North', sales: 10 },
				{ quarter: 'Q2', region: 'North', sales: -10 }
			]
		});
		const [, y0, , h0] = box(bars()[0]);
		const [, y1, , h1] = box(bars()[1]);
		expect(y0 + h0).toBe(100);
		expect(y1).toBe(100);
		expect(h1).toBe(h0);
		expect(bars()[1].dataset.negative).toBe('true');
	});
});

function roundTwo(value: number) {
	return Math.round(value * 100) / 100;
}
