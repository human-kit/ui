import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { tick } from 'svelte';
import FluidTest from './fluid-test.svelte';

describe('Chart.Plot', () => {
	it('uses the measured width in pixels after the mount', async () => {
		render(FluidTest);
		await tick();
		const plot = document.querySelector('[data-testid="plot"]')!;
		await expect.poll(() => plot.getAttribute('width')).toBe('320');
		expect(plot.getAttribute('viewBox')).toBe('0 0 320 300');
	});
});
