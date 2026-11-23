import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { userEvent } from 'vitest/browser';
import OrderTest from './order-test.svelte';

const focusedMark = () => {
	const point = document.activeElement!;
	return `${point.closest('[data-mark]')!.getAttribute('data-mark')}:${point.closest('[data-series]')!.getAttribute('data-series')}`;
};

describe('the order of the series for the vertical arrows', () => {
	it('follows the legend, and goes through the marks of a series before the next series', async () => {
		render(OrderTest);
		const legend = [...document.querySelectorAll('[data-legend-item]')].map((item) =>
			item.getAttribute('data-series')
		);
		expect(legend).toEqual(['A', 'B']);

		(
			document.querySelector('[data-mark="area"] [data-series="A"] [tabindex]') as SVGElement
		).focus();
		const order = [focusedMark()];
		for (let i = 0; i < 3; i++) {
			await userEvent.keyboard('{ArrowDown}');
			order.push(focusedMark());
		}
		expect(order).toEqual(['area:A', 'line:A', 'area:B', 'line:B']);
	});
});
