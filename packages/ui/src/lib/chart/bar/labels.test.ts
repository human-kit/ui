import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import LabelsTest from './labels-test.svelte';

const settle = () => new Promise((resolve) => requestAnimationFrame(() => setTimeout(resolve, 50)));
const texts = (selector: string) =>
	[...document.querySelectorAll(selector)].map((element) => element.textContent?.trim());
const bars = () => [...document.querySelectorAll<SVGGraphicsElement>('[data-bar]')];
const labels = () => [...document.querySelectorAll<SVGTextElement>('[data-bar-label]')];

describe('A band axis', () => {
	it('names each band that has room for one line of text', () => {
		render(LabelsTest);
		// Six bands in about 100 pixels: each one is taller than a line of text.
		expect(texts('[data-axis="left"] [data-tick] text')).toEqual([
			'Current',
			'30 days',
			'60 days',
			'90 days',
			'120 days',
			'Older'
		]);
	});
});

describe('Chart.Bar radius', () => {
	it('keeps square bars by default', () => {
		render(LabelsTest);
		expect(bars().every((bar) => bar.tagName === 'rect')).toBe(true);
	});

	it('rounds the end of each bar and keeps the corners at zero square', () => {
		render(LabelsTest, { radius: 4 });
		const [first, , negative] = bars();
		expect(first.tagName).toBe('path');
		// A positive bar starts at zero, on the left, with a straight edge.
		expect(first.getAttribute('d')).toMatch(/^M[\d.]+,[\d.]+h[\d.]+a4,4 0 0 1/);
		// A negative bar starts at zero, on the right, and its round end is on the left.
		expect(negative.getAttribute('d')).toMatch(/a4,4 0 0 0/);
	});

	it('keeps the names of the points', () => {
		render(LabelsTest, { radius: 4 });
		expect(bars()[0].getAttribute('aria-label')).toBe('Current, 40');
	});
});

describe('Chart.Bar labels', () => {
	it('writes the value of each bar after its end', async () => {
		render(LabelsTest, { labels: true });
		await settle();
		expect(labels().map((label) => label.textContent)).toEqual([
			'40',
			'20',
			'-10',
			'30',
			'5',
			'15'
		]);
		const bar = bars()[0].getBBox();
		const label = labels()[0];
		expect(Number(label.getAttribute('x'))).toBe(bar.x + bar.width + 4);
		expect(label.getAttribute('text-anchor')).toBe('start');
	});

	it('makes room for the labels inside the chart', async () => {
		render(LabelsTest, { labels: true });
		await settle();
		const svg = document.querySelector('svg')!.getBoundingClientRect();
		for (const label of labels()) {
			expect(label.getBoundingClientRect().right).toBeLessThanOrEqual(svg.right + 0.5);
		}
	});

	it('puts the label of a negative bar before the bar when there is room, else after zero', async () => {
		render(LabelsTest, { labels: true });
		await settle();
		const negative = labels()[2];
		const bar = bars()[2].getBBox();
		const before = negative.getAttribute('text-anchor') === 'end';
		expect(Number(negative.getAttribute('x'))).toBe(before ? bar.x - 4 : bar.x + bar.width + 4);
	});

	it('writes the text of a function', async () => {
		render(LabelsTest, { labels: (point) => `${point.x} USD` });
		await settle();
		expect(labels()[0].textContent).toBe('40 USD');
	});

	it('hides the labels from assistive technology', () => {
		render(LabelsTest, { labels: true });
		expect(document.querySelector('[data-bar-labels]')!.getAttribute('aria-hidden')).toBe('true');
	});

	it('puts the label of a vertical bar above it, and of a negative one below it', async () => {
		render(LabelsTest, { labels: true, vertical: true });
		await settle();
		const [up, , down] = labels();
		expect(Number(up.getAttribute('y'))).toBeCloseTo(bars()[0].getBBox().y - 4, 1);
		const bar = bars()[2].getBBox();
		expect(Number(down.getAttribute('y'))).toBeCloseTo(bar.y + bar.height + 4, 1);
	});
});
