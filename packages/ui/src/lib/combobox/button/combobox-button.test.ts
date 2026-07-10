import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import ComboBoxButtonTest from './combobox-button-test.svelte';

describe('ComboBox.Button', () => {
	it('forwards behavior to ComboBox.Trigger', async () => {
		const screen = render(ComboBoxButtonTest);
		const input = screen.getByRole('combobox');
		const button = screen.getByRole('button', { name: 'Show options' });

		await expect.element(button).toHaveAttribute('tabindex', '-1');
		await button.click();
		await expect.element(input).toHaveAttribute('aria-expanded', 'true');
		const openButton = screen.getByRole('button', { name: 'Hide options' });
		await expect.element(openButton).toHaveAttribute('data-pressed', 'true');
	});

	it('inherits pending state through the trigger alias', async () => {
		const screen = render(ComboBoxButtonTest, { pending: true });
		const button = screen.getByRole('button', { name: 'Show options' });

		await expect.element(button).toHaveAttribute('data-pending', 'true');
		await expect.element(button).toBeDisabled();
	});
});
