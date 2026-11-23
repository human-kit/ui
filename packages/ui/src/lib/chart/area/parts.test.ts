import { tick } from 'svelte';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { userEvent } from 'vitest/browser';
import PartsTest from './parts-test.svelte';

const points = () => [...document.querySelectorAll<SVGCircleElement>('[data-point]')];
const tooltip = () => document.querySelector<HTMLElement>('[data-tooltip]');
const texts = (selector: string) =>
	[...document.querySelectorAll(selector)].map((element) => element.textContent?.trim());

describe('Chart.Area', () => {
	it('puts the series one on the other, and the scale includes the tops', () => {
		render(PartsTest);
		// The largest stack is 30 + 15 = 45, at the top of the plot. The first series is on the top.
		expect(points()[2].getAttribute('cy')).toBe('0');
		expect(points()[5].getAttribute('cy')).toBe(String(Math.round((1 - 15 / 45) * 20000) / 100));
	});

	it('hides the points, and shows the point that has the focus', async () => {
		render(PartsTest);
		expect(points()[0].getAttribute('r')).toBe('0');
		points()[0].focus();
		await tick();
		expect(points()[0].getAttribute('r')).toBe('4');
	});
});

describe('Chart.DataTable', () => {
	it('makes a table with a row per x value and a column per series', () => {
		render(PartsTest);
		const table = document.querySelector('table')!;

		expect(texts('thead th')).toEqual(['month', 'Tea', 'Coffee']);
		expect(texts('tbody th')).toEqual(['Jan', 'Feb', 'Mar']);
		expect(texts('tbody tr:first-child td')).toEqual(['10', '5']);
		expect(table.querySelectorAll('th[scope="col"]')).toHaveLength(3);
		expect(table.querySelectorAll('th[scope="row"]')).toHaveLength(3);
		expect(table.getAttribute('aria-labelledby')).toBe(document.querySelector('figcaption')!.id);
	});

	it('keeps the table off the screen by default, and shows it on request', () => {
		const { rerender } = render(PartsTest);
		const hidden = getComputedStyle(document.querySelector('table')!);
		expect(hidden.clipPath).toBe('inset(50%)');
		expect(hidden.position).toBe('absolute');

		rerender({ visibility: 'visible', caption: 'The units' });
		expect(getComputedStyle(document.querySelector('table')!).clipPath).toBe('none');
		expect(texts('caption')).toEqual(['The units']);
		expect(document.querySelector('table')!.hasAttribute('aria-labelledby')).toBe(false);
	});
});

describe('Chart.Legend', () => {
	it('lists the series, out of the accessibility tree', () => {
		render(PartsTest);
		const legend = document.querySelector('[data-legend]')!;
		expect(legend.getAttribute('aria-hidden')).toBe('true');
		expect(texts('[data-legend-item]')).toEqual(['Tea', 'Coffee']);
		expect(
			[...legend.querySelectorAll('[data-legend-item]')].map((li) => li.getAttribute('data-series'))
		).toEqual(['Tea', 'Coffee']);
	});
});

describe('Chart.Tooltip', () => {
	it('shows the point that has the keyboard focus', async () => {
		render(PartsTest);
		points()[0].focus();
		await userEvent.keyboard('{ArrowRight}');

		expect(tooltip()).not.toBeNull();
		expect(tooltip()!.getAttribute('aria-hidden')).toBe('true');
		expect(tooltip()!.textContent).toContain('Feb');
		expect(tooltip()!.textContent).toContain('Tea');
		expect(tooltip()!.textContent).toContain('20');
	});

	it('closes on Escape, and opens again on the next point', async () => {
		render(PartsTest);
		points()[0].focus();
		await userEvent.keyboard('{ArrowRight}');
		await userEvent.keyboard('{Escape}');
		expect(tooltip()).toBeNull();
		expect(document.activeElement).toBe(points()[1]);

		await userEvent.keyboard('{ArrowRight}');
		expect(tooltip()!.textContent).toContain('Mar');
	});

	it('shows the point under the pointer, and closes when the pointer leaves', async () => {
		render(PartsTest);
		// The points have no size, thus the pointer goes to the position of the point in the plot.
		const point = points()[4];
		await userEvent.hover(document.querySelector('svg')!, {
			position: { x: Number(point.getAttribute('cx')) + 2, y: Number(point.getAttribute('cy')) + 2 }
		});
		expect(tooltip()!.textContent).toContain('Coffee');

		await userEvent.unhover(document.querySelector('svg')!);
		await userEvent.hover(document.querySelector('figcaption')!);
		expect(tooltip()).toBeNull();
	});

	it('opens on a tap, stays when the finger lifts, and closes on a tap out of the plot', async () => {
		render(PartsTest);
		const svg = document.querySelector('svg')!;
		const box = svg.getBoundingClientRect();
		const point = points()[4];
		const at = {
			clientX: box.left + Number(point.getAttribute('cx')) + 2,
			clientY: box.top + Number(point.getAttribute('cy')) + 2,
			pointerType: 'touch',
			bubbles: true
		};
		svg.dispatchEvent(new PointerEvent('pointerdown', at));
		svg.dispatchEvent(new PointerEvent('pointerleave', at));
		await tick();
		expect(tooltip()!.textContent).toContain('Coffee');

		document.body.dispatchEvent(new PointerEvent('pointerdown', { ...at, clientY: 0 }));
		await tick();
		expect(tooltip()).toBeNull();

		// A finger that starts to scroll the page closes it.
		svg.dispatchEvent(new PointerEvent('pointerdown', at));
		await tick();
		expect(tooltip()).not.toBeNull();
		svg.dispatchEvent(new PointerEvent('pointercancel', at));
		await tick();
		expect(tooltip()).toBeNull();
	});

	it('stays in the width of the figure at the first and the last point', async () => {
		render(PartsTest, { long: true });
		const figure = document.querySelector('figure')!.getBoundingClientRect();
		points()[0].focus();
		for (const key of ['{ArrowRight}', '{Home}', '{End}']) {
			await userEvent.keyboard(key);
			await tick();
			const box = tooltip()!.getBoundingClientRect();
			expect(box.left).toBeGreaterThanOrEqual(figure.left - 0.5);
			expect(box.right).toBeLessThanOrEqual(figure.right + 0.5);
		}
	});

	it('does not open for a focus from a pointer press', async () => {
		render(PartsTest);
		const point = points()[0];
		point.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
		point.focus();
		await tick();
		expect(tooltip()).toBeNull();
	});
});
