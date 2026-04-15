import { describe, it, expect } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { userEvent } from 'vitest/browser';
import ComboBoxClearTest from './combobox-clear-test.svelte';

describe('ComboBox.Clear', () => {
	it('clears the selected value and input value', async () => {
		const screen = render(ComboBoxClearTest);
		const clearButton = screen.getByRole('button', { name: 'Clear selection' });

		await clearButton.click();

		await expect
			.poll(() => document.querySelector('[data-selected-value]')?.textContent)
			.toBe('undefined');
		await expect.poll(() => document.querySelector('[data-input-value]')?.textContent).toBe('');
	});

	it('keeps focus on the input after clearing', async () => {
		const screen = render(ComboBoxClearTest);
		const input = screen.getByRole('combobox');
		const clearButton = screen.getByRole('button', { name: 'Clear selection' });

		input.element()?.focus();
		await clearButton.click();

		expect(document.activeElement).toBe(input.element());
	});

	it('reflects pending state and becomes disabled while pending', async () => {
		const screen = render(ComboBoxClearTest);
		const pendingToggle = document.querySelector('[data-set-pending]') as HTMLButtonElement | null;
		expect(pendingToggle).toBeTruthy();

		await userEvent.click(pendingToggle as HTMLButtonElement);

		const clearButton = screen.getByRole('button', { name: 'Clear selection' });
		await expect.element(clearButton).toHaveAttribute('data-pending', 'true');
		await expect.element(clearButton).toBeDisabled();
	});
});
