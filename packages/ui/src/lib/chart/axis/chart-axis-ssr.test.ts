// @vitest-environment node

import { describe, expect, it } from 'vitest';
import { render } from 'svelte/server';
import AxisTest from './axis-test.svelte';

describe('Chart.Axis SSR', () => {
	it('makes the ticks and the labels on the server', () => {
		const { body } = render(AxisTest);

		expect(body).toContain('data-axis="bottom"');
		expect(body).toContain('>2015</text>');
		expect(body).toContain('>Value (USD)</text>');
		expect(body).toContain('aria-label="2015, 1,000"');
	});
});
