// @vitest-environment node

import { describe, expect, it } from 'vitest';
import { render } from 'svelte/server';
import PartsTest from './parts-test.svelte';

describe('Chart parts SSR', () => {
	it('makes the data table and the legend on the server', () => {
		const { body } = render(PartsTest);

		expect(body).toContain('<th scope="row">Mar</th>');
		expect(body).toContain('<td>15</td>');
		expect(body).toContain('data-legend-item=""');
		expect(body).not.toContain('data-tooltip=""');
	});
});
