import { describe, it, expect } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { userEvent } from 'vitest/browser';
import ComboBoxNumericStringIdTest from './combobox-numeric-string-id-test.svelte';

describe('ComboBox numeric-string ids', () => {
	it('preserves leading-zero id in active descendant and selected value', async () => {
		const screen = render(ComboBoxNumericStringIdTest);
		const input = screen.getByRole('combobox');

		await input.click();
		await userEvent.keyboard('{ArrowDown}');

		const activeDescendant = input.element().getAttribute('aria-activedescendant');
		expect(activeDescendant).toMatch(/-01$/);

		await userEvent.keyboard('{Enter}');

		await expect.element(input).toHaveValue('Code 01');
		expect(screen.getByTestId('selected').element().textContent).toBe('01');
		expect(screen.getByTestId('selected-type').element().textContent).toBe('string');
	});
});
