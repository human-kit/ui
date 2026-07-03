import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import CheckboxTest from '../root/checkbox-test.svelte';

describe('Checkbox.Indicator', () => {
	it('renders when checked', async () => {
		render(CheckboxTest, { defaultChecked: true });

		expect(document.querySelector('[data-checkbox-indicator="true"]')).toBeTruthy();
		expect(document.querySelector('[data-checkbox-icon="true"]')).toBeTruthy();
	});

	it('renders when indeterminate', async () => {
		render(CheckboxTest, { defaultIndeterminate: true });

		const indicator = document.querySelector<HTMLElement>('[data-checkbox-indicator="true"]');
		expect(indicator?.getAttribute('data-indeterminate')).toBe('true');
	});

	it('does not render when unchecked by default', async () => {
		render(CheckboxTest);

		expect(document.querySelector('[data-checkbox-indicator="true"]')).toBeNull();
	});

	it('supports forceMount when unchecked', async () => {
		render(CheckboxTest, { forceMount: true });

		const indicator = document.querySelector<HTMLElement>('[data-checkbox-indicator="true"]');
		expect(indicator).toBeTruthy();
		expect(indicator?.hidden).toBe(true);
	});
});
