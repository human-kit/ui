// @vitest-environment node

import { describe, expect, it } from 'vitest';
import { render } from 'svelte/server';
import ArcTest from './arc-test.svelte';

describe('Chart.Arc SSR', () => {
	it('makes the slices, the names and the table on the server', () => {
		const { body } = render(ArcTest, { props: { labels: true } });

		expect(body).toContain('aria-label="North, Sales 50, 50%"');
		expect(body.match(/tabindex="0"/g)).toHaveLength(1);
		expect(body).toContain('d="M0,-100A100,100 0 0 1 0,100L0,0Z"');
		expect(body).toContain('data-category="West"');
		expect(body.match(/<tbody>[\s\S]*<\/tbody>/)![0].match(/<tr/g)).toHaveLength(4);
		expect(body.match(/data-arc-label=""/g)).toHaveLength(4);
	});
});
