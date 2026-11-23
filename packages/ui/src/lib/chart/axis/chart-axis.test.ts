import { tick } from 'svelte';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import AxisTest from './axis-test.svelte';

const texts = (selector: string) =>
	[...document.querySelectorAll(selector)].map((element) => element.textContent);

async function settle() {
	// The axes measure their labels after the render, and the margins change after it.
	for (let i = 0; i < 4; i++) await tick();
	await new Promise((resolve) => requestAnimationFrame(resolve));
}

describe('Chart.Axis', () => {
	it('labels the time axis with years, and the names of the points with the full value', async () => {
		render(AxisTest);
		await settle();

		expect(texts('[data-axis="bottom"] [data-tick] text')).toEqual([
			'2015',
			'2016',
			'2017',
			'2018',
			'2019',
			'2020'
		]);
		const names = [...document.querySelectorAll('[data-point]')].map((p) =>
			p.getAttribute('aria-label')
		);
		expect(names[0]).toBe('2015, 1,000');
	});

	it('uses the format of the consumer for the ticks and the names', async () => {
		render(AxisTest, { yFormat: { style: 'currency', currency: 'USD', maximumFractionDigits: 0 } });
		await settle();

		expect(texts('[data-axis="left"] [data-tick] text')[0]).toBe('$0');
		expect(document.querySelector('[data-point]')!.getAttribute('aria-label')).toBe('2015, $1,000');
	});

	it('keeps the axes out of the accessibility tree', () => {
		render(AxisTest);
		for (const axis of document.querySelectorAll('[data-axis], [data-grid]')) {
			expect(axis.getAttribute('aria-hidden')).toBe('true');
		}
	});

	it('makes the margins large enough for the labels', async () => {
		render(AxisTest);
		await settle();
		const svg = document.querySelector('svg')!.getBoundingClientRect();
		for (const element of document.querySelectorAll('[data-axis] text')) {
			const box = element.getBoundingClientRect();
			expect(box.left).toBeGreaterThanOrEqual(svg.left - 0.5);
			expect(box.right).toBeLessThanOrEqual(svg.right + 0.5);
			expect(box.top).toBeGreaterThanOrEqual(svg.top - 0.5);
			expect(box.bottom).toBeLessThanOrEqual(svg.bottom + 0.5);
		}
	});

	it('puts one grid line on each tick of the y axis', async () => {
		render(AxisTest);
		await settle();
		expect(document.querySelectorAll('[data-grid] line')).toHaveLength(
			document.querySelectorAll('[data-axis="left"] [data-tick]').length
		);
	});
});
