// @vitest-environment node

import { describe, expect, it } from 'vitest';
import { render } from 'svelte/server';
import SeparatorTest from './separator-test.svelte';

describe('Separator SSR', () => {
	it('renders the role and the orientation before hydration', () => {
		const { body } = render(SeparatorTest, { props: { orientation: 'vertical' } });
		expect(body).toContain('role="separator"');
		expect(body).toContain('aria-orientation="vertical"');
		expect(body).toContain('data-orientation="vertical"');
	});

	it('renders no role for a decorative line', () => {
		const { body } = render(SeparatorTest, { props: { decorative: true } });
		expect(body).toContain('role="none"');
		expect(body).not.toContain('aria-orientation');
	});
});
