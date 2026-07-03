import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import SwitchTest from '../root/switch-test.svelte';

describe('Switch.Thumb', () => {
	it('mirrors checked state through data attributes', async () => {
		render(SwitchTest, { defaultChecked: true });
		const thumb = document.querySelector('[data-switch-thumb="true"]');

		expect(thumb?.getAttribute('data-checked')).toBe('true');
		expect(thumb?.getAttribute('data-unchecked')).toBeNull();
	});

	it('mirrors unchecked state through data attributes', async () => {
		render(SwitchTest);
		const thumb = document.querySelector('[data-switch-thumb="true"]');

		expect(thumb?.getAttribute('data-unchecked')).toBe('true');
		expect(thumb?.getAttribute('data-checked')).toBeNull();
	});
});
