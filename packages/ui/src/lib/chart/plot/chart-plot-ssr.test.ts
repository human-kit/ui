// @vitest-environment node

import { describe, expect, it } from 'vitest';
import { render } from 'svelte/server';
import FluidTest from './fluid-test.svelte';

describe('Chart.Plot SSR', () => {
	it('fills the container before the first measure, and scales the default width', () => {
		const { body } = render(FluidTest);
		expect(body).toMatch(/<svg[^>]* width="100%" height="300" viewBox="0 0 640 300"/);
	});
});
