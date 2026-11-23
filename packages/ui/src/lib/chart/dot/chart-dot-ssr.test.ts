// @vitest-environment node

import { describe, expect, it } from 'vitest';
import { render } from 'svelte/server';
import DotTest from './dot-test.svelte';

describe('Chart.Dot SSR', () => {
	it('makes the dots, the names, the shapes and the table on the server', () => {
		const { body } = render(DotTest);

		expect(body).toContain('aria-label="B, Weight 2, Speed 5"');
		expect(body.match(/tabindex="0"/g)).toHaveLength(1);
		expect(body).toContain('data-symbol="square"');
		expect(body).toContain('transform="translate(75,150)"');
		expect(body.match(/<tbody>[\s\S]*<\/tbody>/)![0].match(/<tr/g)).toHaveLength(7);
	});
});
