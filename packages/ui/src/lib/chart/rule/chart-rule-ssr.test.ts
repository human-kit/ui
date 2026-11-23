// @vitest-environment node

import { describe, expect, it } from 'vitest';
import { render } from 'svelte/server';
import RuleTest from './rule-test.svelte';

describe('Chart.Rule SSR', () => {
	it('makes the same line, description and table row as the client', () => {
		const { body } = render(RuleTest, {
			props: {
				rules: [
					{
						value: 130,
						label: 'Target',
						compare: (point, target) => (point.y >= target ? 'above target' : '')
					}
				]
			}
		});

		// The rule comes before the bar mark, thus its value is in the domain of the bars.
		expect(body).toContain('x1="0" x2="300" y1="14.29" y2="14.29"');
		expect(body).toMatch(/<desc id="chart-r-rule-[^"]+">Target, Sales 130<\/desc>/);
		expect(body).toContain('aria-label="Feb, Sales 60"');
		expect(body).toMatch(
			/<tfoot><!--\[--><tr data-rule=""><th scope="row">Target<\/th><td colspan="1">130<\/td><\/tr>/
		);
		// The plot writes its attributes before the rules in it start, thus the server cannot list
		// their ids. The client adds them when it hydrates the plot.
		expect(body).not.toContain('aria-describedby');
	});
});
