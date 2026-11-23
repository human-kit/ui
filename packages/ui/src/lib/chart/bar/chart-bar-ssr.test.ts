// @vitest-environment node

import { describe, expect, it } from 'vitest';
import { render } from 'svelte/server';
import BarTest from './bar-test.svelte';

describe('Chart.Bar SSR', () => {
	it('makes the bars and their names on the server, with a grid before the bars', () => {
		const { body } = render(BarTest);

		expect(body).toContain('aria-label="Q2, South, 15"');
		expect(body).toContain('>Q3</text>');
		// The grid reads the y scale first. The scale still includes zero and the largest value.
		expect(body.match(/data-bar=""/g)).toHaveLength(6);
		expect(body).toMatch(/<rect x="200" y="0" width="50" height="200"/);
	});
});
