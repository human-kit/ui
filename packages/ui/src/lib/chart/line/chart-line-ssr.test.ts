// @vitest-environment node

import { describe, expect, it } from 'vitest';
import { render } from 'svelte/server';
import LineTest from './line-test.svelte';

describe('Chart.Line SSR', () => {
	it('makes the SVG, the names and the tab stop on the server', () => {
		const { body } = render(LineTest);

		expect(body).toContain('aria-roledescription="chart"');
		expect(body).toContain('aria-labelledby="chart-t-title"');
		expect(body).toContain('aria-label="2, A, 20"');
		expect(body.match(/tabindex="0"/g)).toHaveLength(1);
		expect(body).toMatch(/<path d="M[\d.,]+L/);
	});
});
